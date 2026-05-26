const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'services/api/.env') });

const laptopSpecData = [
  {
    name: "MacBook Air M3",
    slug: "macbook-air-m3",
    image: "/media/macbook_air_m3.png",
    description: `
      <div class="pro-description">
        <h3>Đỉnh cao của sự mỏng nhẹ và sức mạnh</h3>
        <p>MacBook Air M3 2024 mang đến một cuộc cách mạng về hiệu suất trong thiết kế siêu mỏng nhẹ quen thuộc. Với chip M3 thế hệ mới nhất của Apple, máy có tốc độ xử lý nhanh hơn 60% so với thế hệ M1.</p>
        <div style="margin: 20px 0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <img src="/media/macbook_air_m3.png" style="width:100%; display: block;" />
        </div>
        <h4>Màn hình Liquid Retina tuyệt mỹ</h4>
        <p>Thưởng thức mọi nội dung với độ chi tiết kinh ngạc trên màn hình Liquid Retina 13.6 inch. Hỗ trợ 1 tỷ màu, độ sáng 500 nits.</p>
      </div>
    `,
    specs: {
      "Thương hiệu": "Apple",
      "Vi xử lý": "Apple M3 Chip (8-core CPU, 10-core GPU)",
      "RAM": "8GB Unified Memory",
      "Lưu trữ": "256GB SSD",
      "Màn hình": "13.6-inch Liquid Retina Display",
      "Hệ điều hành": "macOS Sonoma"
    }
  },
  {
    name: "Dell XPS 15 9530",
    slug: "dell-xps-15-9530",
    image: "/media/dell_xps.png",
    description: `
      <div class="pro-description">
        <h3>Dell XPS 15 9530: Đẳng cấp chuyên gia</h3>
        <p>Thiết kế tinh xảo từ nhôm và sợi carbon, màn hình InfinityEdge tràn viền cho trải nghiệm thị giác không giới hạn.</p>
        <div style="margin: 20px 0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <img src="/media/dell_xps.png" style="width:100%; display: block;" />
        </div>
      </div>
    `,
    specs: {
      "Thương hiệu": "Dell",
      "Vi xử lý": "Intel Core i7-13700H",
      "RAM": "16GB DDR5 4800MHz",
      "Lưu trữ": "512GB NVMe SSD",
      "Đồ họa": "NVIDIA GeForce RTX 4050 6GB",
      "Màn hình": "15.6-inch OLED 3.5K Touch"
    }
  },
  {
    name: "Dell Alienware 15",
    slug: "dell-alienware-15",
    image: "/media/alienware.png",
    description: `
      <div class="pro-description">
        <h3>Alienware 15: Thống trị chiến trường ảo</h3>
        <div style="margin: 20px 0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <img src="/media/alienware.png" style="width:100%; display: block;" />
        </div>
        <p>Ngôn ngữ thiết kế Legend 3.0 với dải LED RGB tùy biến cực mạnh cùng hệ thống tản nhiệt Cryo-tech.</p>
      </div>
    `,
    specs: {
      "Thương hiệu": "Dell Alienware",
      "Vi xử lý": "Intel Core i9-13900HK",
      "RAM": "32GB DDR5 5200MHz",
      "Lưu trữ": "1TB SSD M.2 NVMe",
      "Đồ họa": "NVIDIA GeForce RTX 4080 12GB",
      "Màn hình": "15.6-inch QHD 240Hz"
    }
  },
  {
    name: "Razer Blade 15",
    slug: "razer-blade-15",
    image: "/media/razer_blade_15.png",
    description: `
      <div class="pro-description">
        <h3>Razer Blade 15: Sức mạnh trong sự tinh tế</h3>
        <p>Khung máy nhôm CNC nguyên khối đen tuyền với logo 'Rắn ba đầu' phát sáng biểu tượng.</p>
        <div style="margin: 20px 0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <img src="/media/razer_blade_15.png" style="width:100%; display: block;" />
        </div>
        <p>Laptop gaming mỏng nhất thế giới, sự kết hợp hoàn hảo giữa thẩm mỹ và sức mạnh.</p>
      </div>
    `,
    specs: {
      "Thương hiệu": "Razer",
      "Vi xử lý": "Intel Core i7-13800H",
      "Đồ họa": "NVIDIA GeForce RTX 4070 8GB",
      "RAM": "16GB DDR5 5200MHz",
      "Lưu trữ": "1TB PCIe Gen4 SSD",
      "Màn hình": "15.6-inch QHD 240Hz, 100% DCI-P3"
    }
  },
  {
    name: "Lenovo ThinkPad X1 Carbon",
    slug: "lenovo-thinkpad-x1-carbon-gen-11",
    image: "/media/thinkpad_x1.png",
    description: `
      <div class="pro-description">
        <h3>ThinkPad X1 Carbon Gen 11: Sự hoàn hảo của giới Business</h3>
        <p>Dòng máy huyền thoại với bàn phím không đối thủ và độ nhẹ tê tái dưới 1.1kg.</p>
        <div style="margin: 20px 0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <img src="/media/thinkpad_x1.png" style="width:100%; display: block;" />
        </div>
      </div>
    `,
    specs: {
      "Thương hiệu": "Lenovo",
      "Vi xử lý": "Intel Core i7-1355U",
      "RAM": "16GB LPDDR5x",
      "Lưu trữ": "512GB PCIe Gen4 SSD",
      "Màn hình": "14-inch 2.2K IPS",
      "Trọng lượng": "1.12 kg"
    }
  }
];

async function updateSpecs(conn, skuId, specs) {
    await conn.execute('DELETE FROM sku_attributes WHERE sku_id = ?', [skuId]);
    for (const [attrName, attrValue] of Object.entries(specs)) {
        const [attrRows] = await conn.execute('SELECT id FROM attributes WHERE name = ?', [attrName]);
        let attrId;
        if (attrRows.length > 0) attrId = attrRows[0].id;
        else {
            const [res] = await conn.execute('INSERT INTO attributes (name) VALUES (?)', [attrName]);
            attrId = res.insertId;
        }

        const [valRows] = await conn.execute('SELECT id FROM attribute_values WHERE attribute_id = ? AND value = ?', [attrId, attrValue]);
        let valId;
        if (valRows.length > 0) valId = valRows[0].id;
        else {
            const [res] = await conn.execute('INSERT INTO attribute_values (attribute_id, value) VALUES (?, ?)', [attrId, attrValue]);
            valId = res.insertId;
        }
        await conn.execute('INSERT INTO sku_attributes (sku_id, attribute_value_id) VALUES (?, ?)', [skuId, valId]);
    }
}

(async () => {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST, user: process.env.DB_USER,
        password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        for (const data of laptopSpecData) {
            console.log(`Cleaning Seeding: ${data.name}`);
            
            const [products] = await conn.execute('SELECT id FROM products WHERE name LIKE ?', [`%${data.name}%`]);
            if (products.length === 0) continue;
            const productId = products[0].id;

            // Update main image and description
            await conn.execute('UPDATE products SET description = ?, slug = ? WHERE id = ?', [data.description, data.slug, productId]);

            const [skus] = await conn.execute('SELECT id FROM product_skus WHERE product_id = ?', [productId]);
            for (const s of skus) {
                // Update SKU image to match the high-quality generated shot
                await conn.execute('UPDATE product_skus SET image_url = ? WHERE id = ?', [data.image, s.id]);
                await updateSpecs(conn, s.id, data.specs);
            }
        }
    } finally {
        await conn.end();
    }
})();
