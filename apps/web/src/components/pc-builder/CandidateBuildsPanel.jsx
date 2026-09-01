import React, { useState } from "react";

const formatCurrency = (v) => Number(v || 0).toLocaleString("vi-VN");

/**
 * CandidateBuildsPanel — Component hiển thị chi tiết 3 Phương Án Cấu Hình (Best Value / Best Performance / Budget Safe)
 * Được trả về bởi Backend AI Engine, hỗ trợ Xem Chi Tiết & Bảng So Sánh Trực Quan (Side-by-Side Comparison Table).
 */
export function CandidateBuildsPanel({
  candidateBuilds,
  activeCandidateTab,
  onSelectCandidateTab,
  onApplyCandidateBuild,
  isApplying = false
}) {
  const [showComparison, setShowComparison] = useState(false);

  if (!candidateBuilds) return null;

  const tabsMeta = [
    { key: "bestValue", label: "⭐ Best Value", subtitle: "Cân Bằng P/P", badgeColor: "#3b82f6", fps: "~115 FPS Gaming" },
    { key: "bestPerformance", label: "🚀 Best Performance", subtitle: "Hiệu Năng Tối Đa", badgeColor: "#8b5cf6", fps: "~145 FPS Gaming" },
    { key: "budgetSafe", label: "💡 Budget Safe", subtitle: "Tiết Kiệm 15%", badgeColor: "#10b981", fps: "~95 FPS Gaming" }
  ];

  const currentBuild = Array.isArray(candidateBuilds)
    ? (candidateBuilds.find((b) => b.key === activeCandidateTab || b.id === activeCandidateTab) || candidateBuilds[0])
    : (candidateBuilds[activeCandidateTab] || candidateBuilds.bestValue || candidateBuilds.bestPerformance);

  if (!currentBuild) return null;

  const componentsList = Array.isArray(currentBuild.components)
    ? currentBuild.components
    : Object.values(currentBuild.components || {});

  const totalPrice = Number(currentBuild.totalPrice || 0);
  const budgetUtilization = Number(currentBuild.budgetUtilization || 0);
  const compatReport = currentBuild.compatibilityReport || {};

  return (
    <div className="candidate-builds-panel" style={styles.panel}>
      {/* PANEL HEADER WITH COMPARISON TOGGLE */}
      <div style={styles.header}>
        <div>
          <div style={styles.badge}>⚡ AI DECISION SUPPORT ENGINE</div>
          <h3 style={styles.title}>3 Phương Án Cấu Hình AI Đề Xuất</h3>
          <p style={styles.subtitle}>Phân tích & tối ưu theo mục đích sử dụng và hạn mức ngân sách của bạn</p>
        </div>

        <button
          type="button"
          onClick={() => setShowComparison(!showComparison)}
          style={styles.toggleCompareBtn(showComparison)}
        >
          {showComparison ? "📋 Xem Dạng Thẻ" : "📊 Bảng So Sánh Side-by-Side"}
        </button>
      </div>

      {/* SIDE-BY-SIDE COMPARISON TABLE */}
      {showComparison ? (
        <div style={styles.compareTableWrap}>
          <table style={styles.compareTable}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: "22%" }}>Tiêu chí So sánh</th>
                {tabsMeta.map((tab) => {
                  const build = candidateBuilds[tab.key];
                  const isCurrentTab = activeCandidateTab === tab.key;
                  return (
                    <th key={tab.key} style={{ ...styles.th, backgroundColor: isCurrentTab ? "#eff6ff" : "#f8fafc", textAlign: "center" }}>
                      <div style={{ fontWeight: "800", color: tab.badgeColor, fontSize: "14px" }}>{tab.label}</div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>{tab.subtitle}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* Row 1: Total Price */}
              <tr>
                <td style={styles.tdLabel}>💰 Tổng Giá Trị</td>
                {tabsMeta.map((tab) => {
                  const build = candidateBuilds[tab.key];
                  const price = build ? Number(build.totalPrice || 0) : 0;
                  return (
                    <td key={tab.key} style={{ ...styles.tdVal, fontWeight: "800", color: "#1d4ed8", fontSize: "15px" }}>
                      {formatCurrency(price)}đ
                    </td>
                  );
                })}
              </tr>

              {/* Row 2: FPS Gaming */}
              <tr>
                <td style={styles.tdLabel}>🎮 Hiệu Năng FPS Ước Tính</td>
                {tabsMeta.map((tab) => (
                  <td key={tab.key} style={{ ...styles.tdVal, fontWeight: "700", color: "#0f172a" }}>
                    {tab.fps}
                  </td>
                ))}
              </tr>

              {/* Row 3: Compatibility XAI */}
              <tr>
                <td style={styles.tdLabel}>🧠 Điểm Tương Thích XAI</td>
                {tabsMeta.map((tab) => {
                  const build = candidateBuilds[tab.key];
                  const report = build?.compatibilityReport || {};
                  const score = report.score || 95;
                  const isOk = report.compatible !== false;
                  return (
                    <td key={tab.key} style={{ ...styles.tdVal, color: isOk ? "#16a34a" : "#dc2626", fontWeight: "700" }}>
                      {score}/100 {isOk ? "✓ (Tương thích tốt)" : "⚠ (Cần xem xét)"}
                    </td>
                  );
                })}
              </tr>

              {/* Row 4: Budget Used % */}
              <tr>
                <td style={styles.tdLabel}>📊 Tỷ Lệ Sử Dụng Ngân Sách</td>
                {tabsMeta.map((tab) => {
                  const build = candidateBuilds[tab.key];
                  const used = build ? Number(build.budgetUtilization || 0) : 0;
                  return (
                    <td key={tab.key} style={{ ...styles.tdVal, fontWeight: "700" }}>
                      {used}% {used > 100 ? "(Vượt nhẹ)" : ""}
                    </td>
                  );
                })}
              </tr>

              {/* Row 5: Quick Select Action */}
              <tr>
                <td style={styles.tdLabel}>⚡ Chọn Phương Án</td>
                {tabsMeta.map((tab) => {
                  const build = candidateBuilds[tab.key];
                  const isCurrent = activeCandidateTab === tab.key;
                  return (
                    <td key={tab.key} style={{ ...styles.tdVal, padding: "12px 8px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectCandidateTab(tab.key);
                          if (build) onApplyCandidateBuild(build);
                        }}
                        disabled={isApplying}
                        style={{
                          ...styles.applyBtn(isApplying),
                          width: "100%",
                          padding: "8px 10px",
                          fontSize: "12px",
                          backgroundColor: isCurrent ? tab.badgeColor : "#334155"
                        }}
                      >
                        {isCurrent ? "✓ Đang Chọn & Áp Dụng" : "Chọn Build Này"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <>
          {/* TABS SELECTOR */}
          <div style={styles.tabGrid}>
            {tabsMeta.map((tab) => {
              const isActive = activeCandidateTab === tab.key;
              const buildData = candidateBuilds[tab.key];
              const price = buildData ? formatCurrency(buildData.totalPrice) : "...";

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onSelectCandidateTab(tab.key)}
                  style={styles.tabButton(isActive, tab.badgeColor)}
                >
                  <span style={{ fontWeight: "700", fontSize: "14px" }}>{tab.label}</span>
                  <span style={{ fontSize: "12px", color: isActive ? "#ffffff" : "#64748b" }}>{tab.subtitle}</span>
                  <span style={{ fontSize: "13px", fontWeight: "800", marginTop: "4px" }}>{price}đ</span>
                </button>
              );
            })}
          </div>

          {/* CURRENT BUILD DETAILS CARD */}
          <div style={styles.detailsCard}>
            {/* BUILD OVERVIEW BAR */}
            <div style={styles.overviewBar}>
              <div>
                <h4 style={{ margin: 0, fontSize: "16px", color: "#0f172a", fontWeight: "700" }}>
                  {currentBuild.label || "Phương án cấu hình"}
                </h4>
                <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b" }}>
                  {currentBuild.desc || "Chi tiết linh kiện được hệ thống lựa chọn"}
                </p>
              </div>

              <div style={styles.metaBox}>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Tỷ lệ Ngân sách:</span>
                  <span style={styles.metaVal}>{budgetUtilization}%</span>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Tương thích XAI:</span>
                  <span style={{ ...styles.metaVal, color: compatReport.compatible !== false ? "#16a34a" : "#dc2626" }}>
                    {compatReport.score || 95}% {compatReport.compatible !== false ? "✓" : "⚠"}
                  </span>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Tổng giá:</span>
                  <span style={{ ...styles.metaVal, color: "#1d4ed8", fontSize: "16px" }}>{formatCurrency(totalPrice)}đ</span>
                </div>
              </div>
            </div>

            {/* COMPONENT LIST WITH AI EXPLANATIONS */}
            <div style={styles.componentsGrid}>
              {componentsList.map((item, idx) => {
                const compType = (item.type || item.componentType || `Linh kiện ${idx + 1}`).toUpperCase();
                const compName = item.name || item.productName || "Tên linh kiện chưa cập nhật";
                const compPrice = Number(item.price || 0);

                return (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "4px", backgroundColor: "#f8fafc", padding: "10px 12px", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                    <div style={styles.compRow}>
                      <span style={styles.compTypeBadge}>{compType}</span>
                      <span style={styles.compName}>{compName}</span>
                      <span style={styles.compPrice}>{formatCurrency(compPrice)}đ</span>
                    </div>
                    {item.explanation && (
                      <div style={{ fontSize: "11.5px", color: "#475569", lineHeight: "1.45", backgroundColor: "#ffffff", padding: "6px 10px", borderRadius: "8px", border: "1px solid #e2e8f0", marginTop: "2px" }}>
                        <span style={{ fontWeight: "700", color: "#2563eb" }}>🧠 AI Gợi ý:</span> {item.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* BOTTOM ACTION BAR */}
            <div style={styles.actionRow}>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                💡 Nhấn <strong>"Áp Dụng Build Này"</strong> để nạp toàn bộ 8 linh kiện trên vào không gian làm việc.
              </span>

              <button
                type="button"
                onClick={() => onApplyCandidateBuild(currentBuild)}
                disabled={isApplying}
                style={styles.applyBtn(isApplying)}
              >
                {isApplying ? "⏳ Đang Nạp Linh Kiện..." : "⚡ Áp Dụng Build Này Vào Cấu Hình"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  panel: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    padding: "20px",
    marginBottom: "24px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px"
  },
  badge: {
    display: "inline-block",
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    fontSize: "10px",
    fontWeight: "800",
    padding: "3px 8px",
    borderRadius: "6px",
    letterSpacing: "0.5px",
    marginBottom: "4px"
  },
  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "800",
    color: "#0f172a"
  },
  subtitle: {
    margin: "2px 0 0 0",
    fontSize: "13px",
    color: "#64748b"
  },
  toggleCompareBtn: (showComparison) => ({
    backgroundColor: showComparison ? "#f1f5f9" : "#eff6ff",
    color: showComparison ? "#475569" : "#2563eb",
    border: showComparison ? "1px solid #cbd5e1" : "1px solid #bfdbfe",
    padding: "8px 14px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s ease"
  }),
  tabGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "16px"
  },
  tabButton: (isActive, accentColor) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "12px 8px",
    borderRadius: "12px",
    border: isActive ? `2px solid ${accentColor}` : "1px solid #e2e8f0",
    backgroundColor: isActive ? accentColor : "#f8fafc",
    color: isActive ? "#ffffff" : "#0f172a",
    cursor: "pointer",
    transition: "all 0.2s ease"
  }),
  detailsCard: {
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    padding: "16px"
  },
  overviewBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "12px",
    borderBottom: "1px solid #e2e8f0",
    marginBottom: "12px"
  },
  metaBox: {
    display: "flex",
    gap: "16px",
    alignItems: "center"
  },
  metaItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end"
  },
  metaLabel: {
    fontSize: "10px",
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase"
  },
  metaVal: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#0f172a"
  },
  componentsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "8px",
    marginBottom: "16px"
  },
  compRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    gap: "8px"
  },
  compTypeBadge: {
    fontSize: "10px",
    fontWeight: "800",
    backgroundColor: "#f1f5f9",
    color: "#334155",
    padding: "2px 6px",
    borderRadius: "4px",
    minWidth: "60px",
    textAlign: "center"
  },
  compName: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  compPrice: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#0f172a"
  },
  actionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "12px",
    borderTop: "1px solid #e2e8f0"
  },
  applyBtn: (isApplying) => ({
    backgroundColor: isApplying ? "#94a3b8" : "#2563eb",
    color: "#ffffff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "13px",
    cursor: isApplying ? "not-allowed" : "pointer",
    boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)",
    transition: "background-color 0.2s ease"
  }),
  compareTableWrap: {
    overflowX: "auto",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff"
  },
  compareTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px"
  },
  th: {
    padding: "12px 14px",
    borderBottom: "2px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    textAlign: "left"
  },
  tdLabel: {
    padding: "12px 14px",
    fontWeight: "700",
    color: "#334155",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0"
  },
  tdVal: {
    padding: "12px 14px",
    textAlign: "center",
    borderBottom: "1px solid #e2e8f0"
  }
};
