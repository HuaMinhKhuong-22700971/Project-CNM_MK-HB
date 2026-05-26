const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'services/api/.env') });

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST, user: process.env.DB_USER,
            password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        const [products] = await conn.execute('SELECT id, name, category_id, is_active FROM products WHERE name LIKE "%CPU%" OR name LIKE "%Intel%" OR name LIKE "%Core%"');
        console.log('\n=== Products in DB ===');
        console.log(`Found ${products.length} products matching CPU/Intel/Core`);
        for (const p of products) {
            console.log(`- ID: ${p.id} | Name: ${p.name} | Category: ${p.category_id} | Active: ${p.is_active}`);
        }
        
        const [cats] = await conn.execute('SELECT id, name FROM categories');
        console.log('\n=== Categories in DB ===');
        for (const c of cats) {
            console.log(`- ID: ${c.id} | Name: ${c.name}`);
        }
        
        await conn.end();
    } catch (e) {
        console.error(e);
    }
})();
