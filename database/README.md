# Database

## Dump chính thức

Import file SQL gốc của dự án (schema + dữ liệu mẫu):

```bash
mysql -h 127.0.0.1 -P 3307 -u root -proot cnm_mk_hb < "../cnm_ecommerce (1).sql"
```

Sau khi import, chạy seed tài khoản demo chuẩn README:

```bash
npm run seed:production -w services/api
```

## Tài khoản demo (sau seed:production)

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| Admin | admin@cnm.local | Admin@123 |
| Sales | sales@cnm.local | Sales@123 |
| Tech | tech1@cnm.local | Tech@123 |
| Customer | customer@cnm.local | Customer@123 |
