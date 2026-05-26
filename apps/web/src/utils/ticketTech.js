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
  "Mình đã tiếp nhận ticket và đang kiểm tra chi tiết.",
  "Bạn vui lòng gửi thêm ảnh lỗi, video hoặc mã đơn hàng để kỹ thuật kiểm tra nhanh hơn.",
  "Mình đã cập nhật hướng xử lý ban đầu, bạn kiểm tra lại giúp mình rồi phản hồi thêm nếu cần.",
  "Vấn đề đã được xử lý. Bạn kiểm tra lại giúp mình, nếu còn lỗi hãy phản hồi trong ticket này."
];

const ATTACHMENT_MARKER_REGEX = /\[(?:Tệp đính kèm khách đã chọn|Khách hàng đã chọn tệp đính kèm):\s*([^\]]+)\]/gi;

const MESSAGE_TRANSLATIONS = {
  "Checking logs. Done. Issue resolved.": "Đã kiểm tra log hệ thống và xử lý xong vấn đề.",
  "Checking logs. Done.": "Đã kiểm tra log hệ thống.",
  "Issue resolved.": "Vấn đề đã được giải quyết.",
  "Checking logs.": "Đang kiểm tra log hệ thống...",
  "LBSOD when playing Cyberpunk 2077": "Lỗi màn hình xanh khi chơi Cyberpunk 2077",
  "Smoke ticket": "Ticket kiểm thử hệ thống",
  "Smoke Customer Ticket": "Yêu cầu hỗ trợ mẫu",
  "Smoke support ticket": "Ticket hỗ trợ kỹ thuật mẫu"
};

function dedupeAttachments(list) {
  const seen = new Set();
  return list.filter((item) => {
    const key = `${item.name}-${item.sizeLabel || ""}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function extractAttachmentMentions(text) {
  if (!text) return [];

  const matches = [];
  for (const match of String(text).matchAll(ATTACHMENT_MARKER_REGEX)) {
    const rawItems = String(match[1] || "")
      .split(/,\s*/)
      .map((item) => item.trim())
      .filter(Boolean);

    rawItems.forEach((rawItem, index) => {
      const attachmentMatch = rawItem.match(/^(.*?)(?:\s*\(([^)]+)\))?$/);
      const name = attachmentMatch?.[1]?.trim() || `Tệp đính kèm ${index + 1}`;
      const sizeLabel = attachmentMatch?.[2]?.trim() || "";
      matches.push({
        id: `${name}-${sizeLabel || index}`.replace(/\s+/g, "-").toLowerCase(),
        name,
        sizeLabel
      });
    });
  }

  return dedupeAttachments(matches);
}

export function stripAttachmentMarker(text) {
  return String(text || "")
    .replace(ATTACHMENT_MARKER_REGEX, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function translateTicketText(text) {
  const source = String(text || "");
  return MESSAGE_TRANSLATIONS[source] || source;
}

export function normalizeTicketText(text) {
  return stripAttachmentMarker(translateTicketText(text));
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
