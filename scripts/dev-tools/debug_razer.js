const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'services/api/.env') });

(async () => {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST, user: process.env.DB_USER,
        password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    const [products] = await conn.execute('SELECT id, name FROM products WHERE name LIKE "%Razer Blade%"');
    if (products.length === 0) {
        console.log("Razer Blade not found in database.");
    } else {
        const p = products[0];
        console.log(`Found: [${p.id}] ${p.name}`);

        const [skus] = await conn.execute('SELECT id FROM product_skus WHERE product_id = ?', [p.id]);
        console.log("SKUs:", skus);

        if (skus.length > 0) {
            const [attrs] = await conn.execute(`
                SELECT a.name, av.value 
                FROM sku_attributes sa 
                JOIN attribute_values av ON sa.attribute_value_id = av.id 
                JOIN attributes a ON av.attribute_id = a.id 
                WHERE sa.sku_id = ?
            `, [skus[0].id]);
            console.log("Attributes for first SKU:", attrs);
        }
    }

    await conn.end();
})();
