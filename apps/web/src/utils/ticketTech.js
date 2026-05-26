export const TICKET_STATUS_META = {
  OPEN: { label: "Mới", tone: "info" },
  IN_PROGRESS: { label: "Đang xử lý", tone: "warning" },
  RESOLVED: { label: "Đã giải quyết", tone: "success" },
  CLOSED: { label: "Đã đóng", tone: "neutral" }
};

export const TICKET_PRIORITY_META = {
  LOW: { label: "Thấp", tone: "neutral" },
  MEDIUM: { label: "Trung bình", tone: "info" },
  HIGH: { label: "Cao", tone: "warning" },
  URGENT: { label: "Khẩn cấp", tone: "danger" }
};

export const TICKET_REPLY_TEMPLATES = [
  "Chào bạn, bộ phận kỹ thuật PC Mall đã nhận ticket và đang kiểm tra.",
  "Vui lòng cung cấp thêm ảnh/video lỗi và mã đơn hàng (nếu có) để hỗ trợ nhanh hơn.",
  "Chúng tôi đã cập nhật driver/firmware — bạn thử khởi động lại và kiểm tra giúp nhé.",
  "Ticket đã xử lý xong. Nếu còn lỗi, bạn phản hồi lại trong 48 giờ để được hỗ trợ tiếp."
];

const MESSAGE_TRANSLATIONS = {
  "Checking logs. Done. Issue resolved.": "Đã kiểm tra log hệ thống. Đã tìm ra nguyên nhân và đã xử lý xong lỗi.",
  "Checking logs. Done.": "Đã kiểm tra log hệ thống. Đã xong.",
  "Issue resolved.": "Vấn đề đã được giải quyết thành công.",
  "Checking logs.": "Đang kiểm tra log hệ thống...",
  "LBSOD when playing Cyberpunk 2077": "Lỗi màn hình xanh (BSOD) khi đang chơi Cyberpunk 2077",
  "Smoke ticket": "Ticket kiểm thử hệ thống",
  "Smoke Customer Ticket": "Yêu cầu hỗ trợ khách hàng mẫu",
  "Smoke support ticket": "Yêu cầu tư vấn kỹ thuật mẫu"
};

export function translateTicketText(text) {
  return MESSAGE_TRANSLATIONS[text] || text;
}

export function getTicketStatusMeta(status) {
  return TICKET_STATUS_META[status] || { label: status || "Không rõ", tone: "neutral" };
}

export function getTicketPriorityMeta(priority) {
  return TICKET_PRIORITY_META[priority] || { label: priority || "Không rõ", tone: "neutral" };
}

export function isTechSender(role) {
  const normalized = String(role || "").toUpperCase();
  return ["ADMIN", "TECH_STAFF", "TECHNICIAN", "SALES_STAFF", "SALES"].includes(normalized);
}
