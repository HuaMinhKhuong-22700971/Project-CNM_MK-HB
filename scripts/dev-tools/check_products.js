const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'services/api/.env') });

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  const [products] = await conn.execute(`
    SELECT p.id, p.name, p.description, c.name as category, 
           (SELECT COUNT(*) FROM product_skus s WHERE s.product_id = p.id) as sku_count,
           (SELECT COUNT(*) FROM sku_attributes sa JOIN product_skus sk ON sa.sku_id = sk.id WHERE sk.product_id = p.id) as attr_count
    FROM products p 
    JOIN categories c ON p.category_id = c.id 
    ORDER BY c.name, p.name
  `);

  products.forEach(p => {
    const desc = p.description ? p.description.substring(0, 40) + '...' : 'NO DESC';
    console.log(`[${p.id}] ${p.category} | ${p.name} | attrs:${p.attr_count} | desc:${desc}`);
  });

  await conn.end();
})();
