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

        const [users] = await conn.execute('SELECT u.id, u.email, u.full_name, r.name as role FROM users u JOIN roles r ON u.role_id = r.id');
        console.log('\n=== Danh sách Users trong DB ===');
        for (const u of users) {
            console.log(`- ID: ${u.id} | Email: ${u.email} | Name: ${u.full_name} | Role: ${u.role}`);
        }
        await conn.end();
    } catch (e) {
        console.error(e);
    }
})();
