import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const DEMO_STEPS = [
  { to: "/products", icon: "🛍️", title: "Danh mục & lọc", desc: "Tìm linh kiện theo thương hiệu, giá, socket, RAM..." },
  { to: "/compare", icon: "⚖️", title: "So sánh", desc: "So tối đa 4 sản phẩm" },
  { to: "/pc-builder", icon: "⚙️", title: "Build PC", desc: "Lưu cấu hình trên trình duyệt, xuất JSON" },
  { to: "/ai-chat", icon: "🤖", title: "AI tư vấn", desc: "Chat + lịch sử lưu local" },
  { to: "/register", icon: "✨", title: "Đăng ký", desc: "Google Demo — nâng cấp tài khoản" }
];

export function GuestDemoStrip() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return null;

  return (
    <section
      style={{
        margin: "28px 0 8px",
        padding: "28px 32px",
        borderRadius: 24,
        background: "linear-gradient(135deg, #ecfdf5 0%, #eff6ff 55%, #f8fafc 100%)",
        border: "1px solid #bbf7d0",
        boxShadow: "0 8px 30px rgba(16, 185, 129, 0.08)"
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#059669" }}>
            Demo khách vãng lai — 100%
          </div>
          <h2 style={{ margin: "8px 0 0", fontSize: 26, fontWeight: 900, color: "#0f172a" }}>
            Trải nghiệm đầy đủ không cần đăng nhập
          </h2>
          <p style={{ margin: "8px 0 0", color: "#64748b", maxWidth: 640, lineHeight: 1.6 }}>
            Bạn có thể xem sản phẩm, lọc thông số, build PC, chat AI và đăng ký tài khoản. Cấu hình PC & chat được lưu trên trình duyệt.
          </p>
        </div>
        <Link
          to="/guide"
          style={{
            alignSelf: "center",
            padding: "12px 20px",
            borderRadius: 12,
            background: "#0f172a",
            color: "#fff",
            fontWeight: 800,
            textDecoration: "none",
            fontSize: 14
          }}
        >
          📋 Hướng dẫn demo
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 14
        }}
      >
        {DEMO_STEPS.map((step) => (
          <Link
            key={step.to}
            to={step.to}
            style={{
              padding: "16px 18px",
              borderRadius: 16,
              background: "#fff",
              border: "1px solid #e2e8f0",
              textDecoration: "none",
              color: "inherit",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{step.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>{step.title}</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4, lineHeight: 1.4 }}>{step.desc}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
