const { query } = require("../../config/database");
const { createError, toPositiveInteger } = require("../../utils/service-helpers");

function normalizeAttributeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

async function findBuild(userId, buildId) {
  const rows = await query(
    `
      SELECT id, user_id AS userId, name
      FROM pc_builds
      WHERE id = ? AND user_id = ?
      LIMIT 1
    `,
    [buildId, userId]
  );

  return rows[0] || null;
}

async function getBuildItemsWithAttributes(buildId) {
  const rows = await query(
    `
      SELECT
        i.id AS buildItemId,
        i.component_type AS componentType,
        s.id AS skuId,
        p.id AS productId,
        p.name AS productName,
        c.id AS categoryId,
        c.name AS categoryName,
        a.id AS attributeId,
        a.name AS attributeName,
        av.id AS attributeValueId,
        av.value AS attributeValue
      FROM pc_build_items i
      INNER JOIN product_skus s ON s.id = i.sku_id
      INNER JOIN products p ON p.id = s.product_id
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN sku_attributes sa ON sa.sku_id = s.id
      LEFT JOIN attribute_values av ON av.id = sa.attribute_value_id
      LEFT JOIN attributes a ON a.id = av.attribute_id
      WHERE i.build_id = ?
      ORDER BY i.id ASC, a.name ASC
    `,
    [buildId]
  );

  const itemMap = new Map();

  for (const row of rows) {
    if (!itemMap.has(row.buildItemId)) {
      itemMap.set(row.buildItemId, {
        buildItemId: row.buildItemId,
        componentType: row.componentType,
        variant: {
          id: row.skuId,
          sku: `SKU-${row.skuId}`
        },
        product: {
          id: row.productId,
          name: row.productName,
          categoryId: row.categoryId,
          categoryName: row.categoryName
        },
        attributes: {}
      });
    }

    if (row.attributeId && row.attributeValueId) {
      const item = itemMap.get(row.buildItemId);
      const attributeKey = normalizeAttributeKey(row.attributeName);
      item.attributes[attributeKey] = {
        attributeId: row.attributeId,
        attributeKey,
        attributeValueId: row.attributeValueId,
        attributeValue: row.attributeValue
      };
    }
  }

  return Array.from(itemMap.values());
}

async function getCompatibilityMap() {
  const rows = await query(
    `
      SELECT id, attribute_value_1 AS attributeValue1, attribute_value_2 AS attributeValue2, is_compatible AS isCompatible
      FROM compatibility_rules
      ORDER BY id ASC
    `
  );

  const compatibilityMap = new Map();

  for (const row of rows) {
    const left = Number(row.attributeValue1);
    const right = Number(row.attributeValue2);
    const key = left < right ? `${left}:${right}` : `${right}:${left}`;
    compatibilityMap.set(key, {
      ruleId: row.id,
      isCompatible: Number(row.isCompatible) === 1
    });
  }

  return compatibilityMap;
}

function buildIssue(ruleId, sourceItem, targetItem, sourceAttribute, targetAttribute) {
  return {
    ruleId,
    ruleDescription: null,
    source: {
      componentType: sourceItem.componentType,
      categoryName: sourceItem.product.categoryName,
      productName: sourceItem.product.name,
      sku: sourceItem.variant.sku,
      attributeKey: sourceAttribute.attributeKey,
      attributeValue: sourceAttribute.attributeValue
    },
    target: {
      componentType: targetItem.componentType,
      categoryName: targetItem.product.categoryName,
      productName: targetItem.product.name,
      sku: targetItem.variant.sku,
      attributeKey: targetAttribute.attributeKey,
      attributeValue: targetAttribute.attributeValue
    },
    message: `${sourceItem.product.categoryName || sourceItem.componentType} ${sourceAttribute.attributeKey} (${sourceAttribute.attributeValue}) is not compatible with ${targetItem.product.categoryName || targetItem.componentType} ${targetAttribute.attributeKey} (${targetAttribute.attributeValue})`
  };
}

async function checkBuildCompatibility(userId, buildId) {
  const parsedBuildId = toPositiveInteger(buildId, "buildId");
  const build = await findBuild(userId, parsedBuildId);

  if (!build) {
    throw createError("PC build not found", 404);
  }

  const [buildItems, compatibilityMap] = await Promise.all([
    getBuildItemsWithAttributes(parsedBuildId),
    getCompatibilityMap()
  ]);

  const issues = [];

  for (let i = 0; i < buildItems.length; i += 1) {
    for (let j = i + 1; j < buildItems.length; j += 1) {
      const sourceItem = buildItems[i];
      const targetItem = buildItems[j];
      const sourceAttributes = Object.values(sourceItem.attributes);
      const targetAttributes = Object.values(targetItem.attributes);

      for (const sourceAttribute of sourceAttributes) {
        for (const targetAttribute of targetAttributes) {
          const left = Number(sourceAttribute.attributeValueId);
          const right = Number(targetAttribute.attributeValueId);
          const key = left < right ? `${left}:${right}` : `${right}:${left}`;
          const rule = compatibilityMap.get(key);

          if (rule && !rule.isCompatible) {
            issues.push(buildIssue(rule.ruleId, sourceItem, targetItem, sourceAttribute, targetAttribute));
          }
        }
      }
    }
  }

  return {
    buildId: build.id,
    buildName: build.name,
    compatible: issues.length === 0,
    checkedRuleCount: compatibilityMap.size,
    checkedComponentCount: buildItems.length,
    issues
  };
}

module.exports = {
  checkBuildCompatibility
};
