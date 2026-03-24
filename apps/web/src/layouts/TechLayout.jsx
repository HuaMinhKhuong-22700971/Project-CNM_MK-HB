import { Navigate, Link, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

const TECH_NAV_ITEMS = [
  { to: "/tech/tickets", label: "Ticket kỹ thuật", description: "Xử lý, phản hồi và cập nhật trạng thái hỗ trợ" }
];

export function TechLayout() {
  const location = useLocation();
  const { authState, isAuthenticated } = useAuth();
  const role = String(authState?.user?.role || "").toUpperCase();
  const techName = authState?.user?.fullName || authState?.user?.email || "Nhân viên kỹ thuật";
  const canAccess = ["ADMIN", "TECH_STAFF"].includes(role);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccess) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f3f6fb", color: "#1f2937" }}>
      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "28px 24px 40px", display: "grid", gridTemplateColumns: "300px minmax(0, 1fr)", gap: 24, alignItems: "start" }}>
        <aside style={{ position: "sticky", top: 24, display: "grid", gap: 18, padding: 24, borderRadius: 24, background: "#ffffff", border: "1px solid #e5e7eb", boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)" }}>
          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6b7280" }}>Tech workspace</div>
            <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>Hỗ trợ kỹ thuật</div>
            <div style={{ color: "#6b7280", lineHeight: 1.7 }}>
              Khu vực riêng cho nhân viên kỹ thuật để theo dõi ticket, cập nhật trạng thái và trao đổi với khách hàng trong cùng một luồng hỗ trợ.
            </div>
          </div>

          <div style={{ padding: 16, borderRadius: 18, background: "linear-gradient(135deg, #eff6ff, #dbeafe)", border: "1px solid #bfdbfe", display: "grid", gap: 4 }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", color: "#1d4ed8" }}>Đăng nhập với</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{techName}</div>
            <div style={{ color: "#1e40af" }}>Vai trò: {role}</div>
          </div>

          <nav style={{ display: "grid", gap: 10 }}>
            {TECH_NAV_ITEMS.map((item) => {
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
                    background: isActive ? "#eff6ff" : "#ffffff",
                    border: isActive ? "1px solid #bfdbfe" : "1px solid #e5e7eb",
                    color: "#1f2937"
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
                Về admin
              </Link>
            ) : null}
            <Link to="/" style={{ display: "inline-flex", justifyContent: "center", padding: "12px 16px", borderRadius: 999, border: "1px solid #e5e7eb", background: "#ffffff", color: "#1f2937", textDecoration: "none" }}>
              Về cửa hàng
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
