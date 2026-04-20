import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { getAdminSystemOverview, updateAdminSystemSettings } from "../../services/admin-system.service";

const FIELD_LABELS = {
  store_name: "Tên cửa hàng",
  support_email: "Email hỗ trợ",
  support_phone: "Số điện thoại hỗ trợ",
  online_payment_mode: "Chế độ thanh toán online",
  shipping_mode: "Chế độ vận chuyển",
  maintenance_mode: "Chế độ bảo trì"
};

const SELECT_OPTIONS = {
  online_payment_mode: ["sandbox", "live"],
  shipping_mode: ["mock", "live"],
  maintenance_mode: ["off", "on"]
};

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }

  return error?.message || fallbackMessage;
}

function normalizeSettings(items = []) {
  return items.reduce((accumulator, item) => {
    accumulator[item.key] = item.value ?? "";
    return accumulator;
  }, {});
}

function MetricCard({ label, value, tone = "default" }) {
  const palette = tone === "danger"
    ? { background: "#fef2f2", border: "#fecaca", color: "#b91c1c" }
    : tone === "success"
      ? { background: "#ecfdf5", border: "#a7f3d0", color: "#047857" }
      : { background: "#ffffff", border: "#e5e7eb", color: "#111827" };

  return (
    <div style={{ padding: 20, borderRadius: 18, background: palette.background, border: `1px solid ${palette.border}`, display: "grid", gap: 8 }}>
      <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b7280" }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: palette.color }}>{value}</div>
    </div>
  );
}

function formatDateTime(value) {
  if (!value) {
    return "Không rõ";
  }

  return new Date(value).toLocaleString("vi-VN");
}

export function AdminSystemPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [overview, setOverview] = useState(null);
  const [formState, setFormState] = useState({
    store_name: "",
    support_email: "",
    support_phone: "",
    online_payment_mode: "sandbox",
    shipping_mode: "mock",
    maintenance_mode: "off"
  });

  useEffect(() => {
    async function loadOverview() {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await getAdminSystemOverview();
        const payload = response?.data || response;
        setOverview(payload);
        setFormState((prevState) => ({
          ...prevState,
          ...normalizeSettings(payload?.settings || [])
        }));
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Không thể tải dữ liệu hệ thống."));
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, []);

  const settingsList = useMemo(() => overview?.settings || [], [overview]);
  const metrics = overview?.metrics || {};
  const health = overview?.health || {};
  const auditLogs = overview?.auditLogs || [];

  function handleChange(event) {
    const { name, value } = event.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  }

  async function handleSave(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");
      const response = await updateAdminSystemSettings(formState);
      const payload = response?.data || response;
      setOverview((prevState) => ({ ...prevState, settings: payload }));
      setSuccessMessage("Đã cập nhật cấu hình hệ thống.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể cập nhật cấu hình hệ thống."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section style={{ padding: 28, borderRadius: 28, background: "linear-gradient(135deg, rgba(15, 76, 63, 0.10), rgba(201, 169, 97, 0.22))", border: "1px solid rgba(15, 76, 63, 0.12)", boxShadow: "var(--shadow-soft)" }}>
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "#6b7280", marginBottom: 10 }}>Admin system</div>
        <h1 style={{ margin: 0, fontSize: 38, lineHeight: 1.05 }}>Cấu hình và tình trạng hệ thống</h1>
        <p style={{ margin: "12px 0 0", maxWidth: 760, color: "#4b5563", lineHeight: 1.75 }}>
          Khu vực này dùng để xem health check đơn giản, một số chỉ số tổng quan, log thao tác gần đây và cập nhật các cấu hình cơ bản phục vụ vận hành hệ thống ở mức đồ án.
        </p>
      </section>

      {errorMessage ? (
        <div style={{ padding: 14, borderRadius: 14, background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c" }}>{errorMessage}</div>
      ) : null}

      {successMessage ? (
        <div style={{ padding: 14, borderRadius: 14, background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857" }}>{successMessage}</div>
      ) : null}

      {loading ? (
        <div style={{ padding: 20, borderRadius: 18, background: "#ffffff", border: "1px solid #e5e7eb" }}>Đang tải thông tin hệ thống...</div>
      ) : (
        <>
          <section style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
            <MetricCard label="API" value={health?.api?.status || "UNKNOWN"} tone={health?.api?.status === "UP" ? "success" : "danger"} />
            <MetricCard label="Database" value={health?.database?.status || "UNKNOWN"} tone={health?.database?.status === "UP" ? "success" : "danger"} />
            <MetricCard label="Users" value={metrics.users ?? "-"} />
            <MetricCard label="Products" value={metrics.products ?? "-"} />
            <MetricCard label="Orders" value={metrics.orders ?? "-"} />
            <MetricCard label="Tickets" value={metrics.tickets ?? "-"} />
            <MetricCard label="Payments" value={metrics.payments ?? "-"} />
            <MetricCard label="Shipments" value={metrics.shipments ?? "-"} />
          </section>

          <section style={{ display: "grid", gap: 24, gridTemplateColumns: "minmax(0, 1.3fr) minmax(320px, 0.9fr)", alignItems: "start" }}>
            <form onSubmit={handleSave} style={{ display: "grid", gap: 18, padding: 24, borderRadius: 24, background: "#ffffff", border: "1px solid #e5e7eb", boxShadow: "var(--shadow-soft)" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 26 }}>Cấu hình cơ bản</h2>
                <p style={{ margin: "8px 0 0", color: "#6b7280" }}>Chỉ sửa những setting có ảnh hưởng đến chế độ vận hành sandbox hoặc mock của hệ thống.</p>
              </div>

              <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                {Object.entries(FIELD_LABELS).map(([key, label]) => (
                  <label key={key} style={{ display: "grid", gap: 8 }}>
                    <span style={{ fontWeight: 600, color: "#111827" }}>{label}</span>
                    {SELECT_OPTIONS[key] ? (
                      <select name={key} value={formState[key] || ""} onChange={handleChange} style={{ padding: "12px 14px", borderRadius: 14, border: "1px solid #d1d5db", background: "#fff" }}>
                        {SELECT_OPTIONS[key].map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input name={key} value={formState[key] || ""} onChange={handleChange} style={{ padding: "12px 14px", borderRadius: 14, border: "1px solid #d1d5db", background: "#fff" }} />
                    )}
                  </label>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" disabled={saving} style={{ padding: "12px 18px", borderRadius: 999, border: "none", background: "#0f4c3f", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                  {saving ? "Đang lưu..." : "Lưu cấu hình"}
                </button>
              </div>
            </form>

            <section style={{ display: "grid", gap: 16, padding: 24, borderRadius: 24, background: "#ffffff", border: "1px solid #e5e7eb", boxShadow: "var(--shadow-soft)" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 24 }}>Danh sách setting</h2>
                <p style={{ margin: "8px 0 0", color: "#6b7280" }}>Bản snapshot hiện tại của bảng <code>system_settings</code>.</p>
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                {settingsList.map((item) => (
                  <div key={item.key} style={{ padding: 16, borderRadius: 16, background: "#f9fafb", border: "1px solid #e5e7eb", display: "grid", gap: 6 }}>
                    <div style={{ fontWeight: 700 }}>{FIELD_LABELS[item.key] || item.key}</div>
                    <div style={{ color: "#111827" }}>{String(item.value ?? "")}</div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>{item.description || "Không có mô tả"}</div>
                  </div>
                ))}
              </div>
            </section>
          </section>

          <section style={{ display: "grid", gap: 16, padding: 24, borderRadius: 24, background: "#ffffff", border: "1px solid #e5e7eb", boxShadow: "var(--shadow-soft)" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 26 }}>Nhật ký thao tác gần đây</h2>
              <p style={{ margin: "8px 0 0", color: "#6b7280" }}>Audit log cơ bản cho các thao tác quan trọng của admin, staff và tech. Nếu chưa import migration audit_logs thì khu vực này sẽ trống.</p>
            </div>

            {auditLogs.length === 0 ? (
              <div style={{ padding: 16, borderRadius: 16, background: "#f9fafb", border: "1px dashed #d1d5db", color: "#6b7280" }}>
                Chưa có audit log nào để hiển thị.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {auditLogs.map((log) => (
                  <div key={log.id} style={{ padding: 16, borderRadius: 16, background: "#f9fafb", border: "1px solid #e5e7eb", display: "grid", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 700 }}>{log.action}</div>
                      <div style={{ fontSize: 13, color: "#6b7280" }}>{formatDateTime(log.createdAt)}</div>
                    </div>
                    <div style={{ color: "#111827" }}>{log.description || "Không có mô tả"}</div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>
                      Đối tượng: {log.entityType}{log.entityId ? ` #${log.entityId}` : ""} | Vai trò: {log.actorRole || "SYSTEM"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
