const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'services/api/.env') });

const laptopSpecData = [
  {
    name: "MacBook Air M3",
    slug: "macbook-air-m3",
    description: `
      <div class="pro-description">
        <h3>Đỉnh cao của sự mỏng nhẹ và sức mạnh</h3>
        <p>MacBook Air M3 2024 mang đến một cuộc cách mạng về hiệu suất trong thiết kế siêu mỏng nhẹ quen thuộc. Với chip M3 thế hệ mới nhất của Apple, máy có tốc độ xử lý nhanh hơn 60% so với thế hệ M1, giúp bạn giải quyết mọi tác vụ từ chỉnh sửa video 4K đến chơi game đồ họa cao một cách mượt mà.</p>
        
        <h4>Màn hình Liquid Retina tuyệt mỹ</h4>
        <p>Thưởng thức mọi nội dung với độ chi tiết kinh ngạc trên màn hình Liquid Retina 13.6 inch. Hỗ trợ 1 tỷ màu, độ sáng 500 nits và dải màu P3 rộng cho hình ảnh sống động, chân thực như cuộc sống.</p>
        
        <h4>Thời lượng pin đáng kinh ngạc</h4>
        <p>Làm việc xuyên suốt cả ngày dài với thời lượng pin lên đến 18 giờ. Bạn có thể tự tin ra ngoài mà không cần mang theo bộ sạc, MacBook Air luôn sẵn sàng đồng hành cùng bạn ở bất cứ đâu.</p>
        
        <ul>
          <li>Chip Apple M3 mạnh mẽ với tiến trình 3nm</li>
          <li>Thiết kế không quạt, hoạt động hoàn toàn yên tĩnh</li>
          <li>Loa Spatial Audio hỗ trợ Dolby Atmos</li>
          <li>Cổng sạc MagSafe 3 tiện dụng</li>
        </ul>
      </div>
    `,
    specs: {
      "Thương hiệu": "Apple",
      "Dòng sản phẩm": "MacBook Air",
      "Model": "M3 2024",
      "Bộ vi xử lý (CPU)": "Apple M3 (8-core CPU)",
      "Số nhân CPU": "8",
      "Số nhân GPU": "10-core GPU",
      "Bộ nhớ RAM": "8GB Unified Memory",
      "Ổ cứng (SSD)": "256GB PCIe-based SSD",
      "Màn hình": "13.6-inch Liquid Retina Display",
      "Độ phân giải": "2560 x 1664 pixels",
      "Tần số quét": "60Hz",
      "Độ sáng": "500 nits",
      "Cổng kết nối": "2x Thunderbolt / USB 4, 1x MagSafe 3, 1x Jack 3.5mm",
      "Wifi": "Wi-Fi 6E (802.11ax)",
      "Bluetooth": "Bluetooth 5.3",
      "Bàn phím": "Magic Keyboard có đèn nền",
      "Touchpad": "Force Touch Trackpad",
      "Camera": "1080p FaceTime HD camera",
      "Âm thanh": "4 loa, hỗ trợ Spatial Audio, Dolby Atmos",
      "Pin": "Li-Po 52.6Wh",
      "Trọng lượng": "1.24 kg",
      "Chất liệu": "Nhôm nguyên khối 100% tái chế",
      "Hệ điều hành": "macOS Sonoma"
    }
  },
  {
    name: "Dell XPS 15 9530",
    slug: "dell-xps-15-9530",
    description: `
      <div class="pro-description">
        <h3>Dell XPS 15 9530: Sự kết hợp hoàn hảo giữa thẩm mỹ và hiệu năng</h3>
        <p>Dell XPS 15 9530 được mệnh danh là 'vua của các dòng laptop Windows' nhờ thiết kế viền màn hình siêu mỏng InfinityEdge và cấu hình cực khủng bên trong một thân hình mỏng nhẹ bất ngờ. Đây là người bạn đồng hành không thể thiếu của các kiến trúc sư, biên tập viên video và những người làm sáng tạo chuyên nghiệp.</p>
        
        <h4>Màn hình OLED 3.5K tuyệt đỉnh</h4>
        <p>Trải nghiệm hình ảnh chuẩn Studio với tấm nền OLED độ phân giải cao, độ tương phản tuyệt đối và độ phủ màu 100% DCI-P3. Mọi chi tiết đều trở nên sống động, giúp bạn thực hiện các tác vụ đồ họa với độ chính xác cao nhất.</p>
        
        <h4>Sức mạnh vượt trội từ Intel Gen 13 và RTX 40-series</h4>
        <p>Trang bị chip xử lý Intel Core i7-13700H 14 nhân và card đồ họa rời NVIDIA GeForce RTX 4050, XPS 15 9530 đủ sức gánh vác các dự án nặng nhất, từ render 3D đến xử lý dữ liệu quy mô lớn.</p>
        
        <ul>
          <li>Vật liệu cao cấp: Nhôm CNC và sợi carbon</li>
          <li>Hệ thống âm thanh Quad-speaker chuyên nghiệp</li>
          <li>Bảo mật vân tay và nhận diện khuôn mặt Windows Hello</li>
        </ul>
      </div>
    `,
    specs: {
      "Thương hiệu": "Dell",
      "Dòng sản phẩm": "XPS",
      "Model": "9530 (2023)",
      "Bộ vi xử lý (CPU)": "Intel Core i7-13700H (14 cores, 20 threads)",
      "Xung nhịp": "Up to 5.0 GHz Turbo",
      "Bộ nhớ đệm": "24 MB Intel Smart Cache",
      "Bộ nhớ RAM": "16GB DDR5 4800MHz (Dual-channel)",
      "Ổ cứng (SSD)": "512GB M.2 NVMe PCIe Gen4",
      "Card đồ họa (GPU)": "NVIDIA GeForce RTX 4050 6GB GDDR6",
      "Màn hình": "15.6-inch OLED 3.5K (3456 x 2160) Touch",
      "Độ sáng": "400 nits",
      "Tỷ lệ màn hình": "16:10",
      "Cổng kết nối": "2x Thunderbolt 4, 1x USB-C 3.2 Gen 2, Jack 3.5mm, SD card reader",
      "Wifi": "Intel Wi-Fi 6E AX211",
      "Bluetooth": "Bluetooth 5.2",
      "Pin": "6-Cell, 86 Whr",
      "Trọng lượng": "1.92 kg",
      "Kích thước": "344.7 x 230.1 x 18 mm",
      "Hệ điều hành": "Windows 11 Home",
      "Bảo hành": "12 tháng chính hãng Dell"
    }
  },
  {
    name: "Dell Alienware 15",
    slug: "dell-alienware-15",
    description: `
      <div class="pro-description">
        <h3>Alienware 15: Thống trị mọi chiến trường ảo</h3>
        <p>Dell Alienware 15 là biểu tượng tối thượng của dòng laptop gaming đỉnh cao. Với ngôn ngữ thiết kế 'Legend 3.0' lấy cảm hứng từ tàu không gian vũ trụ, Alienware 15 không chỉ là một chiếc laptop, nó là một cỗ máy chiến đấu thực thụ dành cho những game thủ chuyên nghiệp nhất.</p>
        
        <h4>Hệ thống tản nhiệt Alienware Cryo-tech™</h4>
        <p>Công nghệ tản nhiệt tiên tiến nhất giúp máy luôn duy trì hiệu năng đỉnh cao trong nhiều giờ liền mà không bị tụt FPS. Hệ thống quạt kép và các ống dẫn nhiệt đồng cỡ lớn đảm bảo nhiệt độ ổn định ngay cả khi chơi các tựa game AAA ở mức cấu hình 'Ultra'.</p>
        
        <h4>Trải nghiệm Gaming mượt mà với 240Hz</h4>
        <p>Không bỏ lỡ bất kỳ khung hình nào với màn hình QHD 240Hz siêu nhạy. Công nghệ G-Sync giúp loại bỏ hoàn toàn hiện tượng xé hình, mang lại lợi thế chiến thuật trong các tựa game bắn súng FPS tốc độ cao.</p>
        
        <ul>
          <li>Đèn nền AlienFX RGB 16.8 triệu màu tùy tỉnh từng phím</li>
          <li>Vật liệu hợp kim Magie và nhôm siêu bền</li>
          <li>Trung tâm điều khiển Alienware Command Center độc quyền</li>
        </ul>
      </div>
    `,
    specs: {
      "Thương hiệu": "Dell Alienware",
      "Dòng sản phẩm": "M-Series",
      "Model": "Alienware m15 R7 / R8 Custom",
      "Bộ vi xử lý (CPU)": "Intel Core i9-13900HK (24 nhân, 32 luồng)",
      "Card đồ họa (GPU)": "NVIDIA GeForce RTX 4080 12GB GDDR6X",
      "Bộ nhớ RAM": "32GB DDR5 5200MHz",
      "Ổ cứng (SSD)": "1TB M.2 NVMe PCIe Gen4 x4",
      "Màn hình": "15.6-inch QHD (2560x1440) 240Hz",
      "Tốc độ phản hồi": "2ms",
      "Độ phủ màu": "100% DCI-P3",
      "Công nghệ màn hình": "G-Sync, ComfortView Plus, Dolby Vision",
      "Wifi": "MediaTek Wi-Fi 6E MT7922",
      "Bluetooth": "Bluetooth 5.3",
      "Pin": "86 Whr",
      "Bàn phím": "Alienware M Series per-key AlienFX RGB keyboard",
      "Trọng lượng": "2.69 kg",
      "Cổng kết nối": "1x RJ-45, 1x Global headset jack, 3x USB 3.2 Gen 1, 1x Thunderbolt 4, 1x HDMI 2.1",
      "Hệ điều hành": "Windows 11 Home"
    }
  },
  {
    name: "Razer Blade 15",
    slug: "razer-blade-15",
    description: `
      <div class="pro-description">
        <h3>Razer Blade 15: Sức mạnh hội tụ trong sự tinh tế</h3>
        <p>Razer Blade 15 vẫn luôn giữ vững ngôi vương là chiếc laptop gaming có thiết kế quyến rũ bậc nhất thế giới. Khung máy nhôm CNC nguyên khối đen tuyền với logo 'Rắn ba đầu' phát sáng không chỉ là biểu tượng của đẳng cấp mà còn che giấu bên trong một sức mạnh phần cứng vô tiền khoáng hậu.</p>
        
        <h4>Màn hình QHD 240Hz đỉnh cao</h4>
        <p>Sự cân bằng hoàn hảo giữa độ sắc nét của QHD và sự mượt mà của 240Hz. Màn hình được cân chỉnh màu sắc chuyên nghiệp ngay từ khi xuất xưởng, phục vụ tốt cả nhu cầu chơi game lẫn thiết kế đồ họa, render video.</p>
        
        <h4>Kết nối không giới hạn</h4>
        <p>Dù có thân hình mỏng nhẹ, Razer Blade 15 vẫn được trang bị đầy đủ các cổng kết nối hiện đại nhất bao gồm Thunderbolt 4, khe cắm thẻ nhớ SD và cổng HDMI 2.1, giúp bạn dễ dàng mở rộng không gian làm việc.</p>
        
        <ul>
          <li>Đèn nền Razer Chroma RGB từng phím cực kỳ rực rỡ</li>
          <li>Bàn di chuột bằng kính lớn và siêu nhạy</li>
          <li>Hệ thống loa âm thanh nổi với THX Spatial Audio</li>
        </ul>
      </div>
    `,
    specs: {
      "Thương hiệu": "Razer",
      "Dòng sản phẩm": "Blade 15",
      "Model": "Advanced Model (2023)",
      "Bộ vi xử lý (CPU)": "Intel Core i7-13800H (14-core, up to 5.2 GHz)",
      "Card đồ họa (GPU)": "NVIDIA GeForce RTX 4070 8GB GDDR6",
      "Bộ nhớ RAM": "16GB DDR5 5200MHz (Có thể nâng cấp lên 64GB)",
      "Ổ cứng (SSD)": "1TB M.2 NVMe PCIe 4.0 x4",
      "Màn hình": "15.6-inch QHD (2560 x 1440) 240Hz",
      "Công nghệ màn hình": "G-Sync, 100% DCI-P3, Factory Calibrated",
      "Wifi": "Intel Wi-Fi 6E AX211",
      "Bluetooth": "Bluetooth 5.3",
      "Pin": "80 Whr",
      "Bàn phím": "Per-key RGB powered by Razer Chroma™",
      "Cổng kết nối": "1x Thunderbolt 4, 3x USB 3.2 Gen 2 Type-A, 1x HDMI 2.1, Jack 3.5mm",
      "Trọng lượng": "2.01 kg",
      "Độ dày": "16.99 mm",
      "Hệ điều hành": "Windows 11 Home",
      "Vật liệu máy": "T6 CNC Aluminum, Anodized Black"
    }
  },
  {
    name: "Lenovo ThinkPad X1 Carbon",
    slug: "lenovo-thinkpad-x1-carbon-gen-11",
    description: `
      <div class="pro-description">
        <h3>ThinkPad X1 Carbon Gen 11: Sự hoàn hảo của giới Business</h3>
        <p>Trải qua hàng thập kỷ, ThinkPad X1 Carbon vẫn là sự lựa chọn số 1 của giới doanh nhân toàn cầu. Thế hệ thứ 11 tiếp tục kế thừa những giá trị cốt lõi: trọng lượng siêu nhẹ dưới 1.1kg, độ bền tuyệt đối và bàn phím mang lại cảm giác gõ tốt nhất trên máy tính xách tay.</p>
        
        <h4>Bền bỉ chuẩn quân đội MIL-STD 810H</h4>
        <p>Máy được chế tạo từ sợi carbon và hợp kim magie cao cấp, vượt qua 200 bài kiểm tra về độ bền khắc nghiệt nhất. Bạn có thể mang máy đi khắp thế giới, làm việc trong mọi điều kiện thời tiết mà không lo ảnh hưởng đến dữ liệu bên trong.</p>
        
        <h4>Hệ thống tản nhiệt thông minh</h4>
        <p>Nhờ hệ thống quạt kép mới và khe thoát nhiệt ẩn, X1 Carbon Gen 11 luôn mát mẻ và yên tĩnh ngay cả dưới tải trọng công việc cao, giúp bạn tập trung tuyệt đối vào ý tưởng của mình.</p>
        
        <ul>
          <li>Màn hình 2.2K chống chói EyeSafe giảm ánh sáng xanh</li>
          <li>Webcam 1080p với nút gạt bảo mật Shutter</li>
          <li>Loa Dolby Atmos âm thanh sống động</li>
        </ul>
      </div>
    `,
    specs: {
      "Thương hiệu": "Lenovo",
      "Dòng sản phẩm": "ThinkPad X1",
      "Model": "Carbon Gen 11",
      "Bộ vi xử lý (CPU)": "Intel Core i7-1355U (10 nhân, 12 luồng)",
      "Bộ nhớ RAM": "16GB LPDDR5x 6400MHz (Soldered)",
      "Ổ cứng (SSD)": "512GB SSD M.2 2280 PCIe Gen4 Performance NVMe OpAL2",
      "Card đồ họa (GPU)": "Integrated Intel Iris Xe Graphics",
      "Màn hình": "14-inch 2.2K (2240 x 1400) IPS, Anti-glare, 100% sRGB",
      "Wifi": "Intel Wi-Fi 6E AX211 11ax, 2x2",
      "Bluetooth": "Bluetooth 5.1",
      "Bảo mật": "Vân tay và nhận diện khuôn mặt (IR Camera)",
      "Pin": "57 Whr hỗ trợ Rapid Charge",
      "Trọng lượng": "1.12 kg",
      "Cổng kết nối": "2x Thunderbolt 4, 2x USB 3.2 Gen 1, 1x HDMI 2.1, Jack 3.5mm",
      "Hệ điều hành": "Windows 11 Pro",
      "Màu sắc": "Deep Black"
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
            console.log(`Processing Pro-Seed: ${data.name}...`);
            
            // 1. Update Product Description & Slug
            const [products] = await conn.execute('SELECT id FROM products WHERE name LIKE ?', [`%${data.name}%`]);
            if (products.length === 0) {
                console.log(`  - Skipping: ${data.name} (Not found)`);
                continue;
            }
            const productId = products[0].id;
            await conn.execute('UPDATE products SET description = ?, slug = ? WHERE id = ?', [data.description, data.slug, productId]);

            // 2. Clear and Update SKUs
            const [skus] = await conn.execute('SELECT id FROM product_skus WHERE product_id = ?', [productId]);
            if (skus.length === 0) {
                // Create a default SKU if none exists
                const [newSkuRes] = await conn.execute(
                    'INSERT INTO product_skus (product_id, sku, price, stock, status, is_active) VALUES (?, ?, ?, ?, "ACTIVE", true)',
                    [productId, `SKU-${data.slug.toUpperCase()}`, 30000000, 10]
                );
                const skuId = newSkuRes.insertId;
                await updateSpecs(conn, skuId, data.specs);
            } else {
                for (const s of skus) {
                    await updateSpecs(conn, s.id, data.specs);
                }
            }
            
            // 3. Clear and Update Variants (for consistency)
            const [variants] = await conn.execute('SELECT id FROM product_variants WHERE product_id = ?', [productId]);
            if (variants.length > 0) {
                await conn.execute('UPDATE product_variants SET slug = ? WHERE product_id = ?', [data.slug, productId]).catch(() => {});
            }

            console.log(`  - COMPLETED: ${data.name}`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await conn.end();
        console.log("--- SUPER SEED FINISHED ---");
    }
})();

async function updateSpecs(conn, skuId, specs) {
    await conn.execute('DELETE FROM sku_attributes WHERE sku_id = ?', [skuId]);
    for (const [attrName, attrValue] of Object.entries(specs)) {
        const attrId = await getOrCreateAttributeId(conn, attrName);
        const valId = await getOrCreateAttributeValueId(conn, attrId, String(attrValue));
        await conn.execute('INSERT INTO sku_attributes (sku_id, attribute_value_id) VALUES (?, ?)', [skuId, valId]);
    }
}
