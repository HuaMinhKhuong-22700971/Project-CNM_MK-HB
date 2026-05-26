-- 1. Thêm Danh mục mới
INSERT INTO `categories` (`name`) VALUES 
('LAPTOP'),
('MÁY TÍNH BỘ (PRE-BUILT)'),
('MÀN HÌNH');

-- 2. Thêm Thương hiệu chuyên Laptop
INSERT INTO `brands` (`name`, `slug`, `status`) VALUES 
('Apple', 'apple', 'ACTIVE'),
('Dell', 'dell', 'ACTIVE'),
('HP', 'hp', 'ACTIVE'),
('Lenovo', 'lenovo', 'ACTIVE'),
('Acer', 'acer', 'ACTIVE');

-- 3. Thêm Thuộc tính đặc thù cho Laptop/Màn hình
INSERT INTO `attributes` (`name`) VALUES 
('screen_size'),
('cpu_integrated'),
('battery_cell'),
('color'),
('operating_system');

-- 4. Thêm một số giá trị mẫu cho Thuộc tính
INSERT INTO `attribute_values` (`attribute_id`, `value`) VALUES 
((SELECT id FROM attributes WHERE name='screen_size' LIMIT 1), '13.3 inch'),
((SELECT id FROM attributes WHERE name='screen_size' LIMIT 1), '14 inch'),
((SELECT id FROM attributes WHERE name='screen_size' LIMIT 1), '15.6 inch'),
((SELECT id FROM attributes WHERE name='operating_system' LIMIT 1), 'Windows 11 Home'),
((SELECT id FROM attributes WHERE name='operating_system' LIMIT 1), 'macOS Sonoma');
