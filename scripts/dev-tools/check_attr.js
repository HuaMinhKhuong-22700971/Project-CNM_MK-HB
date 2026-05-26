const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'services/api/.env') });

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  const [attributes] = await conn.execute('SELECT * FROM attributes');
  console.log('--- ATTRIBUTES ---');
  attributes.forEach(a => console.log(`[${a.id}] ${a.name}`));

  const [values] = await conn.execute(`
    SELECT av.id, a.name as attr_name, av.value 
    FROM attribute_values av 
    JOIN attributes a ON av.attribute_id = a.id
    ORDER BY a.name
  `);
  console.log('\n--- ATTRIBUTE VALUES ---');
  values.forEach(v => console.log(`[${v.id}] ${v.attr_name}: ${v.value}`));

  await conn.end();
})();
