import { useState } from "react";

/**
 * XAIExplanationDrawer — Panel hiển thị chi tiết các lập luận giải thích XAI tiếng Việt
 * Phân loại màu sắc rõ ràng (Thành công 🟢, Cảnh báo 🟡, Lỗi 🔴)
 */
export function XAIExplanationDrawer({ isOpen, onClose, xaiReport, isLoading = false, onRecheck }) {
  const [filter, setFilter] = useState("all"); // 'all' | 'error' | 'warning' | 'success'

  if (!isOpen) return null;

  const checks = xaiReport?.checks || [];
  const summary = xaiReport?.summary || {};

  const filteredChecks = checks.filter((c) => {
    if (filter === "error") return c.explanation?.level === "error" || c.severity === "BLOCKER";
    if (filter === "warning") return c.explanation?.level === "warning" || c.severity === "WARNING";
    if (filter === "success") return c.explanation?.level === "success" || c.explanation?.level === "info";
    return true;
  });

  return (
    <div className="xai-drawer-overlay" onClick={onClose} style={styles.overlay}>
      <div className="xai-drawer-content" onClick={(e) => e.stopPropagation()} style={styles.drawer}>
        
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>🧠 Phân Tích & Giải Thích Tương Thích (XAI)</h2>
            <p style={styles.subtitle}>Báo cáo lập luận tri thức phần cứng bởi Engine XAI PC Mall Backend</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* LOADING STATE OVERLAY OR CARD */}
        {isLoading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner} />
            <p style={{ marginTop: "16px", color: "#1d4ed8", fontWeight: "600", fontSize: "14px" }}>
              ⚡ Backend Knowledge Engine đang thẩm định 10 quy tắc COMP-001..COMP-010...
            </p>
          </div>
        ) : !xaiReport || !xaiReport.checks || xaiReport.checks.length === 0 ? (
          <div style={styles.emptyStateContainer}>
            <div style={{ fontSize: "52px", marginBottom: "16px" }}>🧠</div>
            <h3 style={{ margin: "0 0 8px 0", color: "#0f172a", fontSize: "17px", fontWeight: "700" }}>
              Chưa có phân tích từ Backend XAI Engine
            </h3>
            <p style={{ margin: "0 0 24px 0", color: "#64748b", fontSize: "14px", lineHeight: "1.6", maxWidth: "380px" }}>
              Nhấn kiểm tra để xem phân tích đầy đủ, điểm 5 chiều và giải thích chuyên sâu từ Backend Knowledge Engine.
            </p>
            {onRecheck && (
              <button style={styles.recheckMainBtn} onClick={onRecheck}>
                ⚡ Nhấn kiểm tra để xem phân tích đầy đủ
              </button>
            )}
          </div>
        ) : (
          <>
            {/* SUMMARY CARD */}
            <div style={styles.summaryCard}>
              <div style={styles.scoreBadge(xaiReport.compatible)}>
                <span style={{ fontSize: "28px", fontWeight: "bold" }}>{xaiReport.score || 0}%</span>
                <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "700" }}>
                  {xaiReport.compatible ? "Tương thích tốt" : "Có xung đột"}
                </span>
                {xaiReport.buildReadiness && (
                  <span style={{
                    marginTop: "4px",
                    fontSize: "10px",
                    fontWeight: "800",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    backgroundColor: xaiReport.buildReadiness === "READY" ? "#16a34a" : xaiReport.buildReadiness === "BLOCKED" ? "#be123c" : "#d97706",
                    color: "#ffffff"
                  }}>
                    {xaiReport.buildReadiness}
                  </span>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <h4 style={{ margin: "0 0 6px 0", color: "#0f172a", fontSize: "15px", fontWeight: "700" }}>
                  {summary.overallMessage || "Đang phân tích cấu hình..."}
                </h4>
                <div style={styles.countsRow}>
                  <span style={styles.countBadge("#ecfdf5", "#15803d")}>
                    ✅ Đạt: {summary.passedChecks ?? checks.filter(c => c.ok).length}
                  </span>
                  <span style={styles.countBadge("#fffbeb", "#b45309")}>
                    ⚠️ Cảnh báo: {summary.warningCount ?? summary.warningChecks ?? checks.filter(c => !c.ok && c.severity !== "BLOCKER").length}
                  </span>
                  <span style={styles.countBadge("#fff1f2", "#be123c")}>
                    ❌ Lỗi (Blocker): {summary.blockerCount ?? summary.failedChecks ?? checks.filter(c => !c.ok && c.severity === "BLOCKER").length}
                  </span>
                </div>
              </div>
            </div>

            {/* 5-DIMENSIONAL SCORECARD BADGES */}
            {xaiReport.scores && (
              <div style={styles.scorecardContainer}>
                {styles.scorePill("🧩 Tương thích", xaiReport.scores.compatibilityScore)}
                {styles.scorePill("🎮 Hiệu năng", xaiReport.scores.performanceScore)}
                {styles.scorePill("💰 P/P Giá trị", xaiReport.scores.valueScore)}
                {styles.scorePill("⚡ Nguồn/Nhiệt", xaiReport.scores.powerThermalScore)}
                {styles.scorePill("🚀 Nâng cấp", xaiReport.scores.upgradeScore)}
              </div>
            )}

            {/* RECHECK ACTION BAR */}
            {onRecheck && (
              <div style={{ padding: "8px 24px 0", display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={onRecheck}
                  style={{
                    backgroundColor: "#eff6ff",
                    color: "#1d4ed8",
                    border: "1px solid #bfdbfe",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  🔄 Phân Tích Lại Với Backend XAI
                </button>
              </div>
            )}

        {/* FILTER TABS */}
        <div style={styles.filterBar}>
          <button
            style={styles.filterTab(filter === "all")}
            onClick={() => setFilter("all")}
          >
            Tất cả ({checks.length})
          </button>
          <button
            style={styles.filterTab(filter === "error")}
            onClick={() => setFilter("error")}
          >
            ❌ Lỗi ({summary.failedChecks ?? checks.filter(c => !c.ok && c.severity === "BLOCKER").length})
          </button>
          <button
            style={styles.filterTab(filter === "warning")}
            onClick={() => setFilter("warning")}
          >
            ⚠️ Cảnh báo ({summary.warningChecks ?? checks.filter(c => !c.ok && c.severity !== "BLOCKER").length})
          </button>
          <button
            style={styles.filterTab(filter === "success")}
            onClick={() => setFilter("success")}
          >
            ✅ Đạt ({summary.passedChecks ?? checks.filter(c => c.ok).length})
          </button>
        </div>

        {/* CHECKS LIST */}
        <div style={styles.checksList}>
          {filteredChecks.length === 0 ? (
            <div style={styles.emptyState}>Không có mục nào trong bộ lọc này.</div>
          ) : (
            filteredChecks.map((item, index) => {
              const exp = item.explanation || {};
              const severity = item.severity || (item.ok ? "INFO" : exp.level === "error" ? "BLOCKER" : "WARNING");
              const level = exp.level || (severity === "BLOCKER" ? "error" : severity === "WARNING" ? "warning" : severity === "ADVISORY" ? "advisory" : "info");

              const severityBadgeMeta = {
                BLOCKER:  { label: "⛔ BLOCKER (Lỗi Chặn Mua)", bg: "#be123c", color: "#ffffff" },
                WARNING:  { label: "⚠️ WARNING (Cảnh Báo Cân Nhắc)", bg: "#ea580c", color: "#ffffff" },
                ADVISORY: { label: "💡 ADVISORY (Gợi Ý Tối Ưu)", bg: "#d97706", color: "#ffffff" },
                INFO:     { label: "✅ INFO (Tương Thích Tốt)", bg: "#16a34a", color: "#ffffff" }
              };
              const badgeStyle = severityBadgeMeta[severity] || severityBadgeMeta.INFO;

              return (
                <div key={index} style={styles.checkCard(level, severity)}>
                  <div style={styles.checkCardHeader}>
                    <span style={styles.checkTitle}>{exp.short || item.key}</span>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        padding: "3px 8px",
                        borderRadius: "12px",
                        backgroundColor: badgeStyle.bg,
                        color: badgeStyle.color,
                        letterSpacing: "0.5px"
                      }}>
                        {badgeStyle.label}
                      </span>
                      {item.detail && <span style={styles.detailTag}>{item.detail}</span>}
                    </div>
                  </div>

                  <p style={styles.checkLongText}>{exp.long || item.detail || "Đã kiểm tra thông số kỹ thuật."}</p>

                  {exp.suggestion && (
                    <div style={styles.suggestionBox}>
                      <span style={{ fontWeight: "bold", marginRight: "6px" }}>💡 Đề xuất khắc phục:</span>
                      {exp.suggestion}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <div style={styles.footer}>
          <span style={{ fontSize: "13px", color: "#64748b" }}>
            🤖 Powered by PC Mall Knowledge Engine & XAI Model
          </span>
          <button style={styles.doneBtn} onClick={onClose}>Đã hiểu</button>
        </div>
        </>
        )}

      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    backdropFilter: "blur(4px)",
    zIndex: 9999,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "stretch"
  },
  drawer: {
    width: "100%",
    maxWidth: "560px",
    backgroundColor: "#ffffff",
    boxShadow: "-8px 0 32px rgba(15, 23, 42, 0.2)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    animation: "slideLeft 0.3s ease-out"
  },
  header: {
    padding: "20px 24px",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    color: "#ffffff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    color: "#ffffff"
  },
  subtitle: {
    margin: "4px 0 0 0",
    fontSize: "13px",
    color: "#94a3b8"
  },
  closeBtn: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "none",
    color: "#ffffff",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  summaryCard: {
    margin: "16px 24px 0",
    padding: "16px",
    backgroundColor: "#f8fafc",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    display: "flex",
    gap: "16px",
    alignItems: "center"
  },
  scoreBadge: (compatible) => ({
    backgroundColor: compatible ? "#ecfdf5" : "#fff1f2",
    color: compatible ? "#15803d" : "#be123c",
    border: `2px solid ${compatible ? "#bbf7d0" : "#fecdd3"}`,
    borderRadius: "16px",
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: "110px"
  }),
  countsRow: {
    display: "flex",
    gap: "8px",
    marginTop: "8px"
  },
  countBadge: (bg, color) => ({
    backgroundColor: bg,
    color: color,
    fontSize: "12px",
    fontWeight: "600",
    padding: "4px 10px",
    borderRadius: "20px"
  }),
  filterBar: {
    display: "flex",
    gap: "8px",
    padding: "16px 24px 8px",
    borderBottom: "1px solid #f1f5f9"
  },
  filterTab: (active) => ({
    padding: "8px 14px",
    borderRadius: "20px",
    border: active ? "none" : "1px solid #cbd5e1",
    backgroundColor: active ? "#1d4ed8" : "#ffffff",
    color: active ? "#ffffff" : "#475569",
    fontWeight: active ? "600" : "500",
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.2s"
  }),
  checksList: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  scorecardContainer: {
    margin: "12px 24px 0",
    display: "flex",
    flexWrap: "wrap",
    gap: "6px"
  },
  scorePill: (label, score) => (
    <div key={label} style={{
      fontSize: "11px",
      fontWeight: "600",
      padding: "4px 10px",
      borderRadius: "12px",
      backgroundColor: "#f1f5f9",
      color: "#334155",
      border: "1px solid #e2e8f0",
      display: "flex",
      alignItems: "center",
      gap: "4px"
    }}>
      <span>{label}:</span>
      <span style={{ fontWeight: "800", color: score >= 80 ? "#15803d" : score >= 60 ? "#b45309" : "#be123c" }}>
        {score ?? 0}%
      </span>
    </div>
  ),
  emptyStateContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 24px",
    textAlign: "center",
    backgroundColor: "#fafafa"
  },
  recheckMainBtn: {
    backgroundColor: "#1d4ed8",
    color: "#ffffff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "14px",
    boxShadow: "0 4px 14px rgba(29, 78, 216, 0.35)",
    transition: "all 0.2s ease"
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 0",
    color: "#94a3b8",
    fontSize: "14px"
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 24px",
    textAlign: "center"
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #1d4ed8",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },
  checkCard: (level, severity) => {
    const borders = {
      BLOCKER: "#fecdd3",
      WARNING: "#ffedd5",
      ADVISORY: "#fef3c7",
      INFO: "#bbf7d0",
      error: "#fecdd3",
      warning: "#ffedd5",
      advisory: "#fef3c7",
      success: "#bbf7d0",
      info: "#e2e8f0"
    };
    const bgs = {
      BLOCKER: "#fff1f2",
      WARNING: "#fff7ed",
      ADVISORY: "#fffbeb",
      INFO: "#f0fdf4",
      error: "#fff1f2",
      warning: "#fff7ed",
      advisory: "#fffbeb",
      success: "#f0fdf4",
      info: "#f8fafc"
    };
    const targetKey = severity || level || "info";
    return {
      padding: "14px 16px",
      borderRadius: "12px",
      border: `1px solid ${borders[targetKey] || "#e2e8f0"}`,
      backgroundColor: bgs[targetKey] || "#ffffff"
    };
  },
  checkCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px"
  },
  checkTitle: {
    fontWeight: "700",
    fontSize: "14px",
    color: "#0f172a"
  },
  detailTag: {
    fontSize: "11px",
    backgroundColor: "#ffffff",
    padding: "2px 8px",
    borderRadius: "6px",
    color: "#64748b",
    border: "1px solid #cbd5e1"
  },
  checkLongText: {
    margin: "4px 0",
    fontSize: "13px",
    color: "#334155",
    lineHeight: "1.5"
  },
  suggestionBox: {
    marginTop: "8px",
    padding: "8px 12px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    fontSize: "12px",
    color: "#1e293b",
    borderLeft: "3px solid #1d4ed8"
  },
  footer: {
    padding: "16px 24px",
    borderTop: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  doneBtn: {
    backgroundColor: "#1d4ed8",
    color: "#ffffff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px"
  }
};
