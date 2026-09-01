import React, { useEffect } from "react";

/**
 * CompatibilityToast — Toast floating notification nổi bật khi có thay đổi tương thích
 *
 * Props:
 *   toast: { id, type, title, message, detail }
 *   onClose: () => void
 *   onOpenXai: () => void
 */
export function CompatibilityToast({ toast, onClose, onOpenXai }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 7000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const { type, title, message, detail } = toast;

  const isError   = type === "error" || type === "BLOCKER";
  const isWarn    = type === "warning" || type === "WARNING";
  const isSuccess = type === "success" || type === "RESOLVED";

  const borderColor = isError ? "#f43f5e" : isWarn ? "#f59e0b" : "#10b981";
  const icon        = isError ? "⛔" : isWarn ? "⚠️" : "✅";
  const badgeText   = isError ? "XUNG ĐỘT TƯƠNG THÍCH" : isWarn ? "CẢNH BÁO TƯƠNG THÍCH" : "ĐÃ KHẮC PHỤC";
  const badgeClass  = isError ? "toast-badge--error" : isWarn ? "toast-badge--warn" : "toast-badge--success";

  return (
    <div className="compat-toast-wrapper" role="alert" aria-live="assertive">
      <div className="compat-toast-card" style={{ borderLeftColor: borderColor }}>
        <div className="compat-toast-header">
          <div className="compat-toast-title-box">
            <span className="compat-toast-icon">{icon}</span>
            <span className={`compat-toast-badge ${badgeClass}`}>{badgeText}</span>
          </div>
          <button
            type="button"
            className="compat-toast-close"
            onClick={onClose}
            aria-label="Đóng thông báo"
          >
            ×
          </button>
        </div>

        <div className="compat-toast-content">
          <h4 className="compat-toast-title">{title}</h4>
          <p className="compat-toast-msg">{message}</p>
          {detail && <div className="compat-toast-detail">{detail}</div>}
        </div>

        <div className="compat-toast-footer">
          {onOpenXai && (
            <button
              type="button"
              className="compat-toast-btn-primary"
              onClick={() => {
                onClose();
                onOpenXai();
              }}
            >
              🧠 Xem giải thích AI
            </button>
          )}
          <button
            type="button"
            className="compat-toast-btn-secondary"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>

        <div className="compat-toast-progress" style={{ backgroundColor: borderColor }} />
      </div>
    </div>
  );
}
