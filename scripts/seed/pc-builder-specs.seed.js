/**
 * PC Builder Spec Data Seeder [P0-02]
 * ====================================
 * Bổ sung đầy đủ thuộc tính kỹ thuật vào bảng sku_attributes cho 100 SKUs
 * Schema: attributes → attribute_values → sku_attributes
 * Run: node scripts/seed/pc-builder-specs.seed.js
 */
const mysql = require("mysql2/promise");

const DB_CONFIG = {
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "",
  database: "cnm_ecommerce",
};

// ─── Spec Map: SKU ID → thuộc tính kỹ thuật ─────────────────────────────────
const SKU_SPECS = {

  // ═══════════════════════════════════════════════════════════════════
  // CPU (15 SKUs) — Bổ sung: tdp, stock_cooler (socket đã có)
  // ═══════════════════════════════════════════════════════════════════
  1:  { socket: "LGA1700", tdp: "65W",  stock_cooler: "yes" },  // i5-14400F
  11: { socket: "LGA1700", tdp: "125W", stock_cooler: "no"  },  // i7-14700K
  13: { socket: "LGA1700", tdp: "58W",  stock_cooler: "yes" },  // i3-12100F
  31: { socket: "LGA1700", tdp: "58W",  stock_cooler: "yes" },  // i3-12100F (dup)
  32: { socket: "LGA1700", tdp: "125W", stock_cooler: "no"  },  // i7-14700K (dup)
  35: { socket: "LGA1700", tdp: "65W",  stock_cooler: "yes" },  // i5-12400
  37: { socket: "LGA1700", tdp: "125W", stock_cooler: "no"  },  // i9-12900K
  39: { socket: "LGA1700", tdp: "125W", stock_cooler: "no"  },  // i5-13600KF
  34: { socket: "AM4",     tdp: "65W",  stock_cooler: "yes" },  // Ryzen 5 5600
  40: { socket: "AM4",     tdp: "65W",  stock_cooler: "no"  },  // Ryzen 7 5700X
  2:  { socket: "AM5",     tdp: "65W",  stock_cooler: "yes" },  // Ryzen 5 7600
  12: { socket: "AM5",     tdp: "120W", stock_cooler: "no"  },  // Ryzen 7 7800X3D
  33: { socket: "AM5",     tdp: "120W", stock_cooler: "no"  },  // Ryzen 7 7800X3D (dup)
  36: { socket: "AM5",     tdp: "170W", stock_cooler: "no"  },  // Ryzen 9 7900X
  38: { socket: "AM5",     tdp: "65W",  stock_cooler: "yes" },  // Ryzen 5 8600G

  // ═══════════════════════════════════════════════════════════════════
  // MAINBOARD (15 SKUs) — Bổ sung: ram_slots, m2_slots
  // ═══════════════════════════════════════════════════════════════════
  16: { socket: "LGA1700", ram_type: "DDR4", form_factor: "mATX", ram_slots: "4", m2_slots: "2" }, // MSI MAG B660M MORTAR WIFI DDR4
  48: { socket: "LGA1700", ram_type: "DDR4", form_factor: "mATX", ram_slots: "2", m2_slots: "1" }, // ASUS Prime H610M-K
  3:  { socket: "LGA1700", ram_type: "DDR5", form_factor: "mATX", ram_slots: "2", m2_slots: "1" }, // ASUS Prime B760M-A WIFI DDR5
  44: { socket: "LGA1700", ram_type: "DDR5", form_factor: "mATX", ram_slots: "4", m2_slots: "2" }, // ASUS TUF GAMING B760M-PLUS
  14: { socket: "LGA1700", ram_type: "DDR5", form_factor: "ATX",  ram_slots: "4", m2_slots: "4" }, // ASUS ROG STRIX Z790-E
  41: { socket: "LGA1700", ram_type: "DDR5", form_factor: "ATX",  ram_slots: "4", m2_slots: "5" }, // ASUS ROG MAXIMUS Z790 HERO
  47: { socket: "LGA1700", ram_type: "DDR5", form_factor: "ATX",  ram_slots: "4", m2_slots: "4" }, // Gigabyte Z790 AORUS ELITE AX
  45: { socket: "LGA1700", ram_type: "DDR5", form_factor: "ATX",  ram_slots: "4", m2_slots: "4" }, // MSI MPG Z790 EDGE WIFI
  46: { socket: "AM4",     ram_type: "DDR4", form_factor: "mATX", ram_slots: "4", m2_slots: "2" }, // ASRock B550M Pro4
  49: { socket: "AM4",     ram_type: "DDR4", form_factor: "ATX",  ram_slots: "4", m2_slots: "2" }, // MSI B550 GAMING GEN3
  4:  { socket: "AM5",     ram_type: "DDR5", form_factor: "mATX", ram_slots: "2", m2_slots: "2" }, // MSI PRO B650M-A WIFI
  15: { socket: "AM5",     ram_type: "DDR5", form_factor: "ATX",  ram_slots: "4", m2_slots: "2" }, // Gigabyte B650 AORUS ELITE AX
  42: { socket: "AM5",     ram_type: "DDR5", form_factor: "ATX",  ram_slots: "4", m2_slots: "3" }, // MSI MAG B650 TOMAHAWK WIFI
  43: { socket: "AM5",     ram_type: "DDR5", form_factor: "mATX", ram_slots: "2", m2_slots: "2" }, // Gigabyte A620M S2H
  50: { socket: "AM5",     ram_type: "DDR5", form_factor: "ATX",  ram_slots: "4", m2_slots: "3" }, // ROG STRIX X670E-F

  // ═══════════════════════════════════════════════════════════════════
  // RAM (15 SKUs) — Bổ sung: speed, capacity
  // ═══════════════════════════════════════════════════════════════════
  6:  { ram_type: "DDR4", speed: "3200MHz", capacity: "16GB" },
  18: { ram_type: "DDR4", speed: "3200MHz", capacity: "16GB" },
  52: { ram_type: "DDR4", speed: "3200MHz", capacity: "16GB" },
  54: { ram_type: "DDR4", speed: "3600MHz", capacity: "16GB" },
  55: { ram_type: "DDR4", speed: "3200MHz", capacity: "8GB"  },
  57: { ram_type: "DDR4", speed: "3200MHz", capacity: "16GB" },
  60: { ram_type: "DDR4", speed: "3200MHz", capacity: "32GB" },
  5:  { ram_type: "DDR5", speed: "5600MHz", capacity: "16GB" },
  17: { ram_type: "DDR5", speed: "6000MHz", capacity: "32GB" },
  19: { ram_type: "DDR5", speed: "6000MHz", capacity: "32GB" },
  51: { ram_type: "DDR5", speed: "6000MHz", capacity: "32GB" },
  53: { ram_type: "DDR5", speed: "6400MHz", capacity: "32GB" },
  56: { ram_type: "DDR5", speed: "4800MHz", capacity: "16GB" },
  58: { ram_type: "DDR5", speed: "7200MHz", capacity: "32GB" },
  59: { ram_type: "DDR5", speed: "6000MHz", capacity: "32GB" },

  // ═══════════════════════════════════════════════════════════════════
  // GPU (14 SKUs) — Hoàn toàn mới: gpu_length, tdp, vram, pcie_slot
  // ═══════════════════════════════════════════════════════════════════
  7:  { gpu_length: "240mm", tdp: "115W", vram: "8GB",  pcie_slot: "x16" }, // NVIDIA RTX 4060 8GB
  20: { gpu_length: "285mm", tdp: "220W", vram: "12GB", pcie_slot: "x16" }, // NVIDIA RTX 4070 SUPER
  22: { gpu_length: "336mm", tdp: "450W", vram: "24GB", pcie_slot: "x16" }, // NVIDIA RTX 4090 Founders
  21: { gpu_length: "287mm", tdp: "263W", vram: "16GB", pcie_slot: "x16" }, // AMD RX 7800 XT
  61: { gpu_length: "285mm", tdp: "263W", vram: "16GB", pcie_slot: "x16" }, // Sapphire PULSE RX 7800 XT
  62: { gpu_length: "358mm", tdp: "320W", vram: "16GB", pcie_slot: "x16" }, // ASUS ProArt RTX 4080 SUPER
  63: { gpu_length: "268mm", tdp: "170W", vram: "12GB", pcie_slot: "x16" }, // MSI RTX 3060 Ventus 2X
  64: { gpu_length: "345mm", tdp: "285W", vram: "16GB", pcie_slot: "x16" }, // Gigabyte RTX 4070 Ti SUPER
  65: { gpu_length: "212mm", tdp: "165W", vram: "8GB",  pcie_slot: "x16" }, // PowerColor RX 7600
  66: { gpu_length: "355mm", tdp: "450W", vram: "24GB", pcie_slot: "x16" }, // ASUS ROG Strix RTX 4090
  67: { gpu_length: "325mm", tdp: "355W", vram: "24GB", pcie_slot: "x16" }, // Sapphire NITRO+ RX 7900 XTX
  68: { gpu_length: "306mm", tdp: "165W", vram: "8GB",  pcie_slot: "x16" }, // MSI RTX 4060 Ti Gaming X
  69: { gpu_length: "232mm", tdp: "132W", vram: "8GB",  pcie_slot: "x16" }, // Gigabyte RX 6600 Eagle
  70: { gpu_length: "302mm", tdp: "220W", vram: "12GB", pcie_slot: "x16" }, // ASUS Dual RTX 4070 SUPER

  // ═══════════════════════════════════════════════════════════════════
  // PSU (14 SKUs) — Bổ sung: psu_wattage (alias chuẩn), efficiency
  // ═══════════════════════════════════════════════════════════════════
  9:  { psu_wattage: "650W",  wattage: "650W",  efficiency: "80Plus Bronze"   }, // Cooler Master MWE 650 Bronze V2
  26: { psu_wattage: "850W",  wattage: "850W",  efficiency: "80Plus Gold"     }, // Corsair RM850x
  27: { psu_wattage: "750W",  wattage: "750W",  efficiency: "80Plus Gold"     }, // EVGA SuperNOVA 750 GT
  28: { psu_wattage: "1000W", wattage: "1000W", efficiency: "80Plus Gold"     }, // MSI MPG A1000G
  81: { psu_wattage: "1000W", wattage: "1000W", efficiency: "80Plus Gold"     }, // Deepcool PX1000G Gold
  82: { psu_wattage: "750W",  wattage: "750W",  efficiency: "80Plus Gold"     }, // Seasonic Focus GX-750
  83: { psu_wattage: "850W",  wattage: "850W",  efficiency: "80Plus Gold"     }, // MSI MPG A850G
  84: { psu_wattage: "1200W", wattage: "1200W", efficiency: "80Plus Gold"     }, // Corsair RM1200x Shift
  85: { psu_wattage: "550W",  wattage: "550W",  efficiency: "80Plus Bronze"   }, // Cooler Master MWE 550 Bronze
  86: { psu_wattage: "1000W", wattage: "1000W", efficiency: "80Plus Platinum" }, // Be Quiet! Straight Power 12
  87: { psu_wattage: "750W",  wattage: "750W",  efficiency: "80Plus Platinum" }, // SilverStone SX750 Platinum
  88: { psu_wattage: "650W",  wattage: "650W",  efficiency: "80Plus Bronze"   }, // Deepcool PK650D Bronze
  89: { psu_wattage: "1600W", wattage: "1600W", efficiency: "80Plus Titanium" }, // Seasonic Prime TX-1600
  90: { psu_wattage: "650W",  wattage: "650W",  efficiency: "80Plus Bronze"   }, // Corsair CX650 Bronze

  // ═══════════════════════════════════════════════════════════════════
  // CASE (13 SKUs) — Bổ sung: case_gpu_clearance, case_radiator_support,
  //                           case_cooler_clearance
  // ═══════════════════════════════════════════════════════════════════
  10:  { form_factor: "ATX",  case_gpu_clearance: "380mm", case_radiator_support: "240mm", case_cooler_clearance: "155mm" }, // CM CMP 520
  29:  { form_factor: "ATX",  case_gpu_clearance: "375mm", case_radiator_support: "360mm", case_cooler_clearance: "185mm" }, // NZXT H7 Flow
  30:  { form_factor: "ATX",  case_gpu_clearance: "446mm", case_radiator_support: "360mm", case_cooler_clearance: "167mm" }, // Lian Li O11 EVO
  91:  { form_factor: "ATX",  case_gpu_clearance: "446mm", case_radiator_support: "360mm", case_cooler_clearance: "167mm" }, // Lian Li O11 EVO (dup)
  92:  { form_factor: "ATX",  case_gpu_clearance: "365mm", case_radiator_support: "360mm", case_cooler_clearance: "170mm" }, // NZXT H6 Flow
  93:  { form_factor: "ATX",  case_gpu_clearance: "400mm", case_radiator_support: "360mm", case_cooler_clearance: "175mm" }, // Deepcool CH560 Digital
  94:  { form_factor: "ATX",  case_gpu_clearance: "410mm", case_radiator_support: "360mm", case_cooler_clearance: "170mm" }, // CM TD500 Mesh V2
  95:  { form_factor: "ATX",  case_gpu_clearance: "430mm", case_radiator_support: "360mm", case_cooler_clearance: "190mm" }, // Corsair 5000D Airflow
  96:  { form_factor: "ATX",  case_gpu_clearance: "480mm", case_radiator_support: "420mm", case_cooler_clearance: "195mm" }, // Phanteks NV7
  97:  { form_factor: "ATX",  case_gpu_clearance: "400mm", case_radiator_support: "360mm", case_cooler_clearance: "180mm" }, // Lian Li Lancool 216
  99:  { form_factor: "ATX",  case_gpu_clearance: "450mm", case_radiator_support: "420mm", case_cooler_clearance: "187mm" }, // Be Quiet! Shadow Base 800
  98:  { form_factor: "ITX",  case_gpu_clearance: "322mm", case_radiator_support: "120mm", case_cooler_clearance: "65mm"  }, // NZXT H210 Mini-ITX
  100: { form_factor: "mATX", case_gpu_clearance: "320mm", case_radiator_support: "240mm", case_cooler_clearance: "160mm" }, // Deepcool Matrexx 40

  // ═══════════════════════════════════════════════════════════════════
  // STORAGE (14 SKUs) — Bổ sung: interface, capacity
  // ═══════════════════════════════════════════════════════════════════
  8:   { storage_type: "NVMe",     interface: "PCIe Gen4 x4", capacity: "1TB"   }, // Samsung 990 EVO 1TB
  23:  { storage_type: "NVMe",     interface: "PCIe Gen4 x4", capacity: "1TB"   }, // WD Black SN850X 1TB
  24:  { storage_type: "NVMe",     interface: "PCIe Gen4 x4", capacity: "2TB"   }, // Crucial P3 Plus 2TB
  25:  { storage_type: "NVMe",     interface: "PCIe Gen4 x4", capacity: "2TB"   }, // Samsung 980 Pro 2TB
  71:  { storage_type: "NVMe",     interface: "PCIe Gen4 x4", capacity: "2TB"   }, // Lexar NM790 2TB Gen4
  72:  { storage_type: "NVMe",     interface: "PCIe Gen4 x4", capacity: "4TB"   }, // Samsung 990 Pro 4TB
  73:  { storage_type: "HDD",      interface: "SATA",          capacity: "4TB"   }, // WD Blue 4TB HDD
  74:  { storage_type: "NVMe",     interface: "PCIe Gen5 x4", capacity: "1TB"   }, // Crucial T705 1TB Gen5
  75:  { storage_type: "NVMe",     interface: "PCIe Gen4 x4", capacity: "1TB"   }, // Kingston NV2 1TB Gen4
  76:  { storage_type: "HDD",      interface: "SATA",          capacity: "8TB"   }, // Seagate IronWolf 8TB
  77:  { storage_type: "SATA SSD", interface: "SATA",          capacity: "1TB"   }, // Samsung 870 EVO 1TB SATA
  78:  { storage_type: "NVMe",     interface: "PCIe Gen4 x4", capacity: "2TB"   }, // TeamGroup MP44 2TB Gen4
  79:  { storage_type: "NVMe",     interface: "PCIe Gen4 x4", capacity: "2TB"   }, // WD Black SN850X 2TB
  80:  { storage_type: "SATA SSD", interface: "SATA",          capacity: "500GB" }, // Crucial MX500 500GB SATA
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function getOrCreateAttribute(conn, name) {
  const [rows] = await conn.execute("SELECT id FROM attributes WHERE name = ? LIMIT 1", [name]);
  if (rows.length > 0) return rows[0].id;
  const [result] = await conn.execute("INSERT INTO attributes (name) VALUES (?)", [name]);
  return result.insertId;
}

async function getOrCreateAttributeValue(conn, attributeId, value) {
  const [rows] = await conn.execute(
    "SELECT id FROM attribute_values WHERE attribute_id = ? AND value = ? LIMIT 1",
    [attributeId, value]
  );
  if (rows.length > 0) return rows[0].id;
  const [result] = await conn.execute(
    "INSERT INTO attribute_values (attribute_id, value) VALUES (?, ?)",
    [attributeId, value]
  );
  return result.insertId;
}

async function upsertSkuAttribute(conn, skuId, attributeId, attributeValueId) {
  const [existing] = await conn.execute(
    `SELECT sa.id FROM sku_attributes sa
     JOIN attribute_values av ON av.id = sa.attribute_value_id
     WHERE sa.sku_id = ? AND av.attribute_id = ? LIMIT 1`,
    [skuId, attributeId]
  );
  if (existing.length > 0) {
    await conn.execute("UPDATE sku_attributes SET attribute_value_id = ? WHERE id = ?", [attributeValueId, existing[0].id]);
    return "updated";
  }
  await conn.execute("INSERT INTO sku_attributes (sku_id, attribute_value_id) VALUES (?, ?)", [skuId, attributeValueId]);
  return "inserted";
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  const conn = await mysql.createConnection(DB_CONFIG);
  console.log("✅ Connected to DB:", DB_CONFIG.database);
  console.log("\n==================================================");
  console.log("   SMART PC BUILDER — SPEC DATA SEEDER [P0-02]   ");
  console.log("==================================================\n");

  let inserted = 0, updated = 0, skipped = 0, errors = 0;
  const attrIdCache = {};
  const attrValIdCache = {};

  const skuEntries = Object.entries(SKU_SPECS);
  console.log(`📋 Processing ${skuEntries.length} SKUs...\n`);

  for (const [skuIdStr, specs] of skuEntries) {
    const skuId = Number(skuIdStr);

    // Verify SKU exists
    const [skuRows] = await conn.execute(
      "SELECT s.id, p.name FROM product_skus s JOIN products p ON p.id = s.product_id WHERE s.id = ? LIMIT 1",
      [skuId]
    );
    if (skuRows.length === 0) {
      console.warn(`  ⚠️  SKU[${skuId}] not found — skipping`);
      skipped++;
      continue;
    }
    const productName = skuRows[0].name;
    process.stdout.write(`  SKU[${String(skuId).padStart(3)}] ${productName.substring(0, 42).padEnd(42)} `);

    try {
      let attrCount = 0;
      for (const [attrName, attrValue] of Object.entries(specs)) {
        // Get/create attribute
        if (!attrIdCache[attrName]) {
          attrIdCache[attrName] = await getOrCreateAttribute(conn, attrName);
        }
        const attributeId = attrIdCache[attrName];

        // Get/create attribute value
        const cacheKey = `${attributeId}:${attrValue}`;
        if (!attrValIdCache[cacheKey]) {
          attrValIdCache[cacheKey] = await getOrCreateAttributeValue(conn, attributeId, attrValue);
        }
        const attributeValueId = attrValIdCache[cacheKey];

        // Upsert sku_attributes
        const result = await upsertSkuAttribute(conn, skuId, attributeId, attributeValueId);
        if (result === "inserted") inserted++;
        else updated++;
        attrCount++;
      }
      console.log(`✅ ${attrCount} attrs`);
    } catch (err) {
      console.log(`❌ ${err.message}`);
      errors++;
    }
  }

  // Summary
  console.log("\n══════════════════════════════════════════════════");
  console.log("   SEEDER SUMMARY");
  console.log("══════════════════════════════════════════════════");
  console.log(`  ✅ Inserted:  ${inserted}`);
  console.log(`  🔄 Updated:   ${updated}`);
  console.log(`  ⏭️  Skipped:   ${skipped}`);
  console.log(`  ❌ Errors:    ${errors}`);

  // Post-seed verification
  console.log("\n── Post-Seed Coverage Check ─────────────────────");
  const checkKeys = [
    "socket", "tdp", "stock_cooler",
    "ram_type", "ram_slots",
    "gpu_length", "psu_wattage",
    "case_gpu_clearance", "case_radiator_support", "case_cooler_clearance",
    "efficiency"
  ];
  for (const key of checkKeys) {
    const [rows] = await conn.execute(
      `SELECT COUNT(DISTINCT sa.sku_id) as cnt
       FROM sku_attributes sa
       JOIN attribute_values av ON av.id = sa.attribute_value_id
       JOIN attributes a ON a.id = av.attribute_id
       WHERE a.name = ?`,
      [key]
    );
    const cnt = rows[0]?.cnt || 0;
    const bar = "█".repeat(Math.round(cnt / 2)) + "░".repeat(Math.max(0, 7 - Math.round(cnt / 2)));
    console.log(`  ${key.padEnd(26)} ${bar} ${cnt} SKUs`);
  }

  await conn.end();
  console.log("\n✅ Seeder completed successfully!");
}

seed().catch(err => { console.error("❌ Seeder failed:", err); process.exit(1); });
