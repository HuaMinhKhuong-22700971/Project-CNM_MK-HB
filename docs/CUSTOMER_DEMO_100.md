# Checklist Demo 100% — Khách hàng thành viên (CUSTOMER)

Tài khoản demo: đăng ký tại `/register` hoặc dùng tài khoản đã seed.

## Luồng demo đề xuất (15 phút)

### 1. Đăng nhập & đồng bộ dữ liệu khách
- [ ] Build PC khi chưa login → lưu trên trình duyệt
- [ ] Đăng nhập `/login` → thông báo đồng bộ cấu hình PC (nếu có)
- [ ] Trang chủ hiện **Member Hub** (không còn banner guest)

### 2. Tài khoản (`/profile`)
- [ ] Cập nhật họ tên, số điện thoại
- [ ] Thêm / chọn địa chỉ giao hàng

### 3. Mua hàng
- [ ] Thêm sản phẩm vào giỏ `/cart`
- [ ] Checkout `/checkout` — COD hoặc VNPay (mock/sandbox)
- [ ] VNPay mock: `/payment/mock` → xác nhận → `/payment/result`

### 4. Quản lý đơn hàng (`/orders`)
- [ ] Xem danh sách, lọc theo trạng thái
- [ ] **Hủy đơn** khi trạng thái PENDING
- [ ] **Thanh toán lại VNPay** nếu chưa PAID
- [ ] Chi tiết đơn `/orders/:id` — vận đơn, sản phẩm

### 5. PC Builder (`/pc-builder`)
- [ ] Lưu cấu hình lên tài khoản (cloud)
- [ ] Kiểm tra tương thích + AI Advisor

### 6. Hỗ trợ & bảo hành
- [ ] Tạo ticket `/tickets/new`
- [ ] Kích hoạt bảo hành `/warranties` (sau khi có đơn DELIVERED)

## Ghi chú báo cáo

| Tính năng | Mức demo |
|-----------|----------|
| Hủy đơn (customer) | ✅ PENDING only |
| VNPay | ✅ Sandbox / Mock (`PAYMENT_MOCK_MODE`) |
| Đồng bộ build guest → member | ✅ Sau login |
| Refresh token tự động | Chưa (redirect login khi 401) |
