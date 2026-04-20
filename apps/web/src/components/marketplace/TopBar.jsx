import { Link } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

export function TopBar() {
  const { authState, isAuthenticated, logout } = useAuth();
  const normalizedRole = String(authState?.user?.role || "").trim().toUpperCase();

  const leftLinks = [
    { href: "/profile", label: "Hỗ trợ" },
    { href: "/tickets", label: "Thông báo" },
    { href: "/orders", label: "Đơn hàng" }
  ];

  const workspaceLinks = [];

  if (normalizedRole === "ADMIN") {
    workspaceLinks.push(
      { href: "/admin/dashboard", label: "Quản trị" },
      { href: "/staff/orders", label: "Bán hàng" },
      { href: "/tech/tickets", label: "Kỹ thuật" }
    );
  } else if (normalizedRole === "SALES_STAFF") {
    workspaceLinks.push({ href: "/staff/orders", label: "Xử lý đơn" });
  } else if (normalizedRole === "TECH_STAFF") {
    workspaceLinks.push({ href: "/tech/tickets", label: "Ticket kỹ thuật" });
  }

  return (
    <div className="market-topbar">
      <div className="market-topbar__inner market-container">
        <div className="market-topbar__group">
          {leftLinks.map((item) => (
            <Link key={item.label} className="market-topbar__link" to={item.href}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="market-topbar__group">
          {workspaceLinks.map((item) => (
            <Link key={item.label} className="market-topbar__link" to={item.href}>
              {item.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <>
              <span className="market-topbar__link">
                Xin chào, {authState?.user?.fullName || authState?.user?.email || "khách hàng"}
              </span>
              <button className="market-topbar__button" type="button" onClick={logout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link className="market-topbar__link" to="/login">
                Đăng nhập
              </Link>
              <Link className="market-topbar__link" to="/register">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
