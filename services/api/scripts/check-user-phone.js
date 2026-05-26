const { query } = require("../src/config/database");

async function main() {
  console.log("Đang kiểm tra dữ liệu phone trong bảng users...");
  
  const rows = await query(`
    SELECT id, full_name, email, phone 
    FROM users 
    WHERE role_id = (SELECT id FROM roles WHERE UPPER(name) = 'CUSTOMER' LIMIT 1) 
    LIMIT 5
  `);
  
  console.log("Dữ liệu user:");
  console.table(rows);
  
  if (rows.length > 0) {
    console.log("\nChi tiết user đầu tiên:");
    console.log(JSON.stringify(rows[0], null, 2));
  }
  
  process.exit(0);
}

main().catch(error => {
  console.error("Error:", error);
  process.exit(1);
});
