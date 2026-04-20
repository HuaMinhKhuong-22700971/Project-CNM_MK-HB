const { getDbPool, query } = require("../../config/database");
const { createError, toPositiveInteger } = require("../../utils/service-helpers");

function toMoney(value) {
  return Number(Number(value || 0).toFixed(2));
}

async function findBuildById(userId, buildId, connection = null) {
  const executor = connection || getDbPool();
  const [rows] = await executor.execute(
    `
      SELECT id, user_id AS userId, name, created_at AS createdAt
      FROM pc_builds
      WHERE id = ? AND user_id = ?
      LIMIT 1
    `,
    [buildId, userId]
  );

  return rows[0] || null;
}

async function findSkuById(skuId) {
  const rows = await query(
    `
      SELECT
        s.id AS id,
        s.product_id AS productId,
        s.price AS price,
        COALESCE(s.stock, 0) AS stock,
        p.name AS productName,
        p.description AS productDescription,
        p.category_id AS categoryId,
        c.name AS categoryName
      FROM product_skus s
      INNER JOIN products p ON p.id = s.product_id
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE s.id = ?
      LIMIT 1
    `,
    [skuId]
  );

  const sku = rows[0] || null;

  if (!sku) {
    return null;
  }

  const attributes = await getSkuAttributes(sku.id);
  return {
    ...sku,
    sku: `SKU-${sku.id}`,
    attributes
  };
}

async function getSkuAttributes(skuId) {
  const rows = await query(
    `
      SELECT
        a.name AS attributeName,
        av.id AS attributeValueId,
        av.value AS attributeValue
      FROM sku_attributes sa
      INNER JOIN attribute_values av ON av.id = sa.attribute_value_id
      INNER JOIN attributes a ON a.id = av.attribute_id
      WHERE sa.sku_id = ?
      ORDER BY a.name ASC
    `,
    [skuId]
  );

  const attributes = {};

  for (const row of rows) {
    const key = String(row.attributeName || "").trim().toLowerCase().replace(/\s+/g, "_");
    attributes[key] = {
      attributeKey: key,
      attributeValueId: row.attributeValueId,
      attributeValue: row.attributeValue
    };
  }

  return attributes;
}

async function findBuildItemByComponentType(buildId, componentType, connection = null) {
  const executor = connection || getDbPool();
  const [rows] = await executor.execute(
    `
      SELECT id, build_id AS buildId, sku_id AS skuId, component_type AS componentType
      FROM pc_build_items
      WHERE build_id = ? AND component_type = ?
      LIMIT 1
    `,
    [buildId, componentType]
  );

  return rows[0] || null;
}

async function getBuildItems(buildId) {
  const rows = await query(
    `
      SELECT
        i.id AS itemId,
        i.component_type AS componentType,
        s.id AS skuId,
        s.price AS price,
        COALESCE(s.stock, 0) AS stock,
        p.id AS productId,
        p.name AS productName,
        c.id AS categoryId,
        c.name AS categoryName
      FROM pc_build_items i
      INNER JOIN product_skus s ON s.id = i.sku_id
      INNER JOIN products p ON p.id = s.product_id
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE i.build_id = ?
      ORDER BY i.id ASC
    `,
    [buildId]
  );

  const items = [];

  for (const row of rows) {
    const attributes = await getSkuAttributes(row.skuId);
    items.push({
      id: row.itemId,
      componentType: row.componentType,
      quantity: 1,
      unitPrice: Number(row.price || 0),
      lineTotal: toMoney(row.price || 0),
      product: {
        id: row.productId,
        name: row.productName,
        slug: String(row.productId)
      },
      variant: {
        id: row.skuId,
        sku: `SKU-${row.skuId}`,
        price: Number(row.price || 0),
        stock: Number(row.stock || 0),
        imageUrl: null
      },
      _attributes: attributes,
      _categoryId: row.categoryId,
      _categoryName: row.categoryName
    });
  }

  return items;
}

function formatBuild(build, items) {
  const totalPrice = toMoney(items.reduce((sum, item) => sum + item.lineTotal, 0));
  const components = {};

  for (const item of items) {
    components[item.componentType] = {
      id: item.id,
      componentType: item.componentType,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
      product: item.product,
      variant: item.variant
    };
  }

  return {
    id: build.id,
    userId: build.userId,
    name: build.name,
    status: "DRAFT",
    totalPrice,
    createdAt: build.createdAt,
    updatedAt: build.createdAt,
    items: items.map((item) => ({
      id: item.id,
      componentType: item.componentType,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
      product: item.product,
      variant: item.variant
    })),
    components
  };
}

async function getBuildDetail(userId, buildId) {
  const parsedBuildId = toPositiveInteger(buildId, "buildId");
  const build = await findBuildById(userId, parsedBuildId);

  if (!build) {
    throw createError("PC build not found", 404);
  }

  const items = await getBuildItems(parsedBuildId);
  return formatBuild(build, items);
}

async function createBuild(userId, payload = {}) {
  const name = String(payload.name || "My PC Build").trim() || "My PC Build";
  const [result] = await getDbPool().execute(
    `INSERT INTO pc_builds (user_id, name, created_at) VALUES (?, ?, NOW())`,
    [userId, name]
  );

  return getBuildDetail(userId, result.insertId);
}

async function upsertBuildItem(userId, buildId, payload) {
  const parsedBuildId = toPositiveInteger(buildId, "buildId");
  const skuId = toPositiveInteger(payload.productVariantId, "productVariantId");
  const componentType = String(payload.componentType || "").trim().toLowerCase();

  if (!componentType) {
    throw createError("componentType is required", 400);
  }

  const build = await findBuildById(userId, parsedBuildId);
  if (!build) {
    throw createError("PC build not found", 404);
  }

  const sku = await findSkuById(skuId);
  if (!sku) {
    throw createError("Product variant not found", 404);
  }

  if (Number(sku.stock || 0) <= 0) {
    throw createError("Not enough stock for this product variant", 400);
  }

  const connection = await getDbPool().getConnection();

  try {
    await connection.beginTransaction();

    const existingItem = await findBuildItemByComponentType(parsedBuildId, componentType, connection);

    if (existingItem) {
      await connection.execute(
        `UPDATE pc_build_items SET sku_id = ? WHERE id = ?`,
        [skuId, existingItem.id]
      );
    } else {
      await connection.execute(
        `INSERT INTO pc_build_items (build_id, sku_id, component_type) VALUES (?, ?, ?)`,
        [parsedBuildId, skuId, componentType]
      );
    }

    await connection.commit();
    return getBuildDetail(userId, parsedBuildId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function removeBuildItem(userId, buildId, componentType) {
  const parsedBuildId = toPositiveInteger(buildId, "buildId");
  const normalizedComponentType = String(componentType || "").trim().toLowerCase();
  const build = await findBuildById(userId, parsedBuildId);

  if (!build) {
    throw createError("PC build not found", 404);
  }

  const connection = await getDbPool().getConnection();

  try {
    await connection.beginTransaction();
    const existingItem = await findBuildItemByComponentType(parsedBuildId, normalizedComponentType, connection);

    if (!existingItem) {
      throw createError("Build item not found", 404);
    }

    await connection.execute(`DELETE FROM pc_build_items WHERE id = ?`, [existingItem.id]);
    await connection.commit();
    return getBuildDetail(userId, parsedBuildId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function saveBuild(userId, buildId, payload = {}) {
  const parsedBuildId = toPositiveInteger(buildId, "buildId");
  const build = await findBuildById(userId, parsedBuildId);

  if (!build) {
    throw createError("PC build not found", 404);
  }

  const name = String(payload.name || build.name || "My PC Build").trim() || "My PC Build";
  await query(`UPDATE pc_builds SET name = ? WHERE id = ? AND user_id = ?`, [name, parsedBuildId, userId]);
  return getBuildDetail(userId, parsedBuildId);
}

async function getSkuCandidatesByCategory(categoryName) {
  const rows = await query(
    `
      SELECT
        c.name AS categoryName,
        p.id AS productId,
        p.name AS productName,
        s.id AS skuId,
        s.price AS price,
        COALESCE(s.stock, 0) AS stock
      FROM categories c
      INNER JOIN products p ON p.category_id = c.id
      INNER JOIN product_skus s ON s.product_id = p.id
      WHERE UPPER(c.name) = UPPER(?)
      ORDER BY s.price ASC, s.id ASC
    `,
    [categoryName]
  );

  const candidates = [];

  for (const row of rows) {
    if (Number(row.stock || 0) <= 0) {
      continue;
    }

    candidates.push({
      componentType: String(categoryName || "").trim().toLowerCase(),
      categoryName: row.categoryName,
      brandName: null,
      product: {
        id: row.productId,
        name: row.productName,
        slug: String(row.productId)
      },
      variant: {
        id: row.skuId,
        sku: `SKU-${row.skuId}`,
        price: Number(row.price || 0),
        stockQuantity: Number(row.stock || 0),
        imageUrl: null
      },
      attributes: await getSkuAttributes(row.skuId)
    });
  }

  return candidates;
}

function pickCandidateByBudget(candidates, targetBudget, fallbackRequired = true) {
  if (!candidates || candidates.length === 0) {
    return null;
  }

  const sortedCandidates = [...candidates].sort((a, b) => a.variant.price - b.variant.price);
  const withinTarget = sortedCandidates.filter((candidate) => candidate.variant.price <= targetBudget);

  if (withinTarget.length > 0) {
    return withinTarget[withinTarget.length - 1];
  }

  return fallbackRequired ? sortedCandidates[0] : null;
}

const PURPOSE_PROFILES = {
  gaming: {
    explanation: "Tap trung ngan sach vao CPU va GPU de toi uu hieu nang cho game.",
    targetRatios: { cpu: 0.18, mainboard: 0.14, ram: 0.12, storage: 0.10, gpu: 0.32, psu: 0.08, case: 0.06 },
    requireGpu: true
  },
  office: {
    explanation: "Uu tien cau hinh can bang, tiet kiem chi phi va du dung cho van phong.",
    targetRatios: { cpu: 0.24, mainboard: 0.16, ram: 0.16, storage: 0.16, gpu: 0, psu: 0.10, case: 0.08 },
    requireGpu: false
  },
  programming: {
    explanation: "Uu tien CPU, RAM va SSD de phu hop compile va da nhiem.",
    targetRatios: { cpu: 0.24, mainboard: 0.15, ram: 0.18, storage: 0.16, gpu: 0, psu: 0.10, case: 0.08 },
    requireGpu: false
  },
  design: {
    explanation: "Can bang giua CPU, RAM va GPU cho nhu cau do hoa co ban.",
    targetRatios: { cpu: 0.20, mainboard: 0.14, ram: 0.16, storage: 0.12, gpu: 0.24, psu: 0.08, case: 0.06 },
    requireGpu: true
  }
};

function getPurposeProfile(purpose) {
  const normalized = String(purpose || "").trim().toLowerCase();
  const profile = PURPOSE_PROFILES[normalized];

  if (!profile) {
    throw createError("purpose must be one of: gaming, office, programming, design", 400);
  }

  return {
    key: normalized,
    ...profile
  };
}

async function suggestBuild(payload = {}) {
  const budget = Number(payload.budget);

  if (!Number.isFinite(budget) || budget <= 0) {
    throw createError("budget must be a positive number", 400);
  }

  const profile = getPurposeProfile(payload.purpose);
  const [cpuCandidates, mainboardCandidates, ramCandidates, storageCandidates, gpuCandidates, psuCandidates, caseCandidates] = await Promise.all([
    getSkuCandidatesByCategory("CPU"),
    getSkuCandidatesByCategory("MAINBOARD"),
    getSkuCandidatesByCategory("RAM"),
    getSkuCandidatesByCategory("STORAGE"),
    getSkuCandidatesByCategory("GPU"),
    getSkuCandidatesByCategory("PSU"),
    getSkuCandidatesByCategory("CASE")
  ]);

  const selectedItems = [];
  const cpu = pickCandidateByBudget(cpuCandidates, budget * profile.targetRatios.cpu, true);
  const mainboard = pickCandidateByBudget(mainboardCandidates, budget * profile.targetRatios.mainboard, true);
  const ram = pickCandidateByBudget(ramCandidates, budget * profile.targetRatios.ram, true);
  const storage = pickCandidateByBudget(storageCandidates, budget * profile.targetRatios.storage, true);
  const psu = pickCandidateByBudget(psuCandidates, budget * profile.targetRatios.psu, true);
  const caseItem = pickCandidateByBudget(caseCandidates, budget * profile.targetRatios.case, true);

  for (const item of [cpu, mainboard, ram, storage, psu, caseItem]) {
    if (!item) {
      throw createError("Not enough component data in database to generate build suggestion", 404);
    }
    selectedItems.push(item);
  }

  if (profile.requireGpu) {
    const gpu = pickCandidateByBudget(gpuCandidates, budget * profile.targetRatios.gpu, true);
    if (!gpu) {
      throw createError("No GPU candidate found in database", 404);
    }
    selectedItems.push(gpu);
  }

  const totalPrice = toMoney(selectedItems.reduce((sum, item) => sum + Number(item.variant.price || 0), 0));

  return {
    purpose: profile.key,
    budget: toMoney(budget),
    totalPrice,
    remainingBudget: toMoney(budget - totalPrice),
    compatible: true,
    explanation: profile.explanation,
    items: selectedItems.map((item) => ({
      componentType: item.componentType,
      categoryName: item.categoryName,
      brandName: item.brandName,
      product: item.product,
      variant: item.variant,
      attributes: item.attributes
    }))
  };
}

module.exports = {
  createBuild,
  upsertBuildItem,
  getBuildDetail,
  removeBuildItem,
  saveBuild,
  suggestBuild
};
