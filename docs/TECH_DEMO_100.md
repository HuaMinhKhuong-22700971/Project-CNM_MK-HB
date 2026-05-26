# Checklist Demo 100% — Nhân viên kỹ thuật (TECH_STAFF)

Tài khoản demo: `tech1@cnm.local` / `Tech@123` (role DB có thể là `TECHNICIAN`, hệ thống chuẩn hóa thành `TECH_STAFF`).

Đăng nhập `/login` → tự chuyển `/tech/tickets`.

## Luồng demo đề xuất (12 phút)

### 1. Ticket kỹ thuật (`/tech/tickets`)
- [ ] Xem metric: **Chưa giao**, **Đang xử lý (tôi)**
- [ ] Lọc **Chưa giao** → chọn ticket OPEN
- [ ] **Nhận xử lý** → trạng thái IN_PROGRESS
- [ ] Gửi **phản hồi mẫu** hoặc tin nhắn tùy chỉnh
- [ ] Đổi **ưu tiên** / **trạng thái** từ dropdown
- [ ] **Đánh dấu đã giải quyết** → RESOLVED
- [ ] (Tuỳ chọn) **Đóng ticket** → CLOSED

### 2. Luồng khách tạo ticket (tab khác)
- [ ] Khách đăng nhập → `/tickets/new` → tạo ticket
- [ ] Tab kỹ thuật: badge menu tăng, ticket xuất hiện ở **Chưa giao**

### 3. Luật tương thích (`/tech/compatibility`)
- [ ] Xem danh sách rule PC Builder
- [ ] Tạo / sửa rule (socket CPU ↔ mainboard)
- [ ] Bật/tắt rule → kiểm tra `/pc-builder`

### 4. Bảo hành
- [ ] Menu **Tra cứu bảo hành** → `/warranties`
- [ ] Tra mã bảo hành hoặc kích hoạt (sau đơn DELIVERED)

## Ghi chú báo cáo

| Tính năng | Mức demo |
|-----------|----------|
| Queue ticket + lọc scope/status | ✅ |
| Nhận xử lý + phản hồi + đóng ticket | ✅ |
| Badge ticket chưa giao trên nav | ✅ |
| Luật tương thích (TECH + ADMIN API) | ✅ |
| Giao diện tech workspace thống nhất | ✅ |
| Gán ticket cho nhân viên khác | Chưa (chỉ nhận cho mình) |
| Đính kèm file ảnh trong ticket | Chưa |
| WebSocket hội thoại realtime | Chưa (refresh khi chọn lại) |

## API liên quan

- `GET /api/tickets/stats` — thống kê hàng đợi
- `GET /api/tickets?scope=UNASSIGNED|ASSIGNED|ALL` — danh sách
- `PATCH /api/tickets/:id` — cập nhật trạng thái / gán người
- `POST /api/tickets/:id/messages` — phản hồi
- `GET/POST/PATCH /api/admin/compatibility-rules` — luật tương thích (TECH_STAFF được phép)
