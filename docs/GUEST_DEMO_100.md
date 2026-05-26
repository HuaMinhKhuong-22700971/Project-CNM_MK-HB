# Checklist Demo 100% — Khách hàng vãng lai

Chạy seed trước khi demo:

```bash
npm run seed:guest-demo -w services/api
npm run dev
```

Truy cập: http://localhost:5173 (không đăng nhập)

## 1. Xem danh mục & lọc (`/products`)

- [ ] Danh sách sản phẩm hiển thị ảnh (không trống)
- [ ] Lọc danh mục, thương hiệu, khoảng giá
- [ ] Sidebar **Thông số kỹ thuật**: Socket, Loại RAM, PSU…
- [ ] Chọn socket (vd. LGA1700) → danh sách thu hổi
- [ ] Sắp xếp giá tăng/giảm hoạt động
- [ ] URL có tham số lọc (F5 vẫn giữ)

## 2. Chi tiết & so sánh

- [ ] `/products/:id` — ảnh, giá, thông số
- [ ] Nút **So sánh** trên thẻ sản phẩm
- [ ] `/compare?ids=...` — bảng so sánh tối đa 4 SP

## 3. Build PC (`/pc-builder`)

- [ ] Chọn linh kiện 7 nhóm (guest)
- [ ] **Kiểm tra tương thích** (≥ 2 linh kiện)
- [ ] **Lưu trên trình duyệt**
- [ ] Tạo nhiều cấu hình, đổi tên
- [ ] **Xuất / nhập JSON**
- [ ] AI Advisor gợi ý cấu hình

## 4. AI Chat (`/ai-chat`)

- [ ] Gửi câu hỏi, nhận phản hồi (OpenAI hoặc Demo Mode)
- [ ] F5 trang — lịch sử chat còn
- [ ] **Xóa lịch sử chat**
- [ ] **Gặp nhân viên** (live chat demo)

## 5. Đăng ký (`/register`)

- [ ] Đăng ký email + mật khẩu
- [ ] Nút Google có nhãn **DEMO**
- [ ] Sau đăng ký → đăng nhập, dùng giỏ hàng / lưu build cloud

## Ghi chú báo cáo

- Google Sign-In: **tích hợp demo** (không OAuth production).
- Dữ liệu guest (build/chat): **localStorage** + export JSON.
- Seed: `seed-guest-demo.js` đảm bảo thuộc tính & ảnh cho demo.
