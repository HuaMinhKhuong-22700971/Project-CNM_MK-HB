# Checklist Demo 100% — Nhân viên bán hàng (SALES_STAFF)

Tài khoản demo: `sales@cnm.local` / `Sales@123`  
Đăng nhập tại `/login` → tự chuyển khu vực `/staff/orders`.

## Luồng demo đề xuất (12 phút)

### 1. Xử lý đơn hàng (`/staff/orders`)
- [ ] Lọc đơn **Chờ xử lý** → chọn đơn
- [ ] Bấm **Xử lý đơn** → trạng thái PROCESSING
- [ ] Chọn đơn vị vận chuyển (GHTK / VNPost / J&T)
- [ ] Bấm **Tạo mã demo** hoặc nhập mã thủ công
- [ ] Bấm **Giao vận** → SHIPPED + vận đơn mock
- [ ] Bấm **Hoàn thành** → DELIVERED
- [ ] Dùng mẫu ghi chú → **Lưu ghi chú** tư vấn
- [ ] (Tuỳ chọn) Hủy đơn PENDING với lý do

### 2. Tư vấn chat trực tuyến (`/staff/chat`)
- [ ] Tab khách: mở `/ai-chat` → **Kết nối nhân viên**
- [ ] Tab nhân viên: thấy badge hàng đợi trên menu **Tư vấn khách**
- [ ] Chọn phiên **Chờ nhận** → tự nhận phiên
- [ ] Gửi tin nhanh / tin nhắn tùy chỉnh
- [ ] Mở **PC Builder** (tab mới) → chọn linh kiện → **Gửi cấu hình PC**
- [ ] **Kết thúc phiên** khi xong

### 3. Liên kết luồng
- [ ] Từ chat → link **Xử lý đơn hàng**
- [ ] Từ đơn hàng → link **Tư vấn chat**

## Ghi chú báo cáo

| Tính năng | Mức demo |
|-----------|----------|
| Quy trình đơn PENDING → DELIVERED | ✅ |
| Vận đơn mock + đơn vị VC | ✅ |
| Ghi chú tư vấn (mẫu + lưu DB) | ✅ |
| Chat queue + nhận phiên | ✅ |
| Chat lưu file JSON (khởi động lại API vẫn còn) | ✅ `services/api/src/data/chat-sessions.json` |
| Chat bảo vệ JWT (queue/accept/close) | ✅ |
| Gửi cấu hình PC trong chat | ✅ |
| WebSocket chat realtime | Chưa (polling 3–5s) |
| Tích hợp đơn vị VC thật | Chưa (mock) |

## API liên quan

- `GET /api/chat/queue` — danh sách phiên (staff)
- `GET /api/chat/queue/stats` — số khách chờ
- `POST /api/chat/session/:id/accept` — nhận phiên
- `POST /api/chat/session/:id/close` — đóng phiên
- `PATCH /api/staff/orders/:id/status` — cập nhật trạng thái
- `POST /api/staff/orders/:id/shipment` — tạo/cập nhật vận đơn mock
