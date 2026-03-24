const { query } = require("../../config/database");
const { createError, toPositiveNumber } = require("../../utils/service-helpers");
const { getTableColumns, pickColumn } = require("../../utils/schema-helpers");

let productSchemaCache = null;

function normalizeListParams(params = {}) {
  return {
    categoryId: params.category_id ? Number(params.category_id) : null,
    brandId: params.brand_id ? Number(params.brand_id) : null,
    minPrice: params.min_price !== undefined && params.min_price !== "" ? Number(params.min_price) : null,
    maxPrice: params.max_price !== undefined && params.max_price !== "" ? Number(params.max_price) : null,
    keyword: String(params.keyword || "").trim() || null,
    attributeValueIds: normalizeAttributeValueIds(params.attribute_value_ids || params.attributeValueIds || []),
    page: toPositiveNumber(params.page, 1),
    limit: Math.min(toPositiveNumber(params.limit, 12), 50)
  };
}

function normalizeCompareIds(rawIds) {
  const ids = String(rawIds || "")
    .split(",")
    .map((item) => Number(String(item || "").trim()))
    .filter((item) => Number.isInteger(item) && item > 0);

  return Array.from(new Set(ids)).slice(0, 4);
}

function normalizeAttributeValueIds(rawValue) {
  const values = Array.isArray(rawValue) ? rawValue : String(rawValue || "").split(",");

  return Array.from(
    new Set(
      values
        .map((item) => Number(String(item || "").trim()))
        .filter((item) => Number.isInteger(item) && item > 0)
    )
  ).slice(0, 20);
}

async function getProductSchema() {
  if (productSchemaCache) {
    return productSchemaCache;
  }

  const [productColumns, categoryColumns, skuColumns, attributeColumns, attributeValueColumns, skuAttributeColumns, brandColumns] = await Promise.all([
    getTableColumns("products"),
    getTableColumns("categories"),
    getTableColumns("product_skus"),
    getTableColumns("attributes"),
    getTableColumns("attribute_values"),
    getTableColumns("sku_attributes"),
    getTableColumns("brands")
  ]);

  const config = {
    products: {
      table: "products",
      id: pickColumn(productColumns, ["id"]),
      name: pickColumn(productColumns, ["name"]),
      description: pickColumn(productColumns, ["description"], null),
      price: pickColumn(productColumns, ["price"], null),
      categoryId: pickColumn(productColumns, ["category_id"], null),
      brandId: pickColumn(productColumns, ["brand_id"], null),
      slug: pickColumn(productColumns, ["slug"], null),
      createdAt: pickColumn(productColumns, ["created_at"], null)
    },
    categories: {
      table: "categories",
      id: pickColumn(categoryColumns, ["id"]),
      name: pickColumn(categoryColumns, ["name"])
    },
    skus: skuColumns.length === 0 ? null : {
      table: "product_skus",
      id: pickColumn(skuColumns, ["id"]),
      productId: pickColumn(skuColumns, ["product_id"]),
      price: pickColumn(skuColumns, ["price"]),
      stock: pickColumn(skuColumns, ["stock"], null),
      sku: pickColumn(skuColumns, ["sku"], null),
      imageUrl: pickColumn(skuColumns, ["image_url"], null),
      status: pickColumn(skuColumns, ["status"], null)
    },
    skuAttributes: skuAttributeColumns.length === 0 ? null : {
      table: "sku_attributes",
      id: pickColumn(skuAttributeColumns, ["id"]),
      skuId: pickColumn(skuAttributeColumns, ["sku_id"]),
      attributeValueId: pickColumn(skuAttributeColumns, ["attribute_value_id"])
    },
    attributes: attributeColumns.length === 0 ? null : {
      table: "attributes",
      id: pickColumn(attributeColumns, ["id"]),
      name: pickColumn(attributeColumns, ["name"])
    },
    attributeValues: attributeValueColumns.length === 0 ? null : {
      table: "attribute_values",
      id: pickColumn(attributeValueColumns, ["id"]),
      attributeId: pickColumn(attributeValueColumns, ["attribute_id"]),
      value: pickColumn(attributeValueColumns, ["value"])
    },
    brands: brandColumns.length === 0 ? null : {
      table: "brands",
      id: pickColumn(brandColumns, ["id"]),
      name: pickColumn(brandColumns, ["name"])
    }
  };

  if (!config.products.id || !config.products.name || !config.categories.id || !config.categories.name || !config.products.categoryId) {
    throw createError("Products or categories table does not have the required columns", 500);
  }

  productSchemaCache = config;
  return config;
}

function createListConditions(filters, config) {
  const clauses = [];
  const params = [];

  if (filters.categoryId !== null) {
    clauses.push(`p.${config.products.categoryId} = ?`);
    params.push(filters.categoryId);
  }

  if (filters.brandId !== null && config.products.brandId) {
    clauses.push(`p.${config.products.brandId} = ?`);
    params.push(filters.brandId);
  }

  if (filters.minPrice !== null) {
    clauses.push(`${config.skus ? `COALESCE(s.${config.skus.price}, p.${config.products.price || "price"})` : `p.${config.products.price}`} >= ?`);
    params.push(filters.minPrice);
  }

  if (filters.maxPrice !== null) {
    clauses.push(`${config.skus ? `COALESCE(s.${config.skus.price}, p.${config.products.price || "price"})` : `p.${config.products.price}`} <= ?`);
    params.push(filters.maxPrice);
  }

  if (filters.keyword) {
    clauses.push(`(p.${config.products.name} LIKE CONCAT('%', ?, '%')${config.products.slug ? ` OR p.${config.products.slug} LIKE CONCAT('%', ?, '%')` : ""})`);
    params.push(filters.keyword);
    if (config.products.slug) {
      params.push(filters.keyword);
    }
  }

  if (filters.attributeValueIds.length > 0 && config.skus && config.skuAttributes) {
    const placeholders = filters.attributeValueIds.map(() => "?").join(", ");
    clauses.push(`EXISTS (
      SELECT 1
      FROM ${config.skus.table} fs
      INNER JOIN ${config.skuAttributes.table} fsa ON fsa.${config.skuAttributes.skuId} = fs.${config.skus.id}
      WHERE fs.${config.skus.productId} = p.${config.products.id}
        AND fsa.${config.skuAttributes.attributeValueId} IN (${placeholders})
      GROUP BY fs.${config.skus.id}
      HAVING COUNT(DISTINCT fsa.${config.skuAttributes.attributeValueId}) = ${filters.attributeValueIds.length}
    )`);
    params.push(...filters.attributeValueIds);
  }

  return {
    whereSql: clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "",
    params
  };
}

function mapVariantRow(row) {
  return {
    variant_id: row.variant_id,
    sku: row.sku,
    price: Number(row.price || 0),
    image_url: row.image_url,
    stock_quantity: Number(row.stock_quantity || 0),
    status: row.status || "ACTIVE",
    specs: []
  };
}

async function getProducts(params = {}) {
  const filters = normalizeListParams(params);
  const config = await getProductSchema();
  const offset = (filters.page - 1) * filters.limit;
  const { whereSql, params: whereParams } = createListConditions(filters, config);
  const brandJoin = config.brands && config.products.brandId
    ? `LEFT JOIN ${config.brands.table} b ON b.${config.brands.id} = p.${config.products.brandId}`
    : "";
  const brandSelect = config.brands ? "b.name AS brand_name," : "NULL AS brand_name,";
  const skuJoin = config.skus ? `LEFT JOIN ${config.skus.table} s ON s.${config.skus.productId} = p.${config.products.id}` : "";
  const priceExpr = config.skus ? `COALESCE(MIN(s.${config.skus.price}), p.${config.products.price || "price"})` : `p.${config.products.price}`;
  const imageExpr = config.skus?.imageUrl ? `MIN(s.${config.skus.imageUrl})` : "NULL";

  const [items, totalRows] = await Promise.all([
    query(
      `
        SELECT
          p.${config.products.id} AS product_id,
          p.${config.products.name} AS product_name,
          ${config.products.slug ? `p.${config.products.slug}` : `CAST(p.${config.products.id} AS CHAR)`} AS slug,
          c.${config.categories.name} AS category_name,
          ${brandSelect}
          ${priceExpr} AS price,
          ${imageExpr} AS image_url,
          ${config.skus && config.skus.stock ? `COALESCE(SUM(s.${config.skus.stock}), 0)` : "0"} AS stock_quantity
        FROM ${config.products.table} p
        INNER JOIN ${config.categories.table} c ON c.${config.categories.id} = p.${config.products.categoryId}
        ${brandJoin}
        ${skuJoin}
        ${whereSql}
        GROUP BY p.${config.products.id}
        ORDER BY p.${config.products.id} DESC
        LIMIT ? OFFSET ?
      `,
      [...whereParams, filters.limit, offset]
    ),
    query(
      `
        SELECT COUNT(*) AS total_items
        FROM ${config.products.table} p
        INNER JOIN ${config.categories.table} c ON c.${config.categories.id} = p.${config.products.categoryId}
        ${brandJoin}
        ${whereSql}
      `,
      whereParams
    )
  ]);

  const totalItems = Number(totalRows[0]?.total_items || 0);

  return {
    items,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      totalItems,
      totalPages: totalItems === 0 ? 0 : Math.ceil(totalItems / filters.limit)
    },
    filters: {
      category_id: filters.categoryId,
      brand_id: filters.brandId,
      min_price: filters.minPrice,
      max_price: filters.maxPrice,
      keyword: filters.keyword,
      attribute_value_ids: filters.attributeValueIds
    }
  };
}

async function getFilterOptions() {
  const config = await getProductSchema();

  const [categories, brands, attributeRows] = await Promise.all([
    query(`SELECT ${config.categories.id} AS id, ${config.categories.name} AS name FROM ${config.categories.table} ORDER BY ${config.categories.name} ASC`),
    config.brands
      ? query(`SELECT ${config.brands.id} AS id, ${config.brands.name} AS name FROM ${config.brands.table} ORDER BY ${config.brands.name} ASC`)
      : Promise.resolve([]),
    config.attributes && config.attributeValues
      ? query(
          `
            SELECT
              a.${config.attributes.id} AS attribute_id,
              a.${config.attributes.name} AS attribute_name,
              av.${config.attributeValues.id} AS attribute_value_id,
              av.${config.attributeValues.value} AS attribute_value
            FROM ${config.attributes.table} a
            LEFT JOIN ${config.attributeValues.table} av ON av.${config.attributeValues.attributeId} = a.${config.attributes.id}
            ORDER BY a.${config.attributes.name} ASC, av.${config.attributeValues.value} ASC
          `
        )
      : Promise.resolve([])
  ]);

  const attributesMap = new Map();

  for (const row of attributeRows) {
    if (!attributesMap.has(row.attribute_id)) {
      attributesMap.set(row.attribute_id, {
        id: row.attribute_id,
        name: row.attribute_name,
        values: []
      });
    }

    if (row.attribute_value_id) {
      attributesMap.get(row.attribute_id).values.push({
        id: row.attribute_value_id,
        value: row.attribute_value
      });
    }
  }

  return {
    categories,
    brands,
    attributes: Array.from(attributesMap.values())
  };
}

async function getProductDetail(idOrSlug) {
  const identifier = String(idOrSlug || "").trim();

  if (!identifier) {
    throw createError("Product identifier is required", 400);
  }

  const config = await getProductSchema();
  const brandJoin = config.brands && config.products.brandId
    ? `LEFT JOIN ${config.brands.table} b ON b.${config.brands.id} = p.${config.products.brandId}`
    : "";
  const brandIdSelect = config.brands && config.products.brandId ? `b.${config.brands.id}` : "NULL";
  const brandNameSelect = config.brands ? `b.${config.brands.name}` : "NULL";
  const whereClause = config.products.slug
    ? `(p.${config.products.id} = ? OR p.${config.products.slug} = ?)`
    : `p.${config.products.id} = ?`;
  const whereParams = config.products.slug ? [identifier, identifier] : [identifier];

  const productRows = await query(
    `
      SELECT
        p.${config.products.id} AS product_id,
        p.${config.products.name} AS product_name,
        ${config.products.slug ? `p.${config.products.slug}` : `CAST(p.${config.products.id} AS CHAR)`} AS slug,
        ${config.products.description ? `p.${config.products.description}` : "NULL"} AS description,
        ${brandIdSelect} AS brand_id,
        ${brandNameSelect} AS brand_name,
        c.${config.categories.id} AS category_id,
        c.${config.categories.name} AS category_name
      FROM ${config.products.table} p
      INNER JOIN ${config.categories.table} c ON c.${config.categories.id} = p.${config.products.categoryId}
      ${brandJoin}
      WHERE ${whereClause}
      LIMIT 1
    `,
    whereParams
  );

  const product = productRows[0];

  if (!product) {
    throw createError("Product not found", 404);
  }

  let variants = [];

  if (config.skus && config.skus.id && config.skus.productId && config.skus.price) {
    const canReadSpecs = config.skuAttributes && config.attributes && config.attributeValues;
    const variantRows = await query(
      `
        SELECT
          s.${config.skus.id} AS variant_id,
          ${config.skus.sku ? `s.${config.skus.sku}` : `CONCAT('SKU-', s.${config.skus.id})`} AS sku,
          s.${config.skus.price} AS price,
          ${config.skus.imageUrl ? `s.${config.skus.imageUrl}` : "NULL"} AS image_url,
          ${config.skus.stock ? `s.${config.skus.stock}` : "0"} AS stock_quantity,
          ${config.skus.status ? `s.${config.skus.status}` : "'ACTIVE'"} AS status,
          ${canReadSpecs ? `a.${config.attributes.id}` : "NULL"} AS attribute_id,
          ${canReadSpecs ? `a.${config.attributes.name}` : "NULL"} AS attribute_name,
          ${canReadSpecs ? `av.${config.attributeValues.id}` : "NULL"} AS attribute_value_id,
          ${canReadSpecs ? `av.${config.attributeValues.value}` : "NULL"} AS attribute_value
        FROM ${config.skus.table} s
        ${canReadSpecs ? `LEFT JOIN ${config.skuAttributes.table} sa ON sa.${config.skuAttributes.skuId} = s.${config.skus.id}` : ""}
        ${canReadSpecs ? `LEFT JOIN ${config.attributeValues.table} av ON av.${config.attributeValues.id} = sa.${config.skuAttributes.attributeValueId}` : ""}
        ${canReadSpecs ? `LEFT JOIN ${config.attributes.table} a ON a.${config.attributes.id} = av.${config.attributeValues.attributeId}` : ""}
        WHERE s.${config.skus.productId} = ?
        ORDER BY s.${config.skus.id} ASC, ${canReadSpecs ? `a.${config.attributes.name} ASC` : `s.${config.skus.id} ASC`}
      `,
      [product.product_id]
    );

    const variantsMap = new Map();

    for (const row of variantRows) {
      if (!variantsMap.has(row.variant_id)) {
        variantsMap.set(row.variant_id, mapVariantRow(row));
      }

      if (row.attribute_id && row.attribute_value_id) {
        variantsMap.get(row.variant_id).specs.push({
          attribute_id: row.attribute_id,
          attribute_name: row.attribute_name,
          attribute_value_id: row.attribute_value_id,
          attribute_value: row.attribute_value
        });
      }
    }

    variants = Array.from(variantsMap.values());
  }

  if (variants.length === 0) {
    variants = [{
      variant_id: product.product_id,
      sku: `SKU-${product.product_id}`,
      price: 0,
      image_url: null,
      stock_quantity: 0,
      status: "ACTIVE",
      specs: []
    }];
  }

  return {
    product_id: product.product_id,
    product_name: product.product_name,
    slug: product.slug,
    description: product.description,
    brand: {
      id: product.brand_id,
      name: product.brand_name
    },
    category: {
      id: product.category_id,
      name: product.category_name
    },
    variants
  };
}

async function compareProducts(rawIds) {
  const ids = normalizeCompareIds(rawIds);

  if (ids.length < 2) {
    throw createError("Please provide at least 2 product ids for comparison", 400);
  }

  const items = await Promise.all(ids.map((id) => getProductDetail(id)));
  const attributeNames = new Set();

  const normalizedItems = items.map((item) => {
    const primaryVariant = Array.isArray(item.variants) && item.variants.length > 0 ? item.variants[0] : null;
    const specs = Array.isArray(primaryVariant?.specs) ? primaryVariant.specs : [];

    specs.forEach((spec) => {
      if (spec.attribute_name) {
        attributeNames.add(spec.attribute_name);
      }
    });

    return {
      ...item,
      primaryVariant,
      compareSpecs: specs.reduce((accumulator, spec) => {
        if (spec.attribute_name) {
          accumulator[spec.attribute_name] = spec.attribute_value;
        }
        return accumulator;
      }, {})
    };
  });

  return {
    ids,
    attributes: Array.from(attributeNames),
    items: normalizedItems
  };
}

module.exports = {
  getProducts,
  getFilterOptions,
  getProductDetail,
  compareProducts
};
