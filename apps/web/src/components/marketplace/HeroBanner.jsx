import { Link } from "react-router-dom";

export function HeroBanner() {
  return (
    <section style={{ 
      position: "relative",
      minHeight: "500px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center", 
      padding: "80px 20px", 
      backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('/images/hero-bg.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      margin: "0 0 40px",
      borderRadius: "16px",
      overflow: "hidden",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        background: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        padding: "48px 40px",
        borderRadius: "28px",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        maxWidth: "850px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
      }}>
        <h1 style={{ 
          fontSize: 56, 
          fontWeight: 900, 
          margin: "0 0 24px", 
          color: "#ffffff", 
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          textShadow: "0 4px 8px rgba(0,0,0,0.3)"
        }}>
          Chọn linh kiện. Tự lắp ráp PC.<br />So sánh và chia sẻ.
        </h1>
        <p style={{ 
          fontSize: 21, 
          color: "rgba(255, 255, 255, 0.95)", 
          maxWidth: 720, 
          margin: "0 auto 40px", 
          lineHeight: 1.6,
          fontWeight: 400
        }}>
          Chúng tôi cung cấp hướng dẫn lựa chọn linh kiện, gợi ý từ AI, so sánh giá cả và khả năng tương thích thời gian thực cho những người đam mê công nghệ.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
          <Link to="/pc-builder" className="hover-lift" style={{ 
            background: "#3b82f6", 
            color: "#fff", 
            padding: "0 36px", 
            height: 56, 
            borderRadius: "14px", 
            display: "flex", 
            alignItems: "center", 
            fontWeight: 700, 
            fontSize: 18, 
            textDecoration: "none", 
            transition: "transform 0.2s, box-shadow 0.2s, background 0.2s",
            boxShadow: "0 10px 20px -5px rgba(59, 130, 246, 0.6)",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 12 }}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
            Bắt đầu xây dựng
          </Link>
          <Link to="/products" style={{ 
            background: "rgba(255, 255, 255, 0.12)", 
            color: "#ffffff", 
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.25)", 
            padding: "0 36px", 
            height: 56, 
            borderRadius: "14px", 
            display: "flex", 
            alignItems: "center", 
            fontWeight: 700, 
            fontSize: 18, 
            textDecoration: "none", 
            transition: "all 0.3s ease",
          }}>
            Linh kiện PC
          </Link>
          <Link to="/compare" style={{
            background: "rgba(245, 166, 35, 0.18)",
            color: "#ffffff",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(245, 166, 35, 0.4)",
            padding: "0 30px",
            height: 56,
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            fontWeight: 800,
            fontSize: 18,
            textDecoration: "none",
            transition: "all 0.3s ease"
          }}>
            So sánh
          </Link>
        </div>
      </div>
    </section>
  );
}
