import { Link } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { SearchBar } from "./SearchBar";

const QUICK_KEYWORDS = [
  "RTX 4060",
  "Core i5",
  "Mainboard B760",
  "RAM DDR5",
  "SSD NVMe",
  "Nguồn 750W",
  "Build PC",
  "Tư vấn AI"
];

export function MainHeader() {
  const { authState } = useAuth();
  const normalizedRole = String(authState?.user?.role || "").trim().toUpperCase();

  const workspaceLink =
    normalizedRole === "ADMIN"
      ? { href: "/admin/dashboard", label: "Trang quản trị" }
      : normalizedRole === "SALES_STAFF"
        ? { href: "/staff/orders", label: "Bàn xử lý đơn" }
        : normalizedRole === "TECH_STAFF"
          ? { href: "/tech/tickets", label: "Hỗ trợ kỹ thuật" }
          : null;

  return (
    <header className="market-header">
      <div className="market-container market-header__main">
        <Link className="market-logo" to="/">
          <span className="market-logo__eyebrow">Sàn công nghệ dành cho PC và linh kiện</span>
          <span className="market-logo__text">PC Mall</span>
        </Link>

        <div>
          <SearchBar />
          <div className="market-keywords">
            {QUICK_KEYWORDS.map((keyword) => (
              <span key={keyword}>{keyword}</span>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {workspaceLink ? (
            <Link className="market-topbar__link" style={{ color: "#fff", fontWeight: 700 }} to={workspaceLink.href}>
              {workspaceLink.label}
            </Link>
          ) : null}
          <Link className="market-cart-link" to="/cart">
            <span style={{ fontSize: 22 }}>🛒</span>
            <span className="market-cart-link__badge">Giỏ hàng</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
