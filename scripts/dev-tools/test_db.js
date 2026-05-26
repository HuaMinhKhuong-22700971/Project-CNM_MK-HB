const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'services/api/.env') });
(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });
  const [cols] = await conn.execute('SHOW COLUMNS FROM users');
  console.log('Columns:', cols.map(c => c.Field).join(', '));
  const [users] = await conn.execute('SELECT * FROM users LIMIT 10');
  users.forEach(u => {
    const r = u.role_id || u.user_role || u.role_name || '';
    console.log(u.id, u.email, r, u.full_name || u.name || '');
  });
  await conn.end();
})();
