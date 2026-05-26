const { query } = require("../src/config/database");

// Detailed specs extraction based on product name and category
const detailedSpecsMap = {
  "CPU": {
    attributes: ["Cores", "Threads", "Base Clock", "Boost Clock", "Cache", "TDP"],
    extract: (name) => {
      const specs = {};
      const lowerName = name.toLowerCase();
      
      // Extract cores/threads
      if (lowerName.includes("14400")) {
        specs.Cores = "10";
        specs.Threads = "16";
        specs.BaseClock = "2.5 GHz";
        specs.BoostClock = "4.7 GHz";
        specs.Cache = "20MB L3";
        specs.TDP = "65W";
      } else if (lowerName.includes("14600")) {
        specs.Cores = "14";
        specs.Threads = "20";
        specs.BaseClock = "3.5 GHz";
        specs.BoostClock = "5.3 GHz";
        specs.Cache = "24MB L3";
        specs.TDP = "65W";
      } else if (lowerName.includes("7600")) {
        specs.Cores = "6";
        specs.Threads = "12";
        specs.BaseClock = "3.8 GHz";
        specs.BoostClock = "5.1 GHz";
        specs.Cache = "32MB L3";
        specs.TDP = "65W";
      } else if (lowerName.includes("7700")) {
        specs.Cores = "8";
        specs.Threads = "16";
        specs.BaseClock = "4.5 GHz";
        specs.BoostClock = "5.4 GHz";
        specs.Cache = "32MB L3";
        specs.TDP = "65W";
      } else if (lowerName.includes("5600")) {
        specs.Cores = "6";
        specs.Threads = "12";
        specs.BaseClock = "3.5 GHz";
        specs.BoostClock = "4.4 GHz";
        specs.Cache = "32MB L3";
        specs.TDP = "65W";
      }
      
      return specs;
    }
  },
  "Mainboard": {
    attributes: ["Chipset", "RAM Slots", "Max RAM", "PCIe Slots", "M.2 Slots", "USB Ports"],
    extract: (name) => {
      const specs = {};
      const lowerName = name.toLowerCase();
      
      if (lowerName.includes("b760")) {
        specs.Chipset = "Intel B760";
        specs.RAMSlots = "4";
        specs.MaxRAM = "128GB";
        specs.PCIeSlots = "2x PCIe 4.0 x16";
        specs.M2Slots = "2x M.2 NVMe";
        specs.USBPorts = "USB 3.2 Gen 2";
      } else if (lowerName.includes("b650")) {
        specs.Chipset = "AMD B650";
        specs.RAMSlots = "4";
        specs.MaxRAM = "128GB";
        specs.PCIeSlots = "2x PCIe 4.0 x16";
        specs.M2Slots = "2x M.2 NVMe";
        specs.USBPorts = "USB 3.2 Gen 2";
      }
      
      return specs;
    }
  },
  "RAM": {
    attributes: ["Capacity", "Speed", "CAS Latency", "Voltage", "Form Factor"],
    extract: (name) => {
      const specs = {};
      const lowerName = name.toLowerCase();
      
      // Extract capacity
      const capacityMatch = name.match(/(\d+)GB/);
      if (capacityMatch) specs.Capacity = capacityMatch[1] + "GB";
      
      // Extract speed
      const speedMatch = name.match(/(\d+)MHz/);
      if (speedMatch) specs.Speed = speedMatch[1] + "MHz";
      
      specs.CASLatency = "CL16-CL36";
      specs.Voltage = "1.1V-1.35V";
      specs.FormFactor = "DIMM";
      
      return specs;
    }
  },
  "GPU": {
    attributes: ["VRAM", "Memory Type", "CUDA Cores", "Base Clock", "Boost Clock", "Power"],
    extract: (name) => {
      const specs = {};
      const lowerName = name.toLowerCase();
      
      // Extract VRAM
      const vramMatch = name.match(/(\d+)GB/);
      if (vramMatch) specs.VRAM = vramMatch[1] + "GB";
      
      if (lowerName.includes("rtx 4090")) {
        specs.MemoryType = "GDDR6X";
        specs.CUDACores = "16384";
        specs.BaseClock = "2235 MHz";
        specs.BoostClock = "2520 MHz";
        specs.Power = "450W";
      } else if (lowerName.includes("rtx 4080")) {
        specs.MemoryType = "GDDR6X";
        specs.CUDACores = "9728";
        specs.BaseClock = "2205 MHz";
        specs.BoostClock = "2505 MHz";
        specs.Power = "320W";
      } else if (lowerName.includes("rtx 4070")) {
        specs.MemoryType = "GDDR6X";
        specs.CUDACores = "5888";
        specs.BaseClock = "1920 MHz";
        specs.BoostClock = "2475 MHz";
        specs.Power = "200W";
      } else if (lowerName.includes("rtx 4060")) {
        specs.MemoryType = "GDDR6";
        specs.CUDACores = "3072";
        specs.BaseClock = "1830 MHz";
        specs.BoostClock = "2460 MHz";
        specs.Power = "170W";
      } else if (lowerName.includes("rx 7900")) {
        specs.MemoryType = "GDDR6";
        specs.CUDACores = "6144";
        specs.BaseClock = "1900 MHz";
        specs.BoostClock = "2500 MHz";
        specs.Power = "355W";
      } else if (lowerName.includes("rx 7800")) {
        specs.MemoryType = "GDDR6";
        specs.CUDACores = "3840";
        specs.BaseClock = "1295 MHz";
        specs.BoostClock = "2430 MHz";
        specs.Power = "263W";
      } else if (lowerName.includes("rx 7600")) {
        specs.MemoryType = "GDDR6";
        specs.CUDACores = "2048";
        specs.BaseClock = "1720 MHz";
        specs.BoostClock = "2655 MHz";
        specs.Power = "165W";
      }
      
      return specs;
    }
  },
  "STORAGE": {
    attributes: ["Capacity", "Interface", "Read Speed", "Write Speed", "TBW", "Form Factor"],
    extract: (name) => {
      const specs = {};
      const lowerName = name.toLowerCase();
      
      // Extract capacity
      const capacityMatch = name.match(/(\d+)TB/);
      if (capacityMatch) {
        specs.Capacity = capacityMatch[1] + "TB";
      } else {
        const gbMatch = name.match(/(\d+)GB/);
        if (gbMatch) specs.Capacity = gbMatch[1] + "GB";
      }
      
      if (lowerName.includes("gen5") || lowerName.includes("t705")) {
        specs.Interface = "PCIe Gen5 x4";
        specs.ReadSpeed = "14000 MB/s";
        specs.WriteSpeed = "12000 MB/s";
        specs.TBW = "1200 TB";
      } else if (lowerName.includes("990 pro")) {
        specs.Interface = "PCIe Gen4 x4";
        specs.ReadSpeed = "7450 MB/s";
        specs.WriteSpeed = "6900 MB/s";
        specs.TBW = "600 TB";
      } else if (lowerName.includes("nvme")) {
        specs.Interface = "PCIe Gen3/Gen4 x4";
        specs.ReadSpeed = "3500-7400 MB/s";
        specs.WriteSpeed = "3000-6800 MB/s";
        specs.TBW = "300-600 TB";
      } else if (lowerName.includes("sata") || lowerName.includes("870")) {
        specs.Interface = "SATA III";
        specs.ReadSpeed = "560 MB/s";
        specs.WriteSpeed = "530 MB/s";
        specs.TBW = "600 TB";
      } else if (lowerName.includes("hdd")) {
        specs.Interface = "SATA III";
        specs.ReadSpeed = "150-250 MB/s";
        specs.WriteSpeed = "150-250 MB/s";
        specs.TBW = "N/A";
      }
      
      specs.FormFactor = "M.2 2280 / 2.5 inch";
      
      return specs;
    }
  },
  "PSU": {
    attributes: ["Wattage", "Efficiency", "Modular", "Protections", "Form Factor"],
    extract: (name) => {
      const specs = {};
      const lowerName = name.toLowerCase();
      
      // Extract wattage
      const wattageMatch = name.match(/(\d{3,4})W/);
      if (wattageMatch) specs.Wattage = wattageMatch[1] + "W";
      
      if (lowerName.includes("platinum")) {
        specs.Efficiency = "80 Plus Platinum";
      } else if (lowerName.includes("gold")) {
        specs.Efficiency = "80 Plus Gold";
      } else if (lowerName.includes("bronze")) {
        specs.Efficiency = "80 Plus Bronze";
      } else {
        specs.Efficiency = "80 Plus Standard";
      }
      
      specs.Modular = "Full Modular / Semi Modular";
      specs.Protections = "OVP, OCP, SCP, OPP, OTP";
      specs.FormFactor = "ATX / SFX";
      
      return specs;
    }
  },
  "CASE": {
    attributes: ["Form Factor", "Material", "Max GPU Length", "Max CPU Cooler", "Fan Support"],
    extract: (name) => {
      const specs = {};
      const lowerName = name.toLowerCase();
      
      if (lowerName.includes("atx")) {
        specs.FormFactor = "ATX / mATX / ITX";
      } else if (lowerName.includes("matx")) {
        specs.FormFactor = "mATX / ITX";
      } else if (lowerName.includes("itx")) {
        specs.FormFactor = "ITX / Mini-ITX";
      }
      
      specs.Material = "Tempered Glass / Steel / Plastic";
      specs.MaxGPULength = "300-400mm";
      specs.MaxCPUCooler = "160-180mm";
      specs.FanSupport = "120mm / 140mm / 240mm AIO";
      
      return specs;
    }
  }
};

async function getOrCreateAttribute(name) {
  let rows = await query("SELECT id FROM attributes WHERE name = ?", [name]);
  if (rows.length > 0) {
    return rows[0].id;
  }
  
  const result = await query("INSERT INTO attributes (name) VALUES (?)", [name]);
  return result.insertId;
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

  let totalAdded = 0;

  for (const product of products) {
    console.log(`Đang xử lý SKU ${product.sku_id}: ${product.name} (${product.sku})`);

    const categorySpecs = detailedSpecsMap[product.category_name];
    
    if (!categorySpecs) {
      console.log("  - Không có cấu hình specs cho danh mục này, bỏ qua");
      continue;
    }

    const specs = categorySpecs.extract(product.name);
    
    if (Object.keys(specs).length === 0) {
      console.log("  - Không thể trích xuất specs từ tên sản phẩm, bỏ qua");
      continue;
    }

    const existingAttributes = await getSkuAttributes(product.sku_id);
    const existingAttributeIds = existingAttributes.map(a => a.attribute_id);

    for (const [attributeName, value] of Object.entries(specs)) {
      const attributeId = await getOrCreateAttribute(attributeName);
      
      if (existingAttributeIds.includes(attributeId)) {
        console.log(`  - ${attributeName}: ${value} (đã có)`);
        continue;
      }

      const attributeValueId = await getOrCreateAttributeValue(attributeId, value);
      
      await addSkuAttribute(product.sku_id, attributeValueId);
      console.log(`  + ${attributeName}: ${value}`);
      totalAdded++;
    }

    console.log("---");
  }

  console.log("\nKết quả:");
  console.log(`- Đã thêm specs: ${totalAdded} thuộc tính chi tiết`);
  console.log("- Tổng:", products.length, "SKU");

  process.exit(0);
}

main().catch(error => {
  console.error("Error:", error);
  process.exit(1);
});
