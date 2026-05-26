const { query } = require("../src/config/database");

const laptops = [
  {
    name: "ASUS ROG Strix G16",
    brand: "ASUS",
    price: 45000000,
    image_url: "/assets/products/asus-g751-gaming.png",
    description: "Laptop gaming ASUS ROG Strix G16 với màn hình 16 inch QHD 165Hz, Intel Core i9-13980HX, RTX 4080, 32GB DDR5 RAM, 1TB NVMe SSD. Thiết kế hầm hố, tản nhiệt hiệu quả với hệ thống 3 fan 7 ống dẫn nhiệt. Phù hợp cho gaming chuyên nghiệp và đồ họa 3D.",
    specs: {
      CPU: "Intel Core i9-13980HX",
      GPU: "NVIDIA RTX 4080 12GB",
      RAM: "32GB DDR5 4800MHz",
      Storage: "1TB NVMe SSD",
      Screen: "16 inch QHD 165Hz",
      Weight: "2.3kg",
      Battery: "90Wh"
    }
  },
  {
    name: "MSI Titan 18 HX",
    brand: "MSI",
    price: 65000000,
    image_url: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500",
    description: "Laptop gaming cao cấp MSI Titan 18 HX với màn hình 18 inch 4K 240Hz, Intel Core i9-14900HX, RTX 4090, 64GB DDR5 RAM, 2TB NVMe SSD. Tản nhiệt mạnh mẽ với hệ thống vapor chamber, RGB keyboard custom. Đỉnh cao của laptop gaming.",
    specs: {
      CPU: "Intel Core i9-14900HX",
      GPU: "NVIDIA RTX 4090 16GB",
      RAM: "64GB DDR5 5600MHz",
      Storage: "2TB NVMe SSD",
      Screen: "18 inch 4K 240Hz",
      Weight: "3.5kg",
      Battery: "99.9Wh"
    }
  },
  {
    name: "Dell XPS 15",
    brand: "Dell",
    price: 52000000,
    image_url: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=500",
    description: "Ultrabook Dell XPS 15 với màn hình 15.6 inch OLED 3.5K, Intel Core i7-13700H, RTX 4070, 32GB DDR5 RAM, 1TB NVMe SSD. Thiết kế sang trọng, mỏng nhẹ, màn hình màu sắc xuất sắc. Phù hợp cho làm việc đồ họa và sáng tạo nội dung.",
    specs: {
      CPU: "Intel Core i7-13700H",
      GPU: "NVIDIA RTX 4070 8GB",
      RAM: "32GB DDR5 4800MHz",
      Storage: "1TB NVMe SSD",
      Screen: "15.6 inch OLED 3.5K",
      Weight: "1.8kg",
      Battery: "86Wh"
    }
  },
  {
    name: "MacBook Pro 16 M3 Max",
    brand: "Apple",
    price: 85000000,
    image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
    description: "MacBook Pro 16 inch với chip Apple M3 Max, 36GB Unified Memory, 1TB SSD, màn hình Liquid Retina XDR. Hiệu năng đỉnh cao với thời lượng pin lên đến 22 giờ. Phù hợp cho lập trình viên, nhà sáng tạo và chuyên gia đồ họa.",
    specs: {
      CPU: "Apple M3 Max (16-core CPU)",
      GPU: "Apple M3 Max (40-core GPU)",
      RAM: "36GB Unified Memory",
      Storage: "1TB SSD",
      Screen: "16.2 inch Liquid Retina XDR",
      Weight: "2.1kg",
      Battery: "22 hours"
    }
  },
  {
    name: "Lenovo Legion 5 Pro",
    brand: "Lenovo",
    price: 35000000,
    image_url: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500",
    description: "Laptop gaming Lenovo Legion 5 Pro với màn hình 16 inch WQHD 165Hz, AMD Ryzen 7 7840HS, RTX 4070, 16GB DDR5 RAM, 1TB NVMe SSD. Tản nhiệt Coldfront 5.0, keyboard RGB, thiết kế gaming hiện đại. Giá tốt trong tầm giá.",
    specs: {
      CPU: "AMD Ryzen 7 7840HS",
      GPU: "NVIDIA RTX 4070 8GB",
      RAM: "16GB DDR5 5200MHz",
      Storage: "1TB NVMe SSD",
      Screen: "16 inch WQHD 165Hz",
      Weight: "2.5kg",
      Battery: "80Wh"
    }
  },
  {
    name: "HP Spectre x360",
    brand: "HP",
    price: 38000000,
    image_url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500",
    description: "2-in-1 laptop HP Spectre x360 với màn hình 13.5 inch OLED 3K2K, Intel Core i7-1355U, Intel Iris Xe, 16GB LPDDR5 RAM, 1TB NVMe SSD. Thiết kế kim loại sang trọng, có thể gập 360 độ, bút cảm ứng đi kèm. Phù hợp cho doanh nhân và người dùng di động.",
    specs: {
      CPU: "Intel Core i7-1355U",
      GPU: "Intel Iris Xe",
      RAM: "16GB LPDDR5",
      Storage: "1TB NVMe SSD",
      Screen: "13.5 inch OLED 3K2K",
      Weight: "1.36kg",
      Battery: "18 hours"
    }
  },
  {
    name: "Acer Predator Helios 16",
    brand: "Acer",
    price: 32000000,
    image_url: "/assets/products/laptop-acer-predator-helios-16.svg",
    description: "Laptop gaming Acer Predator Helios 16 với màn hình 16 inch WQHD 165Hz, Intel Core i7-13700HX, RTX 4060, 16GB DDR5 RAM, 512GB NVMe SSD. Tản nhiệt AeroBlade 3D fan, keyboard RGB custom. Giá tốt cho gaming tầm trung.",
    specs: {
      CPU: "Intel Core i7-13700HX",
      GPU: "NVIDIA RTX 4060 8GB",
      RAM: "16GB DDR5 4800MHz",
      Storage: "512GB NVMe SSD",
      Screen: "16 inch WQHD 165Hz",
      Weight: "2.6kg",
      Battery: "90Wh"
    }
  },
  {
    name: "ASUS ZenBook 14 OLED",
    brand: "ASUS",
    price: 25000000,
    image_url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500",
    description: "Ultrabook ASUS ZenBook 14 OLED với màn hình 14 inch OLED 2.8K, Intel Core i7-1355U, Intel Iris Xe, 16GB LPDDR5 RAM, 1TB NVMe SSD. Thiết kế siêu mỏng nhẹ 1.39kg, màn hình OLED xuất sắc. Phù hợp cho làm việc và giải trí di động.",
    specs: {
      CPU: "Intel Core i7-1355U",
      GPU: "Intel Iris Xe",
      RAM: "16GB LPDDR5",
      Storage: "1TB NVMe SSD",
      Screen: "14 inch OLED 2.8K",
      Weight: "1.39kg",
      Battery: "14 hours"
    }
  }
];

const completePCs = [
  {
    name: "PC Gaming Tầm Trung 20 Triệu",
    brand: "Custom Build",
    price: 20000000,
    image_url: "/assets/products/complete-pc-gaming-mid.jpg",
    description: "Cấu hình PC gaming tầm trung với Intel Core i5-14400F, RTX 4060, 16GB DDR5 RAM, 1TB NVMe SSD, PSU 650W, Case ATX. Chơi mượt các game 1080p High settings, phù hợp cho game thủ và người dùng phổ thông.",
    specs: {
      CPU: "Intel Core i5-14400F",
      Mainboard: "ASUS Prime B760M-A",
      GPU: "NVIDIA RTX 4060 8GB",
      RAM: "16GB DDR5 5200MHz",
      Storage: "1TB NVMe SSD",
      PSU: "650W 80 Plus Bronze",
      Case: "ATX Case with RGB"
    }
  },
  {
    name: "PC Gaming High-End 40 Triệu",
    brand: "Custom Build",
    price: 40000000,
    image_url: "/assets/products/complete-pc-gaming-high.jpg",
    description: "Cấu hình PC gaming cao cấp với Intel Core i7-14700K, RTX 4070 Ti, 32GB DDR5 RAM, 2TB NVMe SSD, PSU 850W, Case ATX. Chơi mượt các game 1440p Ultra settings và 4K High, phù hợp cho gaming chuyên nghiệp và đồ họa.",
    specs: {
      CPU: "Intel Core i7-14700K",
      Mainboard: "MSI MAG Z790 Tomahawk",
      GPU: "NVIDIA RTX 4070 Ti 12GB",
      RAM: "32GB DDR5 6000MHz",
      Storage: "2TB NVMe SSD",
      PSU: "850W 80 Plus Gold",
      Case: "ATX Case with RGB"
    }
  },
  {
    name: "PC Đồ Họa 50 Triệu",
    brand: "Custom Build",
    price: 50000000,
    image_url: "/assets/products/complete-pc-design.jpg",
    description: "Cấu hình PC chuyên đồ họa với Intel Core i9-14900K, RTX 4080, 64GB DDR5 RAM, 2TB NVMe SSD, PSU 1000W, Case ATX. Xử lý mượt các tác vụ render 3D, video 4K, AI/ML. Phù hợp cho nhà thiết kế, kiến trúc sư và chuyên gia đồ họa.",
    specs: {
      CPU: "Intel Core i9-14900K",
      Mainboard: "ASUS ROG Z790-E",
      GPU: "NVIDIA RTX 4080 16GB",
      RAM: "64GB DDR5 6000MHz",
      Storage: "2TB NVMe SSD",
      PSU: "1000W 80 Plus Gold",
      Case: "ATX Premium Case"
    }
  },
  {
    name: "PC Văn Phòng 10 Triệu",
    brand: "Custom Build",
    price: 10000000,
    image_url: "/assets/products/complete-pc-office.jpg",
    description: "Cấu hình PC văn phòng với Intel Core i5-14400, Intel UHD Graphics, 16GB DDR4 RAM, 512GB NVMe SSD, PSU 450W, Case mATX. Xử lý tốt các tác vụ văn phòng, web, email. Phù hợp cho công sở và học sinh.",
    specs: {
      CPU: "Intel Core i5-14400",
      Mainboard: "ASUS Prime B760M-A",
      GPU: "Intel UHD Graphics 730",
      RAM: "16GB DDR4 3200MHz",
      Storage: "512GB NVMe SSD",
      PSU: "450W 80 Plus Bronze",
      Case: "mATX Case"
    }
  },
  {
    name: "PC Lập Trình 25 Triệu",
    brand: "Custom Build",
    price: 25000000,
    image_url: "/assets/products/complete-pc-programming.jpg",
    description: "Cấu hình PC cho lập trình viên với AMD Ryzen 7 7700X, RTX 4060 Ti, 32GB DDR5 RAM, 1TB NVMe SSD, PSU 750W, Case ATX. Chạy mượt Docker, IDE, VM, compile code nhanh. Phù hợp cho developer full-stack và backend.",
    specs: {
      CPU: "AMD Ryzen 7 7700X",
      Mainboard: "MSI B650M-A",
      GPU: "NVIDIA RTX 4060 Ti 8GB",
      RAM: "32GB DDR5 5600MHz",
      Storage: "1TB NVMe SSD",
      PSU: "750W 80 Plus Gold",
      Case: "ATX Case"
    }
  }
];

async function getOrCreateCategory(name, description) {
  let rows = await query("SELECT id FROM categories WHERE name = ?", [name]);
  if (rows.length > 0) {
    return rows[0].id;
  }
  
  const result = await query(
    "INSERT INTO categories (name) VALUES (?)",
    [name]
  );
  return result.insertId;
}

async function getOrCreateBrand(name) {
  let rows = await query("SELECT id FROM brands WHERE name = ?", [name]);
  if (rows.length > 0) {
    return rows[0].id;
  }
  
  const result = await query(
    "INSERT INTO brands (name, is_active) VALUES (?, ?)",
    [name, 1]
  );
  return result.insertId;
}

async function createProduct(name, description, price, categoryId, brandId, slug) {
  const result = await query(
    "INSERT INTO products (name, slug, description, price, category_id, brand_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [name, slug, description, price, categoryId, brandId, 1]
  );
  return result.insertId;
}

async function createSku(productId, sku, price, image_url) {
  const result = await query(
    "INSERT INTO product_skus (product_id, sku, price, image_url, is_active) VALUES (?, ?, ?, ?, ?)",
    [productId, sku, price, image_url, 1]
  );
  return result.insertId;
}

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

async function addSkuAttribute(skuId, attributeValueId) {
  await query(
    "INSERT INTO sku_attributes (sku_id, attribute_value_id) VALUES (?, ?)",
    [skuId, attributeValueId]
  );
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function main() {
  console.log("Đang thêm danh mục Laptop và Máy tính hoàn chỉnh...");
  
  const laptopCategoryId = await getOrCreateCategory("LAPTOP", "Laptop gaming, ultrabook và workstation");
  const completePcCategoryId = await getOrCreateCategory("COMPLETE PC", "Máy tính hoàn chỉnh được lắp ráp sẵn");
  
  console.log("Đã tạo/kiểm tra danh mục Laptop và Complete PC");
  
  // Add laptops
  console.log("\nĐang thêm Laptop...");
  let laptopCount = 0;
  for (const laptop of laptops) {
    console.log(`  - ${laptop.name}`);
    
    const brandId = await getOrCreateBrand(laptop.brand);
    const slug = slugify(laptop.name);
    const productId = await createProduct(laptop.name, laptop.description, laptop.price, laptopCategoryId, brandId, slug);
    const sku = slug.toUpperCase();
    const skuId = await createSku(productId, sku, laptop.price, null);
    
    // Add specs
    for (const [attrName, value] of Object.entries(laptop.specs)) {
      const attrId = await getOrCreateAttribute(attrName);
      const attrValueId = await getOrCreateAttributeValue(attrId, value);
      await addSkuAttribute(skuId, attrValueId);
    }
    
    laptopCount++;
  }
  console.log(`Đã thêm ${laptopCount} laptop`);
  
  // Add complete PCs
  console.log("\nĐang thêm Máy tính hoàn chỉnh...");
  let pcCount = 0;
  for (const pc of completePCs) {
    console.log(`  - ${pc.name}`);
    
    const brandId = await getOrCreateBrand(pc.brand);
    const slug = slugify(pc.name);
    const productId = await createProduct(pc.name, pc.description, pc.price, completePcCategoryId, brandId, slug);
    const sku = slug.toUpperCase();
    const skuId = await createSku(productId, sku, pc.price, null);
    
    // Add specs
    for (const [attrName, value] of Object.entries(pc.specs)) {
      const attrId = await getOrCreateAttribute(attrName);
      const attrValueId = await getOrCreateAttributeValue(attrId, value);
      await addSkuAttribute(skuId, attrValueId);
    }
    
    pcCount++;
  }
  console.log(`Đã thêm ${pcCount} máy tính hoàn chỉnh`);
  
  console.log("\nTổng kết:");
  console.log(`- Laptop: ${laptopCount}`);
  console.log(`- Máy tính hoàn chỉnh: ${pcCount}`);
  console.log(`- Tổng: ${laptopCount + pcCount} sản phẩm mới`);
  
  process.exit(0);
}

main().catch(error => {
  console.error("Error:", error);
  process.exit(1);
});
