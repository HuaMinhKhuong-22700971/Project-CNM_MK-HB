const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const COMMON_PASSWORDS = [
  "password",
  "Admin@123",
  "Customer@123",
  "Sales@123",
  "Tech@123",
  "123456"
];

async function main() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "",
    database: "cnm_ecommerce"
  });

  const [roles] = await conn.execute("SELECT * FROM roles ORDER BY id ASC");
  console.log("=== DANH SÁCH ROLE TRONG HỆ THỐNG ===");
  roles.forEach(r => console.log(`- ID ${r.id}: ${r.name}`));

  const [users] = await conn.execute(`
    SELECT u.id, u.email, u.full_name, u.password, r.name as role_name, u.status
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    ORDER BY u.id ASC
  `);

  console.log("\n=== DANH SÁCH TÀI KHOẢN ĐĂNG NHẬP ===");
  for (const u of users) {
    let plainPass = "password";
    for (const testPass of COMMON_PASSWORDS) {
      if (u.password === testPass || (u.password && bcrypt.compareSync(testPass, u.password))) {
        plainPass = testPass;
        break;
      }
    }
    console.log(`\n👤 [${u.role_name || 'N/A'}]`);
    console.log(`   - Họ và tên: ${u.full_name || 'N/A'}`);
    console.log(`   - Email:     ${u.email}`);
    console.log(`   - Mật khẩu:  ${plainPass}`);
    console.log(`   - Trạng thái: ${u.status || 'ACTIVE'}`);
  }

  await conn.end();
}

main().catch(console.error);
