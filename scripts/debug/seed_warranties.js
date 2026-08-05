const mysql = require("mysql2/promise");

async function main() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1", port: 3306, user: "root", password: "", database: "cnm_ecommerce"
  });

  const [reqs] = await conn.execute("SELECT COUNT(*) as count FROM warranty_requests");
  console.log(`=== Warranty Requests Count: ${reqs[0].count} ===`);

  if (reqs[0].count === 0) {
    console.log("Adding sample warranty requests...");

    const sampleRequests = [
      {
        customer_name: "Customer Demo",
        customer_phone: "0901234567",
        customer_email: "customer@example.com",
        product_name: "VGA ASUS Dual GeForce RTX 4060 8GB OC",
        serial_number: "SN-ASUS-4060-998822",
        lookup_value: "BH-RTX4060-001",
        severity: "HIGH",
        issue_description: "Card màn hình quạt không quay khi tải nặng, nhiệt độ lên 90 độ C làm sập nguồn.",
        status: "RECEIVED"
      },
      {
        customer_name: "Hứa Minh Khương",
        customer_phone: "0987654321",
        customer_email: "khuongminhhua11062004@gmail.com",
        product_name: "RAM Kingston Fury Beast 16GB DDR5 5600MHz",
        serial_number: "SN-KF-DDR5-112233",
        lookup_value: "BH-RAMDDR5-002",
        severity: "MEDIUM",
        issue_description: "Thanh RAM bị lỗi xanh màn hình (BSOD) khi chạy ứng dụng đồ họa nặng.",
        status: "IN_PROGRESS"
      }
    ];

    for (const r of sampleRequests) {
      const [res] = await conn.execute(
        `INSERT INTO warranty_requests (customer_name, customer_phone, customer_email, product_name, serial_number, lookup_value, severity, issue_description, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [r.customer_name, r.customer_phone, r.customer_email, r.product_name, r.serial_number, r.lookup_value, r.severity, r.issue_description, r.status]
      );
      console.log(`  ➕ Added Warranty Request #${res.insertId}: ${r.product_name}`);
    }
  }

  await conn.end();
}

main().catch(console.error);
