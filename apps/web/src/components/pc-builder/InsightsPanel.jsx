import React from "react";

/**
 * InsightsPanel — Khối hiển thị thông số điện năng, nguồn đề xuất & FPS ước tính
 */
export function InsightsPanel({ insights }) {
  if (!insights) return null;

  const power = Number(insights.power || 0);
  const fps = Number(insights.fps || 0);
  const recommendedPsu = power > 0 ? Math.ceil((power * 1.35) / 50) * 50 : 550;
  const psuLoad = power > 0 ? Math.min(95, Math.round((power / recommendedPsu) * 100)) : 0;

  const fpsGrade =
    fps >= 200
      ? "🏆 4K Ultra / 240Hz"
      : fps >= 144
      ? "✨ 2K High / 144Hz"
      : fps >= 60
      ? "🎮 1080p Full HD"
      : "💼 Đồ họa cơ bản";

  const psuStatusColor = psuLoad > 85 ? "#dc2626" : psuLoad > 70 ? "#d97706" : "#059669";

  return (
    <div className="insights-panel" style={{ padding: "0 4px" }}>
      <div className="sidebar-section-header" style={{ marginBottom: "8px" }}>
        <span className="sidebar-section-title">⚡ Điện Năng & Hiệu Năng</span>
      </div>

      <div className="sidebar-stats" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
        <div className="sidebar-stat-card" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px 8px", textAlign: "center" }}>
          <span className="sidebar-stat-label" style={{ fontSize: "9px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>TDP Tiêu Thụ</span>
          <span className="sidebar-stat-value" style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a" }}>{power}W</span>
        </div>

        <div className="sidebar-stat-card" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px 8px", textAlign: "center" }}>
          <span className="sidebar-stat-label" style={{ fontSize: "9px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>FPS Gaming</span>
          <span className="sidebar-stat-value" style={{ fontSize: "16px", fontWeight: "900", color: "#2563eb" }}>{fps > 0 ? `${fps} FPS` : "~165 FPS"}</span>
        </div>
      </div>

      {/* Recommended PSU & Thermal Badge */}
      <div style={{ backgroundColor: "#f1f5f9", borderRadius: "10px", padding: "10px 12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#334155" }}>🔌 Nguồn đề xuất (PSU):</span>
          <strong style={{ fontSize: "12px", color: psuStatusColor }}>{recommendedPsu}W+</strong>
        </div>

        {/* PSU Load Bar */}
        {power > 0 && (
          <div style={{ width: "100%", height: "5px", backgroundColor: "#cbd5e1", borderRadius: "99px", overflow: "hidden" }}>
            <div style={{ width: `${psuLoad}%`, height: "100%", backgroundColor: psuStatusColor, transition: "width 0.3s ease" }} />
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" }}>
          <span style={{ fontSize: "10.5px", color: "#64748b" }}>Cấu hình trải nghiệm:</span>
          <span style={{ fontSize: "10.5px", fontWeight: "800", color: "#1e293b" }}>{fpsGrade}</span>
        </div>
      </div>
    </div>
  );
}
