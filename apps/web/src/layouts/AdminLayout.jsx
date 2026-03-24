import { Navigate, Link, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Tổng quan", description: "Trang điều khiển nhanh" },
  { to: "/admin/system", label: "Hệ thống", description: "Health check và system settings" },
  { to: "/admin/products", label: "Sản phẩm", description: "Danh mục sản phẩm" },
  { to: "/admin/attributes", label: "Attributes", description: "Thuộc tính động và values" },
  { to: "/admin/skus", label: "SKUs", description: "Biến thể, tồn kho và gán thuộc tính" },
  { to: "/admin/users", label: "Người dùng", description: "Vai trò và trạng thái tài khoản" },
  { to: "/admin/compatibility-rules", label: "Compatibility", description: "Luật tương thích linh kiện" }
];

export function AdminLayout() {
  const location = useLocation();
  const { authState, isAuthenticated } = useAuth();
  const role = String(authState?.user?.role || "").toUpperCase();
  const adminName = authState?.user?.fullName || authState?.user?.email || "Admin";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top left, rgba(201, 169, 97, 0.16), transparent 26%), var(--color-bg)", color: "var(--color-ink)" }}>
      <div style={{ maxWidth: 1380, margin: "0 auto", padding: "30px 24px 40px", display: "grid", gridTemplateColumns: "300px minmax(0, 1fr)", gap: 28, alignItems: "start" }}>
        <aside style={{ position: "sticky", top: 24, display: "grid", gap: 24, padding: 24, borderRadius: 28, background: "rgba(255, 251, 245, 0.88)", border: "1px solid var(--color-line)", boxShadow: "var(--shadow-soft)", backdropFilter: "blur(18px)" }}>
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-muted)" }}>CNM Ecommerce Admin</div>
            <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.04 }}>Bảng điều khiển</div>
            <div style={{ color: "var(--color-muted)", lineHeight: 1.7 }}>Quản lý catalog, SKU, thuộc tính động, người dùng và cấu hình hệ thống trong cùng một khu vực rõ ràng.</div>
          </div>

          <div style={{ display: "grid", gap: 6, padding: 18, borderRadius: 22, background: "linear-gradient(145deg, rgba(15, 76, 63, 0.08), rgba(201, 169, 97, 0.18))" }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--color-muted)" }}>Đăng nhập với</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{adminName}</div>
            <div style={{ color: "var(--color-muted)" }}>Quyền truy cập: {role}</div>
          </div>

          <nav style={{ display: "grid", gap: 10 }}>
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.to;

              return (
                <Link key={item.to} to={item.to} style={{ display: "grid", gap: 4, padding: "14px 16px", borderRadius: 18, textDecoration: "none", border: isActive ? "1px solid rgba(15, 76, 63, 0.18)" : "1px solid transparent", background: isActive ? "rgba(15, 76, 63, 0.1)" : "transparent", color: "var(--color-ink)", transition: "0.2s ease" }}>
                  <span style={{ fontWeight: 700 }}>{item.label}</span>
                  <span style={{ fontSize: 14, color: "var(--color-muted)" }}>{item.description}</span>
                </Link>
              );
            })}
          </nav>

          <div style={{ display: "grid", gap: 10 }}>
            <Link to="/" style={{ display: "inline-flex", justifyContent: "center", padding: "12px 16px", borderRadius: 999, border: "1px solid var(--color-line)", color: "var(--color-ink)", textDecoration: "none", background: "var(--color-surface)" }}>
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
