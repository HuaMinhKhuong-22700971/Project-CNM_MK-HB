const { query } = require("../src/config/database");

// Attribute ID mappings
const ATTRIBUTE_IDS = {
  socket: 1,
  ram_type: 2,
  wattage: 3,
  form_factor: 4,
  storage_type: 5
};

// Additional attributes to create
const ADDITIONAL_ATTRIBUTES = {
  vram: "VRAM",
  cuda_cores: "CUDA Cores",
  clock: "Clock Speed",
  memory_type: "Memory Type",
  capacity: "Capacity",
  read_speed: "Read Speed",
  write_speed: "Write Speed",
  efficiency: "Efficiency Rating",
  modular: "Modular",
  cooling: "Cooling Type",
  material: "Material",
  rgb: "RGB Support"
};

// Extract specs from product name
function extractSpecsFromName(productName, categoryName) {
  const specs = {};
  const name = productName.toLowerCase();

  // Extract socket for CPU
  if (categoryName === "CPU") {
    if (name.includes("lga1700") || name.includes("14400") || name.includes("14600")) specs.socket = "LGA1700";
    else if (name.includes("am5") || name.includes("7600") || name.includes("7700")) specs.socket = "AM5";
    else if (name.includes("am4") || name.includes("5600")) specs.socket = "AM4";
    else if (name.includes("lga1200")) specs.socket = "LGA1200";
  }

  // Extract RAM type for RAM and Mainboard
  if (categoryName === "RAM" || categoryName === "Mainboard") {
    if (name.includes("ddr5")) specs.ram_type = "DDR5";
    else if (name.includes("ddr4")) specs.ram_type = "DDR4";
  }

  // Extract wattage for PSU
  if (categoryName === "PSU") {
    const wattageMatch = name.match(/(\d{3,4})w/);
    if (wattageMatch) specs.wattage = wattageMatch[1] + "W";
  }

  // Extract form factor for Case and Mainboard
  if (categoryName === "Case" || categoryName === "Mainboard") {
    if (name.includes("atx")) specs.form_factor = "ATX";
    else if (name.includes("matx") || name.includes("m-atx")) specs.form_factor = "mATX";
    else if (name.includes("itx")) specs.form_factor = "ITX";
  }

  // Extract storage type for SSD
  if (categoryName === "SSD" || categoryName === "STORAGE") {
    if (name.includes("nvme")) specs.storage_type = "NVMe";
    else if (name.includes("sata")) specs.storage_type = "SATA SSD";
    else if (name.includes("hdd")) specs.storage_type = "HDD";
  }

  return specs;
}

async function getAttributeIdByName(attributeName) {
  const rows = await query("SELECT id FROM attributes WHERE name = ?", [attributeName]);
  return rows[0]?.id;
}

async function getOrCreateAttributeValue(attributeId, value) {
  let rows = await query(
    "SELECT id FROM attribute_values WHERE attribute_id = ? AND value = ?",
    [attributeId, value]
  );
  
  if (rows.length > 0) {
    return rows[0].id;
  }

  const result = await query(
    "INSERT INTO attribute_values (attribute_id, value) VALUES (?, ?)",
    [attributeId, value]
  );
  
  return result.insertId;
}

async function getSkuAttributes(skuId) {
  const rows = await query(
    "SELECT av.attribute_id, av.value FROM sku_attributes sa JOIN attribute_values av ON sa.attribute_value_id = av.id WHERE sa.sku_id = ?",
    [skuId]
  );
  return rows;
}

async function addSkuAttribute(skuId, attributeValueId) {
  await query(
    "INSERT INTO sku_attributes (sku_id, attribute_value_id) VALUES (?, ?)",
    [skuId, attributeValueId]
  );
}

async function main() {
  console.log("Đang lấy danh sách sản phẩm và SKU...");
  const products = await query(`
    SELECT 
      p.id as product_id,
      p.name,
      c.name as category_name,
      ps.id as sku_id,
      ps.sku
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_skus ps ON ps.product_id = p.id
    WHERE p.is_active = 1 AND ps.is_active = 1
    ORDER BY p.id
  `);

  console.log(`Tìm thấy ${products.length} SKU`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const product of products) {
    console.log(`Đang xử lý SKU ${product.sku_id}: ${product.name} (${product.sku})`);

    const specs = extractSpecsFromName(product.name, product.category_name);
    
    if (Object.keys(specs).length === 0) {
      console.log("  - Không thể trích xuất specs từ tên sản phẩm, bỏ qua");
      skippedCount++;
      continue;
    }

    const existingAttributes = await getSkuAttributes(product.sku_id);
    const existingAttributeIds = existingAttributes.map(a => a.attribute_id);

    for (const [attributeName, value] of Object.entries(specs)) {
      if (existingAttributeIds.includes(ATTRIBUTE_IDS[attributeName])) {
        console.log(`  - ${attributeName}: ${value} (đã có)`);
        continue;
      }

      const attributeId = ATTRIBUTE_IDS[attributeName];
      const attributeValueId = await getOrCreateAttributeValue(attributeId, value);
      
      await addSkuAttribute(product.sku_id, attributeValueId);
      console.log(`  + ${attributeName}: ${value}`);
      updatedCount++;
    }

    console.log("---");
  }

  console.log("\nKết quả:");
  console.log(`- Đã thêm specs: ${updatedCount} thuộc tính`);
  console.log(`- Bỏ qua: ${skippedCount} SKU`);
  console.log("- Tổng:", products.length, "SKU");

  process.exit(0);
}

main().catch(error => {
  console.error("Error:", error);
  process.exit(1);
});
