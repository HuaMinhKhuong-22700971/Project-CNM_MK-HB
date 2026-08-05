const mysql = require("mysql2/promise");

async function main() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1", port: 3306, user: "root", password: "", database: "cnm_ecommerce"
  });

  const [tickets] = await conn.execute("SELECT id, title, status, priority, user_id, assigned_to_id FROM tickets");
  console.log(`=== Tickets Count: ${tickets.length} ===`);
  tickets.forEach(t => console.log(`  [Ticket #${t.id}] ${t.title} | Status: ${t.status} | Priority: ${t.priority}`));

  if (tickets.length === 0) {
    console.log("\nNo tickets found! Inserting sample tech tickets...");
    // Get customer user id
    const [users] = await conn.execute("SELECT id FROM users WHERE email = 'customer@example.com' OR email LIKE '%customer%' LIMIT 1");
    const customerId = users[0]?.id || 2;

    const sampleTickets = [
      {
        user_id: customerId,
        title: "Cần hỗ trợ tư vấn lắp đặt RAM DDR5 Kingston Fury",
        description: "Chào bộ phận kỹ thuật, mình vừa mua RAM DDR5 Kingston Fury Beast 16GB tại cửa hàng. Cho mình hỏi mainboard ASUS TUF B760M của mình cần gắn vào khe A2 và B2 đúng không? Có cần bật XMP 3.0 trong BIOS không ạ?",
        status: "OPEN",
        priority: "HIGH"
      },
      {
        user_id: customerId,
        title: "Màn hình bị chớp tắt khi chơi game nặng với VGA RTX 4060",
        description: "Kỹ thuật hỗ trợ giúp em: Card ASUS Dual RTX 4060 mua tuần trước khi chơi game nặng khoảng 30 phút màn hình bị chớp chớp rồi tắt đen. Nguồn Corsair CV750W của em có đủ gánh không ạ?",
        status: "IN_PROGRESS",
        priority: "URGENT"
      },
      {
        user_id: customerId,
        title: "Hỏi về chính sách bảo hành CPU Intel Core i5-13400F",
        description: "CPU Intel i5-13400F của mình mua tại shop 6 tháng trước. Hiện tại mở máy quạt CPU quay nhưng không lên hình. Cho mình hỏi quy trình gửi bảo hành tại cửa hàng như thế nào ạ?",
        status: "OPEN",
        priority: "MEDIUM"
      }
    ];

    for (const st of sampleTickets) {
      const [res] = await conn.execute(
        `INSERT INTO tickets (user_id, title, description, status, priority, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [st.user_id, st.title, st.description, st.status, st.priority]
      );
      const ticketId = res.insertId;

      // Insert initial ticket message
      await conn.execute(
        `INSERT INTO ticket_messages (ticket_id, user_id, message, visibility, created_at, updated_at)
         VALUES (?, ?, ?, 'PUBLIC', NOW(), NOW())`,
        [ticketId, st.user_id, st.description]
      );
      console.log(`  ➕ Inserted Ticket #${ticketId}: ${st.title}`);
    }
  }

  await conn.end();
}

main().catch(console.error);
