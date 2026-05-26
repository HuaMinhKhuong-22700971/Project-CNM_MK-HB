# Hướng Dẫn Test Chức Năng Khách Hàng (Customer)

## Tổng Quan
Tài liệu này hướng dẫn việc test đầy đủ các chức năng của actor **Khách hàng** trên hệ thống thương mại điện tử PC Mall.

## Chuẩn Bị
- Truy cập: http://localhost:5173
- Tài khoản khách hàng (nếu cần test chức năng đăng nhập):
  - Email: `customer@demo.com`
  - Password: `123456`

## 1. Đăng Ký Tài Khoản

### Test Case 1.1: Đăng ký tài khoản mới
1. Truy cập trang đăng ký: http://localhost:5173/register
2. Nhập thông tin:
   - Họ tên: `Nguyễn Văn Test`
   - Email: `testcustomer@example.com`
   - Password: `123456`
   - Xác nhận Password: `123456`
3. Click "Đăng ký"
4. **Kết quả mong đợi:** Tài khoản được tạo thành công, chuyển đến trang đăng nhập hoặc trang chủ

### Test Case 1.2: Đăng ký với email đã tồn tại
1. Sử dụng email đã đăng ký: `customer@demo.com`
2. Nhập thông tin khác
3. Click "Đăng ký"
4. **Kết quả mong đợi:** Hiển thị lỗi "Email đã tồn tại"

### Test Case 1.3: Đăng ký với mật khẩu không khớp
1. Nhập password: `123456`
2. Nhập xác nhận password: `1234567`
3. Click "Đăng ký"
4. **Kết quả mong đợi:** Hiển thị lỗi "Mật khẩu không khớp"

## 2. Đăng Nhập

### Test Case 2.1: Đăng nhập thành công
1. Truy cập trang đăng nhập: http://localhost:5173/login
2. Nhập email: `customer@demo.com`
3. Nhập password: `123456`
4. Click "Đăng nhập"
5. **Kết quả mong đợi:** Đăng nhập thành công, chuyển đến trang chủ

### Test Case 2.2: Đăng nhập với thông tin sai
1. Nhập email sai: `wrong@demo.com`
2. Nhập password sai: `wrongpassword`
3. Click "Đăng nhập"
4. **Kết quả mong đợi:** Hiển thị lỗi "Email hoặc mật khẩu không đúng"

## 3. Xem Danh Sách Sản Phẩm

### Test Case 3.1: Xem tất cả sản phẩm
1. Truy cập trang sản phẩm: http://localhost:5173/products
2. **Kết quả mong đợi:** Hiển thị danh sách sản phẩm với hình ảnh, tên, giá, đánh giá

### Test Case 3.2: Lọc sản phẩm theo danh mục
1. Chọn danh mục "CPU"
2. **Kết quả mong đợi:** Chỉ hiển thị sản phẩm CPU

### Test Case 3.3: Tìm kiếm sản phẩm
1. Nhập từ khóa "RTX 4060" vào ô tìm kiếm
2. Click "Tìm kiếm"
3. **Kết quả mong đợi:** Hiển thị các sản phẩm có chứa "RTX 4060"

### Test Case 3.4: Sắp xếp sản phẩm theo giá
1. Chọn sắp xếp "Giá thấp đến cao"
2. **Kết quả mong đợi:** Sản phẩm được sắp xếp theo giá tăng dần

### Test Case 3.5: Xem chi tiết sản phẩm
1. Click vào một sản phẩm bất kỳ
2. **Kết quả mong đợi:** Hiển thị chi tiết sản phẩm với mô tả, thông số kỹ thuật, hình ảnh

### Test Case 3.6: Xem sản phẩm Laptop
1. Chọn danh mục "LAPTOP"
2. **Kết quả mong đợi:** Hiển thị 8 sản phẩm laptop với hình ảnh

### Test Case 3.7: Xem sản phẩm Máy tính hoàn chỉnh
1. Chọn danh mục "COMPLETE PC"
2. **Kết quả mong đợi:** Hiển thị 5 sản phẩm máy tính hoàn chỉnh

## 4. Giỏ Hàng

### Test Case 4.1: Thêm sản phẩm vào giỏ hàng
1. Vào trang chi tiết sản phẩm
2. Chọn số lượng (ví dụ: 2)
3. Click "Thêm vào giỏ hàng"
4. **Kết quả mong đợi:** Hiển thị thông báo "Đã thêm vào giỏ hàng", số lượng giỏ hàng tăng

### Test Case 4.2: Xem giỏ hàng
1. Click vào icon giỏ hàng
2. **Kết quả mong đợi:** Hiển thị danh sách sản phẩm trong giỏ hàng với tổng tiền

### Test Case 4.3: Cập nhật số lượng sản phẩm trong giỏ
1. Trong trang giỏ hàng, thay đổi số lượng sản phẩm
2. Click "Cập nhật"
3. **Kết quả mong đợi:** Tổng tiền được cập nhật theo số lượng mới

### Test Case 4.4: Xóa sản phẩm khỏi giỏ hàng
1. Click nút "Xóa" bên cạnh sản phẩm
2. **Kết quả mong đợi:** Sản phẩm được xóa khỏi giỏ hàng, tổng tiền giảm

### Test Case 4.5: Thêm nhiều sản phẩm khác nhau vào giỏ
1. Thêm sản phẩm CPU vào giỏ
2. Thêm sản phẩm RAM vào giỏ
3. Thêm sản phẩm GPU vào giỏ
4. **Kết quả mong đợi:** Giỏ hàng chứa 3 sản phẩm khác nhau

## 5. Đặt Hàng (Checkout)

### Test Case 5.1: Đặt hàng với thông tin mới
1. Đăng nhập vào tài khoản khách hàng
2. Thêm sản phẩm vào giỏ hàng
3. Click "Thanh toán"
4. Nhập thông tin địa chỉ:
   - Họ tên: `Nguyễn Văn Test`
   - Số điện thoại: `0123456789`
   - Tỉnh/Thành phố: `Hà Nội`
   - Quận/Huyện: `Cầu Giấy`
   - Địa chỉ chi tiết: `123 Đường ABC, Phường XYZ`
5. Chọn phương thức thanh toán: "COD"
6. Click "Đặt hàng"
7. **Kết quả mong đợi:** Đơn hàng được tạo thành công, hiển thị mã đơn hàng

### Test Case 5.2: Đặt hàng với địa chỉ đã lưu
1. Đăng nhập vào tài khoản có địa chỉ đã lưu
2. Thêm sản phẩm vào giỏ hàng
3. Click "Thanh toán"
4. Chọn địa chỉ từ danh sách địa chỉ đã lưu
5. Chọn phương thức thanh toán: "VNPAY"
6. Click "Thanh toán VNPAY"
7. **Kết quả mong đợi:** Chuyển đến trang thanh toán VNPAY (sandbox)

### Test Case 5.3: Đặt hàng với giỏ hàng trống
1. Vào trang giỏ hàng với giỏ trống
2. Click "Thanh toán"
3. **Kết quả mong đợi:** Hiển thị thông báo "Giỏ hàng trống"

### Test Case 5.4: Đặt hàng với thông tin thiếu
1. Bỏ trống trường "Số điện thoại"
2. Click "Đặt hàng"
3. **Kết quả mong đợi:** Hiển thị lỗi "Vui lòng nhập số điện thoại"

## 6. Xem Lịch Sử Đơn Hàng

### Test Case 6.1: Xem danh sách đơn hàng
1. Đăng nhập vào tài khoản khách hàng
2. Vào trang "Đơn hàng của tôi"
3. **Kết quả mong đợi:** Hiển thị danh sách các đơn hàng đã đặt với trạng thái

### Test Case 6.2: Xem chi tiết đơn hàng
1. Click vào một đơn hàng trong danh sách
2. **Kết quả mong đợi:** Hiển thị chi tiết đơn hàng: sản phẩm, giá, địa chỉ, trạng thái

### Test Case 6.3: Hủy đơn hàng (nếu cho phép)
1. Chọn đơn hàng ở trạng thái "Chờ xác nhận"
2. Click "Hủy đơn hàng"
3. **Kết quả mong đợi:** Đơn hàng được hủy, trạng thái chuyển thành "Đã hủy"

## 7. Quản Lý Địa Chỉ

### Test Case 7.1: Thêm địa chỉ mới
1. Đăng nhập vào tài khoản khách hàng
2. Vào trang "Địa chỉ của tôi"
3. Click "Thêm địa chỉ mới"
4. Nhập thông tin địa chỉ
5. Click "Lưu"
6. **Kết quả mong đợi:** Địa chỉ được thêm thành công

### Test Case 7.2: Sửa địa chỉ
1. Click nút "Sửa" bên cạnh địa chỉ
2. Cập nhật thông tin
3. Click "Lưu"
4. **Kết quả mong đợi:** Địa chỉ được cập nhật thành công

### Test Case 7.3: Xóa địa chỉ
1. Click nút "Xóa" bên cạnh địa chỉ
2. Xác nhận xóa
3. **Kết quả mong đợi:** Địa chỉ được xóa thành công

### Test Case 7.4: Đặt địa chỉ mặc định
1. Click nút "Đặt mặc định" bên cạnh địa chỉ
2. **Kết quả mong đợi:** Địa chỉ được đánh dấu là mặc định

## 8. AI Advisor (Chat AI)

### Test Case 8.1: Chat với AI Advisor
1. Truy cập trang AI Chat: http://localhost:5173/ai-chat
2. Nhập câu hỏi: "Tư vấn cấu hình PC gaming 20 triệu"
3. Click "Gửi"
4. **Kết quả mong đợi:** AI trả lời với tư vấn cấu hình PC phù hợp

### Test Case 8.2: Hỏi về sản phẩm cụ thể
1. Nhập câu hỏi: "RTX 4060 có chơi được game gì?"
2. Click "Gửi"
3. **Kết quả mong đợi:** AI trả lời về khả năng chơi game của RTX 4060

### Test Case 8.3: Hỏi về so sánh sản phẩm
1. Nhập câu hỏi: "So sánh Intel i5 và AMD Ryzen 5"
2. Click "Gửi"
3. **Kết quả mong đợi:** AI trả lời so sánh chi tiết giữa 2 dòng CPU

### Test Case 8.4: Hỏi về tương thích linh kiện
1. Nhập câu hỏi: "Mainboard LGA1700 dùng được CPU nào?"
2. Click "Gửi"
3. **Kết quả mong đợi:** AI trả lời về các CPU tương thích với socket LGA1700

### Test Case 8.5: Chuyển sang Live Chat với nhân viên
1. Trong trang AI Chat, click "Chat với nhân viên"
2. **Kết quả mong đợi:** Tạo phiên chat live với nhân viên

## 9. PC Builder (Xây Dựng Cấu Hình PC)

### Test Case 9.1: Tạo cấu hình PC mới
1. Truy cập trang PC Builder: http://localhost:5173/pc-builder
2. Chọn ngân sách: "20-30 triệu"
3. Chọn mục đích: "Gaming"
4. Click "Bắt đầu xây dựng"
5. **Kết quả mong đợi:** Hiển thị giao diện build PC với danh sách linh kiện

### Test Case 9.2: Chọn CPU
1. Click vào mục "CPU"
2. Chọn CPU: "Intel Core i5-14400F"
3. **Kết quả mong đợi:** CPU được thêm vào cấu hình, hiển thị giá

### Test Case 9.3: Chọn Mainboard tương thích
1. Click vào mục "Mainboard"
2. Chọn Mainboard: "ASUS Prime B760M-A"
3. **Kết quả mong đợi:** Mainboard được thêm vào, kiểm tra tương thích với CPU

### Test Case 9.4: Kiểm tra tương thích
1. Chọn linh kiện không tương thích (nếu có)
2. **Kết quả mong đợi:** Hiển thị cảnh báo tương thích

### Test Case 9.5: Lưu cấu hình
1. Điền tên cấu hình: "PC Gaming Tầm Trung"
2. Click "Lưu cấu hình"
3. **Kết quả mong đợi:** Cấu hình được lưu, hiển thị trong danh sách cấu hình đã lưu

### Test Case 9.6: Chia sẻ cấu hình
1. Click "Chia sẻ"
2. **Kết quả mong đợi:** Tạo link chia sẻ cấu hình

### Test Case 9.7: Thêm cấu hình vào giỏ hàng
1. Click "Thêm vào giỏ hàng"
2. **Kết quả mong đợi:** Cấu hình được thêm vào giỏ hàng như một sản phẩm

## 10. Đăng Xuất

### Test Case 10.1: Đăng xuất
1. Đăng nhập vào tài khoản khách hàng
2. Click menu profile
3. Click "Đăng xuất"
4. **Kết quả mong đợi:** Đăng xuất thành công, chuyển đến trang đăng nhập

## 11. Responsive Testing

### Test Case 11.1: Test trên màn hình desktop
1. Mở trình duyệt ở chế độ desktop (1920x1080)
2. Test các chức năng chính
3. **Kết quả mong đợi:** Giao diện hiển thị đẹp, đầy đủ chức năng

### Test Case 11.2: Test trên màn hình tablet
1. Mở trình duyệt ở chế độ tablet (768x1024)
2. Test các chức năng chính
3. **Kết quả mong đợi:** Giao diện responsive, menu chuyển sang dạng hamburger

### Test Case 11.3: Test trên màn hình mobile
1. Mở trình duyệt ở chế độ mobile (375x667)
2. Test các chức năng chính
3. **Kết quả mong đợi:** Giao diện mobile-friendly, dễ sử dụng

## Checklist Test

- [ ] Đăng ký tài khoản mới
- [ ] Đăng nhập thành công
- [ ] Xem danh sách sản phẩm
- [ ] Lọc sản phẩm theo danh mục
- [ ] Tìm kiếm sản phẩm
- [ ] Sắp xếp sản phẩm theo giá
- [ ] Xem chi tiết sản phẩm
- [ ] Thêm sản phẩm vào giỏ hàng
- [ ] Xem giỏ hàng
- [ ] Cập nhật số lượng trong giỏ
- [ ] Xóa sản phẩm khỏi giỏ
- [ ] Đặt hàng với COD
- [ ] Đặt hàng với VNPAY
- [ ] Xem lịch sử đơn hàng
- [ ] Xem chi tiết đơn hàng
- [ ] Thêm địa chỉ mới
- [ ] Sửa địa chỉ
- [ ] Xóa địa chỉ
- [ ] Chat với AI Advisor
- [ ] Tạo cấu hình PC mới
- [ ] Chọn linh kiện cho PC
- [ ] Kiểm tra tương thích
- [ ] Lưu cấu hình PC
- [ ] Đăng xuất
- [ ] Test responsive trên desktop
- [ ] Test responsive trên tablet
- [ ] Test responsive trên mobile

## Ghi Chú
- Một số chức năng có thể cần dữ liệu mẫu trong database
- Thanh toán VNPAY sử dụng sandbox, không chuyển tiền thật
- AI Advisor sử dụng Groq AI, có thể phản hồi khác nhau mỗi lần
- PC Builder có thể cần dữ liệu sản phẩm linh kiện đầy đủ

## Báo Cáo Lỗi
Nếu phát hiện lỗi trong quá trình test, hãy ghi lại:
- **Test Case:** Tên test case
- **Bước thực hiện:** Các bước đã làm
- **Kết quả thực tế:** Kết quả nhận được
- **Kết quả mong đợi:** Kết quả nên có
- **Screenshot:** Ảnh chụp màn hình lỗi (nếu có)
