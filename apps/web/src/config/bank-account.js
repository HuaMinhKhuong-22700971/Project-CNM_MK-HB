// Cấu hình tài khoản ngân hàng cho thanh toán chuyển khoản
export const BANK_ACCOUNT_CONFIG = {
  bankName: "Techcombank",
  accountNumber: "8686868991",
  accountHolder: "HỨA MINH KHƯƠNG",
  qrCodeImage: "/images/Screenshot 2026-05-25 123316.png", // Đường dẫn tới ảnh mã QR trong thư mục public
  transferNote: "DH" // Tiền tố nội dung chuyển khoản
};

// Hàm tạo nội dung chuyển khoản
export function generateTransferNote(userPhone) {
  return `${BANK_ACCOUNT_CONFIG.transferNote}${userPhone}`;
}
