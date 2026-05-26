import axios from "axios";

export const ADMIN_ROLE_META = {
  ADMIN: { label: "Quản trị", tone: "primary" },
  SALES_STAFF: { label: "Kinh doanh", tone: "info" },
  TECH_STAFF: { label: "Kỹ thuật", tone: "tech" },
  TECHNICIAN: { label: "Kỹ thuật", tone: "tech" },
  CUSTOMER: { label: "Khách hàng", tone: "neutral" }
};

export const ADMIN_STATUS_META = {
  ACTIVE: { label: "Hoạt động", tone: "success" },
  INACTIVE: { label: "Ngưng", tone: "neutral" },
  BLOCKED: { label: "Khóa", tone: "danger" }
};

export function getAdminErrorMessage(error, fallback) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }
  return error?.message || fallback;
}

export function getAdminEnvelopeData(response, fallback) {
  if (response && typeof response === "object" && "data" in response) {
    return response.data ?? fallback;
  }
  return response ?? fallback;
}

export function normalizeAdminList(response) {
  const payload = getAdminEnvelopeData(response, []);
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.items) ? payload.items : [];
}

export function formatAdminDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

export function formatAdminNumber(value) {
  if (value === null || value === undefined) return "—";
  return Number(value).toLocaleString("vi-VN");
}

export function getRoleMeta(role) {
  return ADMIN_ROLE_META[String(role || "").toUpperCase()] || { label: role || "—", tone: "neutral" };
}

export function getStatusMeta(status) {
  return ADMIN_STATUS_META[String(status || "").toUpperCase()] || { label: status || "—", tone: "neutral" };
}
