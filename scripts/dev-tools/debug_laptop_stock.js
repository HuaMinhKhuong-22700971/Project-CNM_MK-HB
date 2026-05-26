const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'services/api/.env') });

(async () => {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST, user: process.env.DB_USER,
        password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    console.log("=== Checking Laptop Stock ===");
    const [laptops] = await conn.execute(`
        SELECT p.id, p.name, p.slug, p.is_active, p.status, ps.id as sku_id, ps.stock, ps.price, ps.status as sku_status, ps.image_url
        FROM products p
        LEFT JOIN product_skus ps ON ps.product_id = p.id
        WHERE p.name LIKE '%MacBook%' OR p.name LIKE '%Dell XPS%' OR p.name LIKE '%Alienware%' OR p.name LIKE '%Razer%' OR p.name LIKE '%ThinkPad%'
        ORDER BY p.id
    `);
    
    for (const l of laptops) {
        console.log(`Product [${l.id}]: ${l.name} | is_active=${l.is_active} | status=${l.status} | SKU stock=${l.stock} | SKU status=${l.sku_status}`);
    }

    // Fix: Set stock=50 and ensure SKU status is ACTIVE for all laptops
    console.log("\n=== Fixing Stock and Status ===");
    const [result] = await conn.execute(`
        UPDATE product_skus ps
        JOIN products p ON ps.product_id = p.id
        SET ps.stock = 50, ps.status = 'ACTIVE'
        WHERE p.name LIKE '%MacBook%' OR p.name LIKE '%Dell XPS%' OR p.name LIKE '%Alienware%' OR p.name LIKE '%Razer%' OR p.name LIKE '%ThinkPad%'
    `);
    console.log("Updated rows:", result.affectedRows);

    // Also ensure products themselves are active
    const [result2] = await conn.execute(`
        UPDATE products
        SET is_active = 1, status = 'ACTIVE'
        WHERE name LIKE '%MacBook%' OR name LIKE '%Dell XPS%' OR name LIKE '%Alienware%' OR name LIKE '%Razer%' OR name LIKE '%ThinkPad%'
    `);
    console.log("Updated product rows:", result2.affectedRows);

    await conn.end();
    console.log("\nDone!");
})();
