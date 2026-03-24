const path = require("path");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function pickColumn(columns, candidates, defaultValue = null) {
  return candidates.find((column) => columns.includes(column)) || defaultValue;
}

async function getTableColumns(connection, databaseName, tableName) {
  const [rows] = await connection.execute(
    `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
    `,
    [databaseName, tableName]
  );

  return rows.map((row) => row.COLUMN_NAME);
}

function buildInsertParts(record) {
  const entries = Object.entries(record).filter(([, value]) => value !== undefined);

  return {
    fields: entries.map(([field]) => field),
    values: entries.map(([, value]) => value),
    placeholders: entries.map(() => "?")
  };
}

async function insertRecord(connection, tableName, record) {
  const { fields, values, placeholders } = buildInsertParts(record);
  const [result] = await connection.execute(
    `INSERT INTO ${tableName} (${fields.join(", ")}) VALUES (${placeholders.join(", ")})`,
    values
  );

  return result.insertId;
}

async function findOne(connection, sql, params) {
  const [rows] = await connection.execute(sql, params);
  return rows[0] || null;
}

async function getSchema(connection, databaseName) {
  const [categoryColumns, brandColumns, productColumns, variantColumns, attributeColumns, attributeValueColumns, pvavColumns, compatibilityRuleColumns, compatibilityDetailColumns] = await Promise.all([
    getTableColumns(connection, databaseName, "categories"),
    getTableColumns(connection, databaseName, "brands"),
    getTableColumns(connection, databaseName, "products"),
    getTableColumns(connection, databaseName, "product_variants"),
    getTableColumns(connection, databaseName, "attributes"),
    getTableColumns(connection, databaseName, "attribute_values"),
    getTableColumns(connection, databaseName, "product_variant_attribute_values"),
    getTableColumns(connection, databaseName, "compatibility_rules"),
    getTableColumns(connection, databaseName, "compatibility_rule_details")
  ]);

  return {
    categories: {
      table: "categories",
      id: pickColumn(categoryColumns, ["id"]),
      name: pickColumn(categoryColumns, ["name"]),
      slug: pickColumn(categoryColumns, ["slug"]),
      parentId: pickColumn(categoryColumns, ["parent_id"], null),
      description: pickColumn(categoryColumns, ["description"], null),
      status: pickColumn(categoryColumns, ["status"], null),
      isActive: pickColumn(categoryColumns, ["is_active"], null),
      createdAt: pickColumn(categoryColumns, ["created_at"], null),
      updatedAt: pickColumn(categoryColumns, ["updated_at"], null)
    },
    brands: {
      table: "brands",
      id: pickColumn(brandColumns, ["id"]),
      name: pickColumn(brandColumns, ["name"]),
      slug: pickColumn(brandColumns, ["slug"], null),
      description: pickColumn(brandColumns, ["description"], null),
      logo: pickColumn(brandColumns, ["logo_url", "logo", "image_url"], null),
      status: pickColumn(brandColumns, ["status"], null),
      isActive: pickColumn(brandColumns, ["is_active"], null),
      createdAt: pickColumn(brandColumns, ["created_at"], null),
      updatedAt: pickColumn(brandColumns, ["updated_at"], null)
    },
    products: {
      table: "products",
      id: pickColumn(productColumns, ["id"]),
      name: pickColumn(productColumns, ["name"]),
      slug: pickColumn(productColumns, ["slug"]),
      description: pickColumn(productColumns, ["description", "short_description"], null),
      categoryId: pickColumn(productColumns, ["category_id"]),
      brandId: pickColumn(productColumns, ["brand_id"]),
      sku: pickColumn(productColumns, ["sku"], null),
      price: pickColumn(productColumns, ["price", "base_price"], null),
      stock: pickColumn(productColumns, ["stock", "stock_quantity"], null),
      status: pickColumn(productColumns, ["status"], null),
      isActive: pickColumn(productColumns, ["is_active"], null),
      createdAt: pickColumn(productColumns, ["created_at"], null),
      updatedAt: pickColumn(productColumns, ["updated_at"], null)
    },
    variants: {
      table: "product_variants",
      id: pickColumn(variantColumns, ["id"]),
      productId: pickColumn(variantColumns, ["product_id"]),
      sku: pickColumn(variantColumns, ["sku"]),
      price: pickColumn(variantColumns, ["price"]),
      stock: pickColumn(variantColumns, ["stock_quantity", "stock", "quantity"], null),
      image: pickColumn(variantColumns, ["image_url", "thumbnail_url", "thumbnail", "image"], null),
      status: pickColumn(variantColumns, ["status"], null),
      isActive: pickColumn(variantColumns, ["is_active"], null),
      createdAt: pickColumn(variantColumns, ["created_at"], null),
      updatedAt: pickColumn(variantColumns, ["updated_at"], null)
    },
    attributes: {
      table: "attributes",
      id: pickColumn(attributeColumns, ["id"]),
      name: pickColumn(attributeColumns, ["name"]),
      slug: pickColumn(attributeColumns, ["slug", "code"], null),
      status: pickColumn(attributeColumns, ["status"], null),
      isActive: pickColumn(attributeColumns, ["is_active"], null),
      createdAt: pickColumn(attributeColumns, ["created_at"], null),
      updatedAt: pickColumn(attributeColumns, ["updated_at"], null)
    },
    attributeValues: {
      table: "attribute_values",
      id: pickColumn(attributeValueColumns, ["id"]),
      attributeId: pickColumn(attributeValueColumns, ["attribute_id"]),
      value: pickColumn(attributeValueColumns, ["value"]),
      slug: pickColumn(attributeValueColumns, ["slug"], null),
      status: pickColumn(attributeValueColumns, ["status"], null),
      isActive: pickColumn(attributeValueColumns, ["is_active"], null),
      createdAt: pickColumn(attributeValueColumns, ["created_at"], null),
      updatedAt: pickColumn(attributeValueColumns, ["updated_at"], null)
    },
    pvav: {
      table: "product_variant_attribute_values",
      id: pickColumn(pvavColumns, ["id"]),
      productVariantId: pickColumn(pvavColumns, ["product_variant_id", "variant_id"]),
      attributeValueId: pickColumn(pvavColumns, ["attribute_value_id"]),
      createdAt: pickColumn(pvavColumns, ["created_at"], null),
      updatedAt: pickColumn(pvavColumns, ["updated_at"], null)
    },
    compatibilityRules: {
      table: "compatibility_rules",
      id: pickColumn(compatibilityRuleColumns, ["id"]),
      sourceCategoryId: pickColumn(compatibilityRuleColumns, ["source_category_id"]),
      targetCategoryId: pickColumn(compatibilityRuleColumns, ["target_category_id"]),
      sourceAttributeKey: pickColumn(compatibilityRuleColumns, ["source_attribute_key"], null),
      targetAttributeKey: pickColumn(compatibilityRuleColumns, ["target_attribute_key"], null),
      operator: pickColumn(compatibilityRuleColumns, ["operator"], null),
      description: pickColumn(compatibilityRuleColumns, ["description"], null),
      status: pickColumn(compatibilityRuleColumns, ["status"], null),
      isActive: pickColumn(compatibilityRuleColumns, ["is_active"], null),
      createdAt: pickColumn(compatibilityRuleColumns, ["created_at"], null),
      updatedAt: pickColumn(compatibilityRuleColumns, ["updated_at"], null)
    },
    compatibilityRuleDetails: {
      table: "compatibility_rule_details",
      id: pickColumn(compatibilityDetailColumns, ["id"]),
      ruleId: pickColumn(compatibilityDetailColumns, ["rule_id", "compatibility_rule_id"], null),
      sourceValueId: pickColumn(compatibilityDetailColumns, ["source_attribute_value_id", "source_value_id"], null),
      targetValueId: pickColumn(compatibilityDetailColumns, ["target_attribute_value_id", "target_value_id"], null),
      sourceValue: pickColumn(compatibilityDetailColumns, ["source_value"], null),
      targetValue: pickColumn(compatibilityDetailColumns, ["target_value"], null),
      createdAt: pickColumn(compatibilityDetailColumns, ["created_at"], null),
      updatedAt: pickColumn(compatibilityDetailColumns, ["updated_at"], null)
    }
  };
}

async function upsertByName(connection, tableName, idColumn, nameColumn, nameValue) {
  return findOne(
    connection,
    `SELECT ${idColumn} AS id FROM ${tableName} WHERE ${nameColumn} = ? LIMIT 1`,
    [nameValue]
  );
}

function withCommonColumns(record, schemaPart, options = {}) {
  const next = { ...record };

  if (schemaPart.status && options.status !== undefined) {
    next[schemaPart.status] = options.status;
  }

  if (schemaPart.isActive && options.isActive !== undefined) {
    next[schemaPart.isActive] = options.isActive;
  }

  if (schemaPart.createdAt && options.includeTimestamps) {
    next[schemaPart.createdAt] = new Date();
  }

  if (schemaPart.updatedAt && options.includeTimestamps) {
    next[schemaPart.updatedAt] = new Date();
  }

  return next;
}

async function ensureCategory(connection, schema, category) {
  const existing = await upsertByName(connection, schema.categories.table, schema.categories.id, schema.categories.name, category.name);
  if (existing) return existing.id;

  const record = withCommonColumns({
    [schema.categories.name]: category.name,
    [schema.categories.slug]: slugify(category.name),
    ...(schema.categories.description ? { [schema.categories.description]: `${category.name} components` } : {}),
    ...(schema.categories.parentId ? { [schema.categories.parentId]: null } : {})
  }, schema.categories, { status: "ACTIVE", isActive: 1, includeTimestamps: true });

  return insertRecord(connection, schema.categories.table, record);
}

async function ensureBrand(connection, schema, brand) {
  const existing = await upsertByName(connection, schema.brands.table, schema.brands.id, schema.brands.name, brand.name);
  if (existing) return existing.id;

  const record = withCommonColumns({
    [schema.brands.name]: brand.name,
    ...(schema.brands.slug ? { [schema.brands.slug]: slugify(brand.name) } : {}),
    ...(schema.brands.description ? { [schema.brands.description]: `${brand.name} demo brand` } : {}),
    ...(schema.brands.logo ? { [schema.brands.logo]: null } : {})
  }, schema.brands, { status: "ACTIVE", isActive: 1, includeTimestamps: true });

  return insertRecord(connection, schema.brands.table, record);
}

async function ensureAttribute(connection, schema, attributeName) {
  const existing = await upsertByName(connection, schema.attributes.table, schema.attributes.id, schema.attributes.name, attributeName);
  if (existing) return existing.id;

  const record = withCommonColumns({
    [schema.attributes.name]: attributeName,
    ...(schema.attributes.slug ? { [schema.attributes.slug]: slugify(attributeName) } : {})
  }, schema.attributes, { status: "ACTIVE", isActive: 1, includeTimestamps: true });

  return insertRecord(connection, schema.attributes.table, record);
}

async function ensureAttributeValue(connection, schema, attributeId, value) {
  const [rows] = await connection.execute(
    `
      SELECT ${schema.attributeValues.id} AS id
      FROM ${schema.attributeValues.table}
      WHERE ${schema.attributeValues.attributeId} = ?
        AND ${schema.attributeValues.value} = ?
      LIMIT 1
    `,
    [attributeId, value]
  );

  if (rows[0]) return rows[0].id;

  const record = withCommonColumns({
    [schema.attributeValues.attributeId]: attributeId,
    [schema.attributeValues.value]: value,
    ...(schema.attributeValues.slug ? { [schema.attributeValues.slug]: slugify(value) } : {})
  }, schema.attributeValues, { status: "ACTIVE", isActive: 1, includeTimestamps: true });

  return insertRecord(connection, schema.attributeValues.table, record);
}

async function ensureProduct(connection, schema, product) {
  const [rows] = await connection.execute(
    `SELECT ${schema.products.id} AS id FROM ${schema.products.table} WHERE ${schema.products.slug} = ? LIMIT 1`,
    [product.slug]
  );

  if (rows[0]) return rows[0].id;

  const record = withCommonColumns({
    [schema.products.name]: product.name,
    [schema.products.slug]: product.slug,
    [schema.products.categoryId]: product.categoryId,
    [schema.products.brandId]: product.brandId,
    ...(schema.products.description ? { [schema.products.description]: product.description } : {}),
    ...(schema.products.sku ? { [schema.products.sku]: `${product.slug.toUpperCase()}-BASE` } : {}),
    ...(schema.products.price ? { [schema.products.price]: product.basePrice } : {}),
    ...(schema.products.stock ? { [schema.products.stock]: product.baseStock } : {})
  }, schema.products, { status: "ACTIVE", isActive: 1, includeTimestamps: true });

  return insertRecord(connection, schema.products.table, record);
}

async function ensureVariant(connection, schema, variant) {
  const [rows] = await connection.execute(
    `SELECT ${schema.variants.id} AS id FROM ${schema.variants.table} WHERE ${schema.variants.sku} = ? LIMIT 1`,
    [variant.sku]
  );

  if (rows[0]) return rows[0].id;

  const record = withCommonColumns({
    [schema.variants.productId]: variant.productId,
    [schema.variants.sku]: variant.sku,
    [schema.variants.price]: variant.price,
    ...(schema.variants.stock ? { [schema.variants.stock]: variant.stock } : {}),
    ...(schema.variants.image ? { [schema.variants.image]: variant.imageUrl || null } : {})
  }, schema.variants, { status: "ACTIVE", isActive: 1, includeTimestamps: true });

  return insertRecord(connection, schema.variants.table, record);
}

async function ensureVariantAttributeValue(connection, schema, variantId, attributeValueId) {
  const [rows] = await connection.execute(
    `
      SELECT ${schema.pvav.id} AS id
      FROM ${schema.pvav.table}
      WHERE ${schema.pvav.productVariantId} = ?
        AND ${schema.pvav.attributeValueId} = ?
      LIMIT 1
    `,
    [variantId, attributeValueId]
  );

  if (rows[0]) return rows[0].id;

  const record = {
    [schema.pvav.productVariantId]: variantId,
    [schema.pvav.attributeValueId]: attributeValueId,
    ...(schema.pvav.createdAt ? { [schema.pvav.createdAt]: new Date() } : {}),
    ...(schema.pvav.updatedAt ? { [schema.pvav.updatedAt]: new Date() } : {})
  };

  return insertRecord(connection, schema.pvav.table, record);
}

async function ensureCompatibilityRule(connection, schema, rule) {
  const [rows] = await connection.execute(
    `
      SELECT ${schema.compatibilityRules.id} AS id
      FROM ${schema.compatibilityRules.table}
      WHERE ${schema.compatibilityRules.sourceCategoryId} = ?
        AND ${schema.compatibilityRules.targetCategoryId} = ?
      LIMIT 1
    `,
    [rule.sourceCategoryId, rule.targetCategoryId]
  );

  if (rows[0]) return rows[0].id;

  const record = withCommonColumns({
    [schema.compatibilityRules.sourceCategoryId]: rule.sourceCategoryId,
    [schema.compatibilityRules.targetCategoryId]: rule.targetCategoryId,
    ...(schema.compatibilityRules.sourceAttributeKey ? { [schema.compatibilityRules.sourceAttributeKey]: rule.sourceAttributeKey } : {}),
    ...(schema.compatibilityRules.targetAttributeKey ? { [schema.compatibilityRules.targetAttributeKey]: rule.targetAttributeKey } : {}),
    ...(schema.compatibilityRules.operator ? { [schema.compatibilityRules.operator]: rule.operator } : {}),
    ...(schema.compatibilityRules.description ? { [schema.compatibilityRules.description]: rule.description } : {})
  }, schema.compatibilityRules, { status: "ACTIVE", isActive: 1, includeTimestamps: true });

  return insertRecord(connection, schema.compatibilityRules.table, record);
}

async function ensureCompatibilityRuleDetail(connection, schema, detail) {
  if (!schema.compatibilityRuleDetails.ruleId) {
    return null;
  }

  const findConditions = [`${schema.compatibilityRuleDetails.ruleId} = ?`];
  const params = [detail.ruleId];

  if (schema.compatibilityRuleDetails.sourceValueId && schema.compatibilityRuleDetails.targetValueId) {
    findConditions.push(`${schema.compatibilityRuleDetails.sourceValueId} = ?`);
    findConditions.push(`${schema.compatibilityRuleDetails.targetValueId} = ?`);
    params.push(detail.sourceValueId, detail.targetValueId);
  } else if (schema.compatibilityRuleDetails.sourceValue && schema.compatibilityRuleDetails.targetValue) {
    findConditions.push(`${schema.compatibilityRuleDetails.sourceValue} = ?`);
    findConditions.push(`${schema.compatibilityRuleDetails.targetValue} = ?`);
    params.push(detail.sourceValue, detail.targetValue);
  } else {
    return null;
  }

  const [rows] = await connection.execute(
    `
      SELECT ${schema.compatibilityRuleDetails.id} AS id
      FROM ${schema.compatibilityRuleDetails.table}
      WHERE ${findConditions.join(" AND ")}
      LIMIT 1
    `,
    params
  );

  if (rows[0]) return rows[0].id;

  const record = {
    [schema.compatibilityRuleDetails.ruleId]: detail.ruleId,
    ...(schema.compatibilityRuleDetails.sourceValueId ? { [schema.compatibilityRuleDetails.sourceValueId]: detail.sourceValueId } : {}),
    ...(schema.compatibilityRuleDetails.targetValueId ? { [schema.compatibilityRuleDetails.targetValueId]: detail.targetValueId } : {}),
    ...(schema.compatibilityRuleDetails.sourceValue ? { [schema.compatibilityRuleDetails.sourceValue]: detail.sourceValue } : {}),
    ...(schema.compatibilityRuleDetails.targetValue ? { [schema.compatibilityRuleDetails.targetValue]: detail.targetValue } : {}),
    ...(schema.compatibilityRuleDetails.createdAt ? { [schema.compatibilityRuleDetails.createdAt]: new Date() } : {}),
    ...(schema.compatibilityRuleDetails.updatedAt ? { [schema.compatibilityRuleDetails.updatedAt]: new Date() } : {})
  };

  return insertRecord(connection, schema.compatibilityRuleDetails.table, record);
}

async function main() {
  const databaseName = process.env.DB_NAME;

  if (!databaseName) {
    throw new Error("DB_NAME is required in services/api/.env");
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: databaseName,
    multipleStatements: false
  });

  try {
    const schema = await getSchema(connection, databaseName);

    const categories = {};
    for (const name of ["CPU", "MAINBOARD", "RAM", "GPU", "STORAGE", "PSU", "CASE"]) {
      categories[name] = await ensureCategory(connection, schema, { name });
    }

    const brands = {};
    for (const name of ["Intel", "AMD", "ASUS", "MSI", "Corsair", "Cooler Master", "Samsung", "Kingston"]) {
      brands[name] = await ensureBrand(connection, schema, { name });
    }

    const attributes = {};
    for (const name of ["socket", "ram_type", "wattage", "form_factor", "storage_type"]) {
      attributes[name] = await ensureAttribute(connection, schema, name);
    }

    const attributeValues = {};
    async function addAttributeValue(attributeKey, value) {
      const key = `${attributeKey}:${value}`;
      attributeValues[key] = await ensureAttributeValue(connection, schema, attributes[attributeKey], value);
    }

    await addAttributeValue("socket", "LGA1700");
    await addAttributeValue("socket", "AM5");
    await addAttributeValue("ram_type", "DDR4");
    await addAttributeValue("ram_type", "DDR5");
    await addAttributeValue("wattage", "650W");
    await addAttributeValue("wattage", "750W");
    await addAttributeValue("form_factor", "ATX");
    await addAttributeValue("form_factor", "M-ATX");
    await addAttributeValue("storage_type", "NVME");
    await addAttributeValue("storage_type", "SATA");

    const products = [
      {
        name: "Intel Core i5-13400F",
        slug: "intel-core-i5-13400f",
        description: "CPU gaming tầm trung, socket LGA1700",
        categoryId: categories.CPU,
        brandId: brands.Intel,
        basePrice: 4800000,
        baseStock: 20,
        variants: [
          {
            sku: "CPU-I5-13400F-TRAY",
            price: 4800000,
            stock: 20,
            imageUrl: null,
            specs: { socket: "LGA1700" }
          }
        ]
      },
      {
        name: "AMD Ryzen 5 7600",
        slug: "amd-ryzen-5-7600",
        description: "CPU AM5 phù hợp build DDR5 mới",
        categoryId: categories.CPU,
        brandId: brands.AMD,
        basePrice: 5600000,
        baseStock: 18,
        variants: [
          {
            sku: "CPU-R5-7600-BOX",
            price: 5600000,
            stock: 18,
            imageUrl: null,
            specs: { socket: "AM5" }
          }
        ]
      },
      {
        name: "ASUS PRIME B760M-A",
        slug: "asus-prime-b760m-a",
        description: "Mainboard Intel B760 hỗ trợ DDR5, mATX",
        categoryId: categories.MAINBOARD,
        brandId: brands.ASUS,
        basePrice: 3200000,
        baseStock: 14,
        variants: [
          {
            sku: "MB-ASUS-B760M-A",
            price: 3200000,
            stock: 14,
            imageUrl: null,
            specs: { socket: "LGA1700", ram_type: "DDR5", form_factor: "M-ATX" }
          }
        ]
      },
      {
        name: "MSI PRO B650-P WIFI",
        slug: "msi-pro-b650-p-wifi",
        description: "Mainboard AMD B650 hỗ trợ DDR5, ATX",
        categoryId: categories.MAINBOARD,
        brandId: brands.MSI,
        basePrice: 4500000,
        baseStock: 10,
        variants: [
          {
            sku: "MB-MSI-B650-P-WIFI",
            price: 4500000,
            stock: 10,
            imageUrl: null,
            specs: { socket: "AM5", ram_type: "DDR5", form_factor: "ATX" }
          }
        ]
      },
      {
        name: "Corsair Vengeance 32GB DDR5",
        slug: "corsair-vengeance-32gb-ddr5",
        description: "RAM DDR5 32GB kit cho gaming và làm việc",
        categoryId: categories.RAM,
        brandId: brands.Corsair,
        basePrice: 2800000,
        baseStock: 25,
        variants: [
          {
            sku: "RAM-CORSAIR-DDR5-32GB",
            price: 2800000,
            stock: 25,
            imageUrl: null,
            specs: { ram_type: "DDR5" }
          }
        ]
      },
      {
        name: "MSI GeForce RTX 4060 Ventus 2X",
        slug: "msi-geforce-rtx-4060-ventus-2x",
        description: "GPU 1080p/1440p ổn định cho build gaming",
        categoryId: categories.GPU,
        brandId: brands.MSI,
        basePrice: 8900000,
        baseStock: 12,
        variants: [
          {
            sku: "GPU-MSI-RTX4060-8G",
            price: 8900000,
            stock: 12,
            imageUrl: null,
            specs: {}
          }
        ]
      },
      {
        name: "Samsung 990 EVO 1TB",
        slug: "samsung-990-evo-1tb",
        description: "SSD NVMe tốc độ cao 1TB",
        categoryId: categories.STORAGE,
        brandId: brands.Samsung,
        basePrice: 2200000,
        baseStock: 30,
        variants: [
          {
            sku: "SSD-SAMSUNG-990EVO-1TB",
            price: 2200000,
            stock: 30,
            imageUrl: null,
            specs: { storage_type: "NVME" }
          }
        ]
      },
      {
        name: "Cooler Master MWE Gold 750",
        slug: "cooler-master-mwe-gold-750",
        description: "Nguồn 750W phù hợp build RTX 4060",
        categoryId: categories.PSU,
        brandId: brands["Cooler Master"],
        basePrice: 2400000,
        baseStock: 16,
        variants: [
          {
            sku: "PSU-CM-MWE-750",
            price: 2400000,
            stock: 16,
            imageUrl: null,
            specs: { wattage: "750W" }
          }
        ]
      },
      {
        name: "Corsair 4000D Airflow",
        slug: "corsair-4000d-airflow",
        description: "Case mid tower hỗ trợ main ATX",
        categoryId: categories.CASE,
        brandId: brands.Corsair,
        basePrice: 2100000,
        baseStock: 11,
        variants: [
          {
            sku: "CASE-CORSAIR-4000D",
            price: 2100000,
            stock: 11,
            imageUrl: null,
            specs: { form_factor: "ATX" }
          }
        ]
      }
    ];

    const productIds = {};

    for (const product of products) {
      const productId = await ensureProduct(connection, schema, product);
      productIds[product.slug] = productId;

      for (const variant of product.variants) {
        const variantId = await ensureVariant(connection, schema, {
          ...variant,
          productId
        });

        for (const [attributeKey, value] of Object.entries(variant.specs)) {
          const attributeValueId = attributeValues[`${attributeKey}:${value}`];
          if (attributeValueId) {
            await ensureVariantAttributeValue(connection, schema, variantId, attributeValueId);
          }
        }
      }
    }

    const compatibilityRuleIds = {};

    compatibilityRuleIds.cpuMainboard = await ensureCompatibilityRule(connection, schema, {
      sourceCategoryId: categories.CPU,
      targetCategoryId: categories.MAINBOARD,
      sourceAttributeKey: "socket",
      targetAttributeKey: "socket",
      operator: "EQ",
      description: "CPU socket must match mainboard socket"
    });

    compatibilityRuleIds.mainboardRam = await ensureCompatibilityRule(connection, schema, {
      sourceCategoryId: categories.MAINBOARD,
      targetCategoryId: categories.RAM,
      sourceAttributeKey: "ram_type",
      targetAttributeKey: "ram_type",
      operator: "EQ",
      description: "Mainboard RAM type must match RAM module type"
    });

    compatibilityRuleIds.mainboardCase = await ensureCompatibilityRule(connection, schema, {
      sourceCategoryId: categories.MAINBOARD,
      targetCategoryId: categories.CASE,
      sourceAttributeKey: "form_factor",
      targetAttributeKey: "form_factor",
      operator: "EQ",
      description: "Mainboard form factor must be supported by case"
    });

    if (compatibilityRuleIds.cpuMainboard) {
      await ensureCompatibilityRuleDetail(connection, schema, {
        ruleId: compatibilityRuleIds.cpuMainboard,
        sourceValueId: attributeValues["socket:LGA1700"],
        targetValueId: attributeValues["socket:LGA1700"],
        sourceValue: "LGA1700",
        targetValue: "LGA1700"
      });
      await ensureCompatibilityRuleDetail(connection, schema, {
        ruleId: compatibilityRuleIds.cpuMainboard,
        sourceValueId: attributeValues["socket:AM5"],
        targetValueId: attributeValues["socket:AM5"],
        sourceValue: "AM5",
        targetValue: "AM5"
      });
    }

    if (compatibilityRuleIds.mainboardRam) {
      await ensureCompatibilityRuleDetail(connection, schema, {
        ruleId: compatibilityRuleIds.mainboardRam,
        sourceValueId: attributeValues["ram_type:DDR5"],
        targetValueId: attributeValues["ram_type:DDR5"],
        sourceValue: "DDR5",
        targetValue: "DDR5"
      });
      await ensureCompatibilityRuleDetail(connection, schema, {
        ruleId: compatibilityRuleIds.mainboardRam,
        sourceValueId: attributeValues["ram_type:DDR4"],
        targetValueId: attributeValues["ram_type:DDR4"],
        sourceValue: "DDR4",
        targetValue: "DDR4"
      });
    }

    if (compatibilityRuleIds.mainboardCase) {
      await ensureCompatibilityRuleDetail(connection, schema, {
        ruleId: compatibilityRuleIds.mainboardCase,
        sourceValueId: attributeValues["form_factor:ATX"],
        targetValueId: attributeValues["form_factor:ATX"],
        sourceValue: "ATX",
        targetValue: "ATX"
      });
      await ensureCompatibilityRuleDetail(connection, schema, {
        ruleId: compatibilityRuleIds.mainboardCase,
        sourceValueId: attributeValues["form_factor:M-ATX"],
        targetValueId: attributeValues["form_factor:M-ATX"],
        sourceValue: "M-ATX",
        targetValue: "M-ATX"
      });
    }

    console.log("Demo PC build seed completed.");
    console.log("Categories:", Object.keys(categories).join(", "));
    console.log("Brands:", Object.keys(brands).join(", "));
    console.log("Products seeded:", products.length);
    console.log("Compatibility rules seeded:", Object.keys(compatibilityRuleIds).length);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("Seed failed:", error.message);
  console.error(error);
  process.exit(1);
});
