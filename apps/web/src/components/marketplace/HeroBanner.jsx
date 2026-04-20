import { Link } from "react-router-dom";

export function HeroBanner() {
  return (
    <section style={{ textAlign: "center", padding: "80px 20px 60px", background: "#fff", margin: "0 0 40px" }}>
      <h1 style={{ fontSize: 48, fontWeight: 800, margin: "0 0 20px", color: "#222222", lineHeight: 1.2 }}>
        Chọn linh kiện. Tự lắp ráp PC. So sánh và chia sẻ.
      </h1>
      <p style={{ fontSize: 18, color: "#666666", maxWidth: 680, margin: "0 auto 32px", lineHeight: 1.6 }}>
        Chúng tôi cung cấp hướng dẫn lựa chọn linh kiện, gợi ý từ AI, so sánh giá cả và khả năng tương thích thời gian thực cho những người tự lắp ráp máy tính.
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
        <Link to="/pc-builder" style={{ background: "#2078ca", color: "#fff", padding: "0 24px", height: 48, borderRadius: 4, display: "flex", alignItems: "center", fontWeight: 700, fontSize: 16, textDecoration: "none", transition: "background 0.2s" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
          Bắt đầu xây dựng
        </Link>
        <Link to="/products" style={{ background: "#f4f5f7", color: "#222222", border: "1px solid #dcdcdc", padding: "0 24px", height: 48, borderRadius: 4, display: "flex", alignItems: "center", fontWeight: 700, fontSize: 16, textDecoration: "none", transition: "background 0.2s" }}>
          Linh kiện PC
        </Link>
      </div>
    </section>
  );
}
