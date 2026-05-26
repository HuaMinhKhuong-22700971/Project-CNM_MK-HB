const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'services/api/.env') });

(async () => {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST, user: process.env.DB_USER,
        password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    const [users] = await conn.execute('SELECT id, email, role, is_active FROM users ORDER BY id');
    console.log('\n=== Users in DB ===');
    for (const u of users) {
        console.log(`  [${u.role}] ${u.email} | active=${u.is_active}`);
    }
    await conn.end();
})();
