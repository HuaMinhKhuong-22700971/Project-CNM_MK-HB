/**
 * PerformanceScoreWidget — Hiển thị điểm số hiệu năng ước tính (0-100),
 * nhãn phân loại (Entry / Mid / High / Enthusiast) và ước tính FPS game / tốc độ Render
 */
export function PerformanceScoreWidget({ performanceEstimate, onOpenXaiDrawer }) {
  if (!performanceEstimate) return null;

  const score = performanceEstimate.score || 50;
  const grade = performanceEstimate.grade || "Mid-range";
  const fps = performanceEstimate.estimatedFps || { esports1080p: 120, aaa1080p: 45, rendering4k: "Cơ bản" };

  const getGradeColor = (g) => {
    switch (g) {
      case "Enthusiast": return "#7c3aed"; // Purple
      case "High-end": return "#059669";   // Emerald
      case "Mid-range": return "#1d4ed8";   // Blue
      default: return "#d97706";           // Amber
    }
  };

  const color = getGradeColor(grade);

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <span style={styles.label}>📊 ĐIỂM HIỆU NĂNG ƯỚC TÍNH</span>
          <div style={styles.scoreRow}>
            <span style={{ ...styles.scoreValue, color }}>{score}</span>
            <span style={styles.scoreMax}>/100</span>
            <span style={{ ...styles.gradeBadge, backgroundColor: color }}>{grade}</span>
          </div>
        </div>

        {onOpenXaiDrawer && (
          <button style={styles.xaiBtn} onClick={onOpenXaiDrawer}>
            🧠 Xem Giải Thích XAI
          </button>
        )}
      </div>

      {/* PROGRESS BAR */}
      <div style={styles.barBg}>
        <div style={{ ...styles.barFill, width: `${score}%`, backgroundColor: color }} />
      </div>

      {/* ESTIMATED METRICS GRID */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricItem}>
          <span style={styles.metricIcon}>🎮</span>
          <div>
            <div style={styles.metricVal}>~{fps.esports1080p} FPS</div>
            <div style={styles.metricLbl}>Esports 1080p (CS2/LoL)</div>
          </div>
        </div>

        <div style={styles.metricItem}>
          <span style={styles.metricIcon}>🐉</span>
          <div>
            <div style={styles.metricVal}>~{fps.aaa1080p} FPS</div>
            <div style={styles.metricLbl}>AAA Game (Wukong/GTA V)</div>
          </div>
        </div>

        <div style={styles.metricItem}>
          <span style={styles.metricIcon}>🎬</span>
          <div>
            <div style={styles.metricVal}>{fps.rendering4k}</div>
            <div style={styles.metricLbl}>Render Video Premiere 4K</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "18px 20px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
    marginBottom: "16px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px"
  },
  label: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: "0.5px"
  },
  scoreRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "6px",
    marginTop: "2px"
  },
  scoreValue: {
    fontSize: "32px",
    fontWeight: "800",
    lineHeight: "1"
  },
  scoreMax: {
    fontSize: "14px",
    color: "#94a3b8",
    fontWeight: "600"
  },
  gradeBadge: {
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: "700",
    padding: "3px 10px",
    borderRadius: "99px",
    marginLeft: "8px"
  },
  xaiBtn: {
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
    padding: "8px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  barBg: {
    height: "8px",
    backgroundColor: "#f1f5f9",
    borderRadius: "99px",
    overflow: "hidden",
    marginBottom: "16px"
  },
  barFill: {
    height: "100%",
    borderRadius: "99px",
    transition: "width 0.5s ease-in-out"
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
    paddingTop: "12px",
    borderTop: "1px dashed #e2e8f0"
  },
  metricItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#f8fafc",
    padding: "10px 12px",
    borderRadius: "10px"
  },
  metricIcon: {
    fontSize: "20px"
  },
  metricVal: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0f172a"
  },
  metricLbl: {
    fontSize: "11px",
    color: "#64748b"
  }
};
