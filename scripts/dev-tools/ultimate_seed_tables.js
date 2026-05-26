const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'services/api/.env') });

function generateSpecTable(specs) {
    let html = '<div class="spec-table-container"><h4>Thông số kỹ thuật chi tiết</h4><table class="spec-table" style="width:100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">';
    for (const [key, value] of Object.entries(specs)) {
        html += `<tr style="border-bottom: 1px solid #eee;"><td style="padding: 10px; font-weight: 700; color: #666; width: 40%;">${key}</td><td style="padding: 10px; color: #333;">${value}</td></tr>`;
    }
    html += '</table></div>';
    return html;
}

const laptopSpecData = [
  {
    name: "MacBook Air M3",
    slug: "macbook-air-m3",
    specs: {
      "Thương hiệu": "Apple",
      "Model": "MacBook Air M3 2024",
      "Bộ vi xử lý (CPU)": "Apple M3 Chip (8-core CPU, 10-core GPU)",
      "Bộ nhớ RAM": "8GB / 16GB Unified Memory",
      "Ổ cứng": "256GB / 512GB / 1TB / 2TB SSD",
      "Màn hình": "13.6-inch Liquid Retina Display (2560 x 1664)",
      "Độ sáng": "500 nits, dải màu P3 rộng",
      "Cổng kết nối": "2x Thunderbolt / USB 4 ports, MagSafe 3, Jack 3.5mm",
      "Wifi/Bluetooth": "Wi-Fi 6E, Bluetooth 5.3",
      "Trọng lượng": "1.24 kg",
      "Hệ điều hành": "macOS Sonoma"
    },
    description: `
      <div class="pro-description">
        <h3>Đỉnh cao của sự mỏng nhẹ và sức mạnh</h3>
        <p>MacBook Air M3 2024 mang đến một cuộc cách mạng về hiệu suất trong thiết kế siêu mỏng nhẹ quen thuộc. Với chip M3 thế hệ mới nhất của Apple, máy có tốc độ xử lý nhanh hơn 60% so với thế hệ M1.</p>
        <div style="margin: 20px 0;">
          <img src="/media/macbook_air_m3_midnight_clean_1779197037602.png" style="width:100%; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);" />
        </div>
        <h4>Màn hình Liquid Retina tuyệt mỹ</h4>
        <p>Thưởng thức mọi nội dung với độ chi tiết kinh ngạc trên màn hình Liquid Retina 13.6 inch. Hỗ trợ 1 tỷ màu, độ sáng 500 nits.</p>
      </div>
    `
  },
  {
    name: "Dell XPS 15 9530",
    slug: "dell-xps-15-9530",
    specs: {
      "Thương hiệu": "Dell",
      "Model": "XPS 15 9530 (2023)",
      "CPU": "Intel Core i7-13700H (14-Core, 5.0GHz)",
      "RAM": "16GB / 32GB DDR5 4800MHz",
      "Ổ cứng": "512GB / 1TB M.2 PCIe NVMe SSD",
      "GPU": "NVIDIA GeForce RTX 4050 6GB GDDR6",
      "Màn hình": "15.6-inch OLED 3.5K (3456x2160) Touch",
      "Cổng kết nối": "2x Thunderbolt 4, 1x USB-C 3.2 Gen 2, SD Card Reader",
      "Trọng lượng": "1.92 kg",
      "Hệ điều hành": "Windows 11 Home"
    },
    description: `
      <div class="pro-description">
        <h3>Dell XPS 15 9530: Đẳng cấp chuyên gia</h3>
        <p>Thiết kế tinh xảo từ nhôm và sợi carbon, màn hình InfinityEdge tràn viền cho trải nghiệm thị giác không giới hạn.</p>
        <div style="margin: 20px 0;">
          <img src="/media/dell_xps_15_silver_clean_1779197405506.png" style="width:100%; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);" />
        </div>
      </div>
    `
  },
  {
    name: "Dell Alienware 15",
    slug: "dell-alienware-15",
    specs: {
      "Thương hiệu": "Dell Alienware",
      "Model": "Alienware m15 R7 / R8",
      "CPU": "Intel Core i9-13900HK",
      "GPU": "NVIDIA GeForce RTX 4080 12GB",
      "RAM": "32GB DDR5 5200MHz",
      "Ổ cứng": "1TB M.2 NVMe SSD",
      "Màn hình": "15.6-inch QHD (2560x1440) 240Hz",
      "Wifi/Bluetooth": "Wi-Fi 6E, Bluetooth 5.3",
      "Trọng lượng": "2.69 kg"
    },
    description: `
      <div class="pro-description">
        <h3>Alienware 15: Thống trị chiến trường ảo</h3>
        <div style="margin: 20px 0;">
          <img src="/media/dell_alienware_15_clean_1779329242336.png" style="width:100%; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);" />
        </div>
        <p>Ngôn ngữ thiết kế Legend 3.0 với dải LED RGB tùy biến cực mạnh.</p>
      </div>
    `
  },
  {
    name: "Razer Blade 15",
    slug: "razer-blade-15",
    specs: {
      "Thương hiệu": "Razer",
      "Model": "Razer Blade 15 Advanced (2023)",
      "CPU": "Intel Core i7-13800H (14-Core)",
      "GPU": "NVIDIA GeForce RTX 4070 8GB GDDR6",
      "RAM": "16GB DDR5 5200MHz",
      "Ổ cứng": "1TB PCIe Gen4 SSD",
      "Màn hình": "15.6-inch QHD 240Hz, 100% DCI-P3",
      "Cổng kết nối": "Thunderbolt 4, HDMI 2.1, USB-A 3.2 Gen 2",
      "Hệ điều hành": "Windows 11 Home"
    },
    description: `
      <div class="pro-description">
        <h3>Razer Blade 15: Sức mạnh trong sự tinh tế</h3>
        <p>Khung máy nhôm CNC nguyên khối, logo Razer phát sáng biểu tượng.</p>
        <div style="margin: 20px 0;">
          <img src="/media/asus_rog_g751_laptop_1779201692757.png" style="width:100%; border-radius: 16px;" />
          <p style="font-size: 12px; color: #999; text-align: center;">Hình minh họa chuẩn Gaming Cao Cấp</p>
        </div>
      </div>
    `
  },
  {
    name: "Lenovo ThinkPad X1 Carbon",
    slug: "lenovo-thinkpad-x1-carbon-gen-11",
    specs: {
      "Thương hiệu": "Lenovo",
      "Model": "ThinkPad X1 Carbon Gen 11",
      "CPU": "Intel Core i7-1355U",
      "RAM": "16GB LPDDR5x",
      "Ổ cứng": "512GB PCIe Gen4",
      "Màn hình": "14-inch 2.2K IPS",
      "Trọng lượng": "1.12 kg",
      "Bảo mật": "Vân tay, IR Camera"
    },
    description: `
      <div class="pro-description">
        <h3>ThinkPad X1 Carbon: Đỉnh cao doanh nhân</h3>
        <p>Dòng máy huyền thoại với bàn phím không đối thủ và độ bền chuẩn quân đội.</p>
        <div style="margin: 20px 0;">
          <img src="/media/lenovo_thinkpad_x1_carbon_1779202195601.png" style="width:100%; border-radius: 16px;" />
        </div>
      </div>
    `
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
            console.log(`Processing: ${data.name}`);
            const fullDescription = data.description + generateSpecTable(data.specs);
            
            const [products] = await conn.execute('SELECT id FROM products WHERE name LIKE ?', [`%${data.name}%`]);
            if (products.length === 0) continue;
            const productId = products[0].id;

            await conn.execute('UPDATE products SET description = ?, slug = ? WHERE id = ?', [fullDescription, data.slug, productId]);

            const [skus] = await conn.execute('SELECT id FROM product_skus WHERE product_id = ?', [productId]);
            for (const s of skus) {
                await updateSpecs(conn, s.id, data.specs);
            }
        }
    } finally {
        await conn.end();
    }
})();
