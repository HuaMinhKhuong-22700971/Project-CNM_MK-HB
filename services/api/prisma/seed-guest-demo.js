/**
 * Demo seed cho du lieu guest:
 * - Dam bao attributes / attribute values phuc vu bo loc va PC Builder
 * - Gan specs cho SKU bang utf8mb4 sach
 * - Them category COOLING va cooling products neu thieu
 *
 * Chay: npm run seed:guest-demo -w services/api
 */
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const ATTRIBUTE_DEFS = [
  { name: "socket", values: ["LGA1700", "AM5", "AM4", "LGA1200"] },
  { name: "ram_type", values: ["DDR5", "DDR4"] },
  { name: "psu_wattage", values: ["450W", "550W", "650W", "750W", "850W", "1000W"] },
  { name: "form_factor", values: ["ATX", "mATX", "ITX"] },
  { name: "storage_type", values: ["NVMe", "SATA SSD", "HDD"] },
  { name: "tdp", values: ["65W", "95W", "105W", "125W", "180W", "200W", "220W", "260W", "300W", "320W", "350W"] },
  { name: "cooling_type", values: ["Air Cooler", "AIO Liquid Cooling", "Case Fan"] },
  { name: "socket_support", values: ["LGA1700, AM5", "LGA1700", "AM5", "LGA1200, AM4"] },
  { name: "cooling_capacity", values: ["180W", "220W", "260W", "300W", "350W"] },
  { name: "radiator_size", values: ["120mm", "240mm", "360mm"] },
  { name: "cooler_height", values: ["148mm", "154mm", "157mm", "160mm"] },
  { name: "case_radiator_support", values: ["240mm", "280mm", "360mm"] },
  { name: "case_cooler_clearance", values: ["155mm", "160mm", "170mm"] },
  { name: "stock_cooler", values: ["Yes", "No"] }
];

const CATEGORY_IMAGE_MAP = {
  CPU: "/assets/products/i5.png",
  MAINBOARD: "/assets/products/asus-rog.png",
  RAM: "/assets/products/asus-rog-new.svg",
  GPU: "/assets/products/rtx4060.png",
  STORAGE: "/assets/products/asus-rog.png",
  SSD: "/assets/products/asus-rog.png",
  PSU: "/assets/products/dell.png",
  CASE: "/assets/products/alienware.svg",
  COOLING: "/assets/products/cooling-real/deepcool-ag400.webp",
  LAPTOP: "/assets/products/macbook.png",
  NOTEBOOK: "/assets/products/lenovo-x1.png"
};

const COOLING_PRODUCTS = [
  {
    name: "Deepcool AG400",
    slug: "deepcool-ag400",
    sku: "COOL-DEEPCOOL-AG400",
    price: 690000,
    stock: 28,
    imageUrl: "/assets/products/cooling-real/deepcool-ag400.webp",
    description: "Air cooler 120mm pho bien cho gaming tam trung.",
    specs: {
      cooling_type: "Air Cooler",
      socket_support: "LGA1700, AM5",
      cooling_capacity: "220W",
      cooler_height: "154mm"
    }
  },
  {
    name: "Thermalright Assassin X 120",
    slug: "thermalright-assassin-x-120",
    sku: "COOL-THERMALRIGHT-AX120",
    price: 790000,
    stock: 24,
    imageUrl: "/assets/products/cooling-real/thermalright-assassin-x120.jpg",
    description: "Air cooler gon, hop nhieu case mid tower.",
    specs: {
      cooling_type: "Air Cooler",
      socket_support: "LGA1700, AM5",
      cooling_capacity: "220W",
      cooler_height: "148mm"
    }
  },
  {
    name: "Cooler Master Hyper 212",
    slug: "cooler-master-hyper-212",
    sku: "COOL-CM-HYPER212",
    price: 990000,
    stock: 18,
    imageUrl: "/assets/products/cooling-real/cooler-master-hyper-212.png",
    description: "Air cooler kinh dien, de lap cho build pho thong.",
    specs: {
      cooling_type: "Air Cooler",
      socket_support: "LGA1700, AM5",
      cooling_capacity: "180W",
      cooler_height: "157mm"
    }
  },
  {
    name: "Deepcool AK620",
    slug: "deepcool-ak620",
    sku: "COOL-DEEPCOOL-AK620",
    price: 1790000,
    stock: 15,
    imageUrl: "/assets/products/cooling-real/deepcool-ak620.jpg",
    description: "Dual tower air cooler cho CPU hieu nang cao.",
    specs: {
      cooling_type: "Air Cooler",
      socket_support: "LGA1700, AM5",
      cooling_capacity: "260W",
      cooler_height: "160mm"
    }
  },
  {
    name: "Corsair H100i 240mm AIO",
    slug: "corsair-h100i-240mm-aio",
    sku: "COOL-CORSAIR-H100I-240",
    price: 3290000,
    stock: 12,
    imageUrl: "/assets/products/cooling-real/corsair-h100i-240.jpg",
    description: "AIO 240mm phu hop Intel K va Ryzen X series.",
    specs: {
      cooling_type: "AIO Liquid Cooling",
      socket_support: "LGA1700, AM5",
      cooling_capacity: "300W",
      radiator_size: "240mm"
    }
  },
  {
    name: "NZXT Kraken 240",
    slug: "nzxt-kraken-240",
    sku: "COOL-NZXT-KRAKEN-240",
    price: 3790000,
    stock: 10,
    imageUrl: "/assets/products/cooling-real/nzxt-kraken-240.png",
    description: "AIO 240mm cao cap, dep va em.",
    specs: {
      cooling_type: "AIO Liquid Cooling",
      socket_support: "LGA1700, AM5",
      cooling_capacity: "300W",
      radiator_size: "240mm"
    }
  },
  {
    name: "Deepcool LS720 360mm AIO",
    slug: "deepcool-ls720-360mm-aio",
    sku: "COOL-DEEPCOOL-LS720-360",
    price: 4290000,
    stock: 9,
    imageUrl: "/assets/products/cooling-real/deepcool-ls720.jpg",
    description: "AIO 360mm cho gaming, render va workstation manh.",
    specs: {
      cooling_type: "AIO Liquid Cooling",
      socket_support: "LGA1700, AM5",
      cooling_capacity: "350W",
      radiator_size: "360mm"
    }
  }
];

const TABLE_COLUMNS_CACHE = new Map();

async function getTableColumns(connection, tableName) {
  if (TABLE_COLUMNS_CACHE.has(tableName)) {
    return TABLE_COLUMNS_CACHE.get(tableName);
  }

  const [rows] = await connection.execute(
    `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
    `,
    [tableName]
  );

  const columns = rows.map((row) => row.COLUMN_NAME);
  TABLE_COLUMNS_CACHE.set(tableName, columns);
  return columns;
}

function hasColumn(columns, name) {
  return columns.includes(name);
}

function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function pickImageForCategory(categoryName) {
  const key = String(categoryName || "").trim().toUpperCase();
  if (key.includes("LAPTOP") || key.includes("NOTEBOOK")) return CATEGORY_IMAGE_MAP.LAPTOP;
  for (const [token, url] of Object.entries(CATEGORY_IMAGE_MAP)) {
    if (key.includes(token)) return url;
  }
  return "https://placehold.co/600x400/e2e8f0/334155?text=PC+Mall";
}

function pickSpecsForCategory(categoryName, skuId) {
  const cat = String(categoryName || "").toUpperCase();
  const mod = Number(skuId) % 2;

  if (cat.includes("CPU")) {
    return {
      socket: mod === 0 ? "LGA1700" : "AM5",
      tdp: mod === 0 ? "125W" : "105W",
      stock_cooler: mod === 0 ? "No" : "Yes"
    };
  }

  if (cat.includes("MAIN")) {
    return {
      socket: mod === 0 ? "LGA1700" : "AM5",
      ram_type: "DDR5",
      form_factor: mod === 0 ? "ATX" : "mATX"
    };
  }

  if (cat.includes("RAM")) {
    return { ram_type: "DDR5" };
  }

  if (cat.includes("GPU")) {
    return { tdp: mod === 0 ? "200W" : "320W" };
  }

  if (cat.includes("SSD") || cat.includes("STORAGE")) {
    return { storage_type: "NVMe" };
  }

  if (cat.includes("PSU")) {
    const watts = ["650W", "750W", "850W"];
    return { psu_wattage: watts[Number(skuId) % watts.length] };
  }

  if (cat.includes("CASE")) {
    return {
      form_factor: "ATX",
      case_radiator_support: mod === 0 ? "360mm" : "240mm",
      case_cooler_clearance: mod === 0 ? "170mm" : "160mm"
    };
  }

  if (cat.includes("COOLING")) {
    return {
      cooling_type: mod === 0 ? "Air Cooler" : "AIO Liquid Cooling",
      socket_support: "LGA1700, AM5",
      cooling_capacity: mod === 0 ? "220W" : "300W",
      ...(mod === 0 ? { cooler_height: "154mm" } : { radiator_size: "240mm" })
    };
  }

  if (cat.includes("LAPTOP") || cat.includes("NOTEBOOK")) {
    return { ram_type: "DDR5", storage_type: "NVMe" };
  }

  return { ram_type: "DDR5" };
}

async function ensureAttribute(connection, name) {
  const [rows] = await connection.execute("SELECT id FROM attributes WHERE name = ? LIMIT 1", [name]);
  if (rows[0]) return rows[0].id;
  const [result] = await connection.execute("INSERT INTO attributes (name) VALUES (?)", [name]);
  return result.insertId;
}

async function ensureAttributeValue(connection, attributeId, value) {
  const [rows] = await connection.execute(
    "SELECT id FROM attribute_values WHERE attribute_id = ? AND value = ? LIMIT 1",
    [attributeId, value]
  );
  if (rows[0]) return rows[0].id;
  const [result] = await connection.execute("INSERT INTO attribute_values (attribute_id, value) VALUES (?, ?)", [attributeId, value]);
  return result.insertId;
}

async function ensureSkuAttribute(connection, skuId, attributeValueId) {
  const [rows] = await connection.execute(
    "SELECT id FROM sku_attributes WHERE sku_id = ? AND attribute_value_id = ? LIMIT 1",
    [skuId, attributeValueId]
  );
  if (rows[0]) return;
  await connection.execute("INSERT INTO sku_attributes (sku_id, attribute_value_id) VALUES (?, ?)", [skuId, attributeValueId]);
}

async function ensureCategory(connection, name, description) {
  const [rows] = await connection.execute("SELECT id FROM categories WHERE UPPER(name) = ? LIMIT 1", [String(name).toUpperCase()]);
  if (rows[0]) return rows[0].id;

  const categoryColumns = await getTableColumns(connection, "categories");
  const fields = ["name"];
  const placeholders = ["?"];
  const values = [name];

  if (hasColumn(categoryColumns, "slug")) {
    fields.push("slug");
    placeholders.push("?");
    values.push(slugify(name));
  }
  if (hasColumn(categoryColumns, "description")) {
    fields.push("description");
    placeholders.push("?");
    values.push(description);
  }
  if (hasColumn(categoryColumns, "is_active")) {
    fields.push("is_active");
    placeholders.push("1");
  }
  if (hasColumn(categoryColumns, "created_at")) {
    fields.push("created_at");
    placeholders.push("NOW()");
  }
  if (hasColumn(categoryColumns, "updated_at")) {
    fields.push("updated_at");
    placeholders.push("NOW()");
  }

  const [result] = await connection.execute(
    `INSERT INTO categories (${fields.join(", ")}) VALUES (${placeholders.join(", ")})`,
    values
  );

  return result.insertId;
}

async function ensureProductWithSku(connection, product) {
  const productColumns = await getTableColumns(connection, "products");
  const skuColumns = await getTableColumns(connection, "product_skus");

  let productId = null;
  if (hasColumn(productColumns, "slug")) {
    const [existing] = await connection.execute("SELECT id FROM products WHERE slug = ? LIMIT 1", [product.slug]);
    productId = existing[0]?.id || null;
  }

  if (!productId) {
    const [existingByName] = await connection.execute("SELECT id FROM products WHERE name = ? LIMIT 1", [product.name]);
    productId = existingByName[0]?.id || null;
  }

  if (!productId) {
    const fields = ["name"];
    const placeholders = ["?"];
    const values = [product.name];

    if (hasColumn(productColumns, "slug")) {
      fields.push("slug");
      placeholders.push("?");
      values.push(product.slug);
    }
    if (hasColumn(productColumns, "description")) {
      fields.push("description");
      placeholders.push("?");
      values.push(product.description);
    }
    if (hasColumn(productColumns, "price")) {
      fields.push("price");
      placeholders.push("?");
      values.push(product.price);
    }
    if (hasColumn(productColumns, "category_id")) {
      fields.push("category_id");
      placeholders.push("?");
      values.push(product.categoryId);
    }
    if (hasColumn(productColumns, "stock")) {
      fields.push("stock");
      placeholders.push("?");
      values.push(product.stock);
    }
    if (hasColumn(productColumns, "is_active")) {
      fields.push("is_active");
      placeholders.push("1");
    }
    if (hasColumn(productColumns, "created_at")) {
      fields.push("created_at");
      placeholders.push("NOW()");
    }
    if (hasColumn(productColumns, "updated_at")) {
      fields.push("updated_at");
      placeholders.push("NOW()");
    }

    const [createdProduct] = await connection.execute(
      `INSERT INTO products (${fields.join(", ")}) VALUES (${placeholders.join(", ")})`,
      values
    );
    productId = createdProduct.insertId;
  } else {
    const sets = ["name = ?"];
    const values = [product.name];
    if (hasColumn(productColumns, "slug")) {
      sets.push("slug = ?");
      values.push(product.slug);
    }
    if (hasColumn(productColumns, "description")) {
      sets.push("description = ?");
      values.push(product.description);
    }
    if (hasColumn(productColumns, "price")) {
      sets.push("price = ?");
      values.push(product.price);
    }
    if (hasColumn(productColumns, "category_id")) {
      sets.push("category_id = ?");
      values.push(product.categoryId);
    }
    if (hasColumn(productColumns, "stock")) {
      sets.push("stock = ?");
      values.push(product.stock);
    }
    if (hasColumn(productColumns, "is_active")) {
      sets.push("is_active = 1");
    }
    if (hasColumn(productColumns, "updated_at")) {
      sets.push("updated_at = NOW()");
    }
    values.push(productId);
    await connection.execute(`UPDATE products SET ${sets.join(", ")} WHERE id = ?`, values);
  }

  const [existingSku] = await connection.execute("SELECT id FROM product_skus WHERE sku = ? LIMIT 1", [product.sku]);
  let skuId = existingSku[0]?.id || null;

  if (!skuId) {
    const fields = ["product_id", "sku"];
    const placeholders = ["?", "?"];
    const values = [productId, product.sku];
    if (hasColumn(skuColumns, "price")) {
      fields.push("price");
      placeholders.push("?");
      values.push(product.price);
    }
    if (hasColumn(skuColumns, "stock")) {
      fields.push("stock");
      placeholders.push("?");
      values.push(product.stock);
    }
    if (hasColumn(skuColumns, "image_url")) {
      fields.push("image_url");
      placeholders.push("?");
      values.push(product.imageUrl);
    }
    if (hasColumn(skuColumns, "status")) {
      fields.push("status");
      placeholders.push("'ACTIVE'");
    }
    if (hasColumn(skuColumns, "created_at")) {
      fields.push("created_at");
      placeholders.push("NOW()");
    }
    if (hasColumn(skuColumns, "updated_at")) {
      fields.push("updated_at");
      placeholders.push("NOW()");
    }
    const [createdSku] = await connection.execute(
      `INSERT INTO product_skus (${fields.join(", ")}) VALUES (${placeholders.join(", ")})`,
      values
    );
    skuId = createdSku.insertId;
  } else {
    const sets = ["product_id = ?"];
    const values = [productId];
    if (hasColumn(skuColumns, "price")) {
      sets.push("price = ?");
      values.push(product.price);
    }
    if (hasColumn(skuColumns, "stock")) {
      sets.push("stock = ?");
      values.push(product.stock);
    }
    if (hasColumn(skuColumns, "image_url")) {
      sets.push("image_url = ?");
      values.push(product.imageUrl);
    }
    if (hasColumn(skuColumns, "status")) {
      sets.push("status = 'ACTIVE'");
    }
    if (hasColumn(skuColumns, "updated_at")) {
      sets.push("updated_at = NOW()");
    }
    values.push(skuId);
    await connection.execute(`UPDATE product_skus SET ${sets.join(", ")} WHERE id = ?`, values);
  }

  return { productId, skuId };
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "cnm_mk_hb",
    charset: "utf8mb4"
  });

  console.log("Seeding guest demo data...");

  const coolingCategoryId = await ensureCategory(connection, "COOLING", "Cooling products for PC Builder");
  const attributeIdByName = new Map();
  const valueIdByKey = new Map();
  const productColumns = await getTableColumns(connection, "products");
  const skuColumns = await getTableColumns(connection, "product_skus");

  for (const attr of ATTRIBUTE_DEFS) {
    const attributeId = await ensureAttribute(connection, attr.name);
    attributeIdByName.set(attr.name, attributeId);
    for (const value of attr.values) {
      const valueId = await ensureAttributeValue(connection, attributeId, value);
      valueIdByKey.set(`${attr.name}::${value}`, valueId);
    }
  }

  for (const product of COOLING_PRODUCTS) {
    const { productId, skuId } = await ensureProductWithSku(connection, {
      ...product,
      categoryId: coolingCategoryId
    });

    const productSets = [];
    const productValues = [];
    if (hasColumn(productColumns, "category_id")) {
      productSets.push("category_id = ?");
      productValues.push(coolingCategoryId);
    }
    if (hasColumn(productColumns, "price")) {
      productSets.push("price = ?");
      productValues.push(product.price);
    }
    if (hasColumn(productColumns, "stock")) {
      productSets.push("stock = ?");
      productValues.push(product.stock);
    }
    if (productSets.length > 0) {
      productValues.push(productId);
      await connection.execute(`UPDATE products SET ${productSets.join(", ")} WHERE id = ?`, productValues);
    }

    const skuSets = [];
    const skuValues = [];
    if (hasColumn(skuColumns, "image_url")) {
      skuSets.push("image_url = ?");
      skuValues.push(product.imageUrl);
    }
    if (hasColumn(skuColumns, "price")) {
      skuSets.push("price = ?");
      skuValues.push(product.price);
    }
    if (hasColumn(skuColumns, "stock")) {
      skuSets.push("stock = ?");
      skuValues.push(product.stock);
    }
    if (skuSets.length > 0) {
      skuValues.push(skuId);
      await connection.execute(`UPDATE product_skus SET ${skuSets.join(", ")} WHERE id = ?`, skuValues);
    }

    for (const [key, value] of Object.entries(product.specs)) {
      const valueId = valueIdByKey.get(`${key}::${value}`);
      if (valueId) {
        await ensureSkuAttribute(connection, skuId, valueId);
      }
    }
  }

  const [skus] = await connection.execute(`
    SELECT
      ps.id AS sku_id,
      ps.image_url,
      c.name AS category_name
    FROM product_skus ps
    INNER JOIN products p ON p.id = ps.product_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE ps.id IS NOT NULL
  `);

  let linked = 0;
  let images = 0;

  for (const row of skus) {
    const specs = pickSpecsForCategory(row.category_name, row.sku_id);
    for (const [key, value] of Object.entries(specs)) {
      const valueId = valueIdByKey.get(`${key}::${value}`);
      if (valueId) {
        await ensureSkuAttribute(connection, row.sku_id, valueId);
        linked += 1;
      }
    }

    const needsImage = !row.image_url || String(row.image_url).startsWith("data:image") || String(row.image_url).length < 8;
    if (needsImage) {
      const imageUrl = pickImageForCategory(row.category_name);
      await connection.execute("UPDATE product_skus SET image_url = ? WHERE id = ?", [imageUrl, row.sku_id]);
      images += 1;
    }
  }

  const [attrCount] = await connection.execute("SELECT COUNT(*) AS c FROM attributes");
  const [valueCount] = await connection.execute("SELECT COUNT(*) AS c FROM attribute_values");
  const [linkCount] = await connection.execute("SELECT COUNT(*) AS c FROM sku_attributes");

  console.log("Seed summary:");
  console.log(`- SKU count: ${skus.length}`);
  console.log(`- New attribute links: ${linked}`);
  console.log(`- Images updated: ${images}`);
  console.log(`- Total attributes: ${attrCount[0].c}`);
  console.log(`- Total attribute values: ${valueCount[0].c}`);
  console.log(`- Total sku attributes: ${linkCount[0].c}`);

  await connection.end();
}

main().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
