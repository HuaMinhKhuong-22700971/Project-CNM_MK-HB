import React, { useRef } from 'react';
import { Link } from 'react-router-dom';

export function PcBuilderSidebar({
  selectedCount,
  totalPrice,
  actions,
  isAuthenticated,
  guestBuildList = [],
  suggestionForm,
  setSuggestionForm,
  aiLoading,
  PURPOSE_OPTIONS,
  formatCurrency
}) {
  const importInputRef = useRef(null);

  return (
    <aside style={{ display: "grid", gap: 24, position: "sticky", top: 32 }}>
      <div style={{ background: "#fff", borderRadius: 28, padding: 28, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}>
        <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 20 }}>⚡ Công cụ</h3>
        <div style={{ display: "grid", gap: 12 }}>
          <button
            onClick={actions.checkCompatibility}
            disabled={selectedCount < 2}
            style={{ height: 52, borderRadius: 14, background: selectedCount >= 2 ? "#f0f9ff" : "#f8fafc", border: `1px solid ${selectedCount >= 2 ? "#93c5fd" : "#e2e8f0"}`, color: selectedCount >= 2 ? "#1d4ed8" : "#94a3b8", fontWeight: 800, fontSize: 15, cursor: selectedCount >= 2 ? "pointer" : "not-allowed" }}
          >
            🔍 Kiểm tra tương thích
          </button>

          <button
            onClick={actions.commitSave}
            style={{ height: 52, borderRadius: 14, background: "linear-gradient(135deg, #3b82f6, #2563eb)", border: "none", color: "#fff", fontWeight: 900, fontSize: 15, cursor: "pointer" }}
          >
            {isAuthenticated ? "💾 Lưu lên tài khoản" : "💾 Lưu trên trình duyệt"}
          </button>

          {!isAuthenticated ? (
            <Link
              to="/register"
              style={{ height: 44, borderRadius: 14, background: "#ecfdf5", border: "1px solid #86efac", color: "#047857", fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
            >
              ☁️ Đăng ký để lưu đám mây
            </Link>
          ) : null}

          <button
            onClick={actions.clearAll}
            style={{ height: 44, borderRadius: 14, background: "none", border: "1px solid #fca5a5", color: "#ef4444", fontWeight: 700, cursor: "pointer" }}
          >
            🗑️ Xóa toàn bộ
          </button>
        </div>

        <div style={{ marginTop: 20, padding: "16px 20px", background: "#f8fafc", borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>Tổng cộng</span>
            <span style={{ fontWeight: 900, color: "#3b82f6", fontSize: 16 }}>{formatCurrency(totalPrice)}đ</span>
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>{selectedCount} linh kiện đã chọn</div>
        </div>
      </div>

      {!isAuthenticated ? (
        <div style={{ background: "#fff", borderRadius: 28, padding: 24, border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: 17, fontWeight: 900, marginBottom: 12 }}>📁 Cấu hình đã lưu (khách)</h3>
          <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
            {guestBuildList.map((slot) => (
              <div key={slot.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => actions.loadGuestBuildById(slot.id)}
                  style={{ flex: 1, textAlign: "left", padding: "10px 12px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 13 }}
                >
                  {slot.name}
                </button>
                {guestBuildList.length > 1 ? (
                  <button type="button" onClick={() => actions.removeGuestBuildSlot(slot.id)} style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer" }}>✕</button>
                ) : null}
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            <button type="button" onClick={() => actions.createNewGuestBuild()} style={{ padding: "10px", borderRadius: 10, border: "1px dashed #93c5fd", background: "#eff6ff", fontWeight: 700, cursor: "pointer" }}>
              + Tạo cấu hình mới
            </button>
            <button type="button" onClick={() => actions.exportGuestBuilds()} style={{ padding: "10px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontWeight: 700, cursor: "pointer" }}>
              📤 Xuất file JSON
            </button>
            <button type="button" onClick={() => importInputRef.current?.click()} style={{ padding: "10px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontWeight: 700, cursor: "pointer" }}>
              📥 Nhập file JSON
            </button>
            <input ref={importInputRef} type="file" accept="application/json,.json" hidden onChange={(e) => { actions.importGuestBuilds(e.target.files?.[0]); e.target.value = ""; }} />
          </div>
        </div>
      ) : null}

      <div style={{ background: "linear-gradient(160deg, #1e293b, #0f172a)", borderRadius: 28, padding: 28, color: "#fff", border: "1px solid rgba(59,130,246,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ fontSize: 20 }}>🤖</div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>AI Advisor</h3>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>Gợi ý cấu hình thông minh</div>
          </div>
        </div>
        <div style={{ display: "grid", gap: 16 }}>
          <input
            type="number"
            value={suggestionForm.budget}
            onChange={e => setSuggestionForm(p => ({ ...p, budget: e.target.value }))}
            style={{ width: "100%", height: 48, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "0 16px", color: "#fff" }}
          />
          <select
            value={suggestionForm.purpose}
            onChange={e => setSuggestionForm(p => ({ ...p, purpose: e.target.value }))}
            style={{ width: "100%", height: 48, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "0 16px", color: "#fff" }}
          >
            {PURPOSE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            onClick={() => actions.getAiSuggestion(suggestionForm.purpose, suggestionForm.budget)}
            disabled={aiLoading}
            style={{ height: 52, borderRadius: 14, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "#fff", fontWeight: 900, cursor: "pointer" }}
          >
            ✨ Lấy gợi ý AI
          </button>
        </div>
      </div>
    </aside>
  );
}
