-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th4 04, 2026 lúc 04:35 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.1.25

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
(8, 4, 'mATX');

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
(9, 'Cooler Master', 'cooler-master', NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28');

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
(10, 'Cooler Master CMP 520', 'Case mid tower', 1300000.00, 7, '2026-03-20 14:34:28', 'cooler-master-cmp-520', 9, 'ACTIVE', 1, '2026-03-20 14:34:28');

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
(1, 1, 5200000.00, 10, 'CPU-I5-14400F', NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(2, 2, 5600000.00, 8, 'CPU-R5-7600', NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(3, 3, 3900000.00, 9, 'MB-B760M-DDR5', NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(4, 4, 4100000.00, 7, 'MB-B650M-DDR5', NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(5, 5, 1800000.00, 20, 'RAM-DDR5-16G', NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(6, 6, 1200000.00, 20, 'RAM-DDR4-16G', NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(7, 7, 8900000.00, 5, 'GPU-RTX4060-8G', NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(8, 8, 2100000.00, 15, 'SSD-990EVO-1TB', NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(9, 9, 1600000.00, 12, 'PSU-650W-BRONZE', NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(10, 10, 1300000.00, 10, 'CASE-CMP520', NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28');

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
(1, 1, 'CPU-I5-14400F', 5200000.00, 10, NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(2, 2, 'CPU-R5-7600', 5600000.00, 8, NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(3, 3, 'MB-B760M-DDR5', 3900000.00, 9, NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(4, 4, 'MB-B650M-DDR5', 4100000.00, 7, NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(5, 5, 'RAM-DDR5-16G', 1800000.00, 20, NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(6, 6, 'RAM-DDR4-16G', 1200000.00, 20, NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(7, 7, 'GPU-RTX4060-8G', 8900000.00, 5, NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(8, 8, 'SSD-990EVO-1TB', 2100000.00, 15, NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(9, 9, 'PSU-650W-BRONZE', 1600000.00, 12, NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28'),
(10, 10, 'CASE-CMP520', 1300000.00, 10, NULL, 'ACTIVE', 1, '2026-03-20 14:34:28', '2026-03-20 14:34:28');

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
(13, 10, 6);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `brands`
--
ALTER TABLE `brands`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `product_skus`
--
ALTER TABLE `product_skus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
