const { query } = require("../src/config/database");

const categoryTemplates = {
  "CPU": {
    prefix: "Bộ vi xử lý",
    specs: ["socket", "cores", "threads", "clock", "cache"],
    description: "Bộ vi xử lý hiệu năng cao, tối ưu cho các tác vụ đa nhiệm và gaming. Sử dụng kiến trúc hiện đại với nhiều nhân luồng, hỗ trợ các công nghệ mới nhất như PCIe 4.0/5.0, DDR4/DDR5. Phù hợp cho build PC gaming, làm việc đồ họa, và xử lý dữ liệu nặng."
  },
  "Mainboard": {
    prefix: "Bo mạch chủ",
    specs: ["socket", "chipset", "ram_type", "form_factor", "storage"],
    description: "Bo mạch chủ chất lượng cao với chipset hiện đại, hỗ trợ socket CPU mới nhất và RAM DDR4/DDR5 tốc độ cao. Tích hợp nhiều tính năng hiện đại như WiFi 6/6E, Bluetooth, USB-C, M.2 NVMe SSD. Thiết kế tối ưu cho tản nhiệt và overclocking."
  },
  "RAM": {
    prefix: "Bộ nhớ",
    specs: ["capacity", "speed", "type", "cas_latency"],
    description: "Bộ nhớ RAM hiệu năng cao với tốc độ nhanh, hỗ trợ đa kênh để tối ưu hiệu năng. Tương thích với các nền tảng Intel và AMD mới nhất. Phù hợp cho gaming đa nhiệm, làm việc đồ họa, và chạy nhiều ứng dụng cùng lúc."
  },
  "GPU": {
    prefix: "Card đồ họa",
    specs: ["vram", "cuda_cores", "clock", "memory_type", "power"],
    description: "Card đồ họa hiệu năng cao với kiến trúc GPU hiện đại, VRAM lớn và tốc độ xung nhịp cao. Hỗ trợ các công nghệ mới như Ray Tracing, DLSS, FSR. Phù hợp cho gaming 4K, đồ họa 3D, render video và AI/ML."
  },
  "SSD": {
    prefix: "Ổ cứng SSD",
    specs: ["capacity", "interface", "read_speed", "write_speed"],
    description: "Ổ cứng SSD tốc độ cao với giao tiếp NVMe PCIe 3.0/4.0/5.0, thời gian truy xuất dữ liệu cực nhanh. Độ bền cao, tiết kiệm điện và hoạt động yên tĩnh. Phù hợp cho boot hệ thống, game và ứng dụng cần tốc độ cao."
  },
  "PSU": {
    prefix: "Nguồn máy tính",
    specs: ["wattage", "efficiency", "modular", "protection"],
    description: "Nguồn máy tính công suất thực, đạt chuẩn 80 Plus Bronze/Gold/Platinum. Cơ chế bảo vệ đa lớp (OVP, OCP, SCP, OPP). Thiết kế modular giúp quản lý cáp gọn gàng. Ổn định, bền bỉ và phù hợp cho build PC gaming và workstation."
  },
  "Case": {
    prefix: "Vỏ máy tính",
    specs: ["form_factor", "material", "cooling", "rgb"],
    description: "Vỏ máy tính thiết kế hiện đại với vật liệu cao cấp, hỗ trợ tản nhiệt tối ưu. Tương thích với các mainboard ATX, mATX, ITX. Có nhiều không gian cho cài đặt bộ tản nhiệt, fan RGB và hệ thống tản nhiệt nước. Thiết kế airflow tốt giúp giữ máy tính mát mẻ."
  },
  "Cooling": {
    prefix: "Tản nhiệt",
    specs: ["type", "socket", "rpm", "noise_level"],
    description: "Hệ thống tản nhiệt hiệu quả với thiết kế tối ưu cho việc tản nhiệt CPU. Hoạt động yên tĩnh, hiệu năng cao và dễ dàng lắp đặt. Phù hợp cho cả build gaming và workstation cần tản nhiệt mạnh."
  }
};

async function getProducts() {
  const rows = await query(`
    SELECT 
      p.id,
      p.name,
      p.description,
      c.name as category_name,
      b.name as brand_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.is_active = 1
    ORDER BY p.id
  `);
  return rows;
}

function generateDescription(product) {
  const category = product.category_name || "General";
  const brand = product.brand_name || "";
  const name = product.name;
  
  const template = categoryTemplates[category];
  
  let description = "";
  
  if (template) {
    description = `${template.prefix || "Sản phẩm"} ${name} từ ${brand}. `;
    description += template.description || "Sản phẩm chất lượng cao với nhiều tính năng ưu việt. ";
  } else {
    description = `Sản phẩm ${name} từ ${brand}. Đây là ${category} chất lượng cao với nhiều tính năng ưu việt, phù hợp cho nhu cầu sử dụng đa dạng. `;
  }
  
  // Add specific details based on product name
  if (name.includes("Gaming") || name.includes("gaming")) {
    description += "Được thiết kế đặc biệt cho gaming với hiệu năng ổn định và mượt mà.";
  } else if (name.includes("Pro") || name.includes("Professional")) {
    description += "Phiên bản chuyên nghiệp với các tính năng nâng cao cho người dùng chuyên nghiệp.";
  } else if (name.includes("Ultra") || name.includes("Extreme")) {
    description += "Phiên bản cao cấp với hiệu năng tối đa cho các tác vụ nặng nhất.";
  }
  
  return description;
}

async function updateProductDescription(productId, description) {
  await query(
    "UPDATE products SET description = ? WHERE id = ?",
    [description, productId]
  );
}

async function main() {
  console.log("Đang lấy danh sách sản phẩm...");
  const products = await getProducts();
  console.log(`Tìm thấy ${products.length} sản phẩm`);

  let updatedCount = 0;

  for (const product of products) {
    console.log(`Đang xử lý sản phẩm ${product.id}: ${product.name}`);
    console.log(`Mô tả hiện tại: ${product.description || '(không có)'}`);

    const newDescription = generateDescription(product);
    
    await updateProductDescription(product.id, newDescription);
    console.log(`✓ Đã cập nhật sản phẩm ${product.id}`);
    console.log(`Mô tả mới: ${newDescription.substring(0, 150)}...`);
    updatedCount++;

    console.log("---");
  }

  console.log("\nKết quả:");
  console.log(`- Đã cập nhật: ${updatedCount} sản phẩm`);
  console.log("- Tổng:", products.length, "sản phẩm");

  process.exit(0);
}

main().catch(error => {
  console.error("Error:", error);
  process.exit(1);
});
