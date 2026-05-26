const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'services/api/.env') });

const laptopSpecData = [
  {
    name: "MacBook Air M3",
    description: "Siêu phẩm laptop mỏng nhẹ nhất thế giới từ Apple với chip M3 mạnh mẽ. MacBook Air M3 sở hữu thiết kế vỏ nhôm nguyên khối sang trọng, thời lượng pin lên đến 18 giờ và khả năng xử lý đồ họa vượt trội, phù hợp cho cả nhu cầu làm việc sáng tạo và văn phòng cao cấp.",
    specs: {
      "Bộ vi xử lý (CPU)": "Apple M3 Chip (8-core CPU)",
      "Bộ nhớ RAM": "8GB Unified Memory",
      "Ổ cứng (Storage)": "256GB SSD PCIe",
      "Card đồ họa (GPU)": "10-core GPU",
      "Màn hình": "13.6-inch Liquid Retina (2560 x 1664), 500 nits",
      "Hệ điều hành": "macOS"
    }
  },
  {
    name: "Lenovo ThinkPad X1 Carbon",
    description: "ThinkPad X1 Carbon Gen 11 là dòng laptop doanh nhân huyền thoại, kết hợp hoàn hảo giữa tính di động cực cao và độ bền đạt chuẩn quân đội. Với trọng lượng chỉ từ 1.1kg và bàn phím tốt nhất thế giới, đây là lựa chọn số 1 cho giới lãnh đạo và chuyên gia dịch chuyển.",
    specs: {
      "Bộ vi xử lý (CPU)": "Intel Core i7-1355U (U-Series)",
      "Bộ nhớ RAM": "16GB LPDDR5 6000MHz",
      "Ổ cứng (Storage)": "512GB SSD M.2 NVMe Gen4",
      "Card đồ họa (GPU)": "Intel Iris Xe Graphics",
      "Màn hình": "14-inch 2.2K IPS (2240 x 1400) 100% sRGB",
      "Hệ điều hành": "Windows 11 Pro"
    }
  },
  {
    name: "Asus ROG G751",
    description: "Asus ROG G751 là 'quái thú' chơi game với hệ thống tản nhiệt kép thông minh và thiết kế lấy cảm hứng từ máy bay chiến đấu tàng hình F-22. Màn hình lớn 17.3 inch và hiệu năng đồ họa mạnh mẽ mang lại trải nghiệm gaming AAA đỉnh cao.",
    specs: {
      "Bộ vi xử lý (CPU)": "Intel Core i7-4710HQ",
      "Bộ nhớ RAM": "16GB DDR3L",
      "Ổ cứng (Storage)": "1TB HDD 7200rpm + 128GB SSD",
      "Card đồ họa (GPU)": "NVIDIA GeForce GTX 980M 4GB",
      "Màn hình": "17.3-inch Full HD (1920x1080) IPS",
      "Hệ điều hành": "Windows 10"
    }
  },
  {
    name: "Dell XPS 15 9530",
    description: "Đỉnh cao thiết kế laptop Windows, Dell XPS 15 9530 sở hữu màn hình InfinityEdge tràn viền 4 cạnh tuyệt mỹ. Với cấu hình mạnh mẽ bên trong một thân hình mỏng gọn bằng nhôm và sợi carbon, đây là cỗ máy hoàn hảo cho nhà sáng tạo nội dung chuyên nghiệp.",
    specs: {
      "Bộ vi xử lý (CPU)": "Intel Core i7-13700H (14 cores, 20 threads)",
      "Bộ nhớ RAM": "16GB DDR5 4800MHz",
      "Ổ cứng (Storage)": "512GB SSD M.2 NVMe Gen4",
      "Card đồ họa (GPU)": "NVIDIA GeForce RTX 4050 6GB GDDR6",
      "Màn hình": "15.6-inch OLED 3.5K (3456 x 2160) Touch Display",
      "Hệ điều hành": "Windows 11 Home"
    }
  },
  {
    name: "Dell Alienware 15",
    description: "Biểu tượng của làng Gaming Laptop toàn cầu. Dell Alienware 15 mang ngôn ngữ thiết kế 'Legend 2.0' đậm chất tương lai với dải LED RGB tùy biến. Hiệu năng vượt giới hạn giúp bạn thống trị mọi chiến trường ảo với mức thiết lập đồ họa cao nhất.",
    specs: {
      "Bộ vi xử lý (CPU)": "Intel Core i9-13900HK",
      "Bộ nhớ RAM": "32GB DDR5 5200MHz",
      "Ổ cứng (Storage)": "1TB SSD M.2 NVMe Gen4",
      "Card đồ họa (GPU)": "NVIDIA GeForce RTX 4080 12GB GDDR6",
      "Màn hình": "15.6-inch QHD (2560x1440) 240Hz 2ms 100% DCI-P3",
      "Hệ điều hành": "Windows 11 Home"
    }
  },
  {
    name: "Razer Blade 15",
    description: "Razer Blade 15 là sự kết hợp hoàn hảo giữa sức mạnh gaming khủng khiếp và thiết kế mỏng nhẹ tinh tế. Khung máy nhôm CNC cao cấp mang lại vẻ ngoài lịch lãm nhưng ẩn chứa bên trong là 'linh hồn' của một chiến binh gaming thực thụ.",
    specs: {
      "Bộ vi xử lý (CPU)": "Intel Core i7-13800H",
      "Bộ nhớ RAM": "16GB DDR5 5200MHz",
      "Ổ cứng (Storage)": "1TB SSD M.2 NVMe",
      "Card đồ họa (GPU)": "NVIDIA GeForce RTX 4070 8GB GDDR6",
      "Màn hình": "15.6-inch QHD 240Hz, 100% DCI-P3, G-Sync",
      "Hệ điều hành": "Windows 11 Home"
    }
  }
];

async function getOrCreateAttributeId(conn, name) {
  const [rows] = await conn.execute('SELECT id FROM attributes WHERE name = ?', [name]);
  if (rows.length > 0) return rows[0].id;
  const [result] = await conn.execute('INSERT INTO attributes (name) VALUES (?)', [name]);
  return result.insertId;
}

async function getOrCreateAttributeValueId(conn, attrId, value) {
  const [rows] = await conn.execute('SELECT id FROM attribute_values WHERE attribute_id = ? AND value = ?', [attrId, value]);
  if (rows.length > 0) return rows[0].id;
  const [result] = await conn.execute('INSERT INTO attribute_values (attribute_id, value) VALUES (?, ?)', [attrId, value]);
  return result.insertId;
}

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    for (const data of laptopSpecData) {
      console.log(`Processing: ${data.name}`);
      
      // 1. Update Product Description
      const [products] = await conn.execute('SELECT id FROM products WHERE name LIKE ?', [`%${data.name}%`]);
      if (products.length === 0) {
        console.log(`  - Product not found: ${data.name}`);
        continue;
      }
      const productId = products[0].id;
      await conn.execute('UPDATE products SET description = ? WHERE id = ?', [data.description, productId]);

      // 2. Get the SKU
      const [skus] = await conn.execute('SELECT id FROM product_skus WHERE product_id = ?', [productId]);
      if (skus.length === 0) {
        console.log(`  - No SKU found for ${data.name}`);
        continue;
      }
      const skuId = skus[0].id;

      // 3. Update Specs (Attributes)
      // Clear old specs for this SKU to avoid duplicates if needed, 
      // but here we just append or ensure they exist.
      // Better to clear if we want a fresh start for specs.
      await conn.execute('DELETE FROM sku_attributes WHERE sku_id = ?', [skuId]);

      for (const [attrName, attrValue] of Object.entries(data.specs)) {
        const attrId = await getOrCreateAttributeId(conn, attrName);
        const valId = await getOrCreateAttributeValueId(conn, attrId, String(attrValue));
        await conn.execute('INSERT INTO sku_attributes (sku_id, attribute_value_id) VALUES (?, ?)', [skuId, valId]);
      }
      
      console.log(`  - Successfully updated ${data.name}`);
    }

    // Also update some missing components if any have very short descriptions
    const [others] = await conn.execute('SELECT id, name FROM products WHERE description IS NULL OR description = "" OR description LIKE "%missing%"');
    for (const p of others) {
        await conn.execute('UPDATE products SET description = ? WHERE id = ?', [`Sản phẩm ${p.name} hiện đang là linh kiện/thiết bị cao cấp được phân phối chính hãng tại PC Mall. Sản phẩm đảm bảo hiệu năng ổn định và chế độ bảo hành uy tín.`, p.id]);
    }
    
    console.log("Seeding complete.");
  } catch (err) {
    console.error("Error during seeding:", err);
  } finally {
    await conn.end();
  }
})();
