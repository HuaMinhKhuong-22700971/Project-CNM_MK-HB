CREATE TABLE IF NOT EXISTS warranties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  order_id INT NULL,
  order_item_id INT NULL,
  sku_id INT NULL,
  warranty_code VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  note VARCHAR(255) NULL,
  activated_at DATETIME NULL,
  expires_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_warranty_code (warranty_code),
  UNIQUE KEY uq_warranty_order_item (order_item_id),
  CONSTRAINT fk_warranties_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_warranties_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_warranties_order_item FOREIGN KEY (order_item_id) REFERENCES order_items(id)
);
