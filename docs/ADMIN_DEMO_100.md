# Checklist Demo 100% — Quản trị viên (ADMIN)

Tài khoản: `admin@cnm.local` / `Admin@123`  
Sau login → `/admin/dashboard`.

## Luồng demo (20 phút)

### 1. Tổng quan (`/admin/dashboard`)
- [ ] Health API + Database
- [ ] Số liệu users, products, orders, tickets
- [ ] Shortcut cards → từng module
- [ ] Audit log gần đây (nếu có)

### 2. Hệ thống (`/admin/system`)
- [ ] Xem metrics đầy đủ
- [ ] Sửa `store_name`, `support_email`, chế độ VNPay sandbox, shipping mock
- [ ] Lưu → kiểm tra snapshot settings
- [ ] Xem nhật ký audit

### 3. Catalog
- [ ] **Sản phẩm** `/admin/products` — tạo/sửa, bật/tắt ACTIVE
- [ ] **Thuộc tính** `/admin/attributes` — socket, RAM… + giá trị
- [ ] **SKU** `/admin/skus` — giá, tồn, gán thuộc tính
- [ ] **Tương thích** `/admin/compatibility-rules` — rule PC Builder

### 4. Người dùng (`/admin/users`)
- [ ] Tìm theo email
- [ ] Đổi trạng thái ACTIVE / BLOCKED
- [ ] Thống kê theo vai trò

### 5. Giám sát vận hành
- [ ] Menu **Đơn hàng** → `/staff/orders`
- [ ] Menu **Ticket KT** → `/tech/tickets`

## Ghi chú báo cáo

| Module | Demo |
|--------|------|
| Dashboard + metrics thật | ✅ |
| System settings + audit | ✅ |
| Products / Attributes / SKUs | ✅ |
| Compatibility rules | ✅ |
| Users & roles | ✅ |
| UI workspace thống nhất | ✅ |
| CRUD đơn hàng trong admin | Chưa (xem qua Staff) |
| BI / charts | Chưa |
