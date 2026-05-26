const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, 'Screenshot 2026-05-25 123316.png');
const targetPath = path.join(__dirname, 'bank-qr.png');

if (fs.existsSync(sourcePath)) {
  fs.renameSync(sourcePath, targetPath);
  console.log('Đã đổi tên ảnh mã QR thành công!');
} else {
  console.log('Không tìm thấy ảnh nguồn!');
}
