import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { getAdminSystemOverview } from "../../services/admin-system.service";

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }

  return error?.message || fallbackMessage;
}

function StatCard({ title, value, tone = "default" }) {
  const palette = tone === "success"
    ? { background: "#ecfdf5", border: "#a7f3d0", color: "#047857" }
    : { background: "rgba(255, 255, 255, 0.88)", border: "var(--color-line)", color: "var(--color-ink)" };

  return (
    <div style={{ padding: 20, borderRadius: 22, border: `1px solid ${palette.border}`, background: palette.background, boxShadow: "var(--shadow-soft)", display: "grid", gap: 8 }}>
      <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-muted)" }}>{title}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: palette.color }}>{value}</div>
    </div>
  );
}

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
        setOverview(response?.data || response);
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Không thể tải dashboard admin."));
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, []);

  const modules = [
    {
      title: "Hệ thống",
      description: "Xem health check, system settings và các metric tổng quan.",
      action: "/admin/system"
    },
    {
      title: "Sản phẩm",
      description: "Quản lý danh mục hiển thị, slug, thương hiệu, danh mục và trạng thái active/inactive.",
      action: "/admin/products"
    },
    {
      title: "Người dùng",
      description: "Theo dõi vai trò, tìm kiếm tài khoản và cập nhật trạng thái truy cập của người dùng.",
      action: "/admin/users"
    },
    {
      title: "Luật tương thích",
      description: "Cấu hình các luật đối chiếu giữa CPU, RAM, mainboard và các nhóm linh kiện khác.",
      action: "/admin/compatibility-rules"
    }
  ];

  const metrics = overview?.metrics || {};
  const health = overview?.health || {};

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section
        style={{
          padding: 28,
          borderRadius: 30,
          border: "1px solid var(--color-line)",
          background: "linear-gradient(135deg, rgba(15, 76, 63, 0.08), rgba(255, 248, 237, 0.95))",
          boxShadow: "var(--shadow-soft)",
          display: "grid",
          gap: 10
        }}
      >
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--color-muted)" }}>
          Admin dashboard
        </div>
        <h1 style={{ margin: 0, fontSize: 46, lineHeight: 0.98 }}>Khu vực quản trị để demo nghiệp vụ</h1>
        <p style={{ margin: 0, maxWidth: 820, color: "var(--color-muted)", lineHeight: 1.8 }}>
          Tổng quan nhanh tình trạng hệ thống, các metric quan trọng và những module cần dùng trong quá trình demo đồ án.
        </p>
      </section>

      {errorMessage ? (
        <div style={{ padding: 16, borderRadius: 18, background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }}>{errorMessage}</div>
      ) : null}

      {loading ? (
        <div style={{ padding: 22, borderRadius: 20, background: "#fff", border: "1px solid var(--color-line)" }}>Đang tải số liệu dashboard...</div>
      ) : (
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          <StatCard title="API" value={health?.api?.status || "UNKNOWN"} tone={health?.api?.status === "UP" ? "success" : "default"} />
          <StatCard title="Database" value={health?.database?.status || "UNKNOWN"} tone={health?.database?.status === "UP" ? "success" : "default"} />
          <StatCard title="Users" value={metrics.users ?? 0} />
          <StatCard title="Products" value={metrics.products ?? 0} />
          <StatCard title="Orders" value={metrics.orders ?? 0} />
          <StatCard title="Tickets" value={metrics.tickets ?? 0} />
          <StatCard title="Payments" value={metrics.payments ?? 0} />
          <StatCard title="Shipments" value={metrics.shipments ?? 0} />
        </section>
      )}

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
        {modules.map((module) => (
          <div
            key={module.title}
            style={{
              padding: 24,
              borderRadius: 26,
              border: "1px solid var(--color-line)",
              background: "rgba(255, 255, 255, 0.88)",
              boxShadow: "var(--shadow-soft)",
              display: "grid",
              gap: 14
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 800 }}>{module.title}</div>
            <div style={{ color: "var(--color-muted)", lineHeight: 1.7 }}>{module.description}</div>
            <div>
              <Link
                to={module.action}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px 16px",
                  borderRadius: 16,
                  textDecoration: "none",
                  background: "var(--color-accent)",
                  color: "#ffffff",
                  fontWeight: 800
                }}
              >
                Mở module
              </Link>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
