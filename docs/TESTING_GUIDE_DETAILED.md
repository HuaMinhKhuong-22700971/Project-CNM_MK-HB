# Hướng dẫn Testing Chi Tiết Từng Bước

---

## PHẦN 1: GUEST (Khách vãng lai - KHÔNG CẦN ĐĂNG NHẬP)

### Bước 1: Xem danh sách sản phẩm
1. Mở trình duyệt
2. Truy cập: http://localhost:5173/products
3. Bạn sẽ thấy danh sách sản phẩm hiển thị dạng thẻ (card)
4. Kiểm tra: Mỗi sản phẩm có ảnh, tên, giá
5. **Test lọc theo danh mục:**
   - Tìm thanh lọc bên trái hoặc trên cùng
   - Click vào "CPU" hoặc "Mainboard"
   - Danh sách sản phẩm sẽ chỉ hiển thị loại đó
6. **Test lọc theo thương hiệu:**
   - Click vào thương hiệu (ví dụ: Intel, AMD)
   - Danh sách sẽ lọc theo thương hiệu
7. **Test lọc theo khoảng giá:**
   - Chọn khoảng giá (ví dụ: 0-5 triệu, 5-10 triệu)
   - Danh sách sẽ lọc theo giá
8. **Test sắp xếp:**
   - Tìm dropdown "Sắp xếp"
   - Chọn "Giá tăng dần" → sản phẩm sắp xếp từ thấp đến cao
   - Chọn "Giá giảm dần" → sản phẩm sắp xếp từ cao xuống thấp
9. **Test F5:**
   - Nhấn F5 trên bàn phím
   - Kiểm tra xem các bộ lọc vẫn được giữ

### Bước 2: Xem chi tiết sản phẩm
1. Từ trang danh sách sản phẩm
2. Click vào bất kỳ sản phẩm nào
3. Bạn sẽ chuyển đến trang chi tiết (URL: /products/1 hoặc tương tự)
4. Kiểm tra hiển thị:
   - Ảnh sản phẩm (có thể zoom hoặc gallery)
   - Tên sản phẩm
   - Giá
   - Mô tả
   - Thông số kỹ thuật (bảng chi tiết)
5. Click nút "Thêm vào giỏ" (nếu có)

### Bước 3: So sánh sản phẩm
1. Quay lại trang danh sách sản phẩm
2. Click vào nút "So sánh" trên 2-3 sản phẩm khác nhau
3. Click vào link "Xem so sánh" hoặc truy cập http://localhost:5173/compare
4. Bạn sẽ thấy bảng so sánh các sản phẩm đã chọn
5. Kiểm tra: Bảng so sánh hiển thị thông số cạnh nhau
6. Click "Xóa" để bỏ sản phẩm khỏi so sánh

### Bước 4: PC Builder (Xây dựng cấu hình PC)
1. Truy cập: http://localhost:5173/pc-builder
2. Bạn sẽ thấy 7 nhóm linh kiện:
   - CPU
   - Mainboard
   - RAM
   - VGA (Card đồ họa)
   - Storage (Ổ cứng/SSD)
   - PSU (Nguồn)
   - Case (Vỏ máy)
3. **Chọn CPU:**
   - Click vào ô "CPU"
   - Chọn một CPU từ danh sách
   - CPU sẽ được thêm vào cấu hình
4. **Chọn Mainboard:**
   - Click vào ô "Mainboard"
   - Chọn mainboard tương thích với CPU
5. **Chọn linh kiện khác:**
   - Tiếp tục chọn RAM, VGA, Storage, PSU, Case
6. **Kiểm tra tương thích:**
   - Sau khi chọn ít nhất 2 linh kiện
   - Click nút "Kiểm tra tương thích"
   - Nếu tương thích → hiển thị thông báo xanh
   - Nếu không tương thích → hiển thị lỗi cụ thể
7. **Lưu cấu hình:**
   - Click nút "Lưu cấu hình"
   - Nhập tên cho cấu hình (ví dụ: "PC Gaming 15 triệu")
   - Click "Lưu"
   - Cấu hình được lưu trên trình duyệt (localStorage)
8. **Tạo cấu hình mới:**
   - Click "Tạo cấu hình mới"
   - Chọn linh kiện mới
   - Lưu với tên khác
9. **Đổi tên cấu hình:**
   - Chọn cấu hình đã lưu từ dropdown
   - Click "Đổi tên"
   - Nhập tên mới và lưu
10. **Xuất/Nhập JSON:**
    - Click "Xuất JSON" → tải file về máy
    - Click "Nhập JSON" → chọn file đã tải → cấu hình được khôi phục
11. **AI Advisor:**
    - Click nút "AI Advisor gợi ý cấu hình"
    - Nhập ngân sách hoặc yêu cầu
    - AI sẽ gợi ý cấu hình phù hợp

### Bước 5: AI Chat (Chat với AI)
1. Truy cập: http://localhost:5173/ai-chat
2. Bạn sẽ thấy giao diện chat
3. Nhập câu hỏi vào ô chat (ví dụ: "Tư vấn giúp mình cấu hình PC gaming 15 triệu")
4. Click nút gửi hoặc nhấn Enter
5. AI sẽ trả lời
6. **Test lịch sử chat:**
   - Nhấn F5 để refresh trang
   - Kiểm tra xem tin nhắn cũ vẫn còn
7. **Xóa lịch sử:**
   - Click nút "Xóa lịch sử chat"
   - Xác nhận xóa
8. **Live chat với nhân viên:**
   - Click nút "Gặp nhân viên"
   - Tạo phiên chat với nhân viên tư vấn

### Bước 6: Đăng ký tài khoản
1. Truy cập: http://localhost:5173/register
2. Nhập thông tin:
   - Email: nhập email của bạn (ví dụ: test@example.com)
   - Mật khẩu: nhập mật khẩu (ít nhất 6 ký tự)
   - Xác nhận mật khẩu: nhập lại mật khẩu
   - Họ tên: nhập tên của bạn
3. Click nút "Đăng ký bằng Email"
4. Nếu thành công → tự động đăng nhập và chuyển về trang chủ
5. **Test Google Sign-In (DEMO):**
   - Click nút "Đăng ký với Google"
   - Nó có nhãn DEMO → đây là demo, không kết nối thật

---

## PHẦN 2: CUSTOMER (Khách thành viên - CẦN ĐĂNG NHẬP)

### Chuẩn bị: Đăng nhập
1. Truy cập: http://localhost:5173/login
2. Nhập thông tin:
   - Email: `customer@cnm.local`
   - Mật khẩu: `Customer@123`
3. Click nút "Đăng nhập"
4. Bạn sẽ được chuyển đến trang chủ
5. Trang chủ sẽ hiển thị "Member Hub" thay vì banner cho khách

### Bước 1: Cập nhật thông tin cá nhân (Profile)
1. Click vào menu "Tài khoản" hoặc truy cập http://localhost:5173/profile
2. Bạn sẽ thấy trang profile với thông tin hiện tại
3. **Cập nhật thông tin:**
   - Nhập họ tên mới
   - Nhập số điện thoại
   - Click nút "Lưu thay đổi"
4. **Thêm địa chỉ mới:**
   - Tìm phần "Địa chỉ giao hàng"
   - Click nút "Thêm địa chỉ"
   - Nhập:
     - Họ tên người nhận
     - Số điện thoại
     - Địa chỉ chi tiết
     - Phường/Xã
     - Quận/Huyện
     - Tỉnh/Thành phố
   - Click "Lưu địa chỉ"
5. **Chọn địa chỉ mặc định:**
   - Click vào địa chỉ đã thêm
   - Click "Đặt làm mặc định"
6. **Đổi mật khẩu:**
   - Tìm phần "Đổi mật khẩu"
   - Nhập mật khẩu hiện tại
   - Nhập mật khẩu mới
   - Nhập xác nhận mật khẩu mới
   - Click "Đổi mật khẩu"

### Bước 2: Thêm sản phẩm vào giỏ hàng
1. Truy cập: http://localhost:5173/products
2. Click vào một sản phẩm bất kỳ
3. Trên trang chi tiết, click nút "Thêm vào giỏ"
4. Bạn sẽ thấy thông báo "Đã thêm vào giỏ hàng"
5. Click vào icon giỏ hàng (góc phải) hoặc truy cập http://localhost:5173/cart
6. Bạn sẽ thấy sản phẩm đã thêm trong giỏ
7. Thêm thêm vài sản phẩm khác vào giỏ

### Bước 3: Checkout (Thanh toán)
1. Từ giỏ hàng (http://localhost:5173/cart)
2. Click nút "Tiến hành thanh toán"
3. Bạn sẽ chuyển đến trang checkout (http://localhost:5173/checkout)
4. **Chọn địa chỉ giao hàng:**
   - Chọn địa chỉ từ danh sách đã lưu
   - Hoặc nhập địa chỉ mới
5. **Chọn phương thức thanh toán:**
   - **COD (Thanh toán khi nhận hàng):**
     - Chọn "Thanh toán khi nhận hàng"
     - Click nút "Đặt hàng"
     - Đơn hàng được tạo với trạng thái PENDING
   - **VNPay (Thanh toán qua VNPay):**
     - Chọn "Thanh toán qua VNPay"
     - Click nút "Thanh toán"
     - Bạn sẽ chuyển đến trang VNPay (mock mode)
6. **Test VNPay Mock:**
   - Sau khi click thanh toán VNPay
   - Bạn sẽ chuyển đến http://localhost:5173/payment/mock?orderId=xxx
   - Hiển thị thông tin đơn hàng
   - Click nút "Xác nhận thanh toán"
   - Chuyển đến http://localhost:5173/payment/result?success=true
   - Đơn hàng được đánh dấu PAID

### Bước 4: Xem và quản lý đơn hàng
1. Truy cập: http://localhost:5173/orders
2. Bạn sẽ thấy danh sách đơn hàng của bạn
3. **Lọc đơn hàng:**
   - Tìm bộ lọc theo trạng thái
   - Chọn "Chờ xử lý" (PENDING)
   - Danh sách chỉ hiển thị đơn PENDING
4. **Xem chi tiết đơn hàng:**
   - Click vào một đơn hàng
   - Bạn sẽ thấy:
     - Thông tin đơn hàng (mã, ngày tạo)
     - Trạng thái đơn hàng
     - Thông tin địa chỉ giao hàng
     - Danh sách sản phẩm
     - Tổng tiền
     - Vận đơn (nếu có)
5. **Hủy đơn hàng:**
   - Chọn đơn hàng có trạng thái PENDING
   - Click nút "Hủy đơn"
   - Nhập lý do hủy
   - Click "Xác nhận hủy"
   - Đơn hàng chuyển sang trạng thái CANCELLED
6. **Thanh toán lại:**
   - Chọn đơn hàng chưa thanh toán
   - Click nút "Thanh toán lại"
   - Chọn phương thức thanh toán
   - Hoàn tất thanh toán

### Bước 5: PC Builder Cloud (Lưu trên tài khoản)
1. Truy cập: http://localhost:5173/pc-builder
2. Tạo cấu hình mới:
   - Chọn linh kiện như Bước 4 (Phần GUEST)
3. Click nút "Lưu lên tài khoản"
4. Nhập tên cấu hình
5. Click "Lưu"
6. Đăng xuất và đăng nhập lại
7. Vào PC Builder
8. Kiểm tra: Cấu hình vẫn còn trong dropdown
9. Data không mất khi đổi trình duyệt hoặc máy

### Bước 6: Tạo Ticket hỗ trợ
1. Truy cập: http://localhost:5173/tickets/new
2. Nhập thông tin:
   - Tiêu đề: Ví dụ "Sản phẩm bị lỗi"
   - Mô tả chi tiết vấn đề
   - Ưu tiên: Chọn "Thấp", "Trung bình", hoặc "Cao"
3. Click nút "Gửi ticket"
4. Ticket được tạo với trạng thái OPEN
5. Xem danh sách tickets: http://localhost:5173/tickets

### Bước 7: Kích hoạt bảo hành
1. Sau khi có đơn hàng đã giao (DELIVERED)
2. Truy cập: http://localhost:5173/warranties
3. Nhập mã bảo hành (nếu có)
4. Click "Tra cứu"
5. Hoặc click "Kích hoạt bảo hành"
6. Nhập thông tin đơn hàng
7. Click "Kích hoạt"

---

## PHẦN 3: STAFF (Nhân viên bán hàng)

### Chuẩn bị: Đăng nhập Staff
1. Đăng xuất nếu đang đăng nhập khác
2. Truy cập: http://localhost:5173/login
3. Nhập thông tin:
   - Email: `sales@cnm.local`
   - Mật khẩu: `Sales@123`
4. Click "Đăng nhập"
5. Tự động chuyển đến http://localhost:5173/staff/orders

### Bước 1: Xử lý đơn hàng
1. Bạn sẽ thấy danh sách đơn hàng
2. **Lọc đơn chờ xử lý:**
   - Tìm bộ lọc trạng thái
   - Chọn "Chờ xử lý" (PENDING)
3. **Xử lý đơn:**
   - Chọn một đơn hàng PENDING
   - Click nút "Xử lý đơn"
   - Đơn hàng chuyển sang PROCESSING
4. **Tạo vận đơn:**
   - Chọn đơn vị vận chuyển từ dropdown (GHTK, VNPost, J&T)
   - Click nút "Tạo mã demo" → hệ thống tạo mã vận đơn tự động
   - Hoặc nhập mã vận đơn thủ công
5. **Giao vận:**
   - Click nút "Giao vận"
   - Đơn hàng chuyển sang SHIPPED
   - Mã vận đơn được lưu
6. **Hoàn thành đơn:**
   - Click nút "Hoàn thành"
   - Đơn hàng chuyển sang DELIVERED
7. **Thêm ghi chú tư vấn:**
   - Tìm phần ghi chú
   - Chọn mẫu ghi chú từ dropdown
   - Hoặc nhập ghi chú tùy chỉnh
   - Click "Lưu ghi chú"
8. **Hủy đơn (nếu cần):**
   - Chọn đơn PENDING
   - Click "Hủy đơn"
   - Nhập lý do
   - Click "Xác nhận"

### Bước 2: Tư vấn chat trực tuyến

**Cách 1: Từ phía khách hàng (Tab khác):**
1. Mở tab mới hoặc cửa sổ ẩn danh
2. Truy cập: http://localhost:5173/ai-chat
3. Click nút "Kết nối nhân viên"
4. Session chat được tạo với trạng thái "waiting"

**Cách 2: Từ phía nhân viên (Tab hiện tại):**
1. Sau khi khách kết nối nhân viên
2. Bạn sẽ thấy badge số trên menu "Tư vấn khách"
3. Click vào menu "Tư vấn khách"
4. Bạn sẽ thấy danh sách phiên chat đang chờ
5. **Nhận phiên:**
   - Chọn phiên có trạng thái "Chờ nhận"
   - Click nút "Nhận phiên"
   - Phiên chuyển sang "Đang xử lý"
   - Tên bạn hiển thị trong chat
6. **Gửi tin nhắn:**
   - Nhập tin nhắn vào ô chat
   - Click nút gửi hoặc nhấn Enter
7. **Gửi tin nhanh:**
   - Click vào danh sách tin nhanh
   - Chọn tin nhắn mẫu
8. **Gửi cấu hình PC:**
   - Mở tab mới → truy cập http://localhost:5173/pc-builder
   - Tạo cấu hình PC
   - Click "Gửi cấu hình PC"
   - Cấu hình được gửi vào chat khách hàng
9. **Kết thúc phiên:**
   - Click nút "Kết thúc phiên"
   - Phiến chuyển sang "Đã đóng"
   - Hệ thống gửi thông báo kết thúc

### Bước 3: Liên kết giữa Chat và Đơn hàng
1. Từ giao diện chat
2. Tìm nút "Xử lý đơn hàng"
3. Click → chuyển đến trang xử lý đơn hàng của khách
4. Từ giao diện xử lý đơn hàng
5. Tìm nút "Tư vấn chat"
6. Click → chuyển đến trang chat với khách

---

## PHẦN 4: TECH (Nhân viên kỹ thuật)

### Chuẩn bị: Đăng nhập Tech
1. Đăng xuất nếu đang đăng nhập khác
2. Truy cập: http://localhost:5173/login
3. Nhập thông tin:
   - Email: `tech1@cnm.local`
   - Mật khẩu: `Tech@123`
4. Click "Đăng nhập"
5. Tự động chuyển đến http://localhost:5173/tech/tickets

### Bước 1: Xem thống kê Ticket
1. Bạn sẽ thấy các số liệu:
   - Chưa giao: số lượng ticket chưa gán
   - Đang xử lý (tôi): số lượng ticket đang xử lý bởi bạn
   - Tổng số: tổng số ticket mở

### Bước 2: Nhận và xử lý Ticket
1. **Lọc ticket chưa giao:**
   - Chọn bộ lọc "Chưa giao" (UNASSIGNED)
   - Danh sách hiển thị ticket chưa có người xử lý
2. **Nhận ticket:**
   - Chọn một ticket OPEN
   - Click nút "Nhận xử lý"
   - Ticket chuyển sang IN_PROGRESS
   - Ticket được gán cho bạn
3. **Gửi phản hồi:**
   - Nhập tin nhắn phản hồi
   - Hoặc chọn mẫu phản hồi từ dropdown
   - Click "Gửi phản hồi"
4. **Đổi ưu tiên:**
   - Chọn ưu tiên mới từ dropdown
   - Tự động lưu
5. **Đổi trạng thái:**
   - Chọn trạng thái mới từ dropdown
   - Tự động lưu
6. **Đánh dấu đã giải quyết:**
   - Click nút "Đánh dấu đã giải quyết"
   - Ticket chuyển sang RESOLVED
7. **Đóng ticket:**
   - Click nút "Đóng ticket"
   - Ticket chuyển sang CLOSED

### Bước 3: Tạo Ticket từ phía khách (Test luồng)
**Tab khách hàng (cửa sổ ẩn danh):**
1. Đăng nhập customer
2. Truy cập http://localhost:5173/tickets/new
3. Tạo ticket mới
4. Submit

**Tab kỹ thuật (cửa sổ chính):**
1. Badge menu tăng lên
2. Ticket mới xuất hiện ở danh sách "Chưa giao"
3. Nhận và xử lý ticket như Bước 2

### Bước 4: Quản lý luật tương thích PC Builder
1. Truy cập http://localhost:5173/tech/compatibility
2. Bạn sẽ thấy danh sách các luật tương thích
3. **Xem luật:**
   - Mỗi luật hiển thị: điều kiện và kết quả
   - Ví dụ: "CPU socket LGA1700 chỉ tương thích mainboard socket LGA1700"
4. **Tạo luật mới:**
   - Click nút "Tạo luật mới"
   - Nhập tên luật
   - Nhập điều kiện (ví dụ: CPU socket)
   - Nhập kết quả (ví dụ: Mainboard socket)
   - Click "Lưu"
5. **Sửa luật:**
   - Click nút "Sửa" trên một luật
   - Chỉnh sửa thông tin
   - Click "Lưu"
6. **Bật/tắt luật:**
   - Click nút toggle (bật/tắt)
   - Nếu tắt → luật không được áp dụng
7. **Test luật:**
   - Mở tab mới → truy cập http://localhost:5173/pc-builder
   - Chọn linh kiện vi phạm luật
   - Click "Kiểm tra tương thích"
   - Hệ thống hiển thị lỗi theo luật

### Bước 5: Tra cứu và kích hoạt bảo hành
1. Truy cập http://localhost:5173/warranties
2. **Tra cứu bảo hành:**
   - Nhập mã bảo hành
   - Click "Tra cứu"
   - Hiển thị thông tin bảo hành
3. **Kích hoạt bảo hành:**
   - Click "Kích hoạt bảo hành"
   - Nhập mã đơn hàng
   - Click "Kích hoạt"
   - Bảo hành được kích hoạt cho đơn hàng

---

## PHẦN 5: ADMIN (Quản trị viên)

### Chuẩn bị: Đăng nhập Admin
1. Đăng xuất nếu đang đăng nhập khác
2. Truy cập: http://localhost:5173/login
3. Nhập thông tin:
   - Email: `admin@cnm.local`
   - Mật khẩu: `Admin@123`
4. Click "Đăng nhập"
5. Tự động chuyển đến http://localhost:5173/admin/dashboard

### Bước 1: Tổng quan Dashboard
1. **Health Check:**
   - Xem "API Health": màu xanh = OK
   - Xem "Database Health": màu xanh = OK
2. **Số liệu thống kê:**
   - Tổng số người dùng
   - Tổng số sản phẩm
   - Tổng số đơn hàng
   - Tổng số ticket
3. **Shortcut Cards:**
   - Click vào "Sản phẩm" → chuyển đến quản lý sản phẩm
   - Click vào "Đơn hàng" → chuyển đến quản lý đơn hàng
   - Click vào "Tickets" → chuyển đến quản lý ticket
4. **Audit Log:**
   - Xem danh sách các hoạt động gần đây
   - Thời gian, người thực hiện, hành động

### Bước 2: Cấu hình Hệ thống (System Settings)
1. Truy cập http://localhost:5173/admin/system
2. **Xem metrics:**
   - CPU usage
   - Memory usage
   - Disk usage
   - Uptime
3. **Cấu hình cửa hàng:**
   - Nhập Store Name (tên cửa hàng)
   - Nhập Support Email (email hỗ trợ)
4. **Cấu hình thanh toán:**
   - Togggle VNPay Sandbox Mode (bật/tắt)
   - Nếu tắt → cần cấu hình VNPay thật
5. **Cấu hình vận chuyển:**
   - Toggle Shipping Mock Mode (bật/tắt)
   - Chọn Shipping Provider (GHTK, VNPost, J&T)
6. **Lưu thay đổi:**
   - Click nút "Lưu cấu hình"
   - Xem snapshot settings ở bên cạnh
7. **Xem Audit Log:**
   - Xem lịch sử thay đổi cấu hình

### Bước 3: Quản lý Sản phẩm (Products)
1. Truy cập http://localhost:5173/admin/products
2. **Xem danh sách sản phẩm:**
   - Danh sách hiển thị tất cả sản phẩm
   - Hiển thị: tên, giá, trạng thái (ACTIVE/INACTIVE)
3. **Tạo sản phẩm mới:**
   - Click nút "Thêm sản phẩm"
   - Nhập thông tin:
     - Tên sản phẩm
     - Mô tả
     - Giá
     - Hình ảnh (upload URL)
     - Danh mục
     - Thương hiệu
   - Click "Lưu"
4. **Sửa sản phẩm:**
   - Click nút "Sửa" trên một sản phẩm
   - Chỉnh sửa thông tin
   - Click "Lưu"
5. **Bật/tắt sản phẩm:**
   - Click toggle ACTIVE/INACTIVE
   - Nếu INACTIVE → sản phẩm không hiển thị cho khách

### Bước 4: Quản lý Thuộc tính (Attributes)
1. Truy cập http://localhost:5173/admin/attributes
2. **Xem danh sách thuộc tính:**
   - Ví dụ: Socket, Loại RAM, PSU Wattage
3. **Tạo thuộc tính mới:**
   - Click "Thêm thuộc tính"
   - Nhập tên thuộc tính
   - Click "Lưu"
4. **Thêm giá trị cho thuộc tính:**
   - Click vào một thuộc tính
   - Nhập giá trị (ví dụ: LGA1700, AM4)
   - Click "Thêm giá trị"
5. **Sửa/Xóa giá trị:**
   - Click nút sửa/xóa trên từng giá trị

### Bước 5: Quản lý SKU (Biến thể sản phẩm)
1. Truy cập http://localhost:5173/admin/skus
2. **Xem danh sách SKU:**
   - Mỗi SKU là biến thể của sản phẩm
   - Hiển thị: giá, tồn kho, thuộc tính
3. **Tạo SKU mới:**
   - Click "Thêm SKU"
   - Chọn sản phẩm
   - Nhập giá
   - Nhập tồn kho
   - Gán thuộc tính (ví dụ: LGA1700, DDR4)
   - Click "Lưu"
4. **Sửa SKU:**
   - Click "Sửa"
   - Chỉnh sửa giá, tồn kho, thuộc tính
   - Click "Lưu"

### Bước 6: Quản lý Luật Tương thích (Compatibility Rules)
1. Truy cập http://localhost:5173/admin/compatibility-rules
2. **Xem danh sách luật:**
   - Tương tự như TECH nhưng có quyền cao hơn
3. **Tạo/Sửa/Xóa luật:**
   - Tương tự như phần TECH

### Bước 7: Quản lý Người dùng (Users)
1. Truy cập http://localhost:5173/admin/users
2. **Tìm người dùng:**
   - Nhập email vào ô tìm kiếm
   - Click "Tìm kiếm"
3. **Xem danh sách người dùng:**
   - Hiển thị: email, họ tên, vai trò, trạng thái
4. **Đổi trạng thái người dùng:**
   - Click toggle ACTIVE/BLOCKED
   - Nếu BLOCKED → người dùng không thể đăng nhập
5. **Xem thống kê theo vai trò:**
   - Số lượng USER
   - Số lượng ADMIN
   - Số lượng TECH_STAFF
   - Số lượng SALES_STAFF

### Bước 8: Giám sát vận hành
1. **Giám sát đơn hàng:**
   - Click menu "Đơn hàng"
   - Chuyển đến http://localhost:5173/staff/orders
   - Xem và xử lý đơn hàng như STAFF
2. **Giám sát Ticket kỹ thuật:**
   - Click menu "Ticket KT"
   - Chuyển đến http://localhost:5173/tech/tickets
   - Xem và xử lý ticket như TECH

---

## MẸO QUAN TRỌNG

### Mẹo 1: Test hiệu quả
- Test theo thứ tự: GUEST → CUSTOMER → STAFF → TECH → ADMIN
- Mở nhiều tab để test song song (ví dụ: tab khách + tab staff để test chat)
- Sử dụng DevTools (F12) để kiểm tra API calls
- Kiểm tra Network tab để xem request/response

### Mẹo 2: Debug lỗi
- Mở Console (F12 → Console) để xem lỗi JavaScript
- Mở Network (F12 → Network) để xem API request
- Kiểm tra terminal API để xem server logs
- Kiểm tra terminal Web để xem frontend logs

### Mẹo 3: Test edge cases
- Test với input rỗng
- Test với dữ liệu không hợp lệ
- Test khi mất kết nối mạng
- Test với các trạng thái khác nhau của đơn hàng/ticket

### Mẹo 4: Reset dữ liệu
- Nếu cần reset database: chạy `npm run seed:production`
- Nếu cần xóa cache browser: Ctrl+Shift+Delete

---

## CHECKLIST TỔNG QUÁT

### GUEST
- [ ] Xem danh sách sản phẩm
- [ ] Lọc/sắp xếp sản phẩm
- [ ] Xem chi tiết sản phẩm
- [ ] So sánh sản phẩm
- [ ] PC Builder (tạo, lưu, check tương thích, export/import)
- [ ] AI Chat (gửi tin, lịch sử, xóa)
- [ ] Đăng ký tài khoản

### CUSTOMER
- [ ] Đăng nhập
- [ ] Cập nhật profile (tên, phone, password)
- [ ] Quản lý địa chỉ (thêm, sửa, mặc định)
- [ ] Thêm vào giỏ hàng
- [ ] Checkout COD
- [ ] Checkout VNPay mock
- [ ] Xem danh sách đơn hàng
- [ ] Xem chi tiết đơn hàng
- [ ] Hủy đơn (PENDING)
- [ ] Thanh toán lại
- [ ] PC Builder cloud
- [ ] Tạo ticket
- [ ] Xem ticket
- [ ] Kích hoạt bảo hành

### STAFF
- [ ] Đăng nhập sales
- [ ] Lọc đơn PENDING
- [ ] Xử lý đơn (PENDING → PROCESSING → SHIPPED → DELIVERED)
- [ ] Tạo vận đơn mock
- [ ] Lưu ghi chú tư vấn
- [ ] Hủy đơn
- [ ] Xem chat queue
- [ ] Nhận phiên chat
- [ ] Gửi tin nhắn
- [ ] Gửi cấu hình PC
- [ ] Kết thúc phiên
- [ ] Liên kết chat ↔ đơn hàng

### TECH
- [ ] Đăng nhập tech
- [ ] Xem ticket stats
- [ ] Nhận ticket (UNASSIGNED → IN_PROGRESS)
- [ ] Phản hồi ticket
- [ ] Đổi ưu tiên/trạng thái
- [ ] Đánh dấu RESOLVED
- [ ] Đóng ticket CLOSED
- [ ] Quản lý luật tương thích
- [ ] Tạo/sửa/bật/tắt luật
- [ ] Tra cứu bảo hành
- [ ] Kích hoạt bảo hành

### ADMIN
- [ ] Đăng nhập admin
- [ ] Xem dashboard (health, metrics, audit log)
- [ ] Cấu hình hệ thống (store name, email, VNPay, shipping)
- [ ] CRUD sản phẩm
- [ ] CRUD thuộc tính
- [ ] CRUD SKU
- [ ] CRUD luật tương thích
- [ ] Quản lý người dùng (tìm, active/block, thống kê)
- [ ] Giám sát đơn hàng
- [ ] Giám sát ticket

---

## TÀI KHOẢN TEST

| Vai trò | Email | Mật khẩu |
|--------|-------|----------|
| Customer | customer@cnm.local | Customer@123 |
| Sales Staff | sales@cnm.local | Sales@123 |
| Tech Staff | tech1@cnm.local | Tech@123 |
| Admin | admin@cnm.local | Admin@123 |

---

## LIÊN KẾT NHANH

- Frontend: http://localhost:5173
- Backend API: http://localhost:5173/api
- Sản phẩm: http://localhost:5173/products
- PC Builder: http://localhost:5173/pc-builder
- AI Chat: http://localhost:5173/ai-chat
- Đăng nhập: http://localhost:5173/login
- Đăng ký: http://localhost:5173/register
- Profile: http://localhost:5173/profile
- Giỏ hàng: http://localhost:5173/cart
- Checkout: http://localhost:5173/checkout
- Đơn hàng: http://localhost:5173/orders
- Tickets: http://localhost:5173/tickets
- Bảo hành: http://localhost:5173/warranties
- Staff Orders: http://localhost:5173/staff/orders
- Staff Chat: http://localhost:5173/staff/chat
- Tech Tickets: http://localhost:5173/tech/tickets
- Tech Compatibility: http://localhost:5173/tech/compatibility
- Admin Dashboard: http://localhost:5173/admin/dashboard
- Admin System: http://localhost:5173/admin/system
- Admin Products: http://localhost:5173/admin/products
- Admin Users: http://localhost:5173/admin/users
