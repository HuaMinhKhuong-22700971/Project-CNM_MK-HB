import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const MEMBER_LINKS = [
  { to: "/profile", icon: "👤", title: "Tài khoản", desc: "Hồ sơ, mật khẩu, địa chỉ" },
  { to: "/cart", icon: "🛒", title: "Giỏ hàng", desc: "Thanh toán linh kiện" },
  { to: "/orders", icon: "📦", title: "Đơn hàng", desc: "Theo dõi & hủy đơn PENDING" },
  { to: "/pc-builder", icon: "⚙️", title: "Build PC", desc: "Lưu cấu hình trên tài khoản" },
  { to: "/tickets", icon: "🎫", title: "Hỗ trợ", desc: "Ticket kỹ thuật" },
  { to: "/warranties", icon: "🛡️", title: "Bảo hành", desc: "Kích hoạt điện tử" }
];

export function MemberHubStrip() {
  const { isAuthenticated, authState } = useAuth();
  if (!isAuthenticated) return null;

  const name = authState?.user?.fullName || authState?.user?.email || "Thành viên";

  return (
    <section
      style={{
        margin: "28px 0 8px",
        padding: "28px 32px",
        borderRadius: 24,
        background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 55%, #fff 100%)",
        border: "1px solid #bfdbfe",
        boxShadow: "0 8px 30px rgba(59, 130, 246, 0.08)"
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2563eb" }}>
          Khách hàng thành viên
        </div>
        <h2 style={{ margin: "8px 0 0", fontSize: 26, fontWeight: 900, color: "#0f172a" }}>
          Xin chào, {name}
        </h2>
        <p style={{ margin: "8px 0 0", color: "#64748b" }}>
          Trung tâm mua sắm — quản lý đơn hàng, build PC, bảo hành và hỗ trợ kỹ thuật.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
        {MEMBER_LINKS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              background: "#fff",
              border: "1px solid #e2e8f0",
              textDecoration: "none",
              color: "inherit"
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{item.title}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{item.desc}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
