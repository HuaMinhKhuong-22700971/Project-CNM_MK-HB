# Dev tools (legacy)

Các script debug/seed một lần đã được gom từ thư mục gốc repo. Chỉ dùng khi phát triển cục bộ — **không** chạy trên production.

## Seed chính thức

```bash
npm run seed:production -w services/api
```

## Script trong thư mục này

- `check_*` — kiểm tra DB/API thủ công
- `seed_*` — seed laptop/catalog thử nghiệm
- `fix_*`, `debug_*` — sửa ảnh/tồn kho tạm thời
