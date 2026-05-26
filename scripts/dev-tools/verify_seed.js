const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'services/api/.env') });

(async () => {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST, user: process.env.DB_USER,
        password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    const [products] = await conn.execute('SELECT id, name, description FROM products WHERE name LIKE "%MacBook Air M3%"');
    console.log("Product:", products[0]);

    const [specs] = await conn.execute(`
        SELECT a.name, av.value 
        FROM sku_attributes sa 
        JOIN product_skus ps ON sa.sku_id = ps.id 
        JOIN attribute_values av ON sa.attribute_value_id = av.id 
        JOIN attributes a ON av.attribute_id = a.id 
        WHERE ps.product_id = ?
    `, [products[0].id]);
    
    console.log("Specs:", specs);

    await conn.end();
})();
