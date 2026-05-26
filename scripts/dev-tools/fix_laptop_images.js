const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, 'services/api/.env') });

// Direct mapping from slug -> local image file
// Reuse existing images for those we could not generate
const imageMap = {
  'asus-rog-g751-gaming':     '/assets/products/asus-g751-gaming.png',
  'lenovo-thinkpad-x1-carbon':'/assets/products/lenovo-x1.png',
  'dell-alienware-15':        '/assets/products/dell.png',       // reuse dell
  'hp-spectre-x360':          '/assets/products/macbook.png',    // reuse macbook (silver)
  'razer-blade-15':           '/assets/products/asus-g751-gaming.png', // reuse rog
  // earlier laptops
  'macbook-air-m3-13':        '/assets/products/macbook.png',
  'dell-xps-15-9530':         '/assets/products/dell.png',
};

async function fixImages() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    for (const [slug, imgUrl] of Object.entries(imageMap)) {
      // Verify file exists on disk
      const filePath = path.join(__dirname, 'apps/web/public', imgUrl);
      if (!fs.existsSync(filePath)) {
        console.warn(`File NOT FOUND for ${slug}: ${filePath}`);
        continue;
      }

      const [products] = await connection.execute('SELECT id FROM products WHERE slug = ?', [slug]);
      if (products.length === 0) {
        console.log(`Product not found for slug: ${slug}`);
        continue;
      }

      const productId = products[0].id;
      await connection.execute('UPDATE product_skus SET image_url = ? WHERE product_id = ?', [imgUrl, productId]);
      await connection.execute('UPDATE product_variants SET image_url = ? WHERE product_id = ?', [imgUrl, productId]);
      console.log(`Fixed ${slug} -> ${imgUrl}`);
    }

    console.log('\nAll image URLs fixed!');
  } finally {
    await connection.end();
  }
}

fixImages();
