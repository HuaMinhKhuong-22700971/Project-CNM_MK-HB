const { query } = require("../../config/database");

function addWarrantyPeriod(date = new Date(), months = 12) {
  const expiresAt = new Date(date);
  expiresAt.setMonth(expiresAt.getMonth() + months);
  return expiresAt;
}

function generateWarrantyCode(orderItemId) {
  return `BH-${orderItemId}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

async function ensureWarrantyNotificationTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS warranty_notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      request_id INT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      is_read TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_warranty_notifications_user (user_id),
      INDEX idx_warranty_notifications_read (user_id, is_read)
    )
  `);
}

async function createWarrantyRecordsForDeliveredOrder(orderId) {
  const parsedOrderId = Number(orderId);
  if (!Number.isFinite(parsedOrderId) || parsedOrderId <= 0) {
    return [];
  }

  const orderRows = await query(
    `
      SELECT id, user_id AS userId, status
      FROM orders
      WHERE id = ?
      LIMIT 1
    `,
    [parsedOrderId]
  );

  const order = orderRows?.[0];
  if (!order || String(order.status || "").toUpperCase() !== "DELIVERED" || !order.userId) {
    return [];
  }

  const orderItems = await query(
    `
      SELECT
        oi.id,
        oi.order_id AS orderId,
        oi.product_variant_id AS skuId
      FROM order_items oi
      LEFT JOIN warranties w ON w.order_item_id = oi.id
      WHERE oi.order_id = ?
        AND w.id IS NULL
    `,
    [parsedOrderId]
  );

  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    return [];
  }

  const now = new Date();
  const expiresAt = addWarrantyPeriod(now, 12);

  await Promise.all(
    orderItems.map((item) =>
      query(
        `
          INSERT IGNORE INTO warranties
            (user_id, order_id, order_item_id, sku_id, warranty_code, status, note, activated_at, expires_at)
          VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?)
        `,
        [
          order.userId,
          item.orderId,
          item.id,
          item.skuId || null,
          generateWarrantyCode(item.id),
          "Auto-created when order was delivered",
          now,
          expiresAt
        ]
      )
    )
  );

  await ensureWarrantyNotificationTable();
  await query(
    `
      INSERT INTO warranty_notifications (user_id, request_id, title, message, is_read)
      VALUES (?, NULL, ?, ?, 0)
    `,
    [
      order.userId,
      "Bảo hành điện tử đã kích hoạt",
      `Đơn hàng #${parsedOrderId} đã được kích hoạt bảo hành điện tử cho ${orderItems.length} sản phẩm.`
    ]
  );

  return orderItems;
}

module.exports = {
  createWarrantyRecordsForDeliveredOrder
};
