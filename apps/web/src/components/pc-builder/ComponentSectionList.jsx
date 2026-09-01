import React from "react";
import { resolveProductImage } from "../../utils/productImage";

const formatCurrency = (v) => Number(v || 0).toLocaleString("vi-VN");

const getProductName = (p) => p?.product_name || p?.name || p?.title || "Chưa chọn";
const getSelectedProduct = (item) => item?.product || item;
const getItemPrice = (item) => Number(item?.variant?.price || item?.product?.price || item?.price || 0);

/**
 * ComponentSectionList — Danh sách 8 bước chọn linh kiện trong Sidebar
 */
export function ComponentSectionList({
  sections = [],
  selectedItems = {},
  activeComponent,
  setActiveComponent,
  setSearchTerm,
  insights,
  onRemoveComponent,
  onClearAll,
  completionPercent = 0
}) {
  const selectedCount = Object.keys(selectedItems || {}).length;

  return (
    <div className="component-section-list">
      <div className="sidebar-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="sidebar-section-title">Tiến trình lắp ráp</span>
          <span className="sidebar-section-title" style={{ color: "var(--c-primary)" }}>
            {completionPercent}%
          </span>
        </div>
        {onClearAll && selectedCount > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            style={{
              backgroundColor: "transparent",
              color: "#ef4444",
              border: "none",
              fontSize: "11px",
              fontWeight: "700",
              cursor: "pointer",
              padding: "2px 4px",
              borderRadius: "4px"
            }}
            title="Xóa toàn bộ linh kiện đã chọn trong cấu hình"
          >
            🗑️ Xóa hết
          </button>
        )}
      </div>

      <div className="sidebar-progress-wrap">
        <div
          className="sidebar-progress-track"
          role="progressbar"
          aria-valuenow={completionPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span className="sidebar-progress-fill" style={{ width: `${completionPercent}%` }} />
        </div>
      </div>

      {sections.map((section, idx) => {
        const selected = selectedItems[section.componentType];
        const product  = selected ? getSelectedProduct(selected) : null;
        const isDone   = Boolean(selected);
        const isActive = activeComponent === section.componentType;
        const imgUrl   = product ? resolveProductImage(product) : null;

        return (
          <div
            key={section.componentType}
            role="button"
            tabIndex={0}
            className={`step-item${isActive ? " is-active" : ""}${isDone ? " is-done" : ""}`}
            onClick={() => {
              setActiveComponent(section.componentType);
              if (setSearchTerm) setSearchTerm("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setActiveComponent(section.componentType);
                if (setSearchTerm) setSearchTerm("");
              }
            }}
            aria-current={isActive ? "step" : undefined}
          >
            {isDone && imgUrl ? (
              <div style={{ position: "relative", width: "34px", height: "34px", flexShrink: 0 }}>
                <img
                  src={imgUrl}
                  alt={getProductName(product)}
                  style={{
                    width: "34px",
                    height: "34px",
                    objectFit: "contain",
                    borderRadius: "7px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    padding: "2px"
                  }}
                />
                <span style={{
                  position: "absolute",
                  bottom: "-2px",
                  right: "-2px",
                  backgroundColor: "#16a34a",
                  color: "#ffffff",
                  fontSize: "8.5px",
                  fontWeight: "800",
                  width: "13px",
                  height: "13px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.25)"
                }}>
                  ✓
                </span>
              </div>
            ) : (
              <div className="step-indicator" aria-hidden>
                {idx + 1}
              </div>
            )}

            <div className="step-content">
              <strong className="step-title">{section.label}</strong>
              <span className="step-desc">
                {isDone
                  ? getProductName(product)
                  : section.componentType === "cooling" && !insights?.coolingState?.required
                    ? "Tùy chọn"
                    : "Chưa chọn"}
              </span>
            </div>

            {isDone && (
              <span className="step-price">{formatCurrency(getItemPrice(selected))}đ</span>
            )}

            {isDone && (
              <button
                type="button"
                className="step-remove-btn"
                title="Xóa linh kiện này"
                aria-label={`Xóa ${section.label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveComponent(section.componentType);
                }}
              >
                ×
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
