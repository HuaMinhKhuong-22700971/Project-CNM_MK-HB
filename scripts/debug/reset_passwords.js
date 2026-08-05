const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'services/api/.env') });

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST, user: process.env.DB_USER,
            password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        // Hash mật khẩu '123456'
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        // Update tất cả các tài khoản @example.com
        const [result] = await conn.execute(
            `UPDATE users SET password = ?, status = 'ACTIVE' WHERE email LIKE '%@example.com%'`,
            [hashedPassword]
        );
        
        console.log(`✅ Đã reset thành công mật khẩu '123456' cho ${result.affectedRows} tài khoản.`);
        await conn.end();
    } catch (e) {
        console.error("Lỗi:", e);
    }
})();
