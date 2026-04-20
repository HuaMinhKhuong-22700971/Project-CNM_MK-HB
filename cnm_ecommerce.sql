-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th4 20, 2026 lúc 03:48 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `cnm_ecommerce`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `addresses`
--

CREATE TABLE `addresses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `address_line` varchar(255) DEFAULT NULL,
  `ward` varchar(255) DEFAULT NULL,
  `district` varchar(255) DEFAULT NULL,
  `province` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `addresses`
--

INSERT INTO `addresses` (`id`, `user_id`, `full_name`, `phone`, `address_line`, `ward`, `district`, `province`, `created_at`) VALUES
(1, 2, 'Customer Demo', '0900000002', '123 Nguyen Van Linh', 'Ward 1', 'District 7', 'Ho Chi Minh', '2026-03-20 14:36:21');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `ai_chats`
--

CREATE TABLE `ai_chats` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `ai_messages`
--

CREATE TABLE `ai_messages` (
  `id` int(11) NOT NULL,
  `chat_id` int(11) DEFAULT NULL,
  `sender` varchar(20) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `attributes`
--

CREATE TABLE `attributes` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `attributes`
--

INSERT INTO `attributes` (`id`, `name`) VALUES
(1, 'socket'),
(2, 'ram_type'),
(3, 'wattage'),
(4, 'form_factor'),
(5, 'storage_type');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `attribute_values`
--

CREATE TABLE `attribute_values` (
  `id` int(11) NOT NULL,
  `attribute_id` int(11) DEFAULT NULL,
  `value` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `attribute_values`
--

INSERT INTO `attribute_values` (`id`, `attribute_id`, `value`) VALUES
(1, 1, 'LGA1700'),
(2, 1, 'AM5'),
(3, 2, 'DDR5'),
(4, 2, 'DDR4'),
(5, 3, '650W'),
(6, 4, 'ATX'),
(7, 5, 'NVMe'),
(8, 4, 'mATX'),
(9, 3, '850W'),
(10, 3, '750W'),
(11, 3, '1000W'),
(13, 1, 'AM4'),
(14, 1, 'LGA1200'),
(15, 3, '550W'),
(16, 3, '1200W'),
(17, 3, '450W'),
(18, 5, 'SATA SSD'),
(19, 5, 'HDD');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `brands`
--

CREATE TABLE `brands` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'ACTIVE',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `brands`
--

INSERT INTO `brands` (`id`, `name`, `slug`, `logo_url`, `status`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Intel', 'intel', NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(2, 'AMD', 'amd', NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(3, 'ASUS', 'asus', NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(4, 'Corsair', 'corsair', NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(5, 'MSI', 'msi', NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(6, 'Kingston', 'kingston', NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(7, 'NVIDIA', 'nvidia', NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(8, 'Samsung', 'samsung', NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(9, 'Cooler Master', 'cooler-master', NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(10, 'Gigabyte', 'gigabyte', NULL, 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 00:39:05'),
(11, 'G.Skill', 'gskill', NULL, 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 00:39:05'),
(12, 'TeamGroup', 'teamgroup', NULL, 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 00:39:05'),
(13, 'Western Digital', 'western-digital', NULL, 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 00:39:05'),
(14, 'Crucial', 'crucial', NULL, 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 00:39:05'),
(15, 'EVGA', 'evga', NULL, 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 00:39:05'),
(16, 'NZXT', 'nzxt', NULL, 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 00:39:05'),
(17, 'Lian Li', 'lian-li', NULL, 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 00:39:05'),
(18, 'TeamGroup', 'teamgroup', NULL, 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-17 00:42:36'),
(19, 'Lexar', 'lexar', NULL, 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-17 00:42:36'),
(20, 'Sapphire', 'sapphire', NULL, 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-17 00:42:36'),
(21, 'Arctic', 'arctic', NULL, 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-17 00:42:36'),
(22, 'Deepcool', 'deepcool', NULL, 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-17 00:42:36'),
(23, 'Lian Li', 'lian-li', NULL, 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-17 00:42:36'),
(24, 'Be Quiet!', 'be-quiet', NULL, 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-17 00:42:36'),
(25, 'PowerColor', 'powercolor', NULL, 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-17 00:42:36');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `carts`
--

CREATE TABLE `carts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `carts`
--

INSERT INTO `carts` (`id`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 2, '2026-03-20 14:36:21', '2026-03-20 14:36:21'),
(2, 5, '2026-03-26 08:00:44', '2026-03-26 08:00:44');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(11) NOT NULL,
  `cart_id` int(11) NOT NULL,
  `product_variant_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `name`) VALUES
(1, 'CPU'),
(2, 'MAINBOARD'),
(3, 'RAM'),
(4, 'GPU'),
(5, 'STORAGE'),
(6, 'PSU'),
(7, 'CASE');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `compatibility_rules`
--

CREATE TABLE `compatibility_rules` (
  `id` int(11) NOT NULL,
  `attribute_value_1` int(11) DEFAULT NULL,
  `attribute_value_2` int(11) DEFAULT NULL,
  `is_compatible` tinyint(1) DEFAULT NULL,
  `source_category_id` int(11) DEFAULT NULL,
  `target_category_id` int(11) DEFAULT NULL,
  `source_attribute_key` varchar(255) DEFAULT NULL,
  `target_attribute_key` varchar(255) DEFAULT NULL,
  `operator` varchar(20) DEFAULT 'EQ',
  `description` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'ACTIVE',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `compatibility_rules`
--

INSERT INTO `compatibility_rules` (`id`, `attribute_value_1`, `attribute_value_2`, `is_compatible`, `source_category_id`, `target_category_id`, `source_attribute_key`, `target_attribute_key`, `operator`, `description`, `status`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 1, 2, 'socket', 'socket', 'EQ', 'CPU LGA1700 tuong thich voi mainboard LGA1700', 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(2, 1, 2, 0, 1, 2, 'socket', 'socket', 'EQ', 'CPU LGA1700 khong tuong thich voi mainboard AM5', 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(3, 2, 2, 1, 1, 2, 'socket', 'socket', 'EQ', 'CPU AM5 tuong thich voi mainboard AM5', 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(4, 3, 3, 1, 3, 2, 'ram_type', 'ram_type', 'EQ', 'RAM DDR5 tuong thich voi mainboard DDR5', 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(5, 3, 4, 0, 3, 2, 'ram_type', 'ram_type', 'EQ', 'RAM DDR5 khong tuong thich voi mainboard DDR4', 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(6, 4, 4, 1, 3, 2, 'ram_type', 'ram_type', 'EQ', 'RAM DDR4 tuong thich voi mainboard DDR4', 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `address_id` int(11) DEFAULT NULL,
  `total_amount` decimal(12,2) DEFAULT NULL,
  `shipping_fee` decimal(12,2) DEFAULT 0.00,
  `final_amount` decimal(12,2) DEFAULT NULL,
  `shipping_address` text DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT 'COD',
  `payment_status` varchar(50) DEFAULT 'UNPAID',
  `note` text DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total_price`, `status`, `created_at`, `address_id`, `total_amount`, `shipping_fee`, `final_amount`, `shipping_address`, `payment_method`, `payment_status`, `note`, `updated_at`) VALUES
(1, 2, NULL, 'CANCELED', '2026-03-20 15:09:17', 1, 19900000.00, 0.00, 19900000.00, 'Customer Demo, 0900000002, 123 Nguyen Van Linh, Ward 1, District 7, Ho Chi Minh', 'COD', 'UNPAID', 'Test order', '2026-03-20 15:31:12'),
(2, 2, NULL, 'PENDING', '2026-03-20 15:29:07', 1, 8900000.00, 0.00, 8900000.00, 'Customer Demo, 0900000002, 123 Nguyen Van Linh, Ward 1, District 7, Ho Chi Minh', 'COD', 'UNPAID', 'Test order', '2026-03-20 15:29:07');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_variant_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `line_total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `product_id` int(11) DEFAULT NULL,
  `sku_snapshot` varchar(255) DEFAULT NULL,
  `name_snapshot` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_variant_id`, `quantity`, `unit_price`, `line_total`, `product_id`, `sku_snapshot`, `name_snapshot`, `created_at`, `updated_at`) VALUES
(1, 1, 7, 2, 8900000.00, 17800000.00, 7, 'GPU-RTX4060-8G', 'NVIDIA RTX 4060 8GB', '2026-03-20 15:09:17', '2026-03-20 15:09:17'),
(2, 1, 8, 1, 2100000.00, 2100000.00, 8, 'SSD-990EVO-1TB', 'Samsung 990 EVO 1TB', '2026-03-20 15:09:17', '2026-03-20 15:09:17'),
(3, 2, 7, 1, 8900000.00, 8900000.00, 7, 'GPU-RTX4060-8G', 'NVIDIA RTX 4060 8GB', '2026-03-20 15:29:07', '2026-03-20 15:29:07');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pc_builds`
--

CREATE TABLE `pc_builds` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` varchar(50) DEFAULT 'DRAFT',
  `is_saved` tinyint(1) DEFAULT 0,
  `total_price` decimal(12,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `pc_builds`
--

INSERT INTO `pc_builds` (`id`, `user_id`, `name`, `created_at`, `updated_at`, `status`, `is_saved`, `total_price`) VALUES
(1, 2, 'Gaming Demo Build', '2026-03-20 14:36:21', '2026-03-20 14:36:21', 'DRAFT', 0, 24500000.00),
(2, 2, 'My PC Build', '2026-03-20 15:32:11', '2026-03-20 15:32:11', 'DRAFT', 0, 0.00),
(3, 2, 'My Test Build', '2026-03-20 15:32:26', '2026-03-20 15:32:26', 'DRAFT', 0, 0.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pc_build_items`
--

CREATE TABLE `pc_build_items` (
  `id` int(11) NOT NULL,
  `build_id` int(11) DEFAULT NULL,
  `sku_id` int(11) DEFAULT NULL,
  `component_type` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `pc_build_items`
--

INSERT INTO `pc_build_items` (`id`, `build_id`, `sku_id`, `component_type`) VALUES
(1, 1, 1, 'cpu'),
(2, 1, 3, 'mainboard'),
(3, 1, 5, 'ram'),
(4, 1, 7, 'gpu'),
(5, 1, 8, 'storage'),
(6, 1, 9, 'psu'),
(7, 1, 10, 'case');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `slug` varchar(255) DEFAULT NULL,
  `brand_id` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'ACTIVE',
  `is_active` tinyint(1) DEFAULT 1,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `category_id`, `created_at`, `slug`, `brand_id`, `status`, `is_active`, `updated_at`) VALUES
(1, 'Intel Core i5-14400F', 'CPU socket LGA1700 cho gaming tam trung', 5200000.00, 1, '2026-03-20 14:34:28', 'intel-core-i5-14400f', 1, 'ACTIVE', 1, '2026-03-20 14:34:28'),
(2, 'AMD Ryzen 5 7600', 'CPU socket AM5 cho gaming va da nhiem', 5600000.00, 1, '2026-03-20 14:34:28', 'amd-ryzen-5-7600', 2, 'ACTIVE', 1, '2026-03-20 14:34:28'),
(3, 'ASUS Prime B760M-A WIFI DDR5', 'Mainboard LGA1700 DDR5', 3900000.00, 2, '2026-03-20 14:34:28', 'asus-prime-b760m-a-wifi-ddr5', 3, 'ACTIVE', 1, '2026-03-20 14:34:28'),
(4, 'MSI PRO B650M-A WIFI', 'Mainboard AM5 DDR5', 4100000.00, 2, '2026-03-20 14:34:28', 'msi-pro-b650m-a-wifi', 5, 'ACTIVE', 1, '2026-03-20 14:34:28'),
(5, 'Corsair Vengeance 16GB DDR5 5600', 'RAM DDR5 16GB', 1800000.00, 3, '2026-03-20 14:34:28', 'corsair-vengeance-16gb-ddr5-5600', 4, 'ACTIVE', 1, '2026-03-20 14:34:28'),
(6, 'Kingston Fury 16GB DDR4 3200', 'RAM DDR4 16GB', 1200000.00, 3, '2026-03-20 14:34:28', 'kingston-fury-16gb-ddr4-3200', 6, 'ACTIVE', 1, '2026-03-20 14:34:28'),
(7, 'NVIDIA RTX 4060 8GB', 'GPU cho gaming 1080p/1440p', 8900000.00, 4, '2026-03-20 14:34:28', 'nvidia-rtx-4060-8gb', 7, 'ACTIVE', 1, '2026-03-20 14:34:28'),
(8, 'Samsung 990 EVO 1TB', 'SSD NVMe 1TB toc do cao', 2100000.00, 5, '2026-03-20 14:34:28', 'samsung-990-evo-1tb', 8, 'ACTIVE', 1, '2026-03-20 14:34:28'),
(9, 'Cooler Master MWE 650 Bronze V2', 'PSU 650W', 1600000.00, 6, '2026-03-20 14:34:28', 'cooler-master-mwe-650-bronze-v2', 9, 'ACTIVE', 1, '2026-03-20 14:34:28'),
(10, 'Cooler Master CMP 520', 'Case mid tower', 1300000.00, 7, '2026-03-20 14:34:28', 'cooler-master-cmp-520', 9, 'ACTIVE', 1, '2026-03-20 14:34:28'),
(11, 'Intel Core i7-14700K', 'CPU Intel Core i7 the he 14, 20 nhan 28 luong', 11500000.00, 1, '2026-04-17 00:39:05', 'intel-core-i7-14700k', 1, 'ACTIVE', 1, '2026-04-17 00:39:05'),
(12, 'AMD Ryzen 7 7800X3D', 'CPU AMD choi game tot nhat hien nay', 10800000.00, 1, '2026-04-17 00:39:05', 'amd-ryzen-7-7800x3d', 2, 'ACTIVE', 1, '2026-04-17 00:39:05'),
(13, 'Intel Core i3-12100F', 'CPU gia re hieu nang cao cho gaming pho thong', 2200000.00, 1, '2026-04-17 00:39:05', 'intel-core-i3-12100f', 1, 'ACTIVE', 1, '2026-04-17 00:39:05'),
(14, 'ASUS ROG STRIX Z790-E GAMING WIFI', 'Mainboard Z790 cao cap cho Intel Gen 14', 13200000.00, 2, '2026-04-17 00:39:05', 'asus-rog-strix-z790-e', 3, 'ACTIVE', 1, '2026-04-17 00:39:05'),
(15, 'Gigabyte B650 AORUS ELITE AX', 'Mainboard AM5 cho Ryzen 7000 series', 6500000.00, 2, '2026-04-17 00:39:05', 'gigabyte-b650-aorus-elite-ax', 10, 'ACTIVE', 1, '2026-04-17 00:39:05'),
(16, 'MSI MAG B660M MORTAR WIFI DDR4', 'Mainboard LGA1700 ho tro RAM DDR4', 4200000.00, 2, '2026-04-17 00:39:05', 'msi-mag-b660m-mortar-ddr4', 5, 'ACTIVE', 1, '2026-04-17 00:39:05'),
(17, 'G.Skill Trident Z5 RGB 32GB DDR5 6000MHz', 'RAM DDR5 cao cap voi led RGB', 3800000.00, 3, '2026-04-17 00:39:05', 'gskill-trident-z5-32gb-ddr5', 11, 'ACTIVE', 1, '2026-04-17 00:39:05'),
(18, 'Corsair Vengeance LPX 16GB DDR4 3200MHz', 'RAM DDR4 quoc dan ben bi', 1100000.00, 3, '2026-04-17 00:39:05', 'corsair-vengeance-lpx-16gb-ddr4', 4, 'ACTIVE', 1, '2026-04-17 00:39:05'),
(19, 'TeamGroup T-Force Delta RGB 32GB DDR5', 'RAM DDR5 hieu nang cao', 3500000.00, 3, '2026-04-17 00:39:05', 'teamgroup-t-force-delta-32gb-ddr5', 12, 'ACTIVE', 1, '2026-04-17 00:39:05'),
(20, 'NVIDIA RTX 4070 SUPER 12GB', 'Card do hoa kien truc Ada Lovelace moi', 17900000.00, 4, '2026-04-17 00:39:05', 'nvidia-rtx-4070-super', 7, 'ACTIVE', 1, '2026-04-17 00:39:05'),
(21, 'AMD Radeon RX 7800 XT 16GB', 'GPU choi game 1440p hieu nang cao', 14500000.00, 4, '2026-04-17 00:39:05', 'amd-radeon-rx-7800-xt', 2, 'ACTIVE', 1, '2026-04-17 00:39:05'),
(22, 'NVIDIA RTX 4090 24GB Founders Edition', 'Quai vat do hoa manh nhat the gioi', 55000000.00, 4, '2026-04-17 00:39:05', 'nvidia-rtx-4090-24gb', 7, 'ACTIVE', 1, '2026-04-17 00:39:05'),
(23, 'WD Black SN850X 1TB', 'SSD NVMe Gen4 toc do 7300MB/s', 2800000.00, 5, '2026-04-17 00:39:05', 'wd-black-sn850x-1tb', 13, 'ACTIVE', 1, '2026-04-17 00:39:05'),
(24, 'Crucial P3 Plus 2TB', 'SSD Gen4 dung luong lon gia re', 3200000.00, 5, '2026-04-17 00:39:05', 'crucial-p3-plus-2tb', 14, 'ACTIVE', 1, '2026-04-17 00:39:05'),
(25, 'Samsung 980 Pro 2TB', 'SSD Gen4 quoc dan on dinh', 4500000.00, 5, '2026-04-17 00:39:05', 'samsung-980-pro-2tb', 8, 'ACTIVE', 1, '2026-04-17 00:39:05'),
(26, 'Corsair RM850x 80 Plus Gold', 'Nguon Full Modular on dinh', 3500000.00, 6, '2026-04-17 00:39:05', 'corsair-rm850x', 4, 'ACTIVE', 1, '2026-04-17 00:39:05'),
(27, 'EVGA SuperNOVA 750 GT', 'Nguon 750W chat luong cao', 2500000.00, 6, '2026-04-17 00:39:05', 'evga-750-gt', 15, 'ACTIVE', 1, '2026-04-17 00:39:05'),
(28, 'MSI MPG A1000G PCIE5', 'Nguon 1000W ho tro card 40 series', 4800000.00, 6, '2026-04-17 00:39:05', 'msi-mpg-a1000g', 5, 'ACTIVE', 1, '2026-04-17 00:39:05'),
(29, 'NZXT H7 Flow Black', 'Vo case thoang mat toi uu luong gio', 3200000.00, 7, '2026-04-17 00:39:05', 'nzxt-h7-flow-black', 16, 'ACTIVE', 1, '2026-04-17 00:39:05'),
(30, 'Lian Li O11 Dynamic EVO Black', 'Vo case kinh cuong luc sang trong', 4500000.00, 7, '2026-04-17 00:39:05', 'lian-li-o11-dynamic-evo', 17, 'ACTIVE', 1, '2026-04-17 00:39:05'),
(31, 'Intel Core i3-12100F', 'CPU quoc dan tam trung gia re', 2500000.00, 1, '2026-04-17 00:42:36', 'intel-i3-12100f', 1, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(32, 'Intel Core i7-14700K', 'Hieu nang manh me cho creator', 10500000.00, 1, '2026-04-17 00:42:36', 'intel-i7-14700k', 1, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(33, 'AMD Ryzen 7 7800X3D', 'CPU choi game tot nhat the gioi', 10800000.00, 1, '2026-04-17 00:42:36', 'amd-ryzen-7-7800x3d', 2, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(34, 'AMD Ryzen 5 5600', 'CPU AM4 hieu nang tren gia thanh cuc tot', 3500000.00, 1, '2026-04-17 00:42:36', 'amd-ryzen-5-5600', 2, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(35, 'Intel Core i5-12400', 'CPU co tich hop do hoa thich hop van phong', 4200000.00, 1, '2026-04-17 00:42:36', 'intel-i5-12400', 1, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(36, 'AMD Ryzen 9 7900X', 'Suc manh xu ly da nhiem hieu qua', 11500000.00, 1, '2026-04-17 00:42:36', 'amd-ryzen-9-7900x', 2, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(37, 'Intel Core i9-12900K', 'Flagship the he 12 van rat manh', 9500000.00, 1, '2026-04-17 00:42:36', 'intel-i9-12900k', 1, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(38, 'AMD Ryzen 5 8600G', 'APU manh me voi do hoa tich hop xuat sac', 6200000.00, 1, '2026-04-17 00:42:36', 'amd-ryzen-5-8600g', 2, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(39, 'Intel Core i5-13600KF', 'CPU gaming tam trung cao cap', 7800000.00, 1, '2026-04-17 00:42:36', 'intel-i5-13600kf', 1, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(40, 'AMD Ryzen 7 5700X', '8 nhan 16 luong gia re cho AM4', 4800000.00, 1, '2026-04-17 00:42:36', 'amd-ryzen-7-5700x', 2, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(41, 'ASUS ROG MAXIMUS Z790 HERO', 'Mainboard khung long cho Intel 14th', 16500000.00, 2, '2026-04-17 00:42:36', 'asus-z790-hero', 3, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(42, 'MSI MAG B650 TOMAHAWK WIFI', 'Mainboard quoc dan cho AM5', 6200000.00, 2, '2026-04-17 00:42:36', 'msi-b650-tomahawk', 5, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(43, 'Gigabyte A620M S2H', 'Lua chon kinh te cho Ryzen 7000', 2500000.00, 2, '2026-04-17 00:42:36', 'gigabyte-a620m-s2h', 10, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(44, 'ASUS TUF GAMING B760M-PLUS', 'Ben bi va on dinh', 4200000.00, 2, '2026-04-17 00:42:36', 'asus-tuf-b760m-plus', 3, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(45, 'MSI MPG Z790 EDGE WIFI', 'Thiet ke trang sang trong hieu nang cao', 9800000.00, 2, '2026-04-17 00:42:36', 'msi-z790-edge', 5, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(46, 'ASRock B550M Pro4', 'Mainboard AM4 ngon bo re', 2800000.00, 2, '2026-04-17 00:42:36', 'asrock-b550m-pro4', 3, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(47, 'Gigabyte Z790 AORUS ELITE AX', 'Hieu nang on dinh cho dong K', 7500000.00, 2, '2026-04-17 00:42:36', 'gigabyte-z790-aorus-elite', 10, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(48, 'ASUS Prime H610M-K', 'Mainboard gia re co ban', 1900000.00, 2, '2026-04-17 00:42:36', 'asus-prime-h610m-k', 3, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(49, 'MSI B550 GAMING GEN3', 'Lua chon tot cho nang cap AM4', 3100000.00, 2, '2026-04-17 00:42:36', 'msi-b550-gaming-gen3', 5, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(50, 'ROG STRIX X670E-F GAMING WIFI', 'Mainboard cao cap cho AMD Ryzen 7000', 11500000.00, 2, '2026-04-17 00:42:36', 'asus-x670e-f-strix', 3, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(51, 'TeamGroup T-Force Delta RGB 32GB DDR5 6000MHz', 'RAM DDR5 led dep hieu nang cao', 3500000.00, 3, '2026-04-17 00:42:36', 'teamgroup-tforce-32gb-ddr5', 18, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(52, 'Lexar Thor 16GB (2x8GB) DDR4 3200MHz', 'RAM DDR4 gia re ben bi', 950000.00, 3, '2026-04-17 00:42:36', 'lexar-thor-16gb-ddr4', 19, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(53, 'G.Skill Trident Z5 RGB 32GB DDR5 6400MHz', 'Dong RAM cao cap nhat hien nay', 4200000.00, 3, '2026-04-17 00:42:36', 'gskill-trident-z5-32gb-ddr5', 11, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(54, 'Corsair Vengeance RGB 16GB DDR4 3600MHz', 'Led dep va on dinh cho nhieu he thong', 1450000.00, 3, '2026-04-17 00:42:36', 'corsair-vengeance-rgb-16gb-ddr4', 4, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(55, 'Kingston Fury Beast 8GB DDR4 3200MHz', 'RAM co ban cho moi cau hinh', 550000.00, 3, '2026-04-17 00:42:36', 'kingston-fury-beast-8gb-ddr4', 6, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(56, 'TeamGroup Elite 16GB DDR5 4800MHz', 'RAM DDR5 tieu chuan cho van phong', 1800000.00, 3, '2026-04-17 00:42:36', 'teamgroup-elite-16gb-ddr5', 18, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(57, 'G.Skill Ripjaws V 16GB DDR4 3200MHz', 'Hieu nang cao khong led gia re', 1100000.00, 3, '2026-04-17 00:42:36', 'gskill-ripjaws-v-16gb-ddr4', 11, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(58, 'Corsair Dominator Titanium 32GB DDR5 7200MHz', 'Sieu pham RAM toc do cao', 7200000.00, 3, '2026-04-17 00:42:36', 'corsair-dominator-titanium-32gb-ddr5', 4, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(59, 'Lexar Ares RGB 32GB DDR5 6000MHz', 'Thiet ke manh me tan nhiet tot', 3100000.00, 3, '2026-04-17 00:42:36', 'lexar-ares-32gb-ddr5', 19, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(60, 'Crucial Pro 32GB (2x16GB) DDR4 3200MHz', 'RAM on dinh cao cho cong viec', 2100000.00, 3, '2026-04-17 00:42:36', 'crucial-pro-32gb-ddr4', 14, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(61, 'Sapphire PULSE RX 7800 XT 16GB', 'Card do hoa AMD manh me phan khuc 2K', 14500000.00, 4, '2026-04-17 00:42:36', 'sapphire-rx-7800-xt-pulse', 20, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(62, 'ASUS ProArt RTX 4080 SUPER 16GB', 'Card do hoa cho nha thiet ke', 32500000.00, 4, '2026-04-17 00:42:36', 'asus-proart-rtx-4080-super', 3, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(63, 'MSI GeForce RTX 3060 Ventus 2X 12GB', 'Card gaming quoc dan 1080p', 7800000.00, 4, '2026-04-17 00:42:36', 'msi-rtx-3060-ventus', 5, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(64, 'Gigabyte RTX 4070 Ti SUPER Gaming OC', 'Hieu nang gaming 4K nhe nhang', 23500000.00, 4, '2026-04-17 00:42:36', 'gigabyte-rtx-4070-ti-super', 10, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(65, 'PowerColor Hellhound RX 7600 8GB', 'Card AMD gia re choi game 1080p', 7200000.00, 4, '2026-04-17 00:42:36', 'powercolor-rx-7600-hellhound', 25, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(66, 'ASUS ROG Strix RTX 4090 OC Edition', 'Vua cua moi loai Card do hoa', 58000000.00, 4, '2026-04-17 00:42:36', 'asus-rog-strix-rtx-4090', 3, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(67, 'Sapphire NITRO+ RX 7900 XTX 24GB', 'Dinh cao cua card do hoa AMD', 28500000.00, 4, '2026-04-17 00:42:36', 'sapphire-nitro-rx-7900-xtx', 20, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(68, 'MSI GeForce RTX 4060 Ti Gaming X 8GB', 'Phien ban cao cap cua RTX 4060 Ti', 11800000.00, 4, '2026-04-17 00:42:36', 'msi-rtx-4060-ti-gaming-x', 5, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(69, 'Gigabyte Radeon RX 6600 Eagle 8GB', 'Linh kien gaming gia cuc mem', 5500000.00, 4, '2026-04-17 00:42:36', 'gigabyte-rx-6600-eagle', 10, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(70, 'ASUS Dual RTX 4070 SUPER 12GB', 'Card gon gang hieu nang cao', 17800000.00, 4, '2026-04-17 00:42:36', 'asus-dual-rtx-4070-super', 3, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(71, 'Lexar NM790 2TB M.2 PCIe Gen4 x4', 'SSD toc do cao gia tot nhat hien nay', 3500000.00, 5, '2026-04-17 00:42:36', 'lexar-nm790-2tb', 19, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(72, 'Samsung 990 Pro 4TB M.2 NVMe', 'Flagship SSD hieu nang khung khiep', 9500000.00, 5, '2026-04-17 00:42:36', 'samsung-990-pro-4tb', 8, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(73, 'WD Blue 4TB 3.5-inch Internal HDD', 'Kho luu tru du lieu an toan', 2800000.00, 5, '2026-04-17 00:42:36', 'wd-blue-4tb-hdd', 13, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(74, 'Crucial T705 1TB M.2 Gen5 NVMe', 'Sieu toc the he moi PCIe 5.0', 5200000.00, 5, '2026-04-17 00:42:36', 'crucial-t705-1tb-gen5', 14, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(75, 'Kingston NV2 1TB PCIe 4.0 NVMe', 'SSD nang cap laptop va PC hieu qua', 1450000.00, 5, '2026-04-17 00:42:36', 'kingston-nv2-1tb', 6, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(76, 'Seagate IronWolf 8TB NAS Internal HDD', 'Chuyen dung cho NAS va server', 5800000.00, 5, '2026-04-17 00:42:36', 'seagate-ironwolf-8tb', 17, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(77, 'Samsung 870 EVO 1TB 2.5 inch SATA', 'SSD SATA ben bi va on dinh', 2200000.00, 5, '2026-04-17 00:42:36', 'samsung-870-evo-1tb', 8, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(78, 'TeamGroup MP44 2TB PCIe Gen4', 'SSD toc do doc 7400MB/s', 3200000.00, 5, '2026-04-17 00:42:36', 'teamgroup-mp44-2tb', 18, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(79, 'Western Digital Black SN850X 2TB', 'SSD chuyen dung cho game thu', 4500000.00, 5, '2026-04-17 00:42:36', 'wd-black-sn850x-2tb', 13, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(80, 'Crucial MX500 500GB SATA 2.5-inch SSD', 'Giai phap thay the o cung cu hoan hao', 1100000.00, 5, '2026-04-17 00:42:36', 'crucial-mx500-500gb', 14, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(81, 'Deepcool PX1000G 1000W 80 Plus Gold', 'Nguon chuan ATX 3.0 cao cap', 4200000.00, 6, '2026-04-17 00:42:36', 'deepcool-px1000g', 22, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(82, 'Seasonic Focus GX-750 750W 80 Plus Gold', 'Nguon quoc dan on dinh nhat', 2800000.00, 6, '2026-04-17 00:42:36', 'seasonic-focus-gx-750-v2', 12, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(83, 'MSI MPG A850G PCIE5 850W', 'Nguon 80 Plus Gold ATX 3.0', 3600000.00, 6, '2026-04-17 00:42:36', 'msi-mpg-a850g', 5, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(84, 'Corsair RM1200x Shift 80 Plus Gold', 'Nguon cam day canh ben doc dao', 5800000.00, 6, '2026-04-17 00:42:36', 'corsair-rm1200x-shift', 4, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(85, 'Cooler Master MWE 550 Bronze V2', 'Nguon gia re cho cau hinh pho thong', 1200000.00, 6, '2026-04-17 00:42:36', 'cm-mwe-550-bronze', 9, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(86, 'Be Quiet! Straight Power 12 1000W', 'Nguon sieu em ai tu Duc', 4800000.00, 6, '2026-04-17 00:42:36', 'be-quiet-straight-power-12', 24, 'ACTIVE', 1, '2026-04-17 15:25:29'),
(87, 'SilverStone SX750 Platinum SFX', 'Nguon nho gon cho case Mini-ITX', 4500000.00, 6, '2026-04-17 00:42:36', 'silverstone-sx750-sfx', 22, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(88, 'Deepcool PK650D 650W 80 Plus Bronze', 'Lua chon an toan gia re', 1350000.00, 6, '2026-04-17 00:42:36', 'deepcool-pk650d', 22, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(89, 'Seasonic Prime TX-1600 Titanium', 'Nguon khung nhat the gioi', 12500000.00, 6, '2026-04-17 00:42:36', 'seasonic-prime-tx-1600', 12, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(90, 'Corsair CX650 650W 80 Plus Bronze', 'Dong nguon pho bien cua Corsair', 1650000.00, 6, '2026-04-17 00:42:36', 'corsair-cx650', 4, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(91, 'Lian Li O11 Dynamic EVO Black', 'Case be ca quoc dan', 4500000.00, 7, '2026-04-17 00:42:36', 'lian-li-o11d-evo', 23, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(92, 'NZXT H6 Flow Black', 'Thiet ke vat goc lay gio toi uu', 3200000.00, 7, '2026-04-17 00:42:36', 'nzxt-h6-flow-black', 16, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(93, 'Deepcool CH560 Digital', 'Co man hinh hien thi thong so tren case', 2600000.00, 7, '2026-04-17 00:42:36', 'deepcool-ch560-digital', 22, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(94, 'Cooler Master MasterBox TD500 Mesh V2', 'Mat luoi thoang mat led dep', 2200000.00, 7, '2026-04-17 00:42:36', 'cm-td500-mesh-v2', 9, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(95, 'Corsair 5000D Airflow White', 'Case rong rai de lap rap', 4200000.00, 7, '2026-04-17 00:42:36', 'corsair-5000d-airflow-white', 4, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(96, 'Phanteks NV7 Black', 'Case be ca cao cap nhat', 6500000.00, 7, '2026-04-17 00:42:36', 'phanteks-nv7-black', 15, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(97, 'Lian Li Lancool 216 RGB', 'Case airflow tot nhat tam gia', 2500000.00, 7, '2026-04-17 00:42:36', 'lian-li-lancool-216', 23, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(98, 'NZXT H210 Mini-ITX Black', 'Nho gon sang trong', 1900000.00, 7, '2026-04-17 00:42:36', 'nzxt-h210-mini-itx', 16, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(99, 'Be Quiet! Shadow Base 800 DX', 'To lon va hien dai', 3800000.00, 7, '2026-04-17 00:42:36', 'be-quiet-shadow-base-800', 24, 'ACTIVE', 1, '2026-04-17 00:42:36'),
(100, 'Deepcool Matrexx 40 3FS', 'Case mATX gia re kem san 3 fan', 1100000.00, 7, '2026-04-17 00:42:36', 'deepcool-matrexx-40', 22, 'ACTIVE', 1, '2026-04-17 00:42:36');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_skus`
--

CREATE TABLE `product_skus` (
  `id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `stock` int(11) DEFAULT NULL,
  `sku` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'ACTIVE',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `product_skus`
--

INSERT INTO `product_skus` (`id`, `product_id`, `price`, `stock`, `sku`, `image_url`, `status`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 5200000.00, 10, 'INTEL-CORE-I5-14400F', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcT5aAU9yh4Eegr-bvP-qKublke2qmS7HmtbVTcHa0xGORLTffc1OtqkxuWJBxqZEaKOO6e3yDBw-k-8sM3ahFqFtK8TdtFdwR2w8UbzeqGUX5qQkd7VZKA68iyUE9epZLPANLHvng&usqp=CAc', 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-04-17 14:54:44'),
(2, 2, 5600000.00, 8, 'AMD-RYZEN-5-7600', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRYut_9-jI7l3oS7KOfzB7bRGoch1vuHK0LEL6mnK68pD3L1PS-aP0NER5g3IZop8_qJtyfjDywdG2renvZCiuKViBIovaUDCLD1hdtNuM8xfYg2DXZpaixRh_Z-6Gdk_ZGl4_HJg&usqp=CAc', 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-04-17 14:54:44'),
(3, 3, 3900000.00, 9, 'ASUS-PRIME-B760M-A-WIFI-DDR5', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRvHgOYrmtkQ0w4l478qo6IaA1sBzCGwl_aRQH-XVG3iw3FBQve54fCJB9aFmuY0VmwacFcgKEO-272kDUfSske27Sz_St6zwbb3wZlLDVTolwg36JRwoYUiIlX&usqp=CAc', 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-04-17 14:54:44'),
(4, 4, 4100000.00, 7, 'MSI-PRO-B650M-A-WIFI', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQWjzULXvP1akiVOL-HFB1cRON1TORVkYguKMkCNBbDG1vtg0iANKcrSVfJ6s18zvliNWBlHBsYy1HxPRM0FGKkXbMtoB3iIWnZslPam3Al9rj87xiJxZzBHBvpJwDNVXYsyBY7hCefelM&usqp=CAc', 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-04-17 14:54:44'),
(5, 5, 1800000.00, 20, 'CORSAIR-VENGEANCE-16GB-DDR5-5600', 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lsusszzb6abo43.webp', 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-04-17 14:54:44'),
(6, 6, 1200000.00, 20, 'KINGSTON-FURY-16GB-DDR4-3200', 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-llefjmnirutkd1.webp', 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-04-17 14:54:44'),
(7, 7, 8900000.00, 5, 'NVIDIA-RTX-4060-8GB', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQMsmLQDat_DcNkxe98u4rM-V2fauMu4c5oW4kgisByfswZ694OBzU3_iEoY24-60STi4BfPF8LJPNXSgxqVZBuwmzFPIRK8vDIeMShc1xw1ebhLH3vdJao13r34lc1F9bs34RgtA&usqp=CAc', 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-04-17 14:54:44'),
(8, 8, 2100000.00, 15, 'SAMSUNG-990-EVO-1TB', 'https://lagihitech.vn/wp-content/uploads/2024/01/SSD-Samsung-990-EVO-1TB-hinh-1.jpg', 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-04-17 14:54:44'),
(9, 9, 1600000.00, 12, 'COOLER-MASTER-MWE-650-BRONZE-V2', 'https://tinhocanhphat.vn/media/product/24973_01.png', 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-04-17 14:54:44'),
(10, 10, 1300000.00, 10, 'COOLER-MASTER-CMP-520', 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lvcs8nikbvrhad.webp', 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-04-17 14:54:44'),
(11, 11, 11500000.00, 20, 'INTEL-CORE-I7-14700K', 'https://file.hstatic.net/200000722513/file/gearvn-intel-core-i7-14700k-1_d24daeec3cd347ee96562ba5fca0fb19.png', 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 15:05:04'),
(12, 12, 10800000.00, 20, 'AMD-RYZEN-7-7800X3D', 'https://file.hstatic.net/1000026716/file/gearvn-amd-ryzen-7-7800x3d-1_96018b5670d54947b499e569bf86da79_grande.jpg', 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 15:07:15'),
(13, 13, 2200000.00, 20, 'INTEL-CORE-I3-12100F', 'https://product.hstatic.net/200000420363/product/tai_xuong_52d67a3fdbfe4c92a80f7e1e2070a911_grande.jpg', 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 15:12:07'),
(14, 14, 13200000.00, 20, 'ASUS-ROG-STRIX-Z790-E', 'https://dlcdnwebimgs.asus.com/files/media/9A827026-9AD2-4CE7-9958-DB583A2DB6F8/v1/img/kv/ROG-Strix-Z790-E-Gaming.png', 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 15:08:35'),
(15, 15, 6500000.00, 20, 'GIGABYTE-B650-AORUS-ELITE-AX', 'https://www.gigabyte.com/FileUpload/Global/KeyFeature/2192/innergigabyteimages/specsmall01.jpg', 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 15:08:35'),
(16, 16, 4200000.00, 20, 'MSI-MAG-B660M-MORTAR-DDR4', 'https://storage-asset.msi.com/global/picture/image/feature/mb/B660M/mortar-wifi-ddr4/b660m-mortar-wifi-ddr4-board01.png', 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 15:08:35'),
(17, 17, 3800000.00, 20, 'GSKILL-TRIDENT-Z5-32GB-DDR5', 'https://bizweb.dktcdn.net/100/329/122/files/1903291748480.jpg?v=1639638727174', 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 15:08:35'),
(18, 18, 1100000.00, 20, 'CORSAIR-VENGEANCE-LPX-16GB-DDR4', 'https://bizweb.dktcdn.net/100/329/122/files/corsair-ddr4-2400-13.jpg?v=1574046487313', 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 15:08:35'),
(19, 19, 3500000.00, 20, 'TEAMGROUP-T-FORCE-DELTA-32GB-DDR5', 'https://nguyencongpc.vn/media/product/250-27471-ram-teamgroup-delta-rgb-32gb-6000mhz-1.jpg', 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 15:08:35'),
(20, 20, 17900000.00, 20, 'NVIDIA-RTX-4070-SUPER', 'https://storage-asset.msi.com/global/picture/image/feature/vga/NVIDIA/RTX-4070-VENTUS/2X-E-12G-OC/images/msi-rtx4070-ventus-2x-e-12g-kv-pc.png', 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 15:08:35'),
(21, 21, 14500000.00, 20, 'AMD-RADEON-RX-7800-XT', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcS3SJwX7YjjxBGI1iXXffg-IZTILby80y8xfI5z3VvY6WbcQop5_PTeAn6I_nZQqb6sAgrohTHLkukSHcxusHwGJtg6vC-HU6vnXwcs72QfascC0bWgyqcBLrCJPYMyELeGgq7MMw&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-20 13:06:16'),
(22, 22, 55000000.00, 20, 'NVIDIA-RTX-4090-24GB', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcS13h4HFI3pyPCzrGwU7t90quZ7bfIHN4DX0fJGGXXyPXsZ8im3Im0G1G-wkfDDWzfoNcIvf21GWKzXSesDWI0bxJN9zqO01PAKJ9T_9tNVmnuUXDxwnq0Er6Q7jvzFdgDE-g9KWU4&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-20 13:06:43'),
(23, 23, 2800000.00, 20, 'WD-BLACK-SN850X-1TB', 'https://i.ebayimg.com/images/g/7D0AAeSwXDtoGvEb/s-l1600.webp', 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-20 13:40:57'),
(24, 24, 3200000.00, 20, 'CRUCIAL-P3-PLUS-2TB', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQIL7YojCK5_u4pCFAzJdwjFsjJyHFiNJJrrq5-V3o8uitlqgLW6TqKUe1W9rzNq3WvPdf30L2Yr3GSThADYLFnYoL-geVwN8DUr7dZgzkuAwxCIQISc53iXI8&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-20 13:10:28'),
(25, 25, 4500000.00, 20, 'SAMSUNG-980-PRO-2TB', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQobouvYoCcYN2OXJdVXOini2mTF98V9hnNs1bUNHjgbDktodCwJ03RcLr06e20Wo2ZmjeUEvjOxUbg1qTFuDqzaA1FNQak5qWWjrLlp6XUiu0htqrFCvVWz4m0OGChZm7DSw_sulusWw&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-20 13:10:48'),
(26, 26, 3500000.00, 20, 'CORSAIR-RM850X', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRy66kjhg3xjPqQtU7sqY3PkJYTuN7bbkEdmxOstYOqHzORpcbyVJMq0fp37IGeKEYB7ZVMw9WA5WXNvHv2AY_PUVcnyZQIWm93VeAMy_5F79N69uEkwq_X0Q&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-20 13:11:06'),
(27, 27, 2500000.00, 20, 'EVGA-750-GT', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRO2MpoEMM0aY9u9hXBmXpN3_hrvt5h8EmuND_4b9i_MfnxFxw09mCwhQ9NIbxcbu87eZFTb5wymwA4NE46vc0KeTrdkqRYxTi0BGJXdlopR5PvFa_gfOJQSnLDeogszm1eBa0k9a9fpQ&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-20 13:11:22'),
(28, 28, 4800000.00, 20, 'MSI-MPG-A1000G', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRPKrSbqQQa1gbbpsPLi6wu9d9t4_XACtHRkgybuhNbm4lAH_Y4ulDAfxDIDgZceb347u9GXIb1VKshAe5Y9y-OWSUdGWJxtw7ubZ41JS0XdzsAMYRk_UZBaw&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-20 13:11:37'),
(29, 29, 3200000.00, 20, 'NZXT-H7-FLOW-BLACK', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcROPhGJzGgEWnThVjxzZoHL0Bnti9B5RSObIod7gCZkAtSY5FhSNX0WzJIt38XWOSj4FKvIiLgPDnFttuiTpx2YSMN1oWaM6w8UZuq1GhyhYYLShVJjp9dt85OJ2kULePVjQgg6MWc&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-20 13:05:15'),
(30, 30, 4500000.00, 20, 'LIAN-LI-O11-DYNAMIC-EVO', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRvFuNm7Qk3qTQbjbEW9FsOWJ7maLMKKIeZLiiKCgJ_T8fMe8InlxrNJm3-jkgeFdLd06vcgzUAA4DMKDGQ7yy28jHd5UdtRnbc9Nhin3RN_9_0WSVWVfOrLYb7NMoHcLocGYSOQWha9w&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-20 13:04:07'),
(31, 31, 2500000.00, 50, 'INTEL-I3-12100F', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQowp_Se9wuF-8M7F1BA-baacS7DT2da8jl-dvq46f0O1Xgnz0ZH7LEEA4zVObnnf0bu6JtMHYc8VLM8D4xiz5u6aAFZ_fsTL5Sc1Lhc2w827lIVCys2oMu8Q&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:11:59'),
(32, 32, 10500000.00, 30, 'INTEL-I7-14700K', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQHvLVr6o9opuLPwoy9l_I8DPHSQRVxVedN6m8Fk-hxf-F1BfZUo3C9hct4PTUpWfKZfOmqMYExczhbIIFa1xYMZkJz-GosI7XDULzLJoONoHrRqkmsc1ghp4PtZb7t30Cuj_wLGw&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:12:17'),
(33, 33, 10800000.00, 20, 'AMD-RYZEN-7-7800X3D', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSYEUkTeomN9iL5AVsCJbwghu-028FGVqNt3WYWfLJg1kmkBEdlVLxIcZiOhIa4uqG3uxtLRRWVT8de6aG0QutLV-dDTAJa4knKc72aCeUmGpln59f0gY5WJuCcr4xwEy6T4NUBHJA&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:12:37'),
(34, 34, 3500000.00, 100, 'AMD-RYZEN-5-5600', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcS5jCG1XzGDgYRSKcEXrEFfGAopKus_Z03QgP_jnMQGNG_T7xtxhlLqjRyFcfB9QyfIu43vdB-HQ24DRE8ZqC2djpO5P036-89sTVv0d3IuAg4Q5m4nW7u078swAwr2o64yFjm9_WM&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:13:08'),
(35, 35, 4200000.00, 80, 'INTEL-I5-12400', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSpyt1NQU_wTUqmjZF5gCw4ExNEQ0ER-E3c7w_q4N16IcVpENdGGkj1j8HIDppLsxv3-V7OJpopvuWH6H_3_5xlQosXA7GSlNUaS3618SPUQOwsJhOXEIm828z3QyzxKMg684U6ms-fdw&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:13:27'),
(36, 36, 11500000.00, 15, 'AMD-RYZEN-9-7900X', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMQEhUSEhIVFhUXGBcYGBgXGB0WGhYaHRgfFxsaFxcYHSkgGholGxcYITEhJSkrLi4wGCAzODMtNygtLisBCgoKDg0OGBAQGi0dHx0rKy0tKy0rKy0tLS0rLSstLS0tLS0tLS0tLS0tLS0tLTctLS0tKzctLS0rKzc3KystLf/AABEIANoA6AMBIgACEQEDEQH/', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:40:53'),
(37, 37, 9500000.00, 10, 'INTEL-I9-12900K', 'https://product.hstatic.net/1000333506/product/5ymkn5sxqvzzwvphztavw4_eb148b28b4254761af818fe0264dd15a.jpg', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:15:08'),
(38, 38, 6200000.00, 40, 'AMD-RYZEN-5-8600G', 'https://maytinhlmc.vn/wp-content/uploads/proc-amd-am5-ryzen-r5-8600-2_640x640fill_ffffff.jpg', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:15:38'),
(39, 39, 7800000.00, 25, 'INTEL-I5-13600KF', 'https://product.hstatic.net/1000333506/product/tai_xuong__9__476aabb4c7d345c393dca77762c78c67_grande.jpg', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:16:11'),
(40, 40, 4800000.00, 45, 'AMD-RYZEN-7-5700X', 'https://cdn.hstatic.net/products/1000333506/untitled_0c6e64b67fa14ce7b7166ee66c04ed7d_grande.png', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:16:46'),
(41, 41, 16500000.00, 10, 'ASUS-Z790-HERO', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTOKe67Pgmo2gbA01ulISSi-QP0Ndsb4BNtqLU1zh-qISSviHS_iO4RCLVVHzSGI_Qv2sempGLO5P5C_0bQunjQdwqX-SMN8MLKfVxoHP4v8Aezf6LqDp4w5GqaRvi3djro599nFjQV0Ps&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:17:13'),
(42, 42, 6200000.00, 35, 'MSI-B650-TOMAHAWK', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRtreB1AfGTGnwtsxZ_ZMF9czYAr1AeMmDgZ0vf37_lBQQA1C3hgRWggY8QJfmmJS6xAfRlu4kf1gxHD0iO5ia4oCAkgVhUdEWqPySbkJOObzsTKr26BFMrGhUTOR0MIBggMjMMmuDBrcE&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:17:49'),
(43, 43, 2500000.00, 60, 'GIGABYTE-A620M-S2H', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSjqnoYTqbEJCwMktDMGIJ_wj9XXbp5lADlIW22TM84anXQl-_47gc1eDGFuNYeI2INwxHPC5RKW9bTwCDcUzjaOjZXIT262FTdygWJ9oa9vw1higNfjzR1xXAkmOXDVzIPE45jQ6BBDg&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:18:26'),
(44, 44, 4200000.00, 40, 'ASUS-TUF-B760M-PLUS', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSz5jtdgw0Jt6tt4vPBIBooi2JMZufILQQeu-QxXoLNjVmA-9nOE0598sZ2av9h_E3gDD2y44AHwPt1dIEANYBFIhugu0ACtkP33JtsGX2qDKpzJUMvw45fagWXg1kmN4gGFzmHoaXEHQ&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:18:45'),
(45, 45, 9800000.00, 15, 'MSI-Z790-EDGE', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSnK-HiYfIGg6lhs_0o4xnTXyHgLKuNtWyoZ2uTkfns7owDoJHbMsXQi6xms8HUrEmNReixCjQ5gR-_THVU0N2NT7VN_v2wBpyA_SvfeIMlARk4EnTkmpWKP6BGVljL9eXrWWL8KG4&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:19:11'),
(46, 46, 2800000.00, 50, 'ASROCK-B550M-PRO4', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQamLekWpRF4Qm12mGF4NrF0T0tgz0dsO6iM9PHcAhSt7-3rwqSTQkbxvm6r0xWaeleiQnQQLiYSTRalsPF6KL1laDErDwFpdi14IrVaLNgY1YoDsYVSxTQ5dWw3-mzUabvxxxmhr1kdQ&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:19:28'),
(47, 47, 7500000.00, 20, 'GIGABYTE-Z790-AORUS-ELITE', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRRhF5iAaNx4hxfmaMPR8Lb760kIT5rzH0kf9A8xbcG5LZbioIZImu6oYuCfOSAwXYyOCSstD7mS68JungleMYJwyWrjRXxuF9h5QOcoIjv_jxWY97imo7vrcT9RegsFxJvS9_1DVVsQlE&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:20:00'),
(48, 48, 1900000.00, 100, 'ASUS-PRIME-H610M-K', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSuKO98w517XFZ14KdI2Vy__gCKw-gcDgI5Q48KB2DRQC7lcIymhvIWGJgPNkk4YZFrp_0YAgtT2NfHtC1IEObYXuB80Lvh4On2NBtNT0ON&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:20:18'),
(49, 49, 3100000.00, 30, 'MSI-B550-GAMING-GEN3', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRKPqDYLWzEag8vTtMm5xL3Me7b3IchBWxdYb_wrtP-gR5eFeANXZsPCwVT1CWCk1hbrPjDHTGVTzypUCnROjdEUOVy7J2X1VScFUOFvJjRpAhgsalbwcuhmgtCjTgLGh4OjGfH-Kto&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:20:58'),
(50, 50, 11500000.00, 12, 'ASUS-X670E-F-STRIX', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSi3rqMon_JaUsNYO0ykJ5USBnvt1-t2YEFASB36pTKu-vhL_QNJjggK0Mh4jQGC0HG9NJPGXPPGQxs4Chqi9dyYY_Ejd3x7T3YnE3hr3Y-wyjJnZao1dsjkWWdwteMJ0PKH4fKRw&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:21:14'),
(51, 51, 3500000.00, 40, 'TEAMGROUP-TFORCE-32GB-DDR5', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSICFaUafIs9sEYqTmOB5Rz8oYVIOKuwjPvbJ2nH3B1vUnuxbAI-koR70YTGGAtObdE7QR3T1LlIBePEmkeedEjuuSYFxpM00cxjKL1UxHh6eylgBPyJWnA2-gEMuWTw42vRwb0uT-iow&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:21:35'),
(52, 52, 950000.00, 120, 'LEXAR-THOR-16GB-DDR4', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSu6z_vNTl01posICPCY64LqN7Wn9IvlUQSt8_bh5DRPXHvWl18irlOl-CXHfO1x7XpSc5BQH4mzy9nKt4XoPPoYyRX59uDF4CQWAJP-3ht&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:21:52'),
(53, 53, 4200000.00, 25, 'GSKILL-TRIDENT-Z5-32GB-DDR5', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQexaUtdSpJ-WDmUx1BE0NXbz_EyR8SSVNxBQtT5wu0GeXCyDwCUDCAvks2eGL0DU_H7fzalP16WBISbqLI8TEAgmFIqnkje7KIHDiH_XmG6tP0xFrw3DmvY5zJAuCWuCjS55-OSQ0KOJk&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:22:08'),
(54, 54, 1450000.00, 70, 'CORSAIR-VENGEANCE-RGB-16GB-DDR4', 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mhw25fe4r6yp37.webp', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:22:51'),
(55, 55, 550000.00, 200, 'KINGSTON-FURY-BEAST-8GB-DDR4', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcThw5qlttEEd6GiFPSDZ0JYFxcz4lRVg8KyX3KWS54ZkdzY51H08Lndr-EjbVnoMMoXpnXhnV0BYVhYfqyqhYwwbu2mn87pUHvzHF3OFRhFIcm4wu6b3jwGywEQSzQ-coq4VxOLevc&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:23:06'),
(56, 56, 1800000.00, 50, 'TEAMGROUP-ELITE-16GB-DDR5', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQArRKn1tYYnbf8I11W8Q_9_6Q9oEq3YxxvANM5RPLUuCn1iBAVymMlgZf3A4a3ZU5f939BLMxB02RvFEQ6tnvjxJ1tUWdwG6r76xGDrTD07egTm_3qMSHzvCDDh5NV1A&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:23:20'),
(57, 57, 1100000.00, 85, 'GSKILL-RIPJAWS-V-16GB-DDR4', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQ9QI49mIB3nlYxM0WVQ2NJmtDGMxXT9jfRC3DvxxaE0Gd2y4lP7jaIoKy0W1xW54GDQ_i1f-Hu4mjNm3e2sHwG8Nj1pKWw2rVwg50v3LF_yf-y3LmuG7kn2-hHGcqaFClxLUmXVWspiNM&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:23:50'),
(58, 58, 7200000.00, 10, 'CORSAIR-DOMINATOR-TITANIUM-32GB-DDR5', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRPTc6A9STlFgRu-3QTUoKWYFjDer6fORw9Mep4udKu3qx2vI_N-vQ0IpR1yDlMcQBRAgrPe41ZmFCF8zjt6_CzxS4OgvcW3FwDM1GGUXyzIXkYtdnxpV3xGYpa8A&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:24:07'),
(59, 59, 3100000.00, 30, 'LEXAR-ARES-32GB-DDR5', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSSXmvFo1DjHstrUAKlvFvo5Z36qNdD-nja7c61B8Vfv1AJyAZ_nLuauuSnDsvuh5BjB8sWvY-ht-EdIq33xHmN1-BpJu8S9YmQstdism7pmPftsepa9Odo&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:24:56'),
(60, 60, 2100000.00, 45, 'CRUCIAL-PRO-32GB-DDR4', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRBnAiRuv8rhjG3JWWvsYe0gx3rGlEVwzBUat260QoJait9Os4kySA9iSYZMGhOKo3jgoH9FbL6FdfcD1MGQS1ZlKNiIG0poEgNFpMG2WELhKaAKAJFPeNL4aoMGen87XM_VgDu1BE&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:25:18'),
(61, 61, 14500000.00, 15, 'SAPPHIRE-RX-7800-XT-PULSE', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRMcZg_QmbnBPT6oNjQs9__a5RwzK6fGIJT735rUB6eLAs5lN0LqndfQBe_a9pZkaG9jqmOhsZeuWZgN0EX_W97mrRXMlaJsSxQHCen_xWE_E0UeMktPhPcesQ9aJEF_ce27gVnxA&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:25:38'),
(62, 62, 32500000.00, 8, 'ASUS-PROART-RTX-4080-SUPER', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSmDpNJQObisoIBEthmu09HusWsz_-XO4Xn0MJT-jWE341Om493CMd8oSMN2WrZ08J0jrx-tWyv-4AnahFLiOGQ0fm2zGitHImuk59K_9CZyJ4TCpcLZAyK9dQYn7jbSAORNVDjgJzX&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:25:58'),
(63, 63, 7800000.00, 25, 'MSI-RTX-3060-VENTUS', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRhO85IySIrjYs0nzRkMEaexP72WqsL9HmSVcVDHvqt_wSn5AKneCjyITyUOYIW-x9ti9mJ-gPwBx98d1YhfB3z6U-flErJLqfbfe5FltfpOEdukRkOz415f37MRs00EjSfobwxdZPvLJI&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:26:19'),
(64, 64, 23500000.00, 12, 'GIGABYTE-RTX-4070-TI-SUPER', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcThMWhGcoW14PqdXsBp4rmyfLKOoFQs70h6grE9wk09LUgxzqn-0whUVzh30ejn-oSjwSIsEq23pUh7n1PG8MiCxjGOM7i0031FZz0M1_23Yu3VYbrLeDhTyeaw7A_oGG1IwpX1jmLtzg&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:26:44'),
(65, 65, 7200000.00, 20, 'POWERCOLOR-RX-7600-HELLHOUND', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRiHbcUKNM003SXJg-t5Foz10vkaWedVOYmwSPxhq6Sy7UKMvgHQAxvAgn2wwVFkxYlOz-F2jK29u9TQ_AuEUoc1Yz8fdvdxHoDNQTtnXlWEYqU87qI2C3M4re4sk93wwC0Z4R2rFD9Hw&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:27:00'),
(66, 66, 58000000.00, 5, 'ASUS-ROG-STRIX-RTX-4090', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTbczoyb3545bQNcrBhejf9Mu52v2dIG3W_Vvtz2_Ubg_PuByQjDaMSeKz4Xpu6n_dNp8habh24g3i-fa9RD2WN6XSBaH_BmXeSyFFjjDUViR6GpFrH9wE5-vg-G8xArI_BdBDC0g&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:27:16'),
(67, 67, 28500000.00, 10, 'SAPPHIRE-NITRO-RX-7900-XTX', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQ7HAjHf2Lj8sX81J-d4MtV36lOyuVVNO_cM3NQJx1_KERBIKYQ5urxNex1bDrLoHW4vq46KW3EUrPrQKA33fD6Zs7xWoRXR6KQlzxnT1aRbCf0HYD_QogtyfSp-MYAlPTfofGX8oC2pc4&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:27:37'),
(68, 68, 11800000.00, 18, 'MSI-RTX-4060-TI-GAMING-X', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRmT6JhDpe-63oYjYdsjmfnAz8ONm0mUnlujgPcDWYQNVMQeNyt3EqdFFDmrUCSgn7c-EXQelEFMTSbWfCgNenqEHdnEsjQSxVnIHGSMH63Y2F0EbHHvvswpZQpX-pXLxSgj9AF2g&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:27:54'),
(69, 69, 5500000.00, 30, 'GIGABYTE-RX-6600-EAGLE', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTymaLBIP04ow1-AbZxWnBRlVNOln06xjamaCc0AUJUiOiRPa60bz29k4VBmaIcPOisbXQmz7-fB8dlcr7B-BCDrJndZvnhDrewvQGckOTp_JtLFgMju3K7cctMJYBdofXFY1oCV3Xqwg&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:28:14'),
(70, 70, 17800000.00, 15, 'ASUS-DUAL-RTX-4070-SUPER', 'https://i.ebayimg.com/images/g/s4AAAeSwr09pAcAl/s-l1600.webp', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:28:59'),
(71, 71, 3500000.00, 60, 'LEXAR-NM790-2TB', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSwAe8k8A647GXHMfWoTDP1WLIPFvPEm8HnkQEHi2u1HCZLi0N_HiCjrc_qgh-8CxhfEUbOkJ_jvciD1ooPJHXdZeP5vHj3z1sXcnOPRjjpYTsNUTjs7-fM9bk&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:29:29'),
(72, 72, 9500000.00, 20, 'SAMSUNG-990-PRO-4TB', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQobouvYoCcYN2OXJdVXOini2mTF98V9hnNs1bUNHjgbDktodCwJ03RcLr06e20Wo2ZmjeUEvjOxUbg1qTFuDqzaA1FNQak5qWWjrLlp6XUiu0htqrFCvVWz4m0OGChZm7DSw_sulusWw&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:29:49'),
(73, 73, 2800000.00, 100, 'WD-BLUE-4TB-HDD', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSAaNBCbuLdBmWIY3rnitqyrKArZrr1FdxBlFBwqQ0EMS2jQQCddlvfLQQxbtORF8156G_phHX2FnGf2dSC5e1vgsTo-tVc0FNfYXLg6CFAe45ztqJHnVRYHWLrk79CJoPFwiik8pGq&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:30:07'),
(74, 74, 5200000.00, 15, 'CRUCIAL-T705-1TB-GEN5', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSs362pdAdp82e7dUJHiF8UVlh67D2ph1LkHVJzst2nEhoX4d4T5uhnW-bxwQrP7pmN57chwL5t7dgGItgBcl6fK_5PJZiPf-7ADp9QAswjeowtCG1O3OEbfp2bFJnGT8Lo4DpK9g&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:30:28'),
(75, 75, 1450000.00, 150, 'KINGSTON-NV2-1TB', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQEvMrYcTFQKjDCqizXYPn3bSd7OqAfyR1yyqjWCEZ1fj4RRtvunKOWJo5yKFWVrfnlJzzAVhTyg79Y_ziRIvFXVRDrDYWTIsFay1xq2lFptsU4whGuZkxnE5a6koI2UaWz8ZG62LYp&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:30:49'),
(76, 76, 580000.00, 40, 'SEAGATE-IRONWOLF-8TB', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSkblmKTriJuS0L0AHi74BNOLwluAsMQNOk1YqLybpmqiF0H-sLoGXnJBGpqf8mzQ6gf71udgQAhem1e8GAzE_gXLmF9LwjAhz3i09KtmkmRiOcatR5uwKjIKSP13hSYu6fnakSmhs&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:31:05'),
(77, 77, 2200000.00, 80, 'SAMSUNG-870-EVO-1TB', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSTjEVBRTZOwI_L5ci2NWRqW_dmFRfOC--N9NY9UtQUWtb-GM4N-QEYT6ouVliJT5Aneyq96ZgC16NopEZkg8YiIjwbzQU6bFjKdAssOnnoufM7zY3LMGo30F9urLcbQAxm5pwixWhsIg&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:31:27'),
(78, 78, 3200000.00, 50, 'TEAMGROUP-MP44-2TB', 'https://images.teamgroupinc.com/products/ssd/m2/mp44/2tb_01.jpg', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:32:25'),
(79, 79, 4500000.00, 35, 'WD-BLACK-SN850X-2TB', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRyPtwA_9S03F2zRQvFDEF7e30EALgZvYLhROWCLB8bSaoe75zcqsehfiCwqtvwGiAJ3H-6H_eDahaa3zxSljyUOyaLxgT5id9C8eurHm_-ETiDE_z1Fm0uwG7hMe1WmAclWSN__JmhC3Y&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:32:49'),
(80, 80, 1100000.00, 90, 'CRUCIAL-MX500-500GB', 'https://songphuong.vn/Content/uploads/2020/06/3_CT500MX500SSD1_crucial_songphuong.vn_.jpg', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:34:05'),
(81, 81, 4200000.00, 25, 'DEEPCOOL-PX1000G', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSwnHIBLXfoMViNAc3_GI1nJeCUYgY38ksTcOCSCHqKUYVRPqP57tSZUxGfQ0kK1BrHQvCfyTQFekGVHkcLYYl4FM9IKE025Z6vcYlzHgyHWZRS0p9HaA3EBcZE4o1WnM7hywbWAQ8&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:34:26'),
(82, 82, 2800000.00, 40, 'SEASONIC-FOCUS-GX-750-V2', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQiUgxyFbGFICRjVd3Ljf7Mye24AwwCYrfQWE5wQy0ieCc-QmV2T1IJJF4o-H0wvc9vt-yG2uZVGxNX9I_nGdWhUqDBVK3hnI75JSuiLuf_rwbd_tGCJ2Q3cpXUcpW44s81KB82iQ&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:34:54'),
(83, 83, 3600000.00, 30, 'MSI-MPG-A850G', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSVianjr2T53MgrKFk07YKGDs0T2XfVONcger4orrfErhPWW1t9aKi2H_N-bWuZECMHjhnFg9Zxh1AF7j35cT0pyL4yGMgm9u1zpzcYQ_Y5acGptXNIfmbtNsbe9JiiW7rHZ9-ZXY5b2g&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:35:34'),
(84, 84, 5800000.00, 15, 'CORSAIR-RM1200X-SHIFT', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTycivVqA6QuPt0ntg-q8_PviR3OHu0CWk90z_UreYaNAtK2PHfPzsCzQqnAmF42eYEpJ7Y2kfnuTSbKSbHoL8X-88cgr5ikOP32icmoAY8HZTq2MG6bpjGB45lQoWTa9UwsF3R271E&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-20 13:02:28'),
(85, 85, 1200000.00, 100, 'CM-MWE-550-BRONZE', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRjU4I6hIetoDlo4C2wlcQQCJl8CV_if1KirD_TQ3rFtSlaP2zPlxD-2ESv2pQ699JDc55dcSCP-DSAU_fhNLQintttgMMY63hUpHusRX7AnF2M7k1UgRuBPo_Kkss1woAWJ-5JIYo&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-17 15:26:22'),
(86, 86, 4800000.00, 10, 'BE-QUIET-STRAIGHT-POWER-12', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQMmS55ngO0tuJ1xcE4QoSeD-22-1LLBY5NAJFQn3sg16TWzScfr0wM1unMbRlxsFf7sziQHvmySVwcZ0jf5x2gI3MtOlM1pUlNwo5HdBUFmb7EX6DZLwpYQDOLEs12BsbZHJHSyXU&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-17 15:25:49'),
(87, 87, 4500000.00, 20, 'SILVERSTONE-SX750-SFX', 'https://www.silverstonetek.com/upload/images/products/sx750-pt/sx750-pt-package-1.jpg', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-17 15:22:50'),
(88, 88, 1350000.00, 60, 'DEEPCOOL-PK650D', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTGFdLkfw_7T84jHAY5v4NbiACEjOPfZK_CAFI_E1bUUnP95o9VXbfT_2054-yIwOKenhnq0FQS-1GYqShvti6lDHHJA_nxjPWRGuPlHpfl24WRKQIr9AGawonfaLB0-GZcAbQKFYU&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-17 15:21:08'),
(89, 89, 12500000.00, 5, 'SEASONIC-PRIME-TX-1600', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRzHzS71pRSaK1SWHFNej0RnS61prrh6S67t5SIDkSAZ6JJ9WGXiGIbC3tzsKhVftHd7ssfSx-0o7f0HiYA4v_47OkCaWolQ7Ze4ToCTgg9mpPzcSQ7lvQ7Lg0dWjNO0_i24kqG_g&usqp=CAcv', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-17 15:20:35'),
(90, 90, 1650000.00, 55, 'CORSAIR-CX650', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQ1eflwUoSHM1GaX24NLwexaDNsPFxVHMGsgWFCg7PcscqFtuQBeHJC4ACq_xNmF7ZHQCs0D7BCWNaJ0Y3budRRX0UxTQD8efVx72fyTrgAWqMWlSf7KaNLacNdKUUMk5cREkNcIw&usqp=CAcv', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-17 15:20:14'),
(91, 91, 4500000.00, 20, 'LIAN-LI-O11D-EVO', 'https://hanoicomputercdn.com/media/product/80645__lian_li_o11_dynamic_evo_rgb_black___o11dergbx__2_.jpg', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-17 15:19:49'),
(92, 92, 3200000.00, 30, 'NZXT-H6-FLOW-BLACK', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQOemXIO5ZVj3ihoUyB6QBjoFHw7_vuf_XAZ_aobbtDqxuSn0LanA9qhFbIv9cixNiud3vIGZynqDCVX-6qWLtjF_cr0bRWQ5OEyVX4vqHbVd5crNntSi5mkhpW8XviJCHd-UC4iSo&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-17 15:18:57'),
(93, 93, 2600000.00, 15, 'DEEPCOOL-CH560-DIGITAL', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTKvd_Oj6_J9pJpl5VU81slUw2pK3b6lUZoGuG1nhNuLIhU7fdZyAIkRBKX445bpt3aPjyO7XWXk_HmS0iLem3CrdhdqS7Zk5jIRlfuXH7_RxOill7GOV0IRiO0D1Nb17fYxZgucg&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-17 15:18:23'),
(94, 94, 2200000.00, 40, 'CM-TD500-MESH-V2', 'https://product.hstatic.net/200000722513/product/td500-mesh-v2-chun-li-gallery-02-image_2521a359d8954a79992edcf6a997d718_master.png', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-17 15:18:03'),
(95, 95, 4200000.00, 12, 'CORSAIR-5000D-AIRFLOW-WHITE', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSxhN6Jd3MjuC-t-rET4ii9BryOknU5qukZ4HAhY0QVkcjVjYVEG6Mz_jh6X-Ja11YDekLJOznlc-DXxHc_2vwF9HxS5eudLbHFZ2om6-CDmJ7KHVopcllQWE8KOA&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-17 15:16:55'),
(96, 96, 6500000.00, 8, 'PHANTEKS-NV7-BLACK', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQ83lxFpRUSmdA_qjDAKu0JxZsaDzeGOppXYUvD23aHis7GpbfYZouZW9tMTug6iURsMec7mRJhASSTNvCe0Gzwvghgoccvpk37V-GtNjDnnXtLnAxTMqSLi3yt_rA9cx_LE0EI1HY&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-17 15:16:32'),
(97, 97, 2500000.00, 25, 'LIAN-LI-LANCOOL-216', 'https://product.hstatic.net/1000333506/product/z5546498333532_af92ffbc74e4377a14e7f37df6da392e_1fc93ed66b2649e38e7e2491924fb19f_grande.jpg', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-17 15:15:55'),
(98, 98, 1900000.00, 15, 'NZXT-H210-MINI-ITX', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTHQ11d-AEBXvnzULLR4-HgnUXf_COQdzcWlLQpKiAvg5yFdCzMnEabhosd6V-hGhqZ-IukGkGUx-9t0Tr9mVVCz9Rd4eHXQvWPGv32ONoa7yNR5LBdFYSh-IV0xvWaq9cPTHPQng&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-17 15:15:24'),
(99, 99, 3800000.00, 10, 'BE-QUIET-SHADOW-BASE-800', 'https://m.media-amazon.com/images/I/71nI01Ay0ML._AC_UF894,1000_QL80_.jpg', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-17 15:14:58'),
(100, 100, 1100000.00, 50, 'DEEPCOOL-MATREXX-40', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSHFbUDJBWHF62lTe-pCnt7RwzWMwO5A86Wi950SUFJvKGP0Xxacmz1gNpO5_hYf0Wpaheq8eD7glpLEXKs83dtibaVO1pkagOmO9nGorO3LaSAvtz1XK0_tZcUC6CE4OuB-lZoPrv4kg&usqp=CAc', 'ACTIVE', 1, '2026-04-17 00:42:36', '2026-04-17 15:14:09');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_variants`
--

CREATE TABLE `product_variants` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `sku` varchar(255) NOT NULL,
  `price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `image_url` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'ACTIVE',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `product_variants`
--

INSERT INTO `product_variants` (`id`, `product_id`, `sku`, `price`, `stock_quantity`, `image_url`, `status`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'CPU-I5-14400F', 5200000.00, 10, 'https://www.intel.com/content/dam/www/central-libraries/us/en/images/i5-14400f-boxed-front-view.png', 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-04-14 13:29:58'),
(2, 2, 'CPU-R5-7600', 5600000.00, 8, 'https://www.amd.com/system/files/2022-12/1792694-ryzen-5-7600-product-fr-angle.png', 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-04-14 13:29:58'),
(3, 3, 'MB-B760M-DDR5', 3900000.00, 9, 'https://dlcdnwebimgs.asus.com/gain/3D7A9E5F-80E4-4D6C-9A52-87067E66B40E/w717/h525', 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-04-14 13:29:58'),
(4, 4, 'MB-B650M-DDR5', 4100000.00, 7, 'https://storage-asset.msi.com/global/picture/image/feature/mb/PRO-B650M-A-WIFI/PRO-B650M-A-WIFI-01.png', 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-04-14 13:29:58'),
(5, 5, 'RAM-DDR5-16G', 1800000.00, 20, 'https://media.corsair.com/p/CMK32GX5M2B5600C36/gallery/CMK32GX5M2B5600C36_01.png', 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-04-14 13:29:58'),
(6, 6, 'RAM-DDR4-16G', 1200000.00, 20, 'https://media.kingston.com/kingston/product/ktc-product-fury-beast-ddr4-black-front-1-tn.png', 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-04-14 13:29:58'),
(7, 7, 'GPU-RTX4060-8G', 8900000.00, 5, 'https://dlcdnwebimgs.asus.com/gain/9BB539B1-C475-470A-BB29-1F188F69666E/w717/h525', 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-04-14 13:29:58'),
(8, 8, 'SSD-990EVO-1TB', 2100000.00, 15, 'https://images.samsung.com/is/image/samsung/p6pim/vn/mz-v9e1t0bw/gallery/vn-990-evo-nvme-m2-ssd-mz-v9e1t0bw-539665646', 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-04-14 13:29:58'),
(9, 9, 'PSU-650W-BRONZE', 1600000.00, 12, 'https://www.coolermaster.com/media/1963/mwe-bronze-v2-650-gallery-1.png', 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-04-14 13:29:58'),
(10, 10, 'CASE-CMP520', 1300000.00, 10, 'https://product.hstatic.net/200000420363/product/v_m_y_t_nh_cooler_master_cmp_520_argb_1_25e839281a9544778103c81211dc82c8.jpg', 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-04-14 13:29:58'),
(11, 11, 'CPU-I9-14900KS', 11500000.00, 20, NULL, 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 00:41:27'),
(12, 12, 'CPU-R9-7950X', 10800000.00, 20, NULL, 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 00:41:27'),
(13, 13, 'CPU-I5-13400', 2200000.00, 20, NULL, 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 00:41:27'),
(14, 14, 'MB-Z790-EDGE', 13200000.00, 20, NULL, 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 00:41:27'),
(15, 15, 'MB-B650-TUF', 6500000.00, 20, NULL, 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 00:41:27'),
(16, 16, 'MB-Z790-ICE', 4200000.00, 20, NULL, 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 00:41:27'),
(17, 17, 'RAM-DDR5-6400-32G', 3800000.00, 20, NULL, 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 00:41:27'),
(18, 18, 'RAM-DDR5-5200-32G', 1100000.00, 20, NULL, 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 00:41:27'),
(19, 19, 'RAM-DDR5-7200-32G', 3500000.00, 20, NULL, 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 00:41:27'),
(20, 20, 'GPU-RTX4080S-16G', 17900000.00, 20, NULL, 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 00:41:27'),
(21, 21, 'GPU-7900XTX-24G', 14500000.00, 20, NULL, 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 00:41:27'),
(22, 22, 'GPU-RTX4060TI-16G', 55000000.00, 20, NULL, 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 00:41:27'),
(23, 23, 'SSD-T700-1TB', 2800000.00, 20, NULL, 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 00:41:27'),
(24, 24, 'SSD-SN580-1TB', 3200000.00, 20, NULL, 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 00:41:27'),
(25, 25, 'SSD-530-2TB', 4500000.00, 20, NULL, 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 00:41:27'),
(26, 26, 'SKU-26', 3500000.00, 20, NULL, 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 00:39:05'),
(27, 27, 'SKU-27', 2500000.00, 20, NULL, 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 00:39:05'),
(28, 28, 'SKU-28', 4800000.00, 20, NULL, 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 00:39:05'),
(29, 29, 'SKU-29', 3200000.00, 20, NULL, 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 00:39:05'),
(30, 30, 'SKU-30', 4500000.00, 20, NULL, 'ACTIVE', 1, '2026-04-17 00:39:05', '2026-04-17 00:39:05'),
(31, 31, 'SKU-31', 2500000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(32, 32, 'SKU-32', 10500000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(33, 33, 'SKU-33', 10800000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(34, 34, 'SKU-34', 3500000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(35, 35, 'SKU-35', 4200000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(36, 36, 'SKU-36', 11500000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(37, 37, 'SKU-37', 9500000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(38, 38, 'SKU-38', 6200000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(39, 39, 'SKU-39', 7800000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(40, 40, 'SKU-40', 4800000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(41, 41, 'SKU-41', 16500000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(42, 42, 'SKU-42', 6200000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(43, 43, 'SKU-43', 2500000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(44, 44, 'SKU-44', 4200000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(45, 45, 'SKU-45', 9800000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(46, 46, 'SKU-46', 2800000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(47, 47, 'SKU-47', 7500000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(48, 48, 'SKU-48', 1900000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(49, 49, 'SKU-49', 3100000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(50, 50, 'SKU-50', 11500000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(51, 51, 'SKU-51', 3500000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(52, 52, 'SKU-52', 950000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(53, 53, 'SKU-53', 4200000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(54, 54, 'SKU-54', 1450000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(55, 55, 'SKU-55', 550000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(56, 56, 'SKU-56', 1800000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(57, 57, 'SKU-57', 1100000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(58, 58, 'SKU-58', 7200000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(59, 59, 'SKU-59', 3100000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(60, 60, 'SKU-60', 2100000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(61, 61, 'SKU-61', 14500000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(62, 62, 'SKU-62', 32500000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(63, 63, 'SKU-63', 7800000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(64, 64, 'SKU-64', 23500000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(65, 65, 'SKU-65', 7200000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(66, 66, 'SKU-66', 58000000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(67, 67, 'SKU-67', 28500000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(68, 68, 'SKU-68', 11800000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(69, 69, 'SKU-69', 5500000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(70, 70, 'SKU-70', 17800000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(71, 71, 'SKU-71', 3500000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(72, 72, 'SKU-72', 9500000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(73, 73, 'SKU-73', 2800000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(74, 74, 'SKU-74', 5200000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(75, 75, 'SKU-75', 1450000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(76, 76, 'SKU-76', 5800000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(77, 77, 'SKU-77', 2200000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(78, 78, 'SKU-78', 3200000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(79, 79, 'SKU-79', 4500000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(80, 80, 'SKU-80', 1100000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(81, 81, 'SKU-81', 4200000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(82, 82, 'SKU-82', 2800000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(83, 83, 'SKU-83', 3600000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(84, 84, 'SKU-84', 5800000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(85, 85, 'SKU-85', 1200000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(86, 86, 'SKU-86', 4800000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(87, 87, 'SKU-87', 4500000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(88, 88, 'SKU-88', 1350000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(89, 89, 'SKU-89', 12500000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(90, 90, 'SKU-90', 1650000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(91, 91, 'SKU-91', 4500000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(92, 92, 'SKU-92', 3200000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(93, 93, 'SKU-93', 2600000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(94, 94, 'SKU-94', 2200000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(95, 95, 'SKU-95', 4200000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(96, 96, 'SKU-96', 6500000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(97, 97, 'SKU-97', 2500000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(98, 98, 'SKU-98', 1900000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(99, 99, 'SKU-99', 3800000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41'),
(100, 100, 'SKU-100', 1100000.00, 50, NULL, 'ACTIVE', 1, '2026-04-17 01:07:41', '2026-04-17 01:07:41');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `roles`
--

INSERT INTO `roles` (`id`, `name`) VALUES
(1, 'ADMIN'),
(2, 'CUSTOMER'),
(4, 'SALES_STAFF'),
(3, 'STAFF'),
(5, 'TECH_STAFF');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `shipments`
--

CREATE TABLE `shipments` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `tracking_code` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sku_attributes`
--

CREATE TABLE `sku_attributes` (
  `id` int(11) NOT NULL,
  `sku_id` int(11) DEFAULT NULL,
  `attribute_value_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `sku_attributes`
--

INSERT INTO `sku_attributes` (`id`, `sku_id`, `attribute_value_id`) VALUES
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
(13, 10, 6),
(14, 11, 1),
(15, 12, 2),
(16, 13, 1),
(17, 14, 1),
(18, 14, 3),
(19, 14, 6),
(20, 15, 2),
(21, 15, 3),
(22, 15, 6),
(23, 16, 1),
(24, 16, 4),
(25, 16, 8),
(26, 17, 3),
(27, 18, 4),
(28, 19, 3),
(29, 23, 7),
(30, 24, 7),
(31, 25, 7),
(32, 26, 9),
(33, 27, 10),
(34, 28, 11),
(35, 29, 6),
(36, 30, 6),
(37, 31, 1),
(38, 32, 1),
(39, 33, 2),
(40, 34, 13),
(41, 35, 1),
(42, 36, 2),
(43, 37, 1),
(44, 38, 2),
(45, 39, 1),
(46, 40, 13),
(47, 41, 1),
(48, 42, 2),
(49, 43, 2),
(50, 44, 1),
(51, 45, 1),
(52, 46, 13),
(53, 47, 1),
(54, 48, 1),
(55, 49, 13),
(56, 50, 2),
(57, 51, 3),
(58, 52, 4),
(59, 53, 3),
(60, 54, 4),
(61, 55, 4),
(62, 56, 3),
(63, 57, 4),
(64, 58, 3),
(65, 59, 3),
(66, 60, 4),
(67, 81, 11),
(68, 82, 10),
(69, 83, 9),
(70, 84, 16),
(71, 85, 15),
(72, 86, 11),
(73, 87, 10),
(74, 88, 5),
(75, 89, 16),
(76, 90, 5),
(77, 71, 7),
(78, 72, 7),
(79, 73, 19),
(80, 74, 7),
(81, 75, 7),
(82, 76, 19),
(83, 77, 18),
(84, 78, 7),
(85, 79, 7),
(86, 80, 18),
(97, 31, 1),
(98, 32, 1),
(99, 33, 2),
(100, 34, 13),
(101, 35, 1),
(102, 36, 2),
(103, 37, 1),
(104, 38, 2),
(105, 39, 1),
(106, 40, 13),
(107, 41, 1),
(108, 42, 2),
(109, 43, 2),
(110, 44, 1),
(111, 45, 1),
(112, 46, 13),
(113, 47, 1),
(114, 48, 1),
(115, 49, 13),
(116, 50, 2),
(117, 51, 3),
(118, 52, 4),
(119, 53, 3),
(120, 54, 4),
(121, 55, 4),
(122, 56, 3),
(123, 57, 4),
(124, 58, 3),
(125, 59, 3),
(126, 60, 4),
(127, 81, 11),
(128, 82, 10),
(129, 83, 9),
(130, 84, 16),
(131, 85, 15),
(132, 86, 11),
(133, 87, 10),
(134, 88, 5),
(135, 89, 16),
(136, 90, 5),
(137, 71, 7),
(138, 72, 7),
(139, 73, 19),
(140, 74, 7),
(141, 75, 7),
(142, 76, 19),
(143, 77, 18),
(144, 78, 7),
(145, 79, 7),
(146, 80, 18),
(157, 31, 1),
(158, 32, 1),
(159, 33, 2),
(160, 34, 13),
(161, 35, 1),
(162, 36, 2),
(163, 37, 1),
(164, 38, 2),
(165, 39, 1),
(166, 40, 13),
(167, 41, 1),
(168, 41, 3),
(169, 41, 6),
(170, 42, 2),
(171, 42, 3),
(172, 42, 6),
(173, 43, 2),
(174, 43, 3),
(175, 43, 8),
(176, 44, 1),
(177, 44, 3),
(178, 44, 8),
(179, 45, 1),
(180, 45, 3),
(181, 45, 6),
(182, 46, 13),
(183, 46, 4),
(184, 46, 8),
(185, 47, 1),
(186, 47, 3),
(187, 47, 6),
(188, 48, 1),
(189, 48, 4),
(190, 48, 8),
(191, 49, 13),
(192, 49, 4),
(193, 49, 6),
(194, 50, 2),
(195, 50, 3),
(196, 50, 6),
(197, 51, 3),
(198, 52, 4),
(199, 53, 3),
(200, 54, 4),
(201, 55, 4),
(202, 56, 3),
(203, 57, 4),
(204, 58, 3),
(205, 59, 3),
(206, 60, 4),
(207, 71, 7),
(208, 72, 7),
(209, 73, 19),
(210, 74, 7),
(211, 75, 7),
(212, 76, 19),
(213, 77, 18),
(214, 78, 7),
(215, 79, 7),
(216, 80, 18),
(217, 81, 11),
(218, 82, 10),
(219, 83, 9),
(220, 84, 16),
(221, 85, 15),
(222, 86, 11),
(223, 87, 10),
(224, 88, 5),
(225, 89, 16),
(226, 90, 5),
(227, 91, 6),
(228, 92, 6),
(229, 93, 6),
(230, 94, 6),
(231, 95, 6),
(232, 96, 6),
(233, 97, 6),
(234, 99, 6),
(235, 100, 8);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tickets`
--

CREATE TABLE `tickets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'OPEN',
  `priority` varchar(50) NOT NULL DEFAULT 'MEDIUM',
  `assigned_to_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `ticket_messages`
--

CREATE TABLE `ticket_messages` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `role_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` varchar(50) DEFAULT 'ACTIVE',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `phone` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `full_name`, `role_id`, `created_at`, `status`, `updated_at`, `phone`) VALUES
(1, 'admin@example.com', '$2a$10$utcqRyxGzC2yp2uCRaye8ujewpiriFs2BpWX0w.VgO4H1I8PTm.eO', 'Admin Demo', 1, '2026-03-20 14:34:28', 'ACTIVE', '2026-03-20 14:34:28', '0900000001'),
(2, 'customer@example.com', '$2a$10$utcqRyxGzC2yp2uCRaye8ujewpiriFs2BpWX0w.VgO4H1I8PTm.eO', 'Customer Demo', 2, '2026-03-20 14:34:28', 'ACTIVE', '2026-03-20 14:34:28', '0900000002'),
(3, 'sales@example.com', '$2a$10$KN1ghY8rn7gntmM0sLjh8O59Pi8uylTD7T0WqNKZqp7pGq.uPeD9i', 'Sales Staff Demo', 4, '2026-03-22 11:32:38', 'ACTIVE', '2026-03-22 11:32:38', '0900000003'),
(4, 'tech@example.com', '$2a$10$KN1ghY8rn7gntmM0sLjh8O59Pi8uylTD7T0WqNKZqp7pGq.uPeD9i', 'Tech Staff Demo', 5, '2026-03-22 11:32:38', 'ACTIVE', '2026-03-22 11:32:38', '0900000004'),
(5, 'khuongminhhua11062004@gmail.com', '$2a$10$3WvF9DxWlk62h5oif60zBeMecd69fjekLyY4gkhR0ehsEHCfJSsTm', 'Hứa Minh Khương', 2, '2026-03-26 08:00:10', 'ACTIVE', '2026-03-26 08:00:10', '0356565991');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `warranties`
--

CREATE TABLE `warranties` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `order_item_id` int(11) DEFAULT NULL,
  `sku_id` int(11) DEFAULT NULL,
  `warranty_code` varchar(100) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'ACTIVE',
  `note` varchar(255) DEFAULT NULL,
  `activated_at` datetime DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_addresses_user` (`user_id`);

--
-- Chỉ mục cho bảng `ai_chats`
--
ALTER TABLE `ai_chats`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `ai_messages`
--
ALTER TABLE `ai_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `chat_id` (`chat_id`);

--
-- Chỉ mục cho bảng `attributes`
--
ALTER TABLE `attributes`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `attribute_values`
--
ALTER TABLE `attribute_values`
  ADD PRIMARY KEY (`id`),
  ADD KEY `attribute_id` (`attribute_id`);

--
-- Chỉ mục cho bảng `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_carts_user` (`user_id`);

--
-- Chỉ mục cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cart_items_cart` (`cart_id`),
  ADD KEY `fk_cart_items_sku` (`product_variant_id`);

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `compatibility_rules`
--
ALTER TABLE `compatibility_rules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `attribute_value_1` (`attribute_value_1`),
  ADD KEY `attribute_value_2` (`attribute_value_2`);

--
-- Chỉ mục cho bảng `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_order_items_order` (`order_id`),
  ADD KEY `fk_order_items_sku` (`product_variant_id`);

--
-- Chỉ mục cho bảng `pc_builds`
--
ALTER TABLE `pc_builds`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `pc_build_items`
--
ALTER TABLE `pc_build_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `build_id` (`build_id`),
  ADD KEY `sku_id` (`sku_id`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `fk_products_brand` (`brand_id`);

--
-- Chỉ mục cho bảng `product_skus`
--
ALTER TABLE `product_skus`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Chỉ mục cho bảng `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_product_variants_product` (`product_id`);

--
-- Chỉ mục cho bảng `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Chỉ mục cho bảng `shipments`
--
ALTER TABLE `shipments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Chỉ mục cho bảng `sku_attributes`
--
ALTER TABLE `sku_attributes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sku_id` (`sku_id`),
  ADD KEY `attribute_value_id` (`attribute_value_id`);

--
-- Chỉ mục cho bảng `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tickets_user_status` (`user_id`,`status`),
  ADD KEY `idx_tickets_assigned_status` (`assigned_to_id`,`status`);

--
-- Chỉ mục cho bảng `ticket_messages`
--
ALTER TABLE `ticket_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ticket_messages_user` (`user_id`),
  ADD KEY `idx_ticket_messages_ticket_created` (`ticket_id`,`created_at`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role_id` (`role_id`);

--
-- Chỉ mục cho bảng `warranties`
--
ALTER TABLE `warranties`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_warranty_code` (`warranty_code`),
  ADD UNIQUE KEY `uq_warranty_order_item` (`order_item_id`),
  ADD KEY `fk_warranties_order` (`order_id`),
  ADD KEY `fk_warranties_user` (`user_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `ai_chats`
--
ALTER TABLE `ai_chats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `ai_messages`
--
ALTER TABLE `ai_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `attributes`
--
ALTER TABLE `attributes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `attribute_values`
--
ALTER TABLE `attribute_values`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT cho bảng `brands`
--
ALTER TABLE `brands`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT cho bảng `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `compatibility_rules`
--
ALTER TABLE `compatibility_rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `pc_builds`
--
ALTER TABLE `pc_builds`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `pc_build_items`
--
ALTER TABLE `pc_build_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT cho bảng `product_skus`
--
ALTER TABLE `product_skus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT cho bảng `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT cho bảng `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `shipments`
--
ALTER TABLE `shipments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `sku_attributes`
--
ALTER TABLE `sku_attributes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=236;

--
-- AUTO_INCREMENT cho bảng `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `ticket_messages`
--
ALTER TABLE `ticket_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `warranties`
--
ALTER TABLE `warranties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `fk_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `ai_chats`
--
ALTER TABLE `ai_chats`
  ADD CONSTRAINT `ai_chats_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `ai_messages`
--
ALTER TABLE `ai_messages`
  ADD CONSTRAINT `ai_messages_ibfk_1` FOREIGN KEY (`chat_id`) REFERENCES `ai_chats` (`id`);

--
-- Các ràng buộc cho bảng `attribute_values`
--
ALTER TABLE `attribute_values`
  ADD CONSTRAINT `attribute_values_ibfk_1` FOREIGN KEY (`attribute_id`) REFERENCES `attributes` (`id`);

--
-- Các ràng buộc cho bảng `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `fk_carts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`),
  ADD CONSTRAINT `fk_cart_items_sku` FOREIGN KEY (`product_variant_id`) REFERENCES `product_skus` (`id`);

--
-- Các ràng buộc cho bảng `compatibility_rules`
--
ALTER TABLE `compatibility_rules`
  ADD CONSTRAINT `compatibility_rules_ibfk_1` FOREIGN KEY (`attribute_value_1`) REFERENCES `attribute_values` (`id`),
  ADD CONSTRAINT `compatibility_rules_ibfk_2` FOREIGN KEY (`attribute_value_2`) REFERENCES `attribute_values` (`id`);

--
-- Các ràng buộc cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `fk_order_items_sku` FOREIGN KEY (`product_variant_id`) REFERENCES `product_skus` (`id`);

--
-- Các ràng buộc cho bảng `pc_builds`
--
ALTER TABLE `pc_builds`
  ADD CONSTRAINT `pc_builds_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `pc_build_items`
--
ALTER TABLE `pc_build_items`
  ADD CONSTRAINT `pc_build_items_ibfk_1` FOREIGN KEY (`build_id`) REFERENCES `pc_builds` (`id`),
  ADD CONSTRAINT `pc_build_items_ibfk_2` FOREIGN KEY (`sku_id`) REFERENCES `product_skus` (`id`);

--
-- Các ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`),
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Các ràng buộc cho bảng `product_skus`
--
ALTER TABLE `product_skus`
  ADD CONSTRAINT `product_skus_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Các ràng buộc cho bảng `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `fk_product_variants_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Các ràng buộc cho bảng `shipments`
--
ALTER TABLE `shipments`
  ADD CONSTRAINT `shipments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);

--
-- Các ràng buộc cho bảng `sku_attributes`
--
ALTER TABLE `sku_attributes`
  ADD CONSTRAINT `sku_attributes_ibfk_1` FOREIGN KEY (`sku_id`) REFERENCES `product_skus` (`id`),
  ADD CONSTRAINT `sku_attributes_ibfk_2` FOREIGN KEY (`attribute_value_id`) REFERENCES `attribute_values` (`id`);

--
-- Các ràng buộc cho bảng `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `fk_tickets_assignee` FOREIGN KEY (`assigned_to_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_tickets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `ticket_messages`
--
ALTER TABLE `ticket_messages`
  ADD CONSTRAINT `fk_ticket_messages_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ticket_messages_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);

--
-- Các ràng buộc cho bảng `warranties`
--
ALTER TABLE `warranties`
  ADD CONSTRAINT `fk_warranties_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `fk_warranties_order_item` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`),
  ADD CONSTRAINT `fk_warranties_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
