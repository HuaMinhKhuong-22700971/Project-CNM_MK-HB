import { useEffect, useState } from "react";

import {
  AdminAlerts,
  AdminLinkBtn,
  AdminMetric,
  AdminMetrics,
  AdminPage,
  AdminPageHead,
  AdminQuickLinks
} from "../../components/admin/AdminUi";
import { getAdminSystemOverview } from "../../services/admin-system.service";
import { formatAdminNumber, getAdminEnvelopeData, getAdminErrorMessage, formatAdminDateTime } from "../../utils/adminUi";

const QUICK_LINKS = [
  { to: "/admin/products", title: "Sản phẩm", desc: "Danh mục, slug, thương hiệu và trạng thái hiển thị.", icon: "🏷️" },
  { to: "/admin/skus", title: "SKU & tồn kho", desc: "Biến thể, giá, ảnh và gán thuộc tính kỹ thuật.", icon: "📦" },
  { to: "/admin/attributes", title: "Thuộc tính", desc: "Socket, RAM, chipset… phục vụ bộ lọc và PC Builder.", icon: "✨" },
  { to: "/admin/users", title: "Người dùng", desc: "Vai trò, trạng thái tài khoản và phân quyền.", icon: "👥" },
  { to: "/admin/compatibility-rules", title: "Luật tương thích", desc: "Quy tắc kiểm tra cấu hình PC Builder.", icon: "🔗" },
  { to: "/admin/system", title: "Hệ thống", desc: "Health check, cấu hình sandbox và audit log.", icon: "⚙️" },
  { to: "/staff/orders", title: "Đơn hàng (Sales)", desc: "Giám sát luồng xử lý đơn của nhân viên kinh doanh.", icon: "🛒" },
  { to: "/tech/tickets", title: "Ticket kỹ thuật", desc: "Giám sát hỗ trợ khách từ bộ phận kỹ thuật.", icon: "🎫" }
];

export function AdminDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadOverview() {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await getAdminSystemOverview();
        setOverview(getAdminEnvelopeData(response, null));
      } catch (error) {
        setErrorMessage(getAdminErrorMessage(error, "Không thể tải tổng quan hệ thống."));
      } finally {
        setLoading(false);
      }
    }
    loadOverview();
  }, []);

  const metrics = overview?.metrics || {};
  const health = overview?.health || {};
  const apiUp = health?.api?.status === "UP";
  const dbUp = health?.database?.status === "UP";
  const auditLogs = overview?.auditLogs || [];

  return (
    <AdminPage>
      <AdminPageHead
        eyebrow="Quản trị hệ thống"
        title="Tổng quan điều hành"
        description="Theo dõi sức khỏe dịch vụ, số liệu vận hành và truy cập nhanh mọi module quản trị từ một màn hình."
        actions={
          <AdminLinkBtn to="/admin/system" variant="primary">
            Cấu hình hệ thống
          </AdminLinkBtn>
        }
      />

      <AdminAlerts errorMessage={errorMessage} />

      <div className={`admin-health-banner${apiUp && dbUp ? " admin-health-banner--up" : " admin-health-banner--down"}`}>
        <div>
          <strong>{apiUp && dbUp ? "Hệ thống hoạt động bình thường" : "Cần kiểm tra hệ thống"}</strong>
          <p style={{ margin: "6px 0 0", color: "#64748b" }}>
            API: {health?.api?.status || "—"} · Database: {health?.database?.status || "—"}
          </p>
        </div>
        {!loading ? (
          <span className="admin-badge admin-badge--success">Live</span>
        ) : (
          <span className="admin-badge admin-badge--neutral">Đang tải…</span>
        )}
      </div>

      <AdminMetrics>
        <AdminMetric label="Người dùng" value={formatAdminNumber(metrics.users)} tone="primary" hint="Bảng users" />
        <AdminMetric label="Sản phẩm" value={formatAdminNumber(metrics.products)} hint="Catalog" />
        <AdminMetric label="Đơn hàng" value={formatAdminNumber(metrics.orders)} hint="Orders" />
        <AdminMetric label="Ticket" value={formatAdminNumber(metrics.tickets)} hint="Hỗ trợ" />
        <AdminMetric label="Thanh toán" value={formatAdminNumber(metrics.payments)} hint="Payments" />
        <AdminMetric label="Vận đơn" value={formatAdminNumber(metrics.shipments)} hint="Shipments" />
      </AdminMetrics>

      <AdminQuickLinks items={QUICK_LINKS} />

      {auditLogs.length > 0 ? (
        <section className="admin-card">
          <div className="admin-section-title">
            <h3>Nhật ký gần đây</h3>
            <p>12 thao tác mới nhất từ audit log.</p>
          </div>
          <div className="admin-audit-list">
            {auditLogs.slice(0, 6).map((log) => (
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
        </section>
      ) : null}
    </AdminPage>
  );
}
