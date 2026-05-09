# UI/UX

## Actor 1: Guest

Guest khong can dang nhap. Cac tinh nang public can test:

| # | Trang | URL | Ket qua ky vong |
|---|---|---|---|
| 1 | Trang chu | `/` | Hien banner, danh muc va danh sach san pham noi bat |
| 2 | Danh muc san pham | `/products` | Tim kiem, loc category, brand, gia va thuoc tinh |
| 3 | Chi tiet san pham | `/products/:slug` | Hien hinh anh, mo ta, SKU, ton kho va thong so ky thuat |
| 4 | So sanh san pham | `/compare` | Them 2-4 san pham va hien bang so sanh |
| 5 | Build PC Guest | `/pc-builder` | Chon linh kien, tinh tong tien, luu tam vao LocalStorage |
| 6 | Tra cuu bao hanh | `/warranties` | Nhap ma bao hanh/serial de tra cuu trang thai |
| 7 | AI Chat | `/ai-chat` hoac `/ai-advisor` | Hoi AI ve linh kien va cau hinh PC |

## Luong Test Chi Tiet: Build PC Guest

```text
1. Vao /pc-builder khi chua dang nhap.
2. CPU: chon san pham -> chon phien ban -> nhan "Xac nhan".
   - The CPU chuyen sang trang thai da chon, tong tien cap nhat.
3. Mainboard: thao tac tuong tu.
4. Nhan "Kiem tra tuong thich" khi da co it nhat 2 linh kien.
   - Panel ket qua hien compatible hoac danh sach loi.
5. AI Advisor: nhap ngan sach, chon nhu cau -> "Lay goi y AI".
   - Bang goi y hien ra -> nhan "Ap dung toan bo".
6. Nhan "Luu cau hinh".
   - Guest duoc chuyen sang trang dang nhap, vi can login de luu vao tai khoan.
7. Tai lai trang.
   - Cau hinh Guest van con trong LocalStorage neu chua xoa.
```
