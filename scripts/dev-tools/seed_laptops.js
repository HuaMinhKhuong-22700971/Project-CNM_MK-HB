const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'services/api/.env') });

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cnm_ecommerce',
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log('Connecting to database...');
    
    // 0. Fix schema for long URLs
    await connection.execute("ALTER TABLE product_skus MODIFY COLUMN image_url TEXT");
    await connection.execute("ALTER TABLE product_variants MODIFY COLUMN image_url TEXT");
    console.log('Schema updated to support long URLs');

    // 1. Categories
    const [catResult] = await connection.execute("INSERT IGNORE INTO categories (name) VALUES ('LAPTOP'), ('MÁY TÍNH BỘ (PRE-BUILT)'), ('MÀN HÌNH')");
    console.log('Categories added/verified');

    // 2. Brands
    await connection.execute("INSERT IGNORE INTO brands (name, slug, status) VALUES ('Apple', 'apple', 'ACTIVE'), ('Dell', 'dell', 'ACTIVE'), ('HP', 'hp', 'ACTIVE'), ('Lenovo', 'lenovo', 'ACTIVE'), ('Acer', 'acer', 'ACTIVE')");
    console.log('Brands added/verified');

    // 3. Attributes
    await connection.execute("INSERT IGNORE INTO attributes (name) VALUES ('screen_size'), ('cpu_integrated'), ('battery_cell'), ('color'), ('operating_system')");
    console.log('Attributes added/verified');

    // 4. Sample Products
    const [laptopCat] = await connection.execute("SELECT id FROM categories WHERE name = 'LAPTOP'");
    const laptopCatId = laptopCat[0].id;

    const [appleBrand] = await connection.execute("SELECT id FROM brands WHERE name = 'Apple'");
    const appleId = appleBrand[0].id;

    const [dellBrand] = await connection.execute("SELECT id FROM brands WHERE name = 'Dell'");
    const dellId = dellBrand[0].id;

    // MacBook Air M3
    const [macResult] = await connection.execute(
      "INSERT IGNORE INTO products (name, description, price, category_id, brand_id, slug, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      ['MacBook Air M3 13 inch', 'Siêu mỏng nhẹ, hiệu năng cực đỉnh với chip M3.', 27900000, laptopCatId, appleId, 'macbook-air-m3-13', 'ACTIVE']
    );
    if (macResult.insertId) {
      await connection.execute(
        "INSERT INTO product_skus (product_id, price, stock, sku, image_url, status) VALUES (?, ?, ?, ?, ?, ?)",
        [macResult.insertId, 27900000, 20, 'MACBOOK-AIR-M3-13-8G-256G', 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/macbook-air-midnight-select-202403?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1707425930960', 'ACTIVE']
      );
    }

    // Dell XPS 15
    const [dellResult] = await connection.execute(
      "INSERT IGNORE INTO products (name, description, price, category_id, brand_id, slug, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      ['Dell XPS 15 9530', 'Đẳng cấp doanh nhân, màn hình OLED 3.5K tuyệt đẹp.', 45000000, laptopCatId, dellId, 'dell-xps-15-9530', 'ACTIVE']
    );
    if (dellResult.insertId) {
      await connection.execute(
        "INSERT INTO product_skus (product_id, price, stock, sku, image_url, status) VALUES (?, ?, ?, ?, ?, ?)",
        [dellResult.insertId, 45000000, 10, 'DELL-XPS-15-9530-I7-32G', 'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-15-9530/media-gallery/black/laptop-xps-15-9530-t-black-gallery-1.psd?qlt=90,0&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=png-alpha&wid=668&hei=442', 'ACTIVE']
      );
    }

    console.log('Seeding complete!');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await connection.end();
  }
}

seed();
