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

const LEGACY_ATTACHMENT_MARKER_REGEX = /\[(?:Tệp đính kèm khách đã chọn|Khách hàng đã chọn tệp đính kèm|Tệp đính kèm khách|Khách hàng chọn tệp đính kèm):\s*([^\]]+)\]/gi;
const UPLOADED_ATTACHMENT_MARKER_REGEX = /\[(?:ATTACHMENTS_JSON|Tệp đính kèm):\s*(\[[\s\S]*?\])\]/gi;

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
    const key = `${item.name}-${item.sizeLabel || ""}-${item.fileUrl || item.url || ""}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeAttachment(rawAttachment, index) {
  const attachment = rawAttachment && typeof rawAttachment === "object" ? rawAttachment : {};
  const name = String(attachment.name || attachment.originalName || `Tệp đính kèm ${index + 1}`).trim();
  const sizeLabel = String(attachment.sizeLabel || "").trim();
  const mimeType = String(attachment.mimeType || attachment.type || "").trim();
  const fileUrl = String(attachment.fileUrl || attachment.url || "").trim();

  return {
    id: `${name}-${sizeLabel || index}-${fileUrl || "legacy"}`.replace(/\s+/g, "-").toLowerCase(),
    name,
    size: attachment.size,
    sizeLabel,
    mimeType,
    url: attachment.url || "",
    fileUrl
  };
}

function parseUploadedAttachmentMarkers(text) {
  const matches = [];
  for (const match of String(text).matchAll(UPLOADED_ATTACHMENT_MARKER_REGEX)) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed)) {
        parsed.forEach((attachment, index) => matches.push(normalizeAttachment(attachment, index)));
      }
    } catch (_error) {
      // Keep the ticket readable if a legacy/manual marker has invalid JSON.
    }
  }
  return matches;
}

function parseLegacyAttachmentMarkers(text) {
  const matches = [];
  for (const match of String(text).matchAll(LEGACY_ATTACHMENT_MARKER_REGEX)) {
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
        sizeLabel,
        mimeType: "",
        fileUrl: "",
        url: ""
      });
    });
  }
  return matches;
}

export function extractAttachmentMentions(text) {
  if (!text) return [];
  return dedupeAttachments([
    ...parseUploadedAttachmentMarkers(text),
    ...parseLegacyAttachmentMarkers(text)
  ]);
}

export function stripAttachmentMarker(text) {
  return String(text || "")
    .replace(UPLOADED_ATTACHMENT_MARKER_REGEX, "")
    .replace(LEGACY_ATTACHMENT_MARKER_REGEX, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function getAttachmentUrl(attachment) {
  const rawUrl = String(attachment?.fileUrl || attachment?.url || "").trim();
  if (!rawUrl) return "";

  if (rawUrl.startsWith("/uploads/")) {
    return typeof window !== "undefined" ? `${window.location.origin}${rawUrl}` : rawUrl;
  }

  if (typeof window !== "undefined" && /^https?:\/\/localhost(?::\d+)?\/uploads\//i.test(rawUrl)) {
    try {
      const parsed = new URL(rawUrl);
      if (parsed.pathname.startsWith("/uploads/")) {
        return `${window.location.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch (_error) {
      return rawUrl.replace(/^https?:\/\/localhost(?::\d+)?/i, window.location.origin);
    }
  }

  return rawUrl;
}

export async function downloadAttachment(attachment) {
  const attachmentUrl = getAttachmentUrl(attachment);
  if (!attachmentUrl) return;

  const response = await fetch(attachmentUrl);
  if (!response.ok) {
    throw new Error("Không thể tải tệp đính kèm.");
  }

  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = attachment?.name || "ticket-attachment";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
}

export function isImageAttachment(attachment) {
  const mimeType = String(attachment?.mimeType || "").toLowerCase();
  const name = String(attachment?.name || "").toLowerCase();
  return mimeType.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
}

export function isVideoAttachment(attachment) {
  const mimeType = String(attachment?.mimeType || "").toLowerCase();
  const name = String(attachment?.name || "").toLowerCase();
  return mimeType.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(name);
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
