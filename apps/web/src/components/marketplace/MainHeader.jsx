import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { SearchBar } from "./SearchBar";

export function MainHeader() {
  const { authState } = useAuth();
  const location = useLocation();
  const normalizedRole = String(authState?.user?.role || "").trim().toUpperCase();

  const navLinks = [
    { href: "/pc-builder", label: "Lắp ráp PC", icon: "🔧" },
    { href: "/products", label: "Linh kiện PC", icon: "💻" },
    { href: "/warranties", label: "Bảo hành", icon: "🛡️" },
  ];

  const workspaceLink =
    normalizedRole === "ADMIN"
      ? { href: "/admin/dashboard", label: "Quản trị" }
      : normalizedRole === "SALES_STAFF"
        ? { href: "/staff/orders", label: "Bàn xử lý" }
        : normalizedRole === "TECH_STAFF"
          ? { href: "/tech/tickets", label: "Kỹ thuật" }
          : null;

  return (
    <header className="market-header">
      <div className="market-container market-header__main" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, padding: "0" }}>
        
        {/* Left: Logo & Nav */}
        <div style={{ display: "flex", alignItems: "stretch", height: "100%", gap: 32 }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "#fff" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", color: "#fff" }}>PC Mall</span>
          </Link>

          <nav style={{ display: "flex", alignItems: "stretch" }}>
            {navLinks.map(link => {
              const isActive = location.pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "0 20px",
                    color: isActive ? "var(--market-warning)" : "#fff",
                    textDecoration: "none",
                    fontWeight: 700,
                    fontSize: 15,
                    borderBottom: isActive ? "3px solid var(--market-warning)" : "3px solid transparent",
                    borderTop: "3px solid transparent", // To vertically center
                    transition: "all 0.2s ease",
                    opacity: isActive ? 1 : 0.85
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--market-warning)"; e.currentTarget.style.opacity = "1"; }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.color = isActive ? "var(--market-warning)" : "#fff"; 
                    e.currentTarget.style.opacity = isActive ? "1" : "0.85";
                  }}
                >
                  <span style={{ fontSize: 16 }}>{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Search & Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 280 }}>
             <SearchBar />
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {workspaceLink && (
               <Link to={workspaceLink.href} style={{ color: "#f5a623", fontWeight: 700, fontSize: 13, textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.05em", padding: "6px 12px", border: "1px solid #f5a623", borderRadius: 4 }}>
                  {workspaceLink.label}
               </Link>
            )}
            <Link className="market-cart-link" to="/cart" style={{ padding: "0 12px", background: "transparent", color: "#fff", display: "flex", alignItems: "center", gap: 8, textDecoration: "none", borderRadius: 4, height: 40, border: "1px solid rgba(255,255,255,0.2)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
