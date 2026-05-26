import { useEffect, useMemo, useState } from "react";

import {
  AdminAlerts,
  AdminBtn,
  AdminCard,
  AdminField,
  AdminForm,
  AdminMetric,
  AdminMetrics,
  AdminPage,
  AdminPageHead,
  AdminWorkspace,
  useAdminToast
} from "../../components/admin/AdminUi";
import { getAdminSystemOverview, updateAdminSystemSettings } from "../../services/admin-system.service";
import { formatAdminDateTime, formatAdminNumber, getAdminEnvelopeData, getAdminErrorMessage } from "../../utils/adminUi";

const FIELD_LABELS = {
  store_name: "Tên cửa hàng",
  support_email: "Email hỗ trợ",
  support_phone: "Số điện thoại hỗ trợ",
  online_payment_mode: "Thanh toán online",
  shipping_mode: "Vận chuyển",
  maintenance_mode: "Bảo trì"
};

const SELECT_OPTIONS = {
  online_payment_mode: ["sandbox", "live"],
  shipping_mode: ["mock", "live"],
  maintenance_mode: ["off", "on"]
};

function normalizeSettings(items = []) {
  return items.reduce((acc, item) => {
    acc[item.key] = item.value ?? "";
    return acc;
  }, {});
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

  useAdminToast(successMessage, () => setSuccessMessage(""));

  useEffect(() => {
    async function loadOverview() {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await getAdminSystemOverview();
        const payload = getAdminEnvelopeData(response, null);
        setOverview(payload);
        setFormState((prev) => ({ ...prev, ...normalizeSettings(payload?.settings || []) }));
      } catch (error) {
        setErrorMessage(getAdminErrorMessage(error, "Không thể tải dữ liệu hệ thống."));
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
    setFormState((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave(event) {
    event.preventDefault();
    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");
      const response = await updateAdminSystemSettings(formState);
      const payload = getAdminEnvelopeData(response, null);
      setOverview((prev) => ({ ...prev, settings: payload }));
      setSuccessMessage("Đã cập nhật cấu hình hệ thống.");
    } catch (error) {
      setErrorMessage(getAdminErrorMessage(error, "Không thể cập nhật cấu hình."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminPage>
      <AdminPageHead
        eyebrow="Vận hành"
        title="Cấu hình & tình trạng hệ thống"
        description="Health check API/DB, chỉ số tổng quan, audit log và cài đặt sandbox cho demo đồ án."
      />

      <AdminAlerts errorMessage={errorMessage} successMessage={successMessage} />

      {loading ? (
        <div className="admin-empty">Đang tải thông tin hệ thống…</div>
      ) : (
        <>
          <AdminMetrics>
            <AdminMetric
              label="API"
              value={health?.api?.status || "—"}
              tone={health?.api?.status === "UP" ? "success" : "danger"}
            />
            <AdminMetric
              label="Database"
              value={health?.database?.status || "—"}
              tone={health?.database?.status === "UP" ? "success" : "danger"}
            />
            <AdminMetric label="Users" value={formatAdminNumber(metrics.users)} />
            <AdminMetric label="Products" value={formatAdminNumber(metrics.products)} />
            <AdminMetric label="Orders" value={formatAdminNumber(metrics.orders)} />
            <AdminMetric label="Tickets" value={formatAdminNumber(metrics.tickets)} />
          </AdminMetrics>

          <AdminWorkspace columns="split">
            <AdminCard title="Cấu hình cơ bản" description="Chế độ sandbox/mock phục vụ demo VNPay và vận chuyển.">
              <AdminForm onSubmit={handleSave}>
                <div className="admin-form admin-form--grid">
                  {Object.entries(FIELD_LABELS).map(([key, label]) => (
                    <AdminField key={key} label={label} htmlFor={key}>
                      {SELECT_OPTIONS[key] ? (
                        <select id={key} name={key} value={formState[key] || ""} onChange={handleChange} className="admin-input">
                          {SELECT_OPTIONS[key].map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input id={key} name={key} value={formState[key] || ""} onChange={handleChange} className="admin-input" />
                      )}
                    </AdminField>
                  ))}
                </div>
                <div className="admin-action-row">
                  <AdminBtn type="submit" variant="primary" disabled={saving}>
                    {saving ? "Đang lưu…" : "Lưu cấu hình"}
                  </AdminBtn>
                </div>
              </AdminForm>
            </AdminCard>

            <AdminCard title="Snapshot settings" description="Giá trị hiện tại trong system_settings.">
              <div className="admin-setting-list">
                {settingsList.map((item) => (
                  <div key={item.key} className="admin-setting-item">
                    <strong>{FIELD_LABELS[item.key] || item.key}</strong>
                    <div>{String(item.value ?? "")}</div>
                    <small style={{ color: "#64748b" }}>{item.description || "—"}</small>
                  </div>
                ))}
              </div>
            </AdminCard>
          </AdminWorkspace>

          <AdminCard title="Nhật ký thao tác" description="Audit log cho admin, sales và tech.">
            {auditLogs.length === 0 ? (
              <div className="admin-empty admin-empty--compact">Chưa có audit log.</div>
            ) : (
              <div className="admin-audit-list">
                {auditLogs.map((log) => (
                  <div key={log.id} className="admin-audit-item">
                    <div className="admin-audit-item__head">
                      <strong>{log.action}</strong>
                      <span>{formatAdminDateTime(log.createdAt)}</span>
                    </div>
                    <div>{log.description || "—"}</div>
                    <span>
                      {log.entityType}
                      {log.entityId ? ` #${log.entityId}` : ""} · {log.actorRole || "SYSTEM"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>
        </>
      )}
    </AdminPage>
  );
}
