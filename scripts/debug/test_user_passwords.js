const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const PASSWORDS_TO_TEST = [
  "Admin@123",
  "Customer@123",
  "Sales@123",
  "Tech@123",
  "Staff@123",
  "123456",
  "12345678",
  "admin123",
  "sales123",
  "tech123",
  "customer123",
  "password",
  "Password123!",
  "Admin123!",
  "12345678a"
];

async function main() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "",
    database: "cnm_ecommerce"
  });

  const [users] = await conn.execute(`
    SELECT u.id, u.email, u.full_name, u.password, r.name as role_name
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    ORDER BY u.id ASC
  `);

  console.log("=== Checking User Passwords ===\n");

  for (const u of users) {
    let matchedPass = null;
    for (const testPass of PASSWORDS_TO_TEST) {
      if (u.password && (u.password === testPass || bcrypt.compareSync(testPass, u.password))) {
        matchedPass = testPass;
        break;
      }
    }
    console.log(`ID: ${u.id}`);
    console.log(`  Email:    ${u.email}`);
    console.log(`  Name:     ${u.full_name}`);
    console.log(`  Role:     ${u.role_name}`);
    console.log(`  Password: ${matchedPass ? matchedPass : '[Unknown hash: ' + (u.password ? u.password.substring(0, 15) + '...' : 'NULL') + ']'}`);
    console.log("-----------------------------------------");
  }

  await conn.end();
}

main().catch(console.error);
