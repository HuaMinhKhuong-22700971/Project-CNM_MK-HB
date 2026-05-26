const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'services/api/.env') });

(async () => {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST, user: process.env.DB_USER,
        password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    const [products] = await conn.execute('SELECT id, name, status FROM products WHERE id = 110');
    console.log("Product [110]:", products);

    const [skus] = await conn.execute('SELECT id, sku, stock, price, status FROM product_skus WHERE product_id = 110');
    console.log("SKUs for [110]:", skus);

    await conn.end();
})();
