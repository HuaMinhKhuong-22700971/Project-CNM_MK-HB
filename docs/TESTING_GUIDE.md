# Hướng dẫn Testing Từng Actor qua Giao diện

## Chuẩn bị
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- Database: MySQL đã seed dữ liệu

---

## 1. GUEST (Khách vãng lai) - Không đăng nhập

### 1.1 Xem danh mục sản phẩm
1. Truy cập http://localhost:5173/products
2. Kiểm tra danh sách sản phẩm hiển thị
3. Test lọc theo:
   - Danh mục (CPU, Mainboard, RAM, v.v.)
   - Thương hiệu
   - Khoảng giá
   - Thông số kỹ thuật (Socket, Loại RAM, PSU)
4. Test sắp xếp giá tăng/giảm
5. Refresh trang (F5) - kiểm tra tham số lọc vẫn giữ

### 1.2 Chi tiết sản phẩm
1. Click vào bất kỳ sản phẩm
2. Kiểm tra hiển thị: ảnh, giá, thông số kỹ thuật
3. Click nút "So sánh"
4. Truy cập http://localhost:5173/compare?ids=1,2,3
5. Kiểm tra bảng so sánh (tối đa 4 SP)

### 1.3 PC Builder
1. Truy cập http://localhost:5173/pc-builder
2. Chọn linh kiện từng nhóm (CPU, Mainboard, RAM, VGA, Storage, PSU, Case)
3. Click "Kiểm tra tương thích" (chọn ≥2 linh kiện)
4. Click "Lưu cấu hình" - nhập tên cấu hình
5. Tạo cấu hình mới, đổi tên
6. Click "Xuất JSON" và "Nhập JSON"
7. Click "AI Advisor gợi ý cấu hình"

### 1.4 AI Chat
1. Truy cập http://localhost:5173/ai-chat
2. Gửi câu hỏi bất kỳ
3. Kiểm tra phản hồi AI
4. Refresh trang - kiểm tra lịch sử chat còn
5. Click "Xóa lịch sử chat"
6. Click "Gặp nhân viên" (live chat demo)

### 1.5 Đăng ký
1. Truy cập http://localhost:5173/register
2. Nhập email, mật khẩu, họ tên
3. Click nút Google (có nhãn DEMO - không OAuth thật)
4. Submit form
5. Sau đăng ký → tự động đăng nhập

---

## 2. CUSTOMER (Khách thành viên) - Cần đăng nhập

### Tài khoản test
- Email: `customer@cnm.local` / Password: `Customer@123`
- Hoặc đăng ký tài khoản mới

### 2.1 Đăng nhập & đồng bộ dữ liệu
1. Khi chưa login: Vào PC Builder → lưu cấu hình
2. Đăng nhập tại http://localhost:5173/login
3. Kiểm tra thông báo đồng bộ cấu hình (nếu có)
4. Trang chủ hiện Member Hub

### 2.2 Tài khoản (Profile)
1. Truy cập http://localhost:5173/profile
2. Cập nhật họ tên, số điện thoại
3. Thêm địa chỉ giao hàng mới
4. Chọn địa chỉ mặc định
5. Đổi mật khẩu

### 2.3 Mua hàng
1. Thêm sản phẩm vào giỏ:
   - Vào trang sản phẩm → Click "Thêm vào giỏ"
   - Kiểm tra giỏ hàng: http://localhost:5173/cart
2. Checkout:
   - Truy cập http://localhost:5173/checkout
   - Chọn địa chỉ giao hàng
   - Chọn phương thức thanh toán:
     - COD
     - VNPay (mock mode: http://localhost:5173/payment/mock)
3. Xác nhận thanh toán VNPay mock:
   - Chuyển đến trang mock
   - Click "Xác nhận thanh toán"
   - Chuyển đến /payment/result

### 2.4 Quản lý đơn hàng
1. Truy cập http://localhost:5173/orders
2. Xem danh sách đơn hàng
3. Lọc theo trạng thái (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
4. Hủy đơn (khi trạng thái PENDING)
5. Thanh toán lại VNPay (khi chưa PAID)
6. Click vào đơn hàng → xem chi tiết:
   - Vận đơn
   - Sản phẩm
   - Trạng thái

### 2.5 PC Builder (Cloud)
1. Truy cập http://localhost:5173/pc-builder
2. Tạo cấu hình mới
3. Click "Lưu lên tài khoản"
4. Kiểm tra cấu hình được lưu (không mất khi đổi trình duyệt)
5. Kiểm tra tương thích + AI Advisor

### 2.6 Hỗ trợ & Bảo hành
1. Tạo ticket:
   - Truy cập http://localhost:5173/tickets/new
   - Nhập tiêu đề, mô tả, ưu tiên
   - Submit
2. Xem danh sách tickets:
   - Truy cập http://localhost:5173/tickets
   - Kiểm tra trạng thái tickets
3. Kích hoạt bảo hành:
   - Sau khi có đơn DELIVERED
   - Truy cập http://localhost:5173/warranties
   - Nhập mã bảo hành hoặc kích hoạt

---

## 3. STAFF (Nhân viên bán hàng)

### Tài khoản test
- Email: `sales@cnm.local` / Password: `Sales@123`
- Sau login → tự chuyển http://localhost:5173/staff/orders

### 3.1 Xử lý đơn hàng
1. Lọc đơn "Chờ xử lý" (PENDING)
2. Chọn đơn → Click "Xử lý đơn"
3. Trạng thái chuyển PROCESSING
4. Chọn đơn vị vận chuyển (GHTK / VNPost / J&T)
5. Click "Tạo mã demo" hoặc nhập mã thủ công
6. Click "Giao vận" → trạng thái SHIPPED + vận đơn mock
7. Click "Hoàn thành" → trạng thái DELIVERED
8. Dùng mẫu ghi chú → Click "Lưu ghi chú tư vấn"
9. Hủy đơn PENDING với lý do (tuỳ chọn)

### 3.2 Tư vấn chat trực tuyến
**Tab khách:**
1. Mở http://localhost:5173/ai-chat
2. Click "Kết nối nhân viên"

**Tab nhân viên:**
1. Đăng nhập sales
2. Thấy badge hàng đợi trên menu "Tư vấn khách"
3. Click vào menu
4. Chọn phiên "Chờ nhận" → tự nhận phiên
5. Gửi tin nhanh hoặc tin nhắn tùy chỉnh
6. Mở PC Builder (tab mới) → chọn linh kiện → Click "Gửi cấu hình PC"
7. Click "Kết thúc phiên"

### 3.3 Liên kết luồng
1. Từ chat → Click link "Xử lý đơn hàng"
2. Từ đơn hàng → Click link "Tư vấn chat"

---

## 4. TECH (Nhân viên kỹ thuật)

### Tài khoản test
- Email: `tech1@cnm.local` / Password: `Tech@123`
- Sau login → tự chuyển http://localhost:5173/tech/tickets

### 4.1 Ticket kỹ thuật
1. Xem metric:
   - Chưa giao (UNASSIGNED)
   - Đang xử lý (ASSIGNED - của tôi)
2. Lọc "Chưa giao" → chọn ticket OPEN
3. Click "Nhận xử lý" → trạng thái IN_PROGRESS
4. Gửi phản hồi mẫu hoặc tin nhắn tùy chỉnh
5. Đổi ưu tiên / trạng thái từ dropdown
6. Click "Đánh dấu đã giải quyết" → RESOLVED
7. Click "Đóng ticket" → CLOSED (tuỳ chọn)

### 4.2 Luồng khách tạo ticket
**Tab khách:**
1. Đăng nhập customer
2. Truy cập http://localhost:5173/tickets/new
3. Tạo ticket

**Tab kỹ thuật:**
1. Badge menu tăng
2. Ticket xuất hiện ở "Chưa giao"

### 4.3 Luật tương thích
1. Truy cập http://localhost:5173/tech/compatibility
2. Xem danh sách rule PC Builder
3. Tạo rule mới (socket CPU ↔ mainboard)
4. Sửa rule
5. Bật/tắt rule
6. Kiểm tra /pc-builder để test rule

### 4.4 Bảo hành
1. Menu "Tra cứu bảo hành" → http://localhost:5173/warranties
2. Tra mã bảo hành
3. Kích hoạt bảo hành (sau đơn DELIVERED)

---

## 5. ADMIN (Quản trị viên)

### Tài khoản test
- Email: `admin@cnm.local` / Password: `Admin@123`
- Sau login → http://localhost:5173/admin/dashboard

### 5.1 Tổng quan (Dashboard)
1. Kiểm tra Health API + Database
2. Xem số liệu: users, products, orders, tickets
3. Click shortcut cards → từng module
4. Xem audit log gần đây

### 5.2 Hệ thống (System Settings)
1. Truy cập http://localhost:5173/admin/system
2. Xem metrics đầy đủ
3. Sửa:
   - store_name
   - support_email
   - chế độ VNPay sandbox
   - shipping mock
4. Click "Lưu" → kiểm tra snapshot settings
5. Xem nhật ký audit

### 5.3 Catalog
**Sản phẩm:**
1. Truy cập http://localhost:5173/admin/products
2. Tạo sản phẩm mới
3. Sửa sản phẩm
4. Bật/tắt ACTIVE

**Thuộc tính:**
1. Truy cập http://localhost:5173/admin/attributes
2. Tạo attribute (socket, RAM, v.v.)
3. Thêm giá trị cho attribute

**SKU:**
1. Truy cập http://localhost:5173/admin/skus
2. Tạo SKU (giá, tồn kho)
3. Gán thuộc tính cho SKU

**Tương thích:**
1. Truy cập http://localhost:5173/admin/compatibility-rules
2. Tạo/sửa rule PC Builder
3. Bật/tắt rule

### 5.4 Người dùng (Users)
1. Truy cập http://localhost:5173/admin/users
2. Tìm theo email
3. Đổi trạng thái ACTIVE / BLOCKED
4. Xem thống kê theo vai trò

### 5.5 Giám sát vận hành
1. Menu "Đơn hàng" → http://localhost:5173/staff/orders
2. Menu "Ticket KT" → http://localhost:5173/tech/tickets

---

## Checklist Testing Nhanh

### GUEST
- [ ] Xem danh sách sản phẩm
- [ ] Lọc/sắp xếp sản phẩm
- [ ] Chi tiết sản phẩm
- [ ] So sánh sản phẩm
- [ ] PC Builder (tạo, lưu, check tương thích)
- [ ] AI Chat
- [ ] Đăng ký

### CUSTOMER
- [ ] Đăng nhập
- [ ] Profile (cập nhật, address)
- [ ] Thêm vào giỏ
- [ ] Checkout COD
- [ ] Checkout VNPay mock
- [ ] Xem đơn hàng
- [ ] Hủy đơn
- [ ] Thanh toán lại
- [ ] PC Builder cloud
- [ ] Tạo ticket
- [ ] Kích hoạt bảo hành

### STAFF
- [ ] Xử lý đơn PENDING → DELIVERED
- [ ] Tạo vận đơn mock
- [ ] Lưu ghi chú tư vấn
- [ ] Chat queue
- [ ] Nhận phiên chat
- [ ] Gửi cấu hình PC

### TECH
- [ ] Nhận ticket
- [ ] Phản hồi ticket
- [ ] Đóng ticket
- [ ] Quản lý luật tương thích
- [ ] Tra cứu bảo hành

### ADMIN
- [ ] Dashboard metrics
- [ ] System settings
- [ ] CRUD products
- [ ] CRUD attributes/SKUs
- [ ] Compatibility rules
- [ ] Users management
- [ ] Giám sát orders/tickets

---

## Lưu ý quan trọng

1. **VNPay**: Mặc định ở mock mode. Để test thật, cần cấu hình VNPAY_TMN_CODE và VNPAY_HASH_SECRET trong .env
2. **Shipping**: Mặc định ở mock mode. Vận đơn được tạo tự động khi xử lý đơn
3. **Chat**: Đã migrate sang MySQL, data không mất khi restart/deploy
4. **Database**: Nếu cần reset, chạy `npm run seed:production`
5. **Logs**: Kiểm tra console browser và terminal API để debug

---

## Mẹo testing hiệu quả

1. Test theo thứ tự: GUEST → CUSTOMER → STAFF → TECH → ADMIN
2. Mở nhiều tab để test song song (ví dụ: tab khách + tab staff để test chat)
3. Sử dụng DevTools (F12) để kiểm tra API calls
4. Kiểm tra Network tab để xem request/response
5. Test edge cases: input rỗng, dữ liệu không hợp lệ, network error
