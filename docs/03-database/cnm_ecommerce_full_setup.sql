-- CNM Ecommerce full setup for local demo/testing
-- Target database: cnm_ecommerce
-- Import this file once in phpMyAdmin SQL tab

USE cnm_ecommerce;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS brands (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NULL,
  logo_url VARCHAR(255) NULL,
  status VARCHAR(50) NULL DEFAULT 'ACTIVE',
  is_active TINYINT(1) NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS slug VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS logo_url VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS is_active TINYINT(1) NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS product_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  sku VARCHAR(255) NOT NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  stock_quantity INT NOT NULL DEFAULT 0,
  image_url VARCHAR(255) NULL,
  status VARCHAR(50) NULL DEFAULT 'ACTIVE',
  is_active TINYINT(1) NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_variants_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT NOT NULL,
  product_variant_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id),
  CONSTRAINT fk_cart_items_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id)
);

CREATE TABLE IF NOT EXISTS addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  full_name VARCHAR(255) NULL,
  phone VARCHAR(30) NULL,
  address_line VARCHAR(255) NULL,
  ward VARCHAR(255) NULL,
  district VARCHAR(255) NULL,
  province VARCHAR(255) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NULL,
  product_variant_id INT NULL,
  sku_snapshot VARCHAR(255) NOT NULL,
  name_snapshot VARCHAR(255) NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 1,
  line_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT fk_order_items_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id)
);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone VARCHAR(30) NULL,
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS slug VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS brand_id INT NULL,
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS is_active TINYINT(1) NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;


ALTER TABLE product_skus
  ADD COLUMN IF NOT EXISTS sku VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS image_url VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS is_active TINYINT(1) NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS address_id INT NULL,
  ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12,2) NULL,
  ADD COLUMN IF NOT EXISTS shipping_fee DECIMAL(12,2) NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS final_amount DECIMAL(12,2) NULL,
  ADD COLUMN IF NOT EXISTS shipping_address TEXT NULL,
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) NULL DEFAULT 'COD',
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) NULL DEFAULT 'UNPAID',
  ADD COLUMN IF NOT EXISTS note TEXT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;


ALTER TABLE pc_builds
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS is_saved TINYINT(1) NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_price DECIMAL(12,2) NULL DEFAULT 0;

ALTER TABLE compatibility_rules
  ADD COLUMN IF NOT EXISTS source_category_id INT NULL,
  ADD COLUMN IF NOT EXISTS target_category_id INT NULL,
  ADD COLUMN IF NOT EXISTS source_attribute_key VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS target_attribute_key VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS operator VARCHAR(20) NULL DEFAULT 'EQ',
  ADD COLUMN IF NOT EXISTS description TEXT NULL,
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS is_active TINYINT(1) NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

INSERT INTO roles (id, name) VALUES
  (1, 'ADMIN'),
  (2, 'CUSTOMER'),
  (3, 'STAFF')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO brands (id, name, slug, status, is_active) VALUES
  (1, 'Intel', 'intel', 'ACTIVE', 1),
  (2, 'AMD', 'amd', 'ACTIVE', 1),
  (3, 'ASUS', 'asus', 'ACTIVE', 1),
  (4, 'Corsair', 'corsair', 'ACTIVE', 1),
  (5, 'MSI', 'msi', 'ACTIVE', 1),
  (6, 'Kingston', 'kingston', 'ACTIVE', 1),
  (7, 'NVIDIA', 'nvidia', 'ACTIVE', 1),
  (8, 'Samsung', 'samsung', 'ACTIVE', 1),
  (9, 'Cooler Master', 'cooler-master', 'ACTIVE', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name), slug = VALUES(slug), status = VALUES(status), is_active = VALUES(is_active);

INSERT INTO categories (id, name) VALUES
  (1, 'CPU'),
  (2, 'MAINBOARD'),
  (3, 'RAM'),
  (4, 'GPU'),
  (5, 'STORAGE'),
  (6, 'PSU'),
  (7, 'CASE')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO users (id, email, password, full_name, role_id, phone, status, created_at, updated_at) VALUES
  (1, 'admin@example.com', '$2a$10$utcqRyxGzC2yp2uCRaye8ujewpiriFs2BpWX0w.VgO4H1I8PTm.eO', 'Admin Demo', 1, '0900000001', 'ACTIVE', NOW(), NOW()),
  (2, 'customer@example.com', '$2a$10$utcqRyxGzC2yp2uCRaye8ujewpiriFs2BpWX0w.VgO4H1I8PTm.eO', 'Customer Demo', 2, '0900000002', 'ACTIVE', NOW(), NOW())
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), role_id = VALUES(role_id), phone = VALUES(phone), status = VALUES(status);

INSERT INTO products (id, name, description, price, category_id, brand_id, slug, status, is_active, created_at, updated_at) VALUES
  (1, 'Intel Core i5-14400F', 'CPU socket LGA1700 cho gaming tam trung', 5200000, 1, 1, 'intel-core-i5-14400f', 'ACTIVE', 1, NOW(), NOW()),
  (2, 'AMD Ryzen 5 7600', 'CPU socket AM5 cho gaming va da nhiem', 5600000, 1, 2, 'amd-ryzen-5-7600', 'ACTIVE', 1, NOW(), NOW()),
  (3, 'ASUS Prime B760M-A WIFI DDR5', 'Mainboard LGA1700 DDR5', 3900000, 2, 3, 'asus-prime-b760m-a-wifi-ddr5', 'ACTIVE', 1, NOW(), NOW()),
  (4, 'MSI PRO B650M-A WIFI', 'Mainboard AM5 DDR5', 4100000, 2, 5, 'msi-pro-b650m-a-wifi', 'ACTIVE', 1, NOW(), NOW()),
  (5, 'Corsair Vengeance 16GB DDR5 5600', 'RAM DDR5 16GB', 1800000, 3, 4, 'corsair-vengeance-16gb-ddr5-5600', 'ACTIVE', 1, NOW(), NOW()),
  (6, 'Kingston Fury 16GB DDR4 3200', 'RAM DDR4 16GB', 1200000, 3, 6, 'kingston-fury-16gb-ddr4-3200', 'ACTIVE', 1, NOW(), NOW()),
  (7, 'NVIDIA RTX 4060 8GB', 'GPU cho gaming 1080p/1440p', 8900000, 4, 7, 'nvidia-rtx-4060-8gb', 'ACTIVE', 1, NOW(), NOW()),
  (8, 'Samsung 990 EVO 1TB', 'SSD NVMe 1TB toc do cao', 2100000, 5, 8, 'samsung-990-evo-1tb', 'ACTIVE', 1, NOW(), NOW()),
  (9, 'Cooler Master MWE 650 Bronze V2', 'PSU 650W', 1600000, 6, 9, 'cooler-master-mwe-650-bronze-v2', 'ACTIVE', 1, NOW(), NOW()),
  (10, 'Cooler Master CMP 520', 'Case mid tower', 1300000, 7, 9, 'cooler-master-cmp-520', 'ACTIVE', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price = VALUES(price),
  category_id = VALUES(category_id),
  brand_id = VALUES(brand_id),
  slug = VALUES(slug),
  status = VALUES(status),
  is_active = VALUES(is_active);

INSERT INTO product_skus (id, product_id, price, stock, sku, image_url, status, is_active, created_at, updated_at) VALUES
  (1, 1, 5200000, 10, 'CPU-I5-14400F', NULL, 'ACTIVE', 1, NOW(), NOW()),
  (2, 2, 5600000, 8, 'CPU-R5-7600', NULL, 'ACTIVE', 1, NOW(), NOW()),
  (3, 3, 3900000, 9, 'MB-B760M-DDR5', NULL, 'ACTIVE', 1, NOW(), NOW()),
  (4, 4, 4100000, 7, 'MB-B650M-DDR5', NULL, 'ACTIVE', 1, NOW(), NOW()),
  (5, 5, 1800000, 20, 'RAM-DDR5-16G', NULL, 'ACTIVE', 1, NOW(), NOW()),
  (6, 6, 1200000, 20, 'RAM-DDR4-16G', NULL, 'ACTIVE', 1, NOW(), NOW()),
  (7, 7, 8900000, 5, 'GPU-RTX4060-8G', NULL, 'ACTIVE', 1, NOW(), NOW()),
  (8, 8, 2100000, 15, 'SSD-990EVO-1TB', NULL, 'ACTIVE', 1, NOW(), NOW()),
  (9, 9, 1600000, 12, 'PSU-650W-BRONZE', NULL, 'ACTIVE', 1, NOW(), NOW()),
  (10, 10, 1300000, 10, 'CASE-CMP520', NULL, 'ACTIVE', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  product_id = VALUES(product_id),
  price = VALUES(price),
  stock = VALUES(stock),
  sku = VALUES(sku),
  image_url = VALUES(image_url),
  status = VALUES(status),
  is_active = VALUES(is_active);

INSERT INTO product_variants (id, product_id, sku, price, stock_quantity, image_url, status, is_active, created_at, updated_at) VALUES
  (1, 1, 'CPU-I5-14400F', 5200000, 10, NULL, 'ACTIVE', 1, NOW(), NOW()),
  (2, 2, 'CPU-R5-7600', 5600000, 8, NULL, 'ACTIVE', 1, NOW(), NOW()),
  (3, 3, 'MB-B760M-DDR5', 3900000, 9, NULL, 'ACTIVE', 1, NOW(), NOW()),
  (4, 4, 'MB-B650M-DDR5', 4100000, 7, NULL, 'ACTIVE', 1, NOW(), NOW()),
  (5, 5, 'RAM-DDR5-16G', 1800000, 20, NULL, 'ACTIVE', 1, NOW(), NOW()),
  (6, 6, 'RAM-DDR4-16G', 1200000, 20, NULL, 'ACTIVE', 1, NOW(), NOW()),
  (7, 7, 'GPU-RTX4060-8G', 8900000, 5, NULL, 'ACTIVE', 1, NOW(), NOW()),
  (8, 8, 'SSD-990EVO-1TB', 2100000, 15, NULL, 'ACTIVE', 1, NOW(), NOW()),
  (9, 9, 'PSU-650W-BRONZE', 1600000, 12, NULL, 'ACTIVE', 1, NOW(), NOW()),
  (10, 10, 'CASE-CMP520', 1300000, 10, NULL, 'ACTIVE', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  product_id = VALUES(product_id),
  sku = VALUES(sku),
  price = VALUES(price),
  stock_quantity = VALUES(stock_quantity),
  status = VALUES(status),
  is_active = VALUES(is_active);

INSERT INTO attributes (id, name) VALUES
  (1, 'socket'),
  (2, 'ram_type'),
  (3, 'wattage'),
  (4, 'form_factor'),
  (5, 'storage_type')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO attribute_values (id, attribute_id, value) VALUES
  (1, 1, 'LGA1700'),
  (2, 1, 'AM5'),
  (3, 2, 'DDR5'),
  (4, 2, 'DDR4'),
  (5, 3, '650W'),
  (6, 4, 'ATX'),
  (7, 5, 'NVMe'),
  (8, 4, 'mATX')
ON DUPLICATE KEY UPDATE attribute_id = VALUES(attribute_id), value = VALUES(value);

INSERT INTO sku_attributes (id, sku_id, attribute_value_id) VALUES
  (1, 1, 1),
  (2, 2, 2),
  (3, 3, 1),
  (4, 3, 3),
  (5, 3, 8),
  (6, 4, 2),
  (7, 4, 3),
  (8, 4, 8),
  (9, 5, 3),
  (10, 6, 4),
  (11, 8, 7),
  (12, 9, 5),
  (13, 10, 6)
ON DUPLICATE KEY UPDATE sku_id = VALUES(sku_id), attribute_value_id = VALUES(attribute_value_id);

INSERT INTO compatibility_rules (
  id,
  attribute_value_1,
  attribute_value_2,
  is_compatible,
  source_category_id,
  target_category_id,
  source_attribute_key,
  target_attribute_key,
  operator,
  description,
  status,
  is_active,
  created_at,
  updated_at
) VALUES
  (1, 1, 1, 1, 1, 2, 'socket', 'socket', 'EQ', 'CPU LGA1700 tuong thich voi mainboard LGA1700', 'ACTIVE', 1, NOW(), NOW()),
  (2, 1, 2, 0, 1, 2, 'socket', 'socket', 'EQ', 'CPU LGA1700 khong tuong thich voi mainboard AM5', 'ACTIVE', 1, NOW(), NOW()),
  (3, 2, 2, 1, 1, 2, 'socket', 'socket', 'EQ', 'CPU AM5 tuong thich voi mainboard AM5', 'ACTIVE', 1, NOW(), NOW()),
  (4, 3, 3, 1, 3, 2, 'ram_type', 'ram_type', 'EQ', 'RAM DDR5 tuong thich voi mainboard DDR5', 'ACTIVE', 1, NOW(), NOW()),
  (5, 3, 4, 0, 3, 2, 'ram_type', 'ram_type', 'EQ', 'RAM DDR5 khong tuong thich voi mainboard DDR4', 'ACTIVE', 1, NOW(), NOW()),
  (6, 4, 4, 1, 3, 2, 'ram_type', 'ram_type', 'EQ', 'RAM DDR4 tuong thich voi mainboard DDR4', 'ACTIVE', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  attribute_value_1 = VALUES(attribute_value_1),
  attribute_value_2 = VALUES(attribute_value_2),
  is_compatible = VALUES(is_compatible),
  source_category_id = VALUES(source_category_id),
  target_category_id = VALUES(target_category_id),
  source_attribute_key = VALUES(source_attribute_key),
  target_attribute_key = VALUES(target_attribute_key),
  operator = VALUES(operator),
  description = VALUES(description),
  status = VALUES(status),
  is_active = VALUES(is_active);

INSERT INTO addresses (id, user_id, full_name, phone, address_line, ward, district, province, created_at) VALUES
  (1, 2, 'Customer Demo', '0900000002', '123 Nguyen Van Linh', 'Ward 1', 'District 7', 'Ho Chi Minh', NOW())
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  phone = VALUES(phone),
  address_line = VALUES(address_line),
  ward = VALUES(ward),
  district = VALUES(district),
  province = VALUES(province);

INSERT INTO carts (id, user_id, created_at, updated_at) VALUES
  (1, 2, NOW(), NOW())
ON DUPLICATE KEY UPDATE user_id = VALUES(user_id);

INSERT INTO cart_items (id, cart_id, product_variant_id, quantity, created_at, updated_at) VALUES
  (1, 1, 7, 1, NOW(), NOW()),
  (2, 1, 8, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE product_variant_id = VALUES(product_variant_id), quantity = VALUES(quantity);

INSERT INTO pc_builds (id, user_id, name, created_at, updated_at, status, is_saved, total_price) VALUES
  (1, 2, 'Gaming Demo Build', NOW(), NOW(), 'DRAFT', 0, 24500000)
ON DUPLICATE KEY UPDATE
  user_id = VALUES(user_id),
  name = VALUES(name),
  status = VALUES(status),
  is_saved = VALUES(is_saved),
  total_price = VALUES(total_price);

INSERT INTO pc_build_items (id, build_id, sku_id, component_type) VALUES
  (1, 1, 1, 'cpu'),
  (2, 1, 3, 'mainboard'),
  (3, 1, 5, 'ram'),
  (4, 1, 7, 'gpu'),
  (5, 1, 8, 'storage'),
  (6, 1, 9, 'psu'),
  (7, 1, 10, 'case')
ON DUPLICATE KEY UPDATE build_id = VALUES(build_id), sku_id = VALUES(sku_id), component_type = VALUES(component_type);

UPDATE orders
SET
  total_amount = COALESCE(total_amount, total_price),
  final_amount = COALESCE(final_amount, total_price),
  shipping_fee = COALESCE(shipping_fee, 0),
  payment_method = COALESCE(payment_method, 'COD'),
  payment_status = COALESCE(payment_status, 'UNPAID'),
  status = COALESCE(status, 'PENDING'),
  updated_at = COALESCE(updated_at, created_at);

SET FOREIGN_KEY_CHECKS = 1;

-- Test accounts
-- admin@example.com / 123456
-- customer@example.com / 123456




