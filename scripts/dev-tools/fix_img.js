const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'services/api/.env') });

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, port: process.env.DB_PORT
    });

    const [skus] = await conn.execute(`SELECT * FROM product_skus WHERE product_id = 102`);
    console.log("XPS SKUs:", skus.length);
    
    if (skus.length === 0) {
      console.log("Creating SKU for XPS...");
      await conn.execute(`INSERT INTO product_skus (product_id, price, stock, sku, image_url, status) VALUES (102, 45000000, 10, 'DELL-XPS-15', '/media/dell_xps.png', 'ACTIVE')`);
    }

    const [skusAl] = await conn.execute(`SELECT * FROM product_skus WHERE product_id = 108`);
    console.log("Alienware SKUs:", skusAl.length);
    if (skusAl.length === 0) {
      console.log("Creating SKU for Alienware...");
      await conn.execute(`INSERT INTO product_skus (product_id, price, stock, sku, image_url, status) VALUES (108, 55000000, 10, 'DELL-AW-15', '/media/alienware.png', 'ACTIVE')`);
    }

    // Double check that image_url is indeed set in product_skus
    const [skusFinal] = await conn.execute(`SELECT id, product_id, image_url FROM product_skus WHERE product_id IN (102, 108)`);
    console.log("Final SKUs:", skusFinal);

    await conn.end();
  } catch(e) {
    console.error(e);
  }
})();
