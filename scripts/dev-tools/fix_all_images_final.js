const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, 'services/api/.env') });

// Final definitive mapping - every laptop gets a unique REAL photo
const imageMap = {
  'dell-xps-15-9530':         '/assets/products/dell-xps-photo.jpg',
  'razer-blade-15':           '/assets/products/razer-blade-photo.jpg',
  'hp-spectre-x360':          '/assets/products/hp-spectre-photo.jpg',
  'dell-alienware-15':        '/assets/products/alienware-photo.jpg',
  'asus-rog-g751-gaming':     '/assets/products/asus-g751-gaming.png',   // AI generated
  'lenovo-thinkpad-x1-carbon':'/assets/products/lenovo-x1.png',          // AI generated
  'macbook-air-m3-13':        '/assets/products/macbook.png',            // AI generated
};

async function fixAll() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    for (const [slug, imgUrl] of Object.entries(imageMap)) {
      const filePath = path.join(__dirname, 'apps/web/public', imgUrl);
      const exists = fs.existsSync(filePath);
      const size = exists ? fs.statSync(filePath).size : 0;

      if (!exists || size < 1000) {
        console.warn('[MISSING/CORRUPT]', slug, filePath, 'size:', size);
        continue;
      }

      const [products] = await conn.execute('SELECT id FROM products WHERE slug = ?', [slug]);
      if (products.length === 0) {
        console.log('[SLUG NOT FOUND]', slug);
        continue;
      }

      const pid = products[0].id;
      await conn.execute('UPDATE product_skus SET image_url = ? WHERE product_id = ?', [imgUrl, pid]);
      await conn.execute('UPDATE product_variants SET image_url = ? WHERE product_id = ?', [imgUrl, pid]);
      console.log('[OK]', slug, '->', imgUrl, `(${(size/1024).toFixed(1)}KB)`);
    }

    // Final verification
    console.log('\n--- Final Verification ---');
    const [cats] = await conn.execute('SELECT id FROM categories WHERE name = "LAPTOP" LIMIT 1');
    const [allLaptops] = await conn.execute(`
      SELECT p.id, p.name, s.image_url 
      FROM products p 
      LEFT JOIN product_skus s ON p.id = s.product_id 
      WHERE p.category_id = ?
      ORDER BY p.id
    `, [cats[0].id]);
    
    let allGood = true;
    allLaptops.forEach(l => {
      const fp = l.image_url ? path.join(__dirname, 'apps/web/public', l.image_url) : null;
      const ok = fp ? fs.existsSync(fp) : false;
      const sz = ok ? fs.statSync(fp).size : 0;
      const status = ok && sz > 1000 ? '[OK]' : '[BAD]';
      if (status === '[BAD]') allGood = false;
      console.log(status, l.id, l.name.padEnd(30), l.image_url, ok ? `(${(sz/1024).toFixed(1)}KB)` : '');
    });

    console.log(allGood ? '\n ALL IMAGES PERFECT!' : '\n SOME IMAGES STILL BROKEN');
  } finally {
    await conn.end();
  }
}

fixAll();
