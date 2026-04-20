import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "radial-gradient(circle at top left, rgba(201, 169, 97, 0.14), transparent 28%), var(--color-bg)"
      }}
    >
      <div
        style={{
          maxWidth: 720,
          width: "100%",
          padding: 34,
          borderRadius: 30,
          border: "1px solid var(--color-line)",
          background: "rgba(255, 255, 255, 0.88)",
          boxShadow: "var(--shadow-soft)",
          display: "grid",
          gap: 16,
          textAlign: "center"
        }}
      >
        <div style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--color-muted)" }}>404</div>
        <h1 style={{ margin: 0, fontSize: 52, lineHeight: 0.96 }}>Trang bạn tìm không tồn tại</h1>
        <p style={{ margin: 0, color: "var(--color-muted)", lineHeight: 1.8 }}>
          Có thể đường dẫn đã sai, route chưa được tạo hoặc bạn vừa vào một liên kết không còn hợp lệ.
          Quay lại trang chủ hoặc danh mục sản phẩm để tiếp tục demo.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 18px",
              borderRadius: 18,
              textDecoration: "none",
              background: "var(--color-accent)",
              color: "#ffffff",
              fontWeight: 800
            }}
          >
            Về trang chủ
          </Link>
          <Link
            to="/products"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 18px",
              borderRadius: 18,
              textDecoration: "none",
              border: "1px solid var(--color-line)",
              background: "var(--color-surface)",
              color: "var(--color-ink)",
              fontWeight: 800
            }}
          >
            Xem sản phẩm
          </Link>
        </div>
      </div>
    </div>
  );
}
