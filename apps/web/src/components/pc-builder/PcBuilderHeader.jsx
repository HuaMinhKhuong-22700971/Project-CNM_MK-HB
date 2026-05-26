import React from 'react';
import { Link } from 'react-router-dom';

export function PcBuilderHeader({ buildName, setBuildName, totalPrice, formatCurrency, isAuthenticated }) {
  return (
    <header style={{ background: "#0f172a", padding: "60px 0 100px", color: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24 }}>
          <div>
            <h1 style={{ fontSize: 44, fontWeight: 900, marginBottom: 12 }}>⚙️ Xây dựng cấu hình PC</h1>
            <p style={{ fontSize: 18, color: "#94a3b8", maxWidth: 560 }}>
              Tư vấn AI thông minh – Lắp ráp trọn bộ PC chuyên nghiệp.
              {!isAuthenticated && (
                <span style={{ display: "block", marginTop: 8, fontSize: 14, color: "#60a5fa" }}>
                  Chế độ khách: cấu hình được lưu trên trình duyệt. <Link to="/register" style={{ color: "#93c5fd", fontWeight: 700 }}>Đăng ký</Link> để lưu đám mây.
                </span>
              )}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>TỔNG GIÁ TẠM TÍNH</div>
            <div style={{ fontSize: 42, fontWeight: 900, color: "#3b82f6" }}>{formatCurrency(totalPrice)}đ</div>
            <div style={{ marginTop: 12 }}>
              <input
                value={buildName}
                onChange={e => setBuildName(e.target.value)}
                placeholder="Tên cấu hình..."
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: "8px 16px", color: "#fff", fontSize: 14, width: 240 }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
