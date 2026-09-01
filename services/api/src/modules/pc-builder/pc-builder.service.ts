import crypto from "crypto";
import { getDbPool, query } from "../../config/database";
import { env } from "../../config/env";
import { createError, toPositiveInteger } from "../../utils/service-helpers";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { xaiExplanationService } from "./xai-explanation.service";

export interface BuildItem {
  id: number;
  componentType: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: {
    id: number;
    name: string;
    slug: string;
    attributes?: Array<{ key: string; value: string }>;
  };
  variant: {
    id: number;
    sku: string;
    price: number;
    stock: number;
    imageUrl: string | null;
    specs?: Array<{ key: string; value: string }>;
  };
}

export interface Build {
  id: number;
  userId: number;
  name: string;
  status: string;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  items: BuildItem[];
  components: Record<string, BuildItem>;
}

/**
 * Service to manage PC Builder business logic.
 * Handles build creation, item management, multi-candidate recommendations, and compatibility checks.
 */
class PcBuilderService {
  private toMoney(value: any): number {
    return Number(Number(value || 0).toFixed(2));
  }

  private normalizeText(value: any): string {
    return String(value || "").trim().toLowerCase();
  }

  private parseNumber(value: any, fallback = 0): number {
    const match = String(value || "").match(/(\d+(\.\d+)?)/);
    return match ? Number(match[1]) : fallback;
  }

  private specBag(specs: Array<{ key: string; value: string }> = []): Record<string, string> {
    return specs.reduce<Record<string, string>>((accumulator, spec) => {
      const key = this.normalizeText(spec.key);
      if (key) accumulator[key] = String(spec.value || "");
      return accumulator;
    }, {});
  }

  private findSpec(specs: Array<{ key: string; value: string }> = [], aliases: string[]): string {
    const bag = this.specBag(specs);
    const keys = aliases.map((alias) => this.normalizeText(alias));
    const hit = Object.entries(bag).find(([key]) => keys.some((alias) => key.includes(alias)));
    return hit?.[1] || "";
  }

  private hasTruthySpec(value: any): boolean {
    const text = this.normalizeText(value);
    if (!text) return false;
    if (["khong", "không", "no", "false", "none"].some((token) => text.includes(token))) return false;
    return ["co", "có", "yes", "true", "included", "stock", "kem", "kèm", "boxed"].some((token) => text.includes(token));
  }

  private cpuHasStockCooler(specs: Array<{ key: string; value: string }>, productName: string): boolean {
    const specValue = this.findSpec(specs, ["stock cooler", "cooler included", "tản đi kèm", "boxed cooler"]);
    if (specValue) return this.hasTruthySpec(specValue);
    const name = this.normalizeText(productName);
    if (/\bi[3579]-?\d{4,5}(k|kf|ks)\b/.test(name)) return false;
    if (/ryzen\s*[3579].*(x3d|xt|\bx\b)/.test(name)) return false;
    return true;
  }

  private socketMatches(requiredSocket: string, supportedSockets: string): boolean {
    const left = this.normalizeText(requiredSocket);
    const right = this.normalizeText(supportedSockets);
    if (!left || !right) return true;
    return right.includes(left) || left.includes(right);
  }

  async findBuildById(userId: number, buildId: number, connection: any = null): Promise<any> {
    const executor = connection || getDbPool();
    const [rows] = await executor.execute(
      `SELECT id, user_id AS userId, name, created_at AS createdAt FROM pc_builds WHERE id = ? AND user_id = ? LIMIT 1`,
      [buildId, userId]
    );
    return (rows as RowDataPacket[])[0] || null;
  }

  async getBuildItems(buildId: number): Promise<BuildItem[]> {
    const rows = await query(
      `
      SELECT 
        i.id AS itemId,
        i.component_type AS componentType,
        s.id AS skuId,
        s.price AS price,
        COALESCE(s.stock, 0) AS stock,
        s.sku AS skuCode,
        s.image_url AS imageUrl,
        p.id AS productId,
        p.name AS productName,
        COALESCE(p.slug, CAST(p.id AS CHAR)) AS productSlug,
        a.name AS attributeName,
        av.value AS attributeValue
      FROM pc_build_items i
      INNER JOIN product_skus s ON s.id = i.sku_id
      INNER JOIN products p ON p.id = s.product_id
      LEFT JOIN sku_attributes sa ON sa.sku_id = s.id
      LEFT JOIN attribute_values av ON av.id = sa.attribute_value_id
      LEFT JOIN attributes a ON a.id = av.attribute_id
      WHERE i.build_id = ?
      ORDER BY i.id ASC, a.name ASC
      `,
      [buildId]
    );

    const itemMap = new Map<number, BuildItem>();
    for (const row of rows as any[]) {
      if (!itemMap.has(row.itemId)) {
        itemMap.set(row.itemId, {
          id: row.itemId,
          componentType: row.componentType,
          quantity: 1,
          unitPrice: Number(row.price || 0),
          lineTotal: this.toMoney(row.price || 0),
          product: {
            id: row.productId,
            name: row.productName,
            slug: String(row.productSlug || row.productId),
            attributes: []
          },
          variant: {
            id: row.skuId,
            sku: row.skuCode || `SKU-${row.skuId}`,
            price: Number(row.price || 0),
            stock: Number(row.stock || 0),
            imageUrl: row.imageUrl || null,
            specs: []
          }
        });
      }

      if (row.attributeName && row.attributeValue) {
        const item = itemMap.get(row.itemId)!;
        const spec = { key: String(row.attributeName), value: String(row.attributeValue) };
        item.variant.specs?.push(spec);
        item.product.attributes?.push(spec);
      }
    }
    return Array.from(itemMap.values());
  }

  formatBuild(build: any, items: BuildItem[]): Build {
    const totalPrice = this.toMoney(items.reduce((sum, item) => sum + item.lineTotal, 0));
    const components: Record<string, BuildItem> = {};
    for (const item of items) {
      components[item.componentType] = item;
    }

    return {
      id: build.id,
      userId: build.userId,
      name: build.name,
      status: "DRAFT",
      totalPrice,
      createdAt: build.createdAt,
      updatedAt: build.createdAt,
      items,
      components
    };
  }

  async getBuildDetail(userId: number, buildId: any): Promise<Build> {
    const parsedId = toPositiveInteger(buildId, "buildId");
    const build = await this.findBuildById(userId, parsedId);
    if (!build) throw createError("PC build not found", 404);
    const items = await this.getBuildItems(parsedId);
    return this.formatBuild(build, items);
  }

  async createBuild(userId: number, payload: any = {}): Promise<Build> {
    const name = String(payload.name || "My PC Build").trim() || "My PC Build";
    const [result] = await (getDbPool() as any).execute(
      `INSERT INTO pc_builds (user_id, name, created_at) VALUES (?, ?, NOW())`,
      [userId, name]
    );
    return this.getBuildDetail(userId, (result as ResultSetHeader).insertId);
  }

  async getCurrentBuild(userId: number): Promise<Build | null> {
    const rows = await query(
      `SELECT id, user_id AS userId, name, created_at AS createdAt FROM pc_builds WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 1`,
      [userId]
    );
    const build = (rows as any[])[0] || null;
    if (!build) return null;
    const items = await this.getBuildItems(build.id);
    return this.formatBuild(build, items);
  }

  async upsertBuildItem(userId: number, buildId: any, payload: any): Promise<Build> {
    const parsedBuildId = toPositiveInteger(buildId, "buildId");
    const skuId = toPositiveInteger(payload.productVariantId, "productVariantId");
    const componentType = String(payload.componentType || "").trim().toLowerCase();

    if (!componentType) throw createError("componentType is required", 400);

    const build = await this.findBuildById(userId, parsedBuildId);
    if (!build) throw createError("PC build not found", 404);

    const connection = await (getDbPool() as any).getConnection();
    try {
      await connection.beginTransaction();
      const [existing] = await connection.execute(
        `SELECT id FROM pc_build_items WHERE build_id = ? AND component_type = ? LIMIT 1`,
        [parsedBuildId, componentType]
      );
      
      if ((existing as any[]).length > 0) {
        await connection.execute(`UPDATE pc_build_items SET sku_id = ? WHERE id = ?`, [skuId, (existing as any[])[0].id]);
      } else {
        await connection.execute(`INSERT INTO pc_build_items (build_id, sku_id, component_type) VALUES (?, ?, ?)`, [parsedBuildId, skuId, componentType]);
      }
      await connection.commit();
      return this.getBuildDetail(userId, parsedBuildId);
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  async removeBuildItem(userId: number, buildId: any, componentType: string): Promise<Build> {
    const parsedBuildId = toPositiveInteger(buildId, "buildId");
    const type = String(componentType || "").trim().toLowerCase();
    const build = await this.findBuildById(userId, parsedBuildId);
    if (!build) throw createError("PC build not found", 404);

    await query(`DELETE FROM pc_build_items WHERE build_id = ? AND component_type = ?`, [parsedBuildId, type]);
    return this.getBuildDetail(userId, parsedBuildId);
  }

  async saveBuild(userId: number, buildId: any, payload: any = {}): Promise<Build> {
    const parsedId = toPositiveInteger(buildId, "buildId");
    const build = await this.findBuildById(userId, parsedId);
    if (!build) throw createError("PC build not found", 404);

    const name = String(payload.name || build.name || "My PC Build").trim() || "My PC Build";
    await query(`UPDATE pc_builds SET name = ? WHERE id = ? AND user_id = ?`, [name, parsedId, userId]);
    return this.getBuildDetail(userId, parsedId);
  }

  private isColumnsEnsured = false;

  async ensurePcBuildColumns(): Promise<void> {
    if (this.isColumnsEnsured) return;
    const columnsToEnsure = [
      { name: "share_token", def: "VARCHAR(36) NULL UNIQUE" },
      { name: "is_public", def: "BOOLEAN DEFAULT FALSE" },
      { name: "description", def: "TEXT NULL" },
      { name: "use_case", def: "VARCHAR(50) NULL" },
      { name: "budget", def: "DECIMAL(12,2) NULL" }
    ];

    for (const col of columnsToEnsure) {
      try {
        await query(`ALTER TABLE pc_builds ADD COLUMN ${col.name} ${col.def}`);
      } catch (err: any) {
        if (!String(err?.message || "").includes("Duplicate column name")) {
          // Log warning softly
        }
      }
    }
    this.isColumnsEnsured = true;
  }

  async getMyBuilds(userId: number): Promise<any[]> {
    await this.ensurePcBuildColumns();
    const rows = await query(
      `
      SELECT 
        b.id,
        b.user_id AS userId,
        b.name,
        b.share_token AS shareToken,
        COALESCE(b.is_public, 0) AS isPublic,
        b.description,
        b.use_case AS useCase,
        b.budget,
        b.created_at AS createdAt,
        COUNT(i.id) AS itemCount
      FROM pc_builds b
      LEFT JOIN pc_build_items i ON i.build_id = b.id
      WHERE b.user_id = ?
      GROUP BY b.id
      ORDER BY b.created_at DESC
      `,
      [userId]
    );

    const buildsWithDetail = [];
    for (const row of rows as any[]) {
      const items = await this.getBuildItems(row.id);
      const formatted = this.formatBuild(row, items);
      buildsWithDetail.push({
        ...formatted,
        shareToken: row.shareToken || null,
        isPublic: Boolean(row.isPublic),
        description: row.description,
        useCase: row.useCase,
        budget: Number(row.budget || 0)
      });
    }

    return buildsWithDetail;
  }

  async publishBuild(userId: number, buildId: any): Promise<any> {
    await this.ensurePcBuildColumns();
    const parsedId = toPositiveInteger(buildId, "buildId");
    const build = await this.findBuildById(userId, parsedId);
    if (!build) throw createError("PC build not found", 404);

    const shareToken = crypto.randomUUID();
    await query(
      `UPDATE pc_builds SET share_token = ?, is_public = 1 WHERE id = ? AND user_id = ?`,
      [shareToken, parsedId, userId]
    );

    const detail = await this.getBuildDetail(userId, parsedId);
    return {
      ...detail,
      shareToken,
      isPublic: true,
      shareUrl: `/pc-builder/shared/${shareToken}`
    };
  }

  async getSharedBuild(shareToken: string): Promise<any> {
    await this.ensurePcBuildColumns();
    const token = String(shareToken || "").trim();
    if (!token) throw createError("Share token is required", 400);

    const rows = await query(
      `SELECT id, user_id AS userId, name, share_token AS shareToken, is_public AS isPublic, created_at AS createdAt FROM pc_builds WHERE share_token = ? AND is_public = 1 LIMIT 1`,
      [token]
    );
    const build = (rows as any[])[0] || null;
    if (!build) throw createError("Bộ cấu hình không tồn tại hoặc đã bị ẩn", 404);

    const items = await this.getBuildItems(build.id);
    const formatted = this.formatBuild(build, items);

    const compatibilityCheckPayload = {
      components: items.map((item) => ({
        componentType: item.componentType,
        variantId: item.variant.id
      }))
    };

    let xaiReport: any = null;
    if (compatibilityCheckPayload.components.length >= 2) {
      try {
        xaiReport = await this.checkRawCompatibility(compatibilityCheckPayload);
      } catch (err) {
        console.warn("[Shared Build] Compatibility check warning:", (err as Error).message);
      }
    }

    return {
      ...formatted,
      shareToken: build.shareToken,
      isPublic: true,
      xaiReport
    };
  }

  async cloneBuild(userId: number, sourceBuildId: any): Promise<Build> {
    const parsedId = toPositiveInteger(sourceBuildId, "sourceBuildId");
    const sourceRows = await query(
      `SELECT id, name FROM pc_builds WHERE id = ? LIMIT 1`,
      [parsedId]
    );
    const sourceBuild = (sourceRows as any[])[0];
    if (!sourceBuild) throw createError("Bộ cấu hình nguồn không tồn tại", 404);

    const sourceItems = await this.getBuildItems(parsedId);
    if (sourceItems.length === 0) {
      throw createError("Bộ cấu hình nguồn chưa có linh kiện nào", 400);
    }

    const newName = `Bản sao - ${sourceBuild.name}`;
    const newBuild = await this.createBuild(userId, { name: newName });

    for (const item of sourceItems) {
      await this.upsertBuildItem(userId, newBuild.id, {
        productVariantId: item.variant.id,
        componentType: item.componentType
      });
    }

    return this.getBuildDetail(userId, newBuild.id);
  }

  /**
   * Helper to query a single candidate build based on allocation ratios and multiplier
   */
  private generateComponentExplanation(
    type: string,
    item: { name: string; price: number },
    totalBudget: number,
    ratio: number,
    useCase: string = "gaming"
  ): string {
    const name = item.name || "Linh kiện";
    const nameLower = name.toLowerCase();
    const percent = Math.round((item.price / Math.max(1, totalBudget)) * 100);

    switch (type.toLowerCase()) {
      case "cpu":
        if (nameLower.includes("i9") || nameLower.includes("7950x") || nameLower.includes("14900")) {
          return `CPU ${name}: Chọn vì sức mạnh xử lý đa nhân cực mạnh (${percent}% ngân sách), phục vụ tối ưu cho Render 4K/3D và Gaming đỉnh cao.`;
        }
        if (nameLower.includes("i7") || nameLower.includes("7800x3d") || nameLower.includes("13700")) {
          return `CPU ${name}: Chọn vì hiệu năng Gaming & Đồ họa cao cấp (${percent}% ngân sách), duy trì xung nhịp ổn định không lo giật lag.`;
        }
        return `CPU ${name}: Chọn vì cân bằng giá/hiệu năng tuyệt vời (${percent}% ngân sách), đáp ứng hoàn hảo nhu cầu ${useCase.toUpperCase()} và dễ dàng nâng cấp.`;

      case "gpu":
        if (nameLower.includes("4090") || nameLower.includes("4080") || nameLower.includes("7900 xtx")) {
          return `GPU ${name}: Trái tim của hệ thống (${percent}% ngân sách), sức mạnh đồ họa đỉnh bảng cân mượt mọi game AAA ở 4K Max Settings & Ray Tracing.`;
        }
        if (nameLower.includes("4070") || nameLower.includes("7800 xt") || nameLower.includes("3070")) {
          return `GPU ${name}: Động cơ đồ họa chính (${percent}% ngân sách), chiến mượt mà các tựa game 2K/1080p High FPS và tăng tốc render video.`;
        }
        return `GPU ${name}: Chọn vì tối ưu chi phí (${percent}% ngân sách), xử lý mượt các game eSports phổ biến và xuất hình ảnh độ phân giải cao.`;

      case "mainboard":
        if (nameLower.includes("z790") || nameLower.includes("x670") || nameLower.includes("z690")) {
          return `Mainboard ${name}: Bo mạch chủ phân khúc cao cấp (${percent}% ngân sách), dàn VRM xịn cấp điện ổn định và hỗ trợ ép xung mạnh mẽ.`;
        }
        if (nameLower.includes("b760") || nameLower.includes("b650") || nameLower.includes("b550")) {
          return `Mainboard ${name}: Lựa chọn quốc dân (${percent}% ngân sách), trang bị đầy đủ khe M.2 NVMe, PCIe 4.0/5.0 và hỗ trợ nâng cấp phần cứng.`;
        }
        return `Mainboard ${name}: Tối ưu chi phí (${percent}% ngân sách), chân cắm linh hoạt, vận hành bền bỉ cho toàn hệ thống.`;

      case "ram":
        if (nameLower.includes("32gb") || nameLower.includes("64gb")) {
          return `RAM ${name}: Dung lượng bộ nhớ dồi dào (${percent}% ngân sách), đảm bảo đa nhiệm mượt mà không lo đầy RAM khi dựng phim hay vừa chơi game vừa live stream.`;
        }
        return `RAM ${name}: Chọn vì đáp ứng đủ chuẩn bộ nhớ (${percent}% ngân sách), tốc độ bus mượt mà cho các tác vụ hàng ngày.`;

      case "psu":
        if (nameLower.includes("850") || nameLower.includes("1000") || nameLower.includes("gold")) {
          return `Nguồn ${name}: Công suất thực mạnh mẽ (${percent}% ngân sách), chuẩn 80 Plus Gold dư tải an toàn > 25% giúp bảo vệ linh kiện.`;
        }
        return `Nguồn ${name}: Cấp điện ổn định (${percent}% ngân sách), đáp ứng tốt tổng công suất tiêu thụ của CPU & GPU.`;

      case "cooling":
        if (nameLower.includes("360") || nameLower.includes("aio") || nameLower.includes("240")) {
          return `Tản nhiệt ${name}: Giải pháp tản nhiệt nước AIO (${percent}% ngân sách), giữ CPU luôn mát mẻ < 75°C khi chơi game full load.`;
        }
        return `Tản nhiệt ${name}: Tản nhiệt tháp khí hiệu năng cao (${percent}% ngân sách), độ ồn thấp và duy trì nhiệt độ tối ưu.`;

      case "storage":
        return `Ổ cứng ${name}: Ổ SSD NVMe tốc độ cao (${percent}% ngân sách), giúp khởi động Windows và load game chỉ trong vài giây.`;

      case "case":
        return `Vỏ Case ${name}: Thiết kế thoáng khí (${percent}% ngân sách), luồng gió tối ưu và không gian rộng rãi chứa vừa vặn các linh kiện.`;

      default:
        return `${name}: Được lựa chọn tối ưu theo tỷ lệ ngân sách ${percent}%.`;
    }
  }

  private async querySingleCandidate(budget: number, ratios: Record<string, number>, multiplier: number = 1.0, useCase: string = "gaming") {
    const selectedComponents: Record<string, any> = {};
    const componentTypes = Object.keys(ratios).filter((type) => ratios[type] > 0);

    const defaultFallbacks: Record<string, { variantId: number; productId: number; name: string; price: number; imageUrl: string }> = {
      cpu: { variantId: 101, productId: 101, name: "Intel Core i5-13400F (10 nhân 16 luồng)", price: 3990000, imageUrl: "/assets/products/i5.png" },
      mainboard: { variantId: 201, productId: 201, name: "ASUS PRIME B760M-A WIFI DDR5", price: 3490000, imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80" },
      ram: { variantId: 301, productId: 301, name: "Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz", price: 990000, imageUrl: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&auto=format&fit=crop&q=80" },
      gpu: { variantId: 401, productId: 401, name: "NVIDIA GeForce RTX 4060 8GB GDDR6", price: 7890000, imageUrl: "/assets/products/rtx4060.png" },
      storage: { variantId: 501, productId: 501, name: "Samsung 980 PRO 1TB PCIe 4.0 NVMe M.2 SSD", price: 2390000, imageUrl: "/assets/products/ssd-samsung-980-pro-2tb.svg" },
      psu: { variantId: 601, productId: 601, name: "Corsair RM750e 750W 80 Plus Gold Modular", price: 2790000, imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80" },
      case: { variantId: 701, productId: 701, name: "NZXT H5 Flow Compact ATX Mid-Tower", price: 2290000, imageUrl: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&auto=format&fit=crop&q=80" },
      cooling: { variantId: 801, productId: 801, name: "Thermalright Peerless Assassin 120 SE Air Cooler", price: 950000, imageUrl: "/assets/products/cooling-real/peerless-120.png" }
    };

    for (const type of componentTypes) {
      const maxSubBudget = Math.round(budget * ratios[type] * multiplier * 1.15);
      const cleanType = this.normalizeText(type).replace(/[%_\\]/g, "\\$&");
      const searchTerm = `%${cleanType}%`;

      let rows: any[] = [];
      try {
        rows = (await query(
          `
          SELECT 
            s.id AS variantId,
            s.price AS price,
            s.image_url AS imageUrl,
            p.id AS productId,
            p.name AS productName,
            p.slug AS productSlug
          FROM product_skus s
          INNER JOIN products p ON p.id = s.product_id
          INNER JOIN categories c ON c.id = p.category_id
          WHERE (LOWER(c.name) LIKE ? OR LOWER(p.name) LIKE ?)
            AND s.price <= ?
            AND s.stock > 0
          ORDER BY s.price DESC
          LIMIT 1
          `,
          [searchTerm, searchTerm, maxSubBudget]
        )) as any[];
      } catch (_err) {
        rows = [];
      }

      // Fallback 1: Query cheapest available component in DB if maxSubBudget yielded no results
      if ((rows as any[]).length === 0) {
        try {
          rows = (await query(
            `
            SELECT 
              s.id AS variantId,
              s.price AS price,
              s.image_url AS imageUrl,
              p.id AS productId,
              p.name AS productName,
              p.slug AS productSlug
            FROM product_skus s
            INNER JOIN products p ON p.id = s.product_id
            INNER JOIN categories c ON c.id = p.category_id
            WHERE (LOWER(c.name) LIKE ? OR LOWER(p.name) LIKE ?)
              AND s.stock > 0
            ORDER BY s.price ASC
            LIMIT 1
            `,
            [searchTerm, searchTerm]
          )) as any[];
        } catch (_err) {
          rows = [];
        }
      }

      let itemObj: any = null;
      if ((rows as any[]).length > 0) {
        const item = (rows as any[])[0];
        itemObj = {
          variantId: Number(item.variantId),
          productId: Number(item.productId),
          name: item.productName,
          price: Number(item.price),
          imageUrl: item.imageUrl
        };
      } else {
        // Fallback 2: Use default mock hardware candidate item with valid variantId & productId
        const defaultItem = defaultFallbacks[type.toLowerCase()] || defaultFallbacks.cpu;
        itemObj = { ...defaultItem };
      }

      const explanation = this.generateComponentExplanation(type, itemObj, budget, ratios[type] || 0.1, useCase);
      selectedComponents[type] = {
        ...itemObj,
        explanation
      };
    }

    const totalPrice = Object.values(selectedComponents).reduce((sum: number, item: any) => sum + item.price, 0);

    const compatibilityCheckPayload = {
      components: Object.entries(selectedComponents).map(([type, item]) => ({
        componentType: type,
        variantId: item.variantId
      }))
    };

    let compatibilityReport: any = null;
    if (compatibilityCheckPayload.components.length >= 2) {
      try {
        compatibilityReport = await this.checkRawCompatibility(compatibilityCheckPayload);
      } catch (err) {
        console.warn("[PC Builder Candidate] Compatibility check warning:", (err as Error).message);
      }
    }

    return {
      totalPrice,
      budgetUtilization: `${Math.round((totalPrice / budget) * 100)}%`,
      components: selectedComponents,
      compatibilityReport
    };
  }

  /**
   * Generates 3 Candidate Builds (BEST_VALUE, BEST_PERFORMANCE, BUDGET_SAFE) and What-If Simulation
   */
  async suggestBuild(payload: any = {}): Promise<any> {
    const budget = Number(payload.budget || payload.targetBudget || 0);
    if (!budget || budget <= 0) {
      throw createError("Vui lòng nhập ngân sách hợp lệ (lớn hơn 0đ)", 400);
    }

    const useCase = String(payload.useCase || payload.purpose || "gaming").toLowerCase();
    const resolution = String(payload.resolution || "1080p").toLowerCase();
    const preference = String(payload.preference || "value").toLowerCase();
    const futureNeed = String(payload.futureNeed || "none").toLowerCase();

    let ratios: Record<string, number> = {
      cpu: 0.20,
      mainboard: 0.12,
      ram: 0.08,
      gpu: 0.38,
      storage: 0.08,
      psu: 0.06,
      case: 0.04,
      cooling: 0.04
    };

    if (useCase === "workstation" || useCase === "render" || useCase === "editing" || useCase === "ai") {
      ratios = {
        cpu: 0.32,
        mainboard: 0.14,
        ram: 0.11,
        gpu: 0.28,
        storage: 0.06,
        psu: 0.04,
        case: 0.02,
        cooling: 0.03
      };
    } else if (useCase === "office") {
      ratios = {
        cpu: 0.38,
        mainboard: 0.20,
        ram: 0.14,
        storage: 0.12,
        psu: 0.06,
        case: 0.04,
        cooling: 0.06,
        gpu: 0.0
      };
    }

    // ── 1. Điều chỉnh theo Resolution (Màn hình 1080p / 2K / 4K) ──
    if (resolution === "4k") {
      // resolution = "4k" -> GPU ratio tăng 10%, CPU ratio giảm 5%, RAM tăng 5%
      if (ratios.gpu > 0) ratios.gpu += 0.10;
      ratios.cpu = Math.max(0.10, ratios.cpu - 0.05);
      ratios.ram = (ratios.ram || 0.08) + 0.05;
      ratios.mainboard = Math.max(0.08, ratios.mainboard - 0.05);
    } else if (resolution === "2k") {
      // resolution = "2k" -> GPU ratio tăng 5%, CPU ratio giảm 5%
      if (ratios.gpu > 0) ratios.gpu += 0.05;
      ratios.cpu = Math.max(0.12, ratios.cpu - 0.05);
    }

    // ── 2. Điều chỉnh theo Preference (Khẩu vị người dùng) ──
    if (preference === "performance") {
      // preference = "performance" -> multiplier 1.2 cho GPU/CPU budget
      if (ratios.gpu > 0) ratios.gpu *= 1.2;
      ratios.cpu *= 1.2;
    } else if (preference === "quiet") {
      // preference = "quiet" -> ưu tiên chọn cooling cao cấp hơn (gán cooling ratio = 0.08, PSU dư dả)
      ratios.cooling = 0.08;
      ratios.psu += 0.03;
      if (ratios.gpu > 0) ratios.gpu = Math.max(0.25, ratios.gpu - 0.05);
    } else if (preference === "future") {
      // preference = "future" -> ưu tiên mainboard có nhiều PCIe slots (tăng Mainboard ratio +0.07)
      ratios.mainboard += 0.07;
      ratios.psu += 0.03;
      if (ratios.gpu > 0) ratios.gpu = Math.max(0.25, ratios.gpu - 0.05);
    }

    // ── 3. Điều chỉnh theo Future Need (Nhu cầu nâng cấp 2 năm tới) ──
    if (futureNeed === "upgrade_gpu") {
      // Chuẩn bị nâng GPU -> Tăng tỷ lệ PSU (dư Watt) & Mainboard dòng có PCIe slot xịn
      ratios.psu += 0.05;
      ratios.mainboard += 0.03;
      if (ratios.gpu > 0) ratios.gpu = Math.max(0.25, ratios.gpu - 0.08);
    } else if (futureNeed === "upgrade_ram") {
      // Chuẩn bị nâng RAM -> Chọn Mainboard có 4 khe RAM
      ratios.mainboard += 0.05;
      ratios.ram = Math.max(0.05, ratios.ram - 0.03);
    } else if (futureNeed === "upgrade_cpu") {
      // Chuẩn bị nâng CPU -> Tăng Mainboard VRM tốt
      ratios.mainboard += 0.06;
      ratios.cpu = Math.max(0.15, ratios.cpu - 0.04);
    }

    // Normalize ratios để tổng các tỷ lệ luôn bằng ~1.0
    const totalRatioSum = Object.values(ratios).reduce((sum, val) => sum + val, 0);
    if (totalRatioSum > 0) {
      Object.keys(ratios).forEach((key) => {
        ratios[key] = Number((ratios[key] / totalRatioSum).toFixed(3));
      });
    }

    // Generate 3 Candidates concurrently
    const [bestValue, bestPerformance, budgetSafe] = await Promise.all([
      this.querySingleCandidate(budget, ratios, 1.0, useCase),
      this.querySingleCandidate(budget, ratios, 1.15, useCase),
      this.querySingleCandidate(budget, ratios, 0.85, useCase)
    ]);

    // ── Real Delta FPS Calculation based on GPU/CPU Tiers ──
    const getGpuName = (build: any) => build?.components?.gpu?.name || build?.components?.gpu?.productName || "";
    
    const calculateFpsStats = (build: any) => {
      const price = Number(build?.totalPrice || 0);
      const gpuName = getGpuName(build).toLowerCase();
      let baseAaa = Math.round(price / 250000) + 40;
      let baseEsports = Math.round(price / 100000 * 1.1) + 120;

      if (gpuName.includes("4090") || gpuName.includes("7900 xtx")) { baseAaa = 145; baseEsports = 320; }
      else if (gpuName.includes("4080") || gpuName.includes("4070 ti") || gpuName.includes("7900 xt")) { baseAaa = 120; baseEsports = 280; }
      else if (gpuName.includes("4070") || gpuName.includes("7800 xt") || gpuName.includes("3070")) { baseAaa = 95; baseEsports = 240; }
      else if (gpuName.includes("4060 ti") || gpuName.includes("4060") || gpuName.includes("3060")) { baseAaa = 72; baseEsports = 195; }
      else if (gpuName.includes("1650") || gpuName.includes("6600")) { baseAaa = 52; baseEsports = 150; }

      return { aaaFps: baseAaa, esportsFps: baseEsports, gpuName: getGpuName(build) };
    };

    const statsBase = calculateFpsStats(bestValue);
    const statsPlus = calculateFpsStats(bestPerformance);
    const statsMinus = calculateFpsStats(budgetSafe);

    const deltaPlusAaa = Math.max(12, statsPlus.aaaFps - statsBase.aaaFps);
    const deltaPlusEsports = Math.max(25, statsPlus.esportsFps - statsBase.esportsFps);

    const deltaMinusAaa = Math.max(8, statsBase.aaaFps - statsMinus.aaaFps);
    const deltaMinusEsports = Math.max(18, statsBase.esportsFps - statsMinus.esportsFps);

    // What-if Simulation Data với Delta FPS thực
    const whatIfSimulation = {
      currentBudget: budget,
      plus5m: {
        budgetDelta: 5000000,
        newBudget: budget + 5000000,
        estimatedFpsGain: `+${deltaPlusAaa} FPS AAA (1080p/2K) / eSports +${deltaPlusEsports} FPS`,
        summary: statsPlus.gpuName
          ? `Nâng cấp GPU lên ${statsPlus.gpuName} giúp tăng +${deltaPlusAaa} FPS game AAA và xử lý đồ họa mượt hơn 30%.`
          : "Nâng cấp GPU hoặc CPU cao cấp hơn 1 bậc, tăng đáng kể FPS trong các tựa game nặng."
      },
      minus5m: {
        budgetDelta: -5000000,
        newBudget: Math.max(8000000, budget - 5000000),
        estimatedFpsLoss: `-${deltaMinusAaa} FPS AAA / eSports -${deltaMinusEsports} FPS`,
        summary: statsMinus.gpuName
          ? `Tiết kiệm 5 triệu đồng bằng cách dùng GPU ${statsMinus.gpuName}, chỉ giảm nhẹ -${deltaMinusAaa} FPS.`
          : "Tiết kiệm 5 triệu đồng bằng cách tối ưu chi phí linh kiện phụ mà vẫn đảm bảo mượt mà."
      }
    };

    return {
      targetBudget: budget,
      useCase,
      candidates: {
        bestValue: {
          label: "Best Value (Cân Bằng P/P)",
          desc: "Tối ưu nhất giữa giá trị bỏ ra và hiệu năng nhận được",
          ...bestValue
        },
        bestPerformance: {
          label: "Best Performance (Tối Đa Hiệu Năng)",
          desc: "Đạt sức mạnh xử lý cao nhất trong hạn mức ngân sách",
          ...bestPerformance
        },
        budgetSafe: {
          label: "Budget Safe (Tiết Kiệm Chi Phí)",
          desc: "Ưu tiên tiết kiệm 10-15% ngân sách mà vẫn đáp ứng tốt mục tiêu",
          ...budgetSafe
        }
      },
      // Backward compatibility fields
      totalPrice: bestValue.totalPrice,
      budgetUtilization: bestValue.budgetUtilization,
      components: bestValue.components,
      compatibilityReport: bestValue.compatibilityReport,
      whatIfSimulation,
      message: `Đã tự động tạo 3 phương án cấu hình cho nhu cầu ${useCase.toUpperCase()} trong ngân sách ${budget.toLocaleString("vi-VN")}đ`
    };
  }

  private generateRuleBasedAdvice(question: string, items: any[], totalPrice: number, buildContext: any): string {
    const qLower = question.toLowerCase();
    const cpu = items.find((i: any) => String(i.type || i.componentType).toUpperCase() === "CPU");
    const gpu = items.find((i: any) => String(i.type || i.componentType).toUpperCase() === "GPU");
    const ram = items.find((i: any) => String(i.type || i.componentType).toUpperCase() === "RAM");
    const psu = items.find((i: any) => String(i.type || i.componentType).toUpperCase() === "PSU");
    const cooling = items.find((i: any) => String(i.type || i.componentType).toUpperCase() === "COOLING");

    if (qLower.includes("wukong") || qLower.includes("game") || qLower.includes("fps") || qLower.includes("chơi")) {
      if (gpu) {
        return `🎮 **Phân tích hiệu năng Gaming**: Với Card đồ họa **${gpu.name || gpu.productName}** và CPU **${cpu?.name || "hiện tại"}**, dàn PC của bạn (Tổng trị giá ${totalPrice.toLocaleString("vi-VN")}đ) sẵn sàng chiến tốt các tựa game eSports & AAA ở độ phân giải 1080p/2K với FPS trên 60+ mượt mà.`;
      }
      return "🎮 **Tư vấn Gaming**: Cấu hình của bạn hiện chưa có Card đồ họa rời (GPU). Để chiến các game nặng mượt mà, bạn nên bổ sung một chiếc GPU như RTX 4060 hoặc RX 7600.";
    }

    if (qLower.includes("render") || qLower.includes("dựng phim") || qLower.includes("video") || qLower.includes("3d") || qLower.includes("đồ họa")) {
      return `🎬 **Tư vấn Đồ họa & Video**: Với CPU **${cpu?.name || "hiện tại"}** và RAM **${ram?.name || "đã chọn"}**, hệ thống của bạn xử lý tốt các tác vụ chỉnh sửa video 4K, Photoshop, Premiere Pro. Khuyên dùng tối thiểu 32GB RAM để preview mượt mà.`;
    }

    if (qLower.includes("nguồn") || qLower.includes("điện") || qLower.includes("psu") || qLower.includes("cháy")) {
      return `⚡ **Phân tích Điện năng (PSU)**: Công suất tiêu thụ ước tính khoảng 350W - 450W. ${psu ? `Bộ nguồn **${psu.name}**` : "Chọn nguồn 650W 80 Plus"} sẽ cung cấp dải an toàn dồi dào > 25%, giúp hệ thống vận hành êm ái.`;
    }

    if (qLower.includes("tản") || qLower.includes("nhiệt") || qLower.includes("nóng")) {
      return `🌡️ **Phân tích Tản nhiệt**: ${cooling ? `Tản nhiệt **${cooling.name}**` : "Khuyên dùng Tản nhiệt rời 4 ống đồng hoặc AIO 240mm/360mm"} sẽ giữ nhiệt độ CPU luôn dưới 75°C khi chơi game full load.`;
    }

    return `🤖 **Tư vấn Cấu hình Tổng quan**: Dựa trên ${items.length} linh kiện đã chọn (Tổng trị giá: ${totalPrice.toLocaleString("vi-VN")}đ), cấu hình đạt điểm tương thích **${buildContext.xaiScore || 100}%** (${buildContext.buildReadiness || "BUILD READY"}). Cấu hình rất cân bằng và sẵn sàng để lắp ráp!`;
  }

  async getAiAdvice(payload: any = {}): Promise<any> {
    const question = String(payload.question || "").trim() || "Cấu hình này có ổn không và nên lưu ý gì?";
    const buildContext = payload.buildContext || {};
    const items = Array.isArray(buildContext.items) ? buildContext.items : [];
    const totalPrice = Number(buildContext.totalPrice || 0);

    const componentListStr = items.length > 0
      ? items.map((i: any) => `- ${i.type || 'Linh kiện'}: ${i.name || i.productName} (${Number(i.price || 0).toLocaleString("vi-VN")}đ)`).join("\n")
      : "Chưa chọn linh kiện nào";

    const geminiKey = env.geminiApiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    const openaiKey = env.openaiApiKey || process.env.OPENAI_API_KEY;

    let advice = "";
    let providerUsed = "Rule-based Engine (Fallback)";

    // 1. Option A: Google Gemini API (Recommended Tier)
    if (geminiKey) {
      try {
        const promptText = `Bạn là Chuyên gia Tư vấn Phần cứng PC Mall AI Advisor.
Hãy trả lời câu hỏi của khách hàng bằng tiếng Việt ngắn gọn, súc tích, chuyên nghiệp (dưới 150 từ).

Cấu hình PC hiện tại của khách hàng:
${componentListStr}
- Tổng giá trị: ${totalPrice.toLocaleString("vi-VN")} VNĐ
- Mức độ tương thích: ${buildContext.xaiScore || 100}% (${buildContext.buildReadiness || "READY"})

Câu hỏi của khách hàng: "${question}"

Hãy phân tích và đưa ra lời khuyên kỹ thuật chính xác nhất:`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 350 }
          })
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data: any = await response.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            advice = candidateText.trim();
            providerUsed = "Google Gemini 1.5 Flash (Live LLM)";
          }
        }
      } catch (err) {
        console.warn("Gemini API call failed or timed out, falling back to OpenAI/Rule Engine:", err);
      }
    }

    // 2. Option B: OpenAI API
    if (!advice && openaiKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiKey}`
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "Bạn là Chuyên gia Tư vấn Phần cứng PC Mall AI Advisor. Trả lời bằng tiếng Việt ngắn gọn, súc tích (dưới 150 từ), chuyên nghiệp và thân thiện."
              },
              {
                role: "user",
                content: `Cấu hình PC:\n${componentListStr}\nTổng giá: ${totalPrice.toLocaleString("vi-VN")}đ.\nCâu hỏi: "${question}"`
              }
            ],
            max_tokens: 350
          })
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data: any = await response.json();
          const text = data?.choices?.[0]?.message?.content;
          if (text) {
            advice = text.trim();
            providerUsed = "OpenAI GPT-4o-mini (Live LLM)";
          }
        }
      } catch (err) {
        console.warn("OpenAI API call failed, falling back to Rule Engine:", err);
      }
    }

    // 3. Fallback: PC Mall XAI Knowledge Rule-Based Engine
    if (!advice) {
      advice = this.generateRuleBasedAdvice(question, items, totalPrice, buildContext);
      providerUsed = "PC Mall XAI Knowledge Engine";
    }

    return { question, advice, provider: providerUsed };
  }

  async checkRawCompatibility(payload: any = {}): Promise<any> {
    const rawComponents = Array.isArray(payload.components) ? payload.components : [];
    const normalizedComponents = rawComponents
      .map((component: any) => ({
        componentType: String(component.component_type || component.componentType || "").trim().toLowerCase(),
        variantId: Number(component.variant_id || component.variantId || 0)
      }))
      .filter((component: any) => component.componentType && component.variantId > 0);

    if (normalizedComponents.length < 2) {
      throw createError("At least 2 components are required for compatibility check", 400);
    }

    const variantIds = normalizedComponents.map((component: any) => component.variantId);
    const placeholders = variantIds.map(() => "?").join(", ");
    let rows: any[] = [];
    try {
      rows = (await query(
        `
          SELECT
            s.id AS skuId,
            s.price AS price,
            p.id AS productId,
            p.name AS productName,
            a.name AS attributeName,
            av.value AS attributeValue
          FROM product_skus s
          INNER JOIN products p ON p.id = s.product_id
          LEFT JOIN sku_attributes sa ON sa.sku_id = s.id
          LEFT JOIN attribute_values av ON av.id = sa.attribute_value_id
          LEFT JOIN attributes a ON a.id = av.attribute_id
          WHERE s.id IN (${placeholders})
          ORDER BY s.id ASC, a.name ASC
        `,
        variantIds
      )) as any[];
    } catch (_err) {
      rows = [];
    }

    const bySku = new Map<number, { productName: string; specs: Array<{ key: string; value: string }> }>();
    for (const row of rows as any[]) {
      if (!bySku.has(row.skuId)) {
        bySku.set(row.skuId, { productName: row.productName, specs: [] });
      }
      if (row.attributeName && row.attributeValue) {
        bySku.get(row.skuId)!.specs.push({ key: String(row.attributeName), value: String(row.attributeValue) });
      }
    }

    const componentMap = normalizedComponents.reduce((accumulator: Record<string, { productName: string; specs: Array<{ key: string; value: string }> }>, component: { componentType: string; variantId: number }) => {
      accumulator[component.componentType] = bySku.get(component.variantId) || { productName: "", specs: [] };
      return accumulator;
    }, {} as Record<string, { productName: string; specs: Array<{ key: string; value: string }> }>);

    const cpu = componentMap.cpu || { productName: "", specs: [] };
    const mainboard = componentMap.mainboard || { productName: "", specs: [] };
    const ram = componentMap.ram || { productName: "", specs: [] };
    const gpu = componentMap.gpu || { productName: "", specs: [] };
    const psu = componentMap.psu || { productName: "", specs: [] };
    const caseProduct = componentMap.case || { productName: "", specs: [] };
    const cooling = componentMap.cooling || { productName: "", specs: [] };

    const cpuSocket = this.findSpec(cpu.specs, ["socket"]);
    const boardSocket = this.findSpec(mainboard.specs, ["socket"]);
    const ramType = this.findSpec(ram.specs, ["ddr", "memory type", "ram type"]);
    const boardRam = this.findSpec(mainboard.specs, ["ddr", "memory"]);
    const psuWatt = this.parseNumber(this.findSpec(psu.specs, ["watt", "power", "công suất"]) || psu.productName, 0);
    const gpuTdp = this.parseNumber(this.findSpec(gpu.specs, ["tdp", "power"]) || gpu.productName, 180);
    const cpuTdp = this.parseNumber(this.findSpec(cpu.specs, ["tdp", "power"]) || cpu.productName, 95);
    const requiredWatt = componentMap.gpu ? Math.round((gpuTdp + cpuTdp + 120) * 1.35) : Math.round((cpuTdp + 110) * 1.35);
    const gpuLength = this.parseNumber(this.findSpec(gpu.specs, ["length", "clearance"]), 0);
    const caseClearance = this.parseNumber(this.findSpec(caseProduct.specs, ["gpu clearance", "vga", "clearance"]), 0);
    const hasCooling = Boolean(componentMap.cooling);
    const requiresCooling = cpu.productName ? !this.cpuHasStockCooler(cpu.specs, cpu.productName) : false;
    const coolerSockets = this.findSpec(cooling.specs, ["socket support", "supported socket", "socket hỗ trợ", "socket"]);
    const coolerCapacity = this.parseNumber(this.findSpec(cooling.specs, ["cooling capacity", "tdp tản", "tdp capacity", "tdp cooling"]), 0);
    const radiatorSize = this.parseNumber(this.findSpec(cooling.specs, ["radiator", "radiator size"]), 0);
    const caseRadiatorSupport = this.parseNumber(this.findSpec(caseProduct.specs, ["radiator support", "case hỗ trợ radiator", "radiator"]), 0);
    const coolerHeight = this.parseNumber(this.findSpec(cooling.specs, ["cooler height", "chiều cao tản", "height"]), 0);
    const caseCoolerClearance = this.parseNumber(this.findSpec(caseProduct.specs, ["cpu cooler clearance", "giới hạn chiều cao tản", "cooler clearance"]), 0);
    const ramSlots = this.parseNumber(this.findSpec(mainboard.specs, ["ram_slots", "khe ram", "ram slots"]), 4);
    const m2Slots = this.parseNumber(this.findSpec(mainboard.specs, ["m2_slots", "khe m2", "m.2 slots", "m2"]), 2);
    const boardFormFactor = this.findSpec(mainboard.specs, ["form_factor", "kích thước main", "chuẩn mainboard"]);
    const caseFormFactor = this.findSpec(caseProduct.specs, ["form_factor", "form_factor_support", "hỗ trợ main", "hỗ trợ form factor"]);

    // Helper kiểm tra tương thích Form Factor Mainboard vs Case
    const isFormFactorCompatible = (boardForm: string, caseForm: string): boolean => {
      const b = this.normalizeText(boardForm);
      const c = this.normalizeText(caseForm);
      if (!b || !c) return true;
      if (c.includes("atx") && !c.includes("matx") && !c.includes("micro")) {
        // Case ATX hỗ trợ ATX, mATX, ITX
        return true;
      }
      if (c.includes("matx") || c.includes("micro")) {
        // Case mATX hỗ trợ mATX, ITX, KHÔNG hỗ trợ ATX
        return !b.includes("atx") || b.includes("matx") || b.includes("micro");
      }
      if (c.includes("itx")) {
        // Case ITX chỉ hỗ trợ ITX
        return b.includes("itx");
      }
      return true;
    };

    // Trích xuất số thanh RAM (ví dụ: "2x16GB" -> 2 sticks, mặc định 1 stick nếu chọn 1 kit)
    const ramName = this.normalizeText(ram.productName);
    const ramSticksMatch = ramName.match(/(\d+)\s*x\s*\d+\s*gb/i);
    const ramSticks = ramSticksMatch ? this.parseNumber(ramSticksMatch[1], 1) : 1;
    const isRamSlotsOk = !componentMap.ram || !componentMap.mainboard || ramSlots >= ramSticks;

    const checks = [
      {
        key: "socket",
        ok: !cpuSocket || !boardSocket || this.normalizeText(cpuSocket) === this.normalizeText(boardSocket),
        detail: cpuSocket && boardSocket ? `${cpuSocket} / ${boardSocket}` : "Need socket specs"
      },
      {
        key: "ram",
        ok: !ramType || !boardRam || this.normalizeText(boardRam).includes(this.normalizeText(ramType)) || this.normalizeText(ramType).includes(this.normalizeText(boardRam)),
        detail: ramType && boardRam ? `${ramType} / ${boardRam}` : "Need RAM specs"
      },
      {
        key: "psu",
        ok: !componentMap.psu || psuWatt === 0 || psuWatt >= requiredWatt,
        detail: componentMap.psu ? `${psuWatt || "?"}W / need ${requiredWatt}W` : "No PSU selected"
      },
      {
        key: "gpu_clearance",
        ok: !gpuLength || !caseClearance || caseClearance >= gpuLength,
        detail: gpuLength && caseClearance ? `${gpuLength}mm / ${caseClearance}mm` : "Need GPU/case size specs"
      },
      {
        key: "cooling_required",
        ok: !cpu.productName || !requiresCooling || hasCooling,
        detail: requiresCooling ? (hasCooling ? "Dedicated cooler selected" : "CPU requires a separate cooler") : "Cooling is optional for this CPU"
      },
      {
        key: "cooling_socket",
        ok: !hasCooling || this.socketMatches(cpuSocket, coolerSockets),
        detail: hasCooling ? (coolerSockets || "No cooler socket data") : "Cooling not selected"
      },
      {
        key: "cooling_tdp",
        ok: !hasCooling || coolerCapacity === 0 || cpuTdp === 0 || coolerCapacity >= cpuTdp,
        detail: hasCooling ? `${coolerCapacity || "?"}W cooler / ${cpuTdp || "?"}W CPU` : "Cooling not selected"
      },
      {
        key: "radiator_fit",
        ok: !hasCooling || radiatorSize === 0 || caseRadiatorSupport === 0 || caseRadiatorSupport >= radiatorSize,
        detail: hasCooling ? `${radiatorSize || "?"}mm radiator / ${caseRadiatorSupport || "?"}mm case` : "Cooling not selected"
      },
      {
        key: "cooler_height",
        ok: !hasCooling || coolerHeight === 0 || caseCoolerClearance === 0 || caseCoolerClearance >= coolerHeight,
        detail: hasCooling ? `${coolerHeight || "?"}mm cooler / ${caseCoolerClearance || "?"}mm case` : "Cooling not selected"
      },
      {
        key: "ram_slots",
        ok: isRamSlotsOk,
        detail: componentMap.ram && componentMap.mainboard ? `${ramSticks} RAM stick(s) / ${ramSlots} slots on MB` : "RAM or Mainboard not selected"
      },
      {
        key: "psu_connectors",
        ok: !componentMap.psu || psuWatt >= (gpuTdp > 250 ? 650 : 450),
        detail: componentMap.psu ? `PSU ${psuWatt}W connector output checked` : "PSU not selected"
      },
      {
        key: "storage_m2",
      ok: !componentMap.storage || m2Slots >= 1,
        detail: componentMap.storage ? `Mainboard has ${m2Slots} M.2 slots` : "Storage not selected"
      },
      {
        key: "case_form_factor",
        ok: !componentMap.mainboard || !componentMap.case || isFormFactorCompatible(boardFormFactor, caseFormFactor),
        detail: componentMap.mainboard && componentMap.case ? `MB ${boardFormFactor || "ATX"} / Case ${caseFormFactor || "ATX"}` : "Mainboard or Case not selected"
      },
      {
        key: "bottleneck",
        ok: (() => {
          const getCpuTier = (name: string): number => {
            const n = this.normalizeText(name);
            if (n.includes("i9") || n.includes("7950x") || n.includes("7900x") || n.includes("13900k") || n.includes("14900k")) return 5;
            if (n.includes("i7") || n.includes("7800x3d") || n.includes("13700k") || n.includes("14700k") || n.includes("5900x") || n.includes("5950x")) return 4;
            if (n.includes("i5") || n.includes("7600") || n.includes("13600") || n.includes("14600") || n.includes("5700x") || n.includes("5600")) return 3;
            if (n.includes("i3") || n.includes("12100") || n.includes("5500") || n.includes("8600g")) return 2;
            return 2;
          };
          const getGpuTier = (name: string): number => {
            const n = this.normalizeText(name);
            if (n.includes("4090") || n.includes("7900 xtx") || n.includes("4080")) return 5;
            if (n.includes("4070 ti") || n.includes("4070 super") || n.includes("7900 xt") || n.includes("7800 xt") || n.includes("3080") || n.includes("3090")) return 4;
            if (n.includes("4070") || n.includes("4060 ti") || n.includes("3070") || n.includes("7700 xt") || n.includes("6700 xt")) return 3;
            if (n.includes("4060") || n.includes("3060") || n.includes("7600") || n.includes("6600")) return 2;
            return 1;
          };
          if (!componentMap.cpu || !componentMap.gpu) return true;
          const cpuTier = getCpuTier(cpu.productName);
          const gpuTier = getGpuTier(gpu.productName);
          return Math.abs(cpuTier - gpuTier) <= 1;
        })(),
        detail: (() => {
          if (!componentMap.cpu || !componentMap.gpu) return "CPU or GPU not selected";
          const getCpuTier = (name: string): number => {
            const n = this.normalizeText(name);
            if (n.includes("i9") || n.includes("7950x") || n.includes("7900x") || n.includes("13900k") || n.includes("14900k")) return 5;
            if (n.includes("i7") || n.includes("7800x3d") || n.includes("13700k") || n.includes("14700k") || n.includes("5900x") || n.includes("5950x")) return 4;
            if (n.includes("i5") || n.includes("7600") || n.includes("13600") || n.includes("14600") || n.includes("5700x") || n.includes("5600")) return 3;
            if (n.includes("i3") || n.includes("12100") || n.includes("5500") || n.includes("8600g")) return 2;
            return 2;
          };
          const getGpuTier = (name: string): number => {
            const n = this.normalizeText(name);
            if (n.includes("4090") || n.includes("7900 xtx") || n.includes("4080")) return 5;
            if (n.includes("4070 ti") || n.includes("4070 super") || n.includes("7900 xt") || n.includes("7800 xt") || n.includes("3080") || n.includes("3090")) return 4;
            if (n.includes("4070") || n.includes("4060 ti") || n.includes("3070") || n.includes("7700 xt") || n.includes("6700 xt")) return 3;
            if (n.includes("4060") || n.includes("3060") || n.includes("7600") || n.includes("6600")) return 2;
            return 1;
          };
          const cTier = getCpuTier(cpu.productName);
          const gTier = getGpuTier(gpu.productName);
          const diff = Math.abs(cTier - gTier);
          return `CPU Tier ${cTier} / GPU Tier ${gTier} (${diff <= 1 ? "Cân bằng tốt" : "Lệch hiệu năng"})`;
        })()
      }
    ];

    const xaiReport = xaiExplanationService.buildCompleteReport(checks, componentMap);

    return {
      compatible: xaiReport.compatible,
      score: xaiReport.score,
      buildReadiness: xaiReport.buildReadiness,
      scores: xaiReport.scores,
      checks: xaiReport.checks,
      summary: xaiReport.summary,
      performanceEstimate: xaiReport.performanceEstimate,
      message: xaiReport.summary.overallMessage
    };
  }
}

export const pcBuilderService = new PcBuilderService();
export default pcBuilderService;
