import { Navigate, Link, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

const STAFF_NAV_ITEMS = [
  { to: "/staff/orders", label: "Đơn hàng can xử lý", description: "Theo doi, cập nhật va tao vận đơn mock" }
];

export function StaffLayout() {
  const location = useLocation();
  const { authState, isAuthenticated } = useAuth();
  const role = String(authState?.user?.role || "").toUpperCase();
  const staffName = authState?.user?.fullName || authState?.user?.email || "Nhân viên";
  const canAccess = ["ADMIN", "SALES_STAFF"].includes(role);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccess) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top right, rgba(16, 185, 129, 0.15), transparent 40%), var(--color-bg)", color: "#1f2937" }}>
      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "28px 24px 40px", display: "grid", gridTemplateColumns: "300px minmax(0, 1fr)", gap: 24, alignItems: "start" }}>
        <aside
          style={{
            position: "sticky",
            top: 24,
            display: "grid",
            gap: 18,
            padding: 24,
            borderRadius: 24,
            background: "rgba(255, 255, 255, 0.65)",
            border: "1px solid rgba(255, 255, 255, 0.8)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.04)",
            backdropFilter: "blur(24px) saturate(150%)",
            WebkitBackdropFilter: "blur(24px) saturate(150%)"
          }}
        >
          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6b7280" }}>Sales workspace</div>
            <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>Xử lý đơn hàng</div>
            <div style={{ color: "#6b7280", lineHeight: 1.7 }}>
              Khu v?c ri?ng cho nhân viên ban hang de xử lý don, cập nhật tr?ng th?i va ghi chu tư vấn cấu hình cho khach.
            </div>
          </div>

          <div style={{ padding: 16, borderRadius: 18, background: "linear-gradient(145deg, rgba(16, 185, 129, 0.1), rgba(37, 99, 235, 0.1))", border: "1px solid rgba(16, 185, 129, 0.15)", display: "grid", gap: 4 }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", color: "#047857" }}>Đăng nhập với</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{staffName}</div>
            <div style={{ color: "#7c2d12" }}>Vai trò: {role}</div>
          </div>

          <nav style={{ display: "grid", gap: 10 }}>
            {STAFF_NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.to;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  style={{
                    display: "grid",
                    gap: 4,
                    padding: "14px 16px",
                    borderRadius: 16,
                    textDecoration: "none",
                    background: isActive ? "rgba(16, 185, 129, 0.1)" : "transparent",
                    border: isActive ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid transparent",
                    color: "#1f2937",
                    transition: "0.2s ease"
                  }}
                >
                  <span style={{ fontWeight: 700 }}>{item.label}</span>
                  <span style={{ fontSize: 14, color: "#6b7280" }}>{item.description}</span>
                </Link>
              );
            })}
          </nav>

          <div style={{ display: "grid", gap: 10 }}>
            {role === "ADMIN" ? (
              <Link to="/admin/dashboard" style={{ display: "inline-flex", justifyContent: "center", padding: "12px 16px", borderRadius: 999, background: "#111827", color: "#ffffff", textDecoration: "none", fontWeight: 700 }}>
                V? admin
              </Link>
            ) : null}
            <Link to="/" style={{ display: "inline-flex", justifyContent: "center", padding: "12px 16px", borderRadius: 999, border: "1px solid #e5e7eb", background: "#ffffff", color: "#1f2937", textDecoration: "none" }}>
              V? c?a h?ng
            </Link>
          </div>
        </aside>

        <main style={{ minWidth: 0 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}



