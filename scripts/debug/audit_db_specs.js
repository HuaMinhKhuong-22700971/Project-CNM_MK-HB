const mysql = require("mysql2/promise");

async function runAudit() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "",
    database: "cnm_ecommerce",
    connectTimeout: 5000
  });

  console.log("==================================================");
  console.log("   SMART PC BUILDER - DB SPEC DATA AUDIT REPORT   ");
  console.log("==================================================\n");

  // 1. Kiểm tra cấu trúc các bảng liên quan đến attributes
  console.log("--- 1. SCHEMA CHECK ---");
  const [tables] = await conn.execute("SHOW TABLES LIKE '%attrib%'");
  console.log("Found attribute-related tables:", tables.map(t => Object.values(t)[0]));

  const targetAttributes = [
    "socket",
    "tdp",
    "ram_type",
    "gpu_length",
    "psu_wattage",
    "case_gpu_clearance",
    "cooling_capacity",
    "radiator_size",
    "cooler_height",
    "case_form_factor",
    "stock_cooler"
  ];

  // 2. Thống kê theo Categories liên quan đến PC Builder
  const targetCategories = ["CPU", "MAINBOARD", "RAM", "GPU", "STORAGE", "PSU", "CASE", "COOLING"];

  const [categories] = await conn.execute(
    "SELECT id, name FROM categories WHERE UPPER(name) IN ('CPU', 'MAINBOARD', 'RAM', 'GPU', 'STORAGE', 'PSU', 'CASE', 'COOLING') OR UPPER(name) LIKE '%CPU%' OR UPPER(name) LIKE '%RAM%' OR UPPER(name) LIKE '%VGA%' OR UPPER(name) LIKE '%CARD%' OR UPPER(name) LIKE '%NGUỒN%' OR UPPER(name) LIKE '%CASE%' OR UPPER(name) LIKE '%TẢN%'"
  );
  
  console.log("\n--- 2. CATEGORY & PRODUCT STATS ---");
  const [allProducts] = await conn.execute(`
    SELECT p.id as product_id, p.name as product_name, c.name as category_name,
           s.id as sku_id, s.sku, s.price
    FROM products p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_skus s ON s.product_id = p.id
  `);

  console.log(`Total Products in DB: ${allProducts.length}`);

  // 3. Đếm số lượng SKU attributes hiện có
  let attrRows = [];
  try {
    const [rows] = await conn.execute(`
      SELECT 
        s.id AS sku_id,
        p.id AS product_id,
        p.name AS product_name,
        c.name AS category_name,
        a.name AS attribute_name,
        av.value AS attribute_value
      FROM product_skus s
      JOIN products p ON p.id = s.product_id
      JOIN categories c ON c.id = p.category_id
      LEFT JOIN sku_attributes sa ON sa.sku_id = s.id
      LEFT JOIN attribute_values av ON av.id = sa.attribute_value_id
      LEFT JOIN attributes a ON a.id = av.attribute_id
    `);
    attrRows = rows;
  } catch (err) {
    console.error("Error querying sku_attributes:", err.message);
  }

  // Group by SKU / Product
  const skuMap = new Map();
  for (const row of attrRows) {
    if (!skuMap.has(row.sku_id)) {
      skuMap.set(row.sku_id, {
        sku_id: row.sku_id,
        product_name: row.product_name,
        category: row.category_name,
        attributes: {}
      });
    }
    if (row.attribute_name) {
      skuMap.get(row.sku_id).attributes[row.attribute_name.toLowerCase()] = row.attribute_value;
    }
  }

  console.log(`Total SKUs parsed: ${skuMap.size}`);

  // Thống kê chi tiết từng attribute
  console.log("\n--- 3. ATTRIBUTE COVERAGE STATS ---");
  const attrCounts = {};
  targetAttributes.forEach(attr => attrCounts[attr] = 0);

  for (const [skuId, data] of skuMap.entries()) {
    const keys = Object.keys(data.attributes);
    targetAttributes.forEach(target => {
      if (keys.some(k => k.includes(target) || target.includes(k))) {
        attrCounts[target]++;
      }
    });
  }

  console.table(
    targetAttributes.map(attr => ({
      "Attribute Key": attr,
      "SKUs with Data": attrCounts[attr],
      "Total SKUs": skuMap.size,
      "Coverage (%)": skuMap.size > 0 ? ((attrCounts[attr] / skuMap.size) * 100).toFixed(1) + "%" : "0%"
    }))
  );

  // Summary % Đủ vs Thiếu
  let skusWithAllSpecs = 0;
  let skusWithPartialSpecs = 0;
  let skusWithZeroSpecs = 0;

  for (const [skuId, data] of skuMap.entries()) {
    const attrCount = Object.keys(data.attributes).length;
    if (attrCount >= 3) {
      skusWithAllSpecs++;
    } else if (attrCount > 0) {
      skusWithPartialSpecs++;
    } else {
      skusWithZeroSpecs++;
    }
  }

  // Breakdown by Category
  console.log("\n--- 4. DETAILED BREAKDOWN BY CATEGORY ---");
  const catStats = {};
  for (const [skuId, data] of skuMap.entries()) {
    const cat = data.category || "Unknown";
    if (!catStats[cat]) catStats[cat] = { total: 0, attrs: {} };
    catStats[cat].total++;
    Object.keys(data.attributes).forEach(k => {
      catStats[cat].attrs[k] = (catStats[cat].attrs[k] || 0) + 1;
    });
  }

  Object.entries(catStats).forEach(([cat, stat]) => {
    console.log(`\n📌 Category: ${cat} (Total SKUs: ${stat.total})`);
    console.log("   Existing Attributes:", Object.entries(stat.attrs).map(([k, v]) => `${k}: ${v}/${stat.total}`).join(", ") || "NONE");
  });

  const totalSKUs = skuMap.size || 1;
  console.log("\n--- 5. OVERALL DATA COMPLETENESS ---");
  console.log(`🟢 Complete Data (≥ 3 key specs): ${skusWithAllSpecs} (${((skusWithAllSpecs / totalSKUs) * 100).toFixed(1)}%)`);
  console.log(`🟡 Partial Data (1-2 specs):     ${skusWithPartialSpecs} (${((skusWithPartialSpecs / totalSKUs) * 100).toFixed(1)}%)`);
  console.log(`🔴 Zero Data (0 specs):          ${skusWithZeroSpecs} (${((skusWithZeroSpecs / totalSKUs) * 100).toFixed(1)}%)`);

  await conn.end();
}

runAudit().catch(console.error);
