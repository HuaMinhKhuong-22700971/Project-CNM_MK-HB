import { useState, useEffect } from "react";

const PURPOSES = [
  { id: "gaming", label: "Gaming AAA / eSports", icon: "🎮", desc: "Ưu tiên Card đồ họa mạnh, FPS cao mượt mà" },
  { id: "editing", label: "Dựng phim / Đồ họa 4K", icon: "🎬", desc: "Ưu tiên CPU đa nhân & RAM lớn render nhanh" },
  { id: "ai", label: "Lập trình / AI Workstation", icon: "🤖", desc: "VRAM cao, xử lý đa nhiệm nặng" },
  { id: "office", label: "Văn phòng / Học tập", icon: "💼", desc: "Ổn định, mượt mà, tiết kiệm chi phí" }
];

const RESOLUTIONS = [
  { id: "1080p", label: "1080p Full HD", desc: "Phổ phổ thông, FPS cao" },
  { id: "2k", label: "1440p / 2K", desc: "Sắc nét, đồ họa cao cấp" },
  { id: "4k", label: "4K Ultra HD", desc: "Chất lượng hình ảnh tối đa" }
];

const PREFERENCES = [
  { id: "value", label: "Best Value", desc: "Cân bằng P/P nhất" },
  { id: "performance", label: "Best Performance", desc: "Ưu tiên hiệu năng tối đa" },
  { id: "quiet", label: "Máy êm & Mát", desc: "Ưu tiên tản nhiệt & êm ái" },
  { id: "future", label: "Khả năng Nâng cấp", desc: "Dễ nâng cấp về sau" }
];

const FUTURE_NEEDS = [
  { id: "upgrade_gpu", label: "🎮 Nâng cấp GPU", desc: "Cần PSU dư công suất & khe cắm PCIe x16 sẵn sàng" },
  { id: "upgrade_ram", label: "🧠 Nâng cấp RAM", desc: "Cần Mainboard có 4 khe RAM DDR4/DDR5" },
  { id: "upgrade_cpu", label: "🖥 Nâng cấp CPU", desc: "Cần Mainboard VRM khỏe & socket mở rộng tốt" },
  { id: "none", label: "🔒 Giữ nguyên Cấu hình", desc: "Tối ưu ngân sách hiện tại, không nâng cấp" }
];

const formatCurrency = (v) => Number(v || 0).toLocaleString("vi-VN");

export function RequirementWizardModal({ isOpen, onClose, onSubmitProfile, suggestionForm }) {
  const [purpose, setPurpose] = useState(() => suggestionForm?.purpose || "gaming");
  const [budget, setBudget] = useState(() => String(suggestionForm?.budget || 25000000));
  const [resolution, setResolution] = useState(() => suggestionForm?.resolution || "1080p");
  const [preference, setPreference] = useState(() => suggestionForm?.preference || "value");
  const [futureNeed, setFutureNeed] = useState(() => suggestionForm?.futureNeed || "none");

  // ✅ FIX VẤN ĐỀ 10: Tự động đồng bộ form state từ suggestionForm khi mở modal
  useEffect(() => {
    if (isOpen && suggestionForm) {
      setPurpose(suggestionForm.purpose || "gaming");
      setBudget(String(suggestionForm.budget || 25000000));
      setResolution(suggestionForm.resolution || "1080p");
      setPreference(suggestionForm.preference || "value");
      setFutureNeed(suggestionForm.futureNeed || "none");
    }
  }, [isOpen, suggestionForm]);

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    onSubmitProfile({
      purpose,
      budget: Number(budget || 25000000),
      resolution,
      preference,
      futureNeed
    });
    onClose();
  }

  return (
    <div className="req-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="req-modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <header className="req-modal-header">
          <div>
            <span className="req-modal-subtitle">AI DECISION SUPPORT SYSTEM</span>
            <h2 className="req-modal-title">🎯 Thu Thập Nhu Cầu Lắp Ráp PC</h2>
          </div>
          <button type="button" className="req-modal-close" onClick={onClose}>×</button>
        </header>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="req-modal-body">
          {/* Step 1: Purpose */}
          <div className="req-section">
            <label className="req-label">1. Mục đích sử dụng chính của bạn là gì?</label>
            <div className="req-grid req-grid--2">
              {PURPOSES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`req-chip-card${purpose === item.id ? " is-selected" : ""}`}
                  onClick={() => setPurpose(item.id)}
                >
                  <span className="req-chip-icon">{item.icon}</span>
                  <div>
                    <strong className="req-chip-title">{item.label}</strong>
                    <span className="req-chip-desc">{item.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Budget */}
          <div className="req-section">
            <label className="req-label">
              2. Ngân sách dự kiến: <span className="req-highlight">{formatCurrency(budget)}đ</span>
            </label>
            <div className="req-budget-row">
              <input
                type="range"
                min="8000000"
                max="100000000"
                step="1000000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="req-slider"
              />
              <div className="req-quick-budgets">
                {["12000000", "25000000", "35000000", "50000000"].map((val) => (
                  <button
                    key={val}
                    type="button"
                    className={`req-budget-btn${budget === val ? " is-selected" : ""}`}
                    onClick={() => setBudget(val)}
                  >
                    {formatCurrency(val)}đ
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Resolution & Preference */}
          <div className="req-grid req-grid--2">
            <div className="req-section">
              <label className="req-label">3. Target Độ phân giải</label>
              <div className="req-select-stack">
                {RESOLUTIONS.map((res) => (
                  <button
                    key={res.id}
                    type="button"
                    className={`req-option-btn${resolution === res.id ? " is-selected" : ""}`}
                    onClick={() => setResolution(res.id)}
                  >
                    <strong>{res.label}</strong>
                    <span>{res.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="req-section">
              <label className="req-label">4. Khẩu vị ưu tiên cá nhân</label>
              <div className="req-select-stack">
                {PREFERENCES.map((pref) => (
                  <button
                    key={pref.id}
                    type="button"
                    className={`req-option-btn${preference === pref.id ? " is-selected" : ""}`}
                    onClick={() => setPreference(pref.id)}
                  >
                    <strong>{pref.label}</strong>
                    <span>{pref.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 5: Future Needs */}
          <div className="req-section">
            <label className="req-label">5. Kế hoạch nâng cấp trong 2 năm tới của bạn?</label>
            <div className="req-grid req-grid--2">
              {FUTURE_NEEDS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`req-chip-card${futureNeed === item.id ? " is-selected" : ""}`}
                  onClick={() => setFutureNeed(item.id)}
                >
                  <div>
                    <strong className="req-chip-title">{item.label}</strong>
                    <span className="req-chip-desc">{item.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
          <footer className="req-modal-footer">
            <button type="button" className="btn-req-secondary" onClick={onClose}>
              Đóng
            </button>
            <button type="submit" className="btn-req-primary">
              ⚡ Phân Tích & AI Build 3 Candidates
            </button>
          </footer>
        </form>

      </div>
    </div>
  );
}
