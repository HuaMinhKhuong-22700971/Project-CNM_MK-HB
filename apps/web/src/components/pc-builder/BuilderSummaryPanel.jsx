import React from "react";
import { ThemeToggle } from "../common/ThemeToggle";

const formatCurrency = (v) => Number(v || 0).toLocaleString("vi-VN");

/**
 * BuilderSummaryPanel — Header & Bảng Tóm Tắt Cấu Hình
 */
export function BuilderSummaryPanel({
  selectedPresetId,
  onSelectPreset,
  presets = [],
  onOpenReqWizard,
  onOpenXaiDrawer,
  onAutoBuild,
  isAutoBuilding,
  budget = 25000000,
  onRefreshCatalog,
  onClearAll,
  selectedCount = 0,
  onExportPdf,
}) {
  return (
    <header className="builder-topbar">
      {/* Brand */}
      <div className="topbar-brand">
        <span className="topbar-brand-logo">PC Mall</span>
        <span className="topbar-brand-sep">|</span>
        <span className="topbar-brand-name">Smart PC Builder</span>
      </div>

      {/* Presets — "Starting Point" chips */}
      <nav className="topbar-presets" aria-label="Build presets">
        <span className="topbar-presets-label">Preset:</span>
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={`preset-chip${selectedPresetId === preset.id ? " is-active" : ""}`}
            title={preset.desc}
            onClick={() => onSelectPreset(preset)}
          >
            {preset.label}
            <span className="preset-chip__budget">{formatCurrency(preset.budget)}đ</span>
          </button>
        ))}
      </nav>

      {/* Actions — PRIMARY: AI Build, SECONDARY: XAI, Requirement Wizard, PDF, Reset */}
      <div className="topbar-actions">
        {onRefreshCatalog && (
          <button
            type="button"
            className="btn-topbar-secondary"
            onClick={onRefreshCatalog}
            title="Xóa cache trình duyệt và làm mới danh mục linh kiện trực tiếp từ máy chủ"
          >
            🔄 Làm mới
          </button>
        )}

        {onClearAll && (
          <button
            type="button"
            className="btn-topbar-secondary"
            onClick={onClearAll}
            disabled={selectedCount === 0}
            style={{
              opacity: selectedCount === 0 ? 0.5 : 1,
              cursor: selectedCount === 0 ? "not-allowed" : "pointer"
            }}
            title="Xóa toàn bộ linh kiện đã chọn để lắp bộ PC mới"
          >
            🗑️ Reset
          </button>
        )}

        <button
          type="button"
          className="btn-topbar-secondary"
          onClick={onOpenReqWizard}
          title="Mở Form Thu Nhập Nhu Cầu Lắp Ráp PC"
        >
          🎯 Nhu Cầu AI
        </button>

        <button
          type="button"
          className="btn-topbar-secondary"
          onClick={onOpenXaiDrawer}
          title="Xem giải thích AI chi tiết từ Backend XAI Engine"
        >
          🧠 XAI
        </button>

        <button
          type="button"
          className="btn-topbar-secondary"
          onClick={() => onExportPdf ? onExportPdf() : window.print()}
          title="Xuất PDF báo giá cấu hình có logo PC Mall"
        >
          📄 Xuất PDF
        </button>

        {/* PRIMARY ACTION — AI Build */}
        <button
          id="btn-ai-build-primary"
          type="button"
          className="btn-ai-build"
          onClick={() => onAutoBuild()}
          disabled={isAutoBuilding}
          title={`Tự động gợi ý cấu hình ${selectedPresetId} tối ưu trong ngân sách ${formatCurrency(budget)}đ`}
        >
          ⚡ {isAutoBuilding ? "Đang phân tích..." : "AI Build"}
        </button>
      </div>
    </header>
  );
}
