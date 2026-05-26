import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

const accountLinks = [
  { to: "/profile", label: "Hồ sơ cá nhân", icon: "👤" },
  { to: "/orders", label: "Đơn hàng của tôi", icon: "📦" },
  { to: "/profile#addresses", label: "Địa chỉ giao hàng", icon: "📍" },
  { to: "/warranties", label: "Bảo hành của tôi", icon: "🛡️" },
  { to: "/tickets", label: "Ticket hỗ trợ", icon: "🎫" }
];

function getUserDisplayName(user) {
  return user?.fullName || user?.name || user?.email || "khách hàng";
}

function getAvatarInitial(user) {
  const source = getUserDisplayName(user).trim();
  return source.charAt(0).toUpperCase() || "U";
}

export function TopBar() {
  const { authState, isAuthenticated, logout } = useAuth();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const normalizedRole = String(authState?.user?.role || "").trim().toUpperCase();
  const displayName = useMemo(() => getUserDisplayName(authState?.user), [authState?.user]);
  const avatarInitial = useMemo(() => getAvatarInitial(authState?.user), [authState?.user]);

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (!accountRef.current?.contains(event.target)) {
        setIsAccountOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsAccountOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleLogout() {
    setIsAccountOpen(false);
    logout();
  }

  return (
    <div className="market-topbar">
      <style>{accountMenuStyles}</style>
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
            <div className="account-menu" ref={accountRef}>
              <button
                className={`account-menu__trigger ${isAccountOpen ? "is-open" : ""}`}
                type="button"
                onClick={() => setIsAccountOpen((current) => !current)}
                aria-haspopup="menu"
                aria-expanded={isAccountOpen}
              >
                <span className="account-menu__avatar">{avatarInitial}</span>
                <span className="account-menu__name">Xin chào, {displayName}</span>
                <span className="account-menu__chevron">▾</span>
              </button>

              {isAccountOpen ? (
                <div className="account-menu__dropdown" role="menu">
                  <div className="account-menu__profile">
                    <span className="account-menu__avatar account-menu__avatar--large">{avatarInitial}</span>
                    <div>
                      <strong>{displayName}</strong>
                      <small>{authState?.user?.email || "Tài khoản PC Mall"}</small>
                    </div>
                  </div>

                  <div className="account-menu__links">
                    {accountLinks.map((item) => (
                      <Link key={item.to} to={item.to} role="menuitem" onClick={() => setIsAccountOpen(false)}>
                        <span>{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  <button className="account-menu__logout" type="button" role="menuitem" onClick={handleLogout}>
                    <span>↗</span>
                    Đăng xuất
                  </button>
                </div>
              ) : null}
            </div>
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

const accountMenuStyles = `
.account-menu {
  position: relative;
  z-index: 60;
}

.account-menu__trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 4px 10px 4px 4px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
}

.account-menu__trigger:hover,
.account-menu__trigger.is-open {
  transform: translateY(-1px);
  border-color: rgba(245, 166, 35, 0.55);
  background: rgba(245, 166, 35, 0.12);
}

.account-menu__avatar {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  color: #0f172a;
  background: linear-gradient(135deg, #fbbf24, #f97316);
  font-size: 12px;
  font-weight: 900;
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.22);
}

.account-menu__avatar--large {
  width: 44px;
  height: 44px;
  font-size: 18px;
}

.account-menu__name {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-menu__chevron {
  color: #fbbf24;
  transition: transform 160ms ease;
}

.account-menu__trigger.is-open .account-menu__chevron {
  transform: rotate(180deg);
}

.account-menu__dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 292px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #fff;
  color: #0f172a;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
  animation: account-menu-in 150ms ease;
}

.account-menu__dropdown::before {
  content: "";
  position: absolute;
  top: -6px;
  right: 26px;
  width: 12px;
  height: 12px;
  transform: rotate(45deg);
  background: #fff;
  border-left: 1px solid #e2e8f0;
  border-top: 1px solid #e2e8f0;
}

.account-menu__profile {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #0f172a, #1e3a8a);
  color: #fff;
}

.account-menu__profile strong,
.account-menu__profile small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-menu__profile small {
  margin-top: 3px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

.account-menu__links {
  display: grid;
  padding: 8px;
}

.account-menu__links a,
.account-menu__logout {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  border: 0;
  border-radius: 12px;
  color: #334155;
  background: transparent;
  font: inherit;
  font-size: 14px;
  font-weight: 800;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: background 160ms ease, color 160ms ease, transform 160ms ease;
}

.account-menu__links a:hover,
.account-menu__logout:hover {
  transform: translateX(2px);
  color: #1d4ed8;
  background: #eff6ff;
}

.account-menu__links span,
.account-menu__logout span {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: #f1f5f9;
}

.account-menu__logout {
  margin: 0 8px 8px;
  width: calc(100% - 16px);
  color: #b91c1c;
}

.account-menu__logout:hover {
  color: #b91c1c;
  background: #fef2f2;
}

@keyframes account-menu-in {
  from {
    opacity: 0;
    transform: translateY(-6px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 720px) {
  .account-menu__name {
    max-width: 120px;
  }

  .account-menu__dropdown {
    right: -12px;
    width: min(292px, calc(100vw - 24px));
  }
}
`;
