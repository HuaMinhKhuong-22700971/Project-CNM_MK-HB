const { query } = require("../src/config/database");

async function main() {
  console.log("Đang thêm cột payment_proof và payment_status vào bảng orders...");
  
  try {
    // Check if columns exist
    const columns = await query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'orders' 
      AND COLUMN_NAME IN ('payment_proof', 'payment_status')
    `);
    
    const existingColumns = columns.map(row => row.COLUMN_NAME);
    
    // Add payment_proof column if not exists
    if (!existingColumns.includes('payment_proof')) {
      await query(`ALTER TABLE orders ADD COLUMN payment_proof VARCHAR(500) NULL`);
      console.log("✅ Đã thêm cột payment_proof");
    } else {
      console.log("⚠️ Cột payment_proof đã tồn tại, bỏ qua...");
    }
    
    // Add payment_status column if not exists
    if (!existingColumns.includes('payment_status')) {
      await query(`ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) DEFAULT 'UNPAID'`);
      console.log("✅ Đã thêm cột payment_status");
    } else {
      console.log("⚠️ Cột payment_status đã tồn tại, bỏ qua...");
    }
    
    // Update existing BANK_TRANSFER orders to have PENDING_VERIFICATION status
    await query(`
      UPDATE orders 
      SET payment_status = 'PENDING_VERIFICATION' 
      WHERE payment_method = 'BANK_TRANSFER' AND payment_status = 'UNPAID'
    `);
    console.log("✅ Đã cập nhật trạng thái cho đơn hàng chuyển khoản hiện có");
    
    console.log("\n🎉 Hoàn tất! Hệ thống thanh toán chuyển khoản đã sẵn sàng.");
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
  }
  
  process.exit(0);
}

main();
