const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'services/api/.env') });

(async () => {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST, user: process.env.DB_USER,
        password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    // Update stock for all laptops I've been working with
    const laptopNames = ['MacBook', 'Dell XPS', 'Alienware', 'Razer Blade', 'ThinkPad'];
    for (const name of laptopNames) {
        const [products] = await conn.execute('SELECT id FROM products WHERE name LIKE ?', [`%${name}%`]);
        for (const p of products) {
            await conn.execute('UPDATE product_skus SET stock = 50 WHERE product_id = ?', [p.id]);
        }
    }
    
    console.log("Stock updated to 50 for all laptops.");
    await conn.end();
})();
