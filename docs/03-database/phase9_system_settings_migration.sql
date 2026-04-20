CREATE TABLE IF NOT EXISTS system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NULL,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO system_settings (setting_key, setting_value, description)
VALUES
  ('store_name', 'CNM PC Store', 'Ten hien thi cua he thong'),
  ('support_email', 'support@example.com', 'Email ho tro khach hang'),
  ('support_phone', '0900000000', 'So dien thoai ho tro'),
  ('online_payment_mode', 'sandbox', 'Che do thanh toan online: sandbox/live'),
  ('shipping_mode', 'mock', 'Che do van chuyen: mock/live'),
  ('maintenance_mode', 'off', 'Bat/tat che do bao tri')
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  updated_at = CURRENT_TIMESTAMP;
