const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'services/api/.env') });

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  const [categories] = await conn.execute('SELECT id FROM categories WHERE name LIKE "%Laptop%"');
  if (categories.length === 0) {
    console.log("No Laptop category found.");
    process.exit(1);
  }
  const laptopCatId = categories[0].id;

  const [laptops] = await conn.execute(`
    SELECT p.id, p.name, s.id as sku_id 
    FROM products p 
    LEFT JOIN product_skus s ON p.id = s.product_id
    WHERE p.category_id = ?
  `, [laptopCatId]);

  console.log(JSON.stringify(laptops, null, 2));

  await conn.end();
})();
