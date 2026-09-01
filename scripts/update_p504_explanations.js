const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../services/api/src/modules/pc-builder/pc-builder.service.ts');
let code = fs.readFileSync(file, 'utf8');

const targetOld = `  private async querySingleCandidate(budget: number, ratios: Record<string, number>, multiplier: number = 1.0) {
    const selectedComponents: Record<string, any> = {};
    const componentTypes = Object.keys(ratios).filter((type) => ratios[type] > 0);

    for (const type of componentTypes) {
      const maxSubBudget = Math.round(budget * ratios[type] * multiplier * 1.15);

      const rows = await query(
        \`
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
        WHERE (LOWER(c.name) LIKE CONCAT('%', ?, '%') OR LOWER(c.slug) LIKE CONCAT('%', ?, '%') OR LOWER(p.name) LIKE CONCAT('%', ?, '%'))
          AND s.price <= ?
          AND s.stock > 0
        ORDER BY s.price DESC
        LIMIT 1
        \`,
        [type, type, type, maxSubBudget]
      );

      if ((rows as any[]).length > 0) {
        const item = (rows as any[])[0];
        selectedComponents[type] = {
          variantId: Number(item.variantId),
          productId: Number(item.productId),
          name: item.productName,
          price: Number(item.price),
          imageUrl: item.imageUrl
        };
      }
    }`;

const targetNew = `  private generateComponentExplanation(
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
          return \`CPU \${name}: Chọn vì sức mạnh xử lý đa nhân cực mạnh (\${percent}% ngân sách), phục vụ tối ưu cho Render 4K/3D và Gaming đỉnh cao.\`;
        }
        if (nameLower.includes("i7") || nameLower.includes("7800x3d") || nameLower.includes("13700")) {
          return \`CPU \${name}: Chọn vì hiệu năng Gaming & Đồ họa cao cấp (\${percent}% ngân sách), duy trì xung nhịp ổn định không lo giật lag.\`;
        }
        return \`CPU \${name}: Chọn vì cân bằng giá/hiệu năng tuyệt vời (\${percent}% ngân sách), đáp ứng hoàn hảo nhu cầu \${useCase.toUpperCase()} và dễ dàng nâng cấp.\`;

      case "gpu":
        if (nameLower.includes("4090") || nameLower.includes("4080") || nameLower.includes("7900 xtx")) {
          return \`GPU \${name}: Trái tim của hệ thống (\${percent}% ngân sách), sức mạnh đồ họa đỉnh bảng cân mượt mọi game AAA ở 4K Max Settings & Ray Tracing.\`;
        }
        if (nameLower.includes("4070") || nameLower.includes("7800 xt") || nameLower.includes("3070")) {
          return \`GPU \${name}: Động cơ đồ họa chính (\${percent}% ngân sách), chiến mượt mà các tựa game 2K/1080p High FPS và tăng tốc render video.\`;
        }
        return \`GPU \${name}: Chọn vì tối ưu chi phí (\${percent}% ngân sách), xử lý mượt các game eSports phổ biến và xuất hình ảnh độ phân giải cao.\`;

      case "mainboard":
        if (nameLower.includes("z790") || nameLower.includes("x670") || nameLower.includes("z690")) {
          return \`Mainboard \${name}: Bo mạch chủ phân khúc cao cấp (\${percent}% ngân sách), dàn VRM xịn cấp điện ổn định và hỗ trợ ép xung mạnh mẽ.\`;
        }
        if (nameLower.includes("b760") || nameLower.includes("b650") || nameLower.includes("b550")) {
          return \`Mainboard \${name}: Lựa chọn quốc dân (\${percent}% ngân sách), trang bị đầy đủ khe M.2 NVMe, PCIe 4.0/5.0 và hỗ trợ nâng cấp phần cứng.\`;
        }
        return \`Mainboard \${name}: Tối ưu chi phí (\${percent}% ngân sách), chân cắm linh hoạt, vận hành bền bỉ cho toàn hệ thống.\`;

      case "ram":
        if (nameLower.includes("32gb") || nameLower.includes("64gb")) {
          return \`RAM \${name}: Dung lượng bộ nhớ dồi dào (\${percent}% ngân sách), đảm bảo đa nhiệm mượt mà không lo đầy RAM khi dựng phim hay vừa chơi game vừa live stream.\`;
        }
        return \`RAM \${name}: Chọn vì đáp ứng đủ chuẩn bộ nhớ (\${percent}% ngân sách), tốc độ bus mượt mà cho các tác vụ hàng ngày.\`;

      case "psu":
        if (nameLower.includes("850") || nameLower.includes("1000") || nameLower.includes("gold")) {
          return \`Nguồn \${name}: Công suất thực mạnh mẽ (\${percent}% ngân sách), chuẩn 80 Plus Gold dư tải an toàn > 25% giúp bảo vệ linh kiện.\`;
        }
        return \`Nguồn \${name}: Cấp điện ổn định (\${percent}% ngân sách), đáp ứng tốt tổng công suất tiêu thụ của CPU & GPU.\`;

      case "cooling":
        if (nameLower.includes("360") || nameLower.includes("aio") || nameLower.includes("240")) {
          return \`Tản nhiệt \${name}: Giải pháp tản nhiệt nước AIO (\${percent}% ngân sách), giữ CPU luôn mát mẻ < 75°C khi chơi game full load.\`;
        }
        return \`Tản nhiệt \${name}: Tản nhiệt tháp khí hiệu năng cao (\${percent}% ngân sách), độ ồn thấp và duy trì nhiệt độ tối ưu.\`;

      case "storage":
        return \`Ổ cứng \${name}: Ổ SSD NVMe tốc độ cao (\${percent}% ngân sách), giúp khởi động Windows và load game chỉ trong vài giây.\`;

      case "case":
        return \`Vỏ Case \${name}: Thiết kế thoáng khí (\${percent}% ngân sách), luồng gió tối ưu và không gian rộng rãi chứa vừa vặn các linh kiện.\`;

      default:
        return \`\${name}: Được lựa chọn tối ưu theo tỷ lệ ngân sách \${percent}%.\`;
    }
  }

  private async querySingleCandidate(budget: number, ratios: Record<string, number>, multiplier: number = 1.0, useCase: string = "gaming") {
    const selectedComponents: Record<string, any> = {};
    const componentTypes = Object.keys(ratios).filter((type) => ratios[type] > 0);

    for (const type of componentTypes) {
      const maxSubBudget = Math.round(budget * ratios[type] * multiplier * 1.15);

      const rows = await query(
        \`
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
        WHERE (LOWER(c.name) LIKE CONCAT('%', ?, '%') OR LOWER(c.slug) LIKE CONCAT('%', ?, '%') OR LOWER(p.name) LIKE CONCAT('%', ?, '%'))
          AND s.price <= ?
          AND s.stock > 0
        ORDER BY s.price DESC
        LIMIT 1
        \`,
        [type, type, type, maxSubBudget]
      );

      if ((rows as any[]).length > 0) {
        const item = (rows as any[])[0];
        const itemObj = {
          variantId: Number(item.variantId),
          productId: Number(item.productId),
          name: item.productName,
          price: Number(item.price),
          imageUrl: item.imageUrl
        };
        const explanation = this.generateComponentExplanation(type, itemObj, budget, ratios[type] || 0.1, useCase);
        selectedComponents[type] = {
          ...itemObj,
          explanation
        };
      }
    }`;

if (code.includes(targetOld)) {
  code = code.replace(targetOld, targetNew);
  
  // Update querySingleCandidate calls in suggestBuild
  code = code.replace("this.querySingleCandidate(budget, ratios, 1.0),", "this.querySingleCandidate(budget, ratios, 1.0, useCase),");
  code = code.replace("this.querySingleCandidate(budget, ratios, 1.15),", "this.querySingleCandidate(budget, ratios, 1.15, useCase),");
  code = code.replace("this.querySingleCandidate(budget, ratios, 0.85)", "this.querySingleCandidate(budget, ratios, 0.85, useCase)");

  fs.writeFileSync(file, code, 'utf8');
  console.log('✅ Updated querySingleCandidate with generateComponentExplanation successfully!');
} else {
  console.error('❌ Target snippet not found in pc-builder.service.ts');
}
