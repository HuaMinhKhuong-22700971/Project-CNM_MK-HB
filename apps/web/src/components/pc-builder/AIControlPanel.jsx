import React from "react";

const formatCurrency = (v) => Number(v || 0).toLocaleString("vi-VN");

/**
 * AIControlPanel — Bảng điều khiển tùy chỉnh thông số AI Build (Ngân sách, độ phân giải, khẩu vị)
 */
export function AIControlPanel({
  suggestionForm,
  setSuggestionForm,
  onAutoRecommend,
  isAutoBuilding
}) {
  const currentBudget = Number(suggestionForm?.budget || 25000000);

  return (
    <div style={styles.card}>
      <h4 style={styles.title}>
        <span>⚡</span> Bảng Điều Khiển AI Build Smart PC
      </h4>

      {/* Budget Slider */}
      <div style={styles.field}>
        <label style={styles.label}>
          Hạn Mức Ngân Sách: <strong style={{ color: "#2563eb" }}>{formatCurrency(currentBudget)}đ</strong>
        </label>
        <input
          type="range"
          min={10000000}
          max={100000000}
          step={1000000}
          value={currentBudget}
          onChange={(e) => setSuggestionForm((prev) => ({ ...prev, budget: e.target.value }))}
          style={{ width: "100%", accentColor: "#2563eb", cursor: "pointer" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", color: "#64748b" }}>
          <span>10 Triệu</span>
          <span>50 Triệu</span>
          <span>100 Triệu</span>
        </div>
      </div>

      {/* Resolution Selector */}
      <div style={styles.field}>
        <label style={styles.label}>🎯 Độ Phân Giải Mục Tiêu:</label>
        <div style={styles.btnGroup}>
          {["1080p", "2K", "4K"].map((res) => (
            <button
              key={res}
              type="button"
              onClick={() => setSuggestionForm((prev) => ({ ...prev, resolution: res.toLowerCase() }))}
              style={{
                ...styles.chipBtn,
                backgroundColor: (suggestionForm?.resolution || "1080p").toLowerCase() === res.toLowerCase() ? "#2563eb" : "#ffffff",
                color: (suggestionForm?.resolution || "1080p").toLowerCase() === res.toLowerCase() ? "#ffffff" : "#475569",
                borderColor: (suggestionForm?.resolution || "1080p").toLowerCase() === res.toLowerCase() ? "#2563eb" : "#cbd5e1"
              }}
            >
              {res}
            </button>
          ))}
        </div>
      </div>

      {/* Preference Selector */}
      <div style={styles.field}>
        <label style={styles.label}>💡 Khẩu Vị Ưu Tiên:</label>
        <div style={styles.btnGroup}>
          {[
            { id: "value", label: "⭐ P/P Tối Ưu" },
            { id: "performance", label: "🚀 Max FPS" },
            { id: "quiet", label: "❄️ Tản Nhiệt ⚙️" },
            { id: "future", label: "🔮 Dễ Nâng Cấp" }
          ].map((pref) => (
            <button
              key={pref.id}
              type="button"
              onClick={() => setSuggestionForm((prev) => ({ ...prev, preference: pref.id }))}
              style={{
                ...styles.chipBtn,
                backgroundColor: (suggestionForm?.preference || "value") === pref.id ? "#1e40af" : "#ffffff",
                color: (suggestionForm?.preference || "value") === pref.id ? "#ffffff" : "#475569",
                borderColor: (suggestionForm?.preference || "value") === pref.id ? "#1e40af" : "#cbd5e1"
              }}
            >
              {pref.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Trigger */}
      <button
        type="button"
        onClick={() => onAutoRecommend()}
        disabled={isAutoBuilding}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "10px",
          backgroundColor: "#2563eb",
          color: "#ffffff",
          border: "none",
          fontWeight: "800",
          fontSize: "13px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
          marginTop: "4px"
        }}
      >
        {isAutoBuilding ? "⚡ AI Đang Phân Tích Linh Kiện..." : "⚡ KÍCH HOẠT AI BUILD THEO THÔNG SỐ NÀY"}
      </button>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "14px",
    border: "1px solid #e2e8f0",
    marginBottom: "16px"
  },
  title: {
    margin: "0 0 12px 0",
    fontSize: "13.5px",
    fontWeight: "800",
    color: "#0f172a",
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },
  field: {
    marginBottom: "12px"
  },
  label: {
    display: "block",
    fontSize: "11.5px",
    fontWeight: "700",
    color: "#475569",
    marginBottom: "4px"
  },
  btnGroup: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap"
  },
  chipBtn: {
    padding: "5px 10px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
    border: "1px solid",
    transition: "all 0.2s ease"
  }
};
