const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'services/api/.env') });

(async () => {
  try {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    const [products] = await conn.execute(`SELECT id, name, price FROM products WHERE name LIKE '%Dell%'`);

    for (const p of products) {
        let imgVal = null;
        if (p.name.includes("Alienware")) {
            imgVal = '/media/dell_alienware_new.png';
        } else if (p.name.includes("XPS")) {
            imgVal = '/media/dell_xps.png';
        }

        if (imgVal) {
            console.log(`Processing ${p.name}`);
            
            // SKU
            const [skus] = await conn.execute(`SELECT id FROM product_skus WHERE product_id = ?`, [p.id]);
            if (skus.length > 0) {
                await conn.execute(`UPDATE product_skus SET image_url = ? WHERE product_id = ?`, [imgVal, p.id]);
                console.log(`Updated Sku for ${p.name}`);
            } else {
                console.log(`Creating Sku for ${p.name}`);
                await conn.execute(
                    `INSERT INTO product_skus (product_id, sku, price, stock, image_url, status, is_active) VALUES (?, ?, ?, ?, ?, 'ACTIVE', true)`,
                    [p.id, `SKU-${p.id}`, p.price || 1000000, 10, imgVal]
                );
            }

            // Variant
            const [variants] = await conn.execute(`SELECT id FROM product_variants WHERE product_id = ?`, [p.id]);
            if (variants.length > 0) {
                await conn.execute(`UPDATE product_variants SET image_url = ? WHERE product_id = ?`, [imgVal, p.id]);
                console.log(`Updated Variant for ${p.name}`);
            } else {
                console.log(`Creating Variant for ${p.name}`);
                await conn.execute(
                    `INSERT INTO product_variants (product_id, sku, price, stock_quantity, image_url, status, is_active) VALUES (?, ?, ?, ?, ?, 'ACTIVE', true)`,
                    [p.id, `VAR-${p.id}`, p.price || 1000000, 10, imgVal]
                );
            }
        }
    }
    
    await conn.end();
  } catch(e) {
    console.error(e);
  }
})();
