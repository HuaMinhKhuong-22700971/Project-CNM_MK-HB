import React from "react";

/* ── PRICE RANGE PRESETS ────────────────────────────────────────── */
const PRICE_RANGES = [
  { label: "Tất cả",     min: 0,        max: 0        },
  { label: "< 5 Triệu",  min: 0,        max: 5000000  },
  { label: "5 – 10 Tr",  min: 5000000,  max: 10000000 },
  { label: "10 – 20 Tr", min: 10000000, max: 20000000 },
  { label: "20 – 35 Tr", min: 20000000, max: 35000000 },
  { label: "> 35 Triệu", min: 35000000, max: 0        },
];

/* ── AI SCORE THRESHOLDS ─────────────────────────────────────────── */
const AI_SCORE_OPTIONS = [
  { label: "Tất cả",   value: 0  },
  { label: "≥ 40",     value: 40 },
  { label: "≥ 60",     value: 60 },
  { label: "≥ 75 ★",   value: 75 },
  { label: "≥ 85 🔥",  value: 85 },
];

/**
 * ProductFilterBar — Bộ lọc nâng cao cho Product Grid
 * Props:
 *   isOpen, onToggle
 *   availableBrands: string[]
 *   filterPriceRange: {min, max}, setFilterPriceRange
 *   filterBrands: string[], setFilterBrands
 *   filterAiScoreMin: number, setFilterAiScoreMin
 *   activeFilterCount: number
 *   filteredCount: number, totalCount: number
 */
export function ProductFilterBar({
  isOpen,
  onToggle,
  availableBrands = [],
  filterPriceRange,
  setFilterPriceRange,
  filterBrands,
  setFilterBrands,
  filterAiScoreMin,
  setFilterAiScoreMin,
  activeFilterCount = 0,
  filteredCount = 0,
  totalCount = 0,
}) {
  /* Find which price preset is currently active */
  const activePriceIdx = PRICE_RANGES.findIndex(
    (r) => r.min === filterPriceRange.min && r.max === filterPriceRange.max
  );

  function toggleBrand(brand) {
    setFilterBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  }

  function clearAll() {
    setFilterPriceRange({ min: 0, max: 0 });
    setFilterBrands([]);
    setFilterAiScoreMin(0);
  }

  return (
    <div className={`filter-bar${isOpen ? " is-open" : ""}`}>

      {/* ── Toggle Header ──────────────────────────────────────── */}
      <div
        className="filter-bar__header"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onKeyDown={(e) => e.key === "Enter" && onToggle()}
      >
        <div className="filter-bar__header-left">
          <span className="filter-bar__icon">⚙️</span>
          <span className="filter-bar__title">Bộ lọc nâng cao</span>
          {activeFilterCount > 0 && (
            <span className="filter-bar__active-badge">
              {activeFilterCount} đang áp dụng
            </span>
          )}
        </div>
        <div className="filter-bar__header-right">
          <span className="filter-bar__result-count">
            <strong>{filteredCount}</strong>/{totalCount} sản phẩm
          </span>
          <span className={`filter-bar__chevron${isOpen ? " is-up" : ""}`}>›</span>
        </div>
      </div>

      {/* ── Filter Body (collapsible) ─────────────────────────── */}
      <div className={`filter-bar__body${isOpen ? " is-visible" : ""}`}>
        <div className="filter-bar__body-inner">

          {/* Price Range */}
          <div className="filter-section">
            <span className="filter-section__label">
              <span className="filter-section__icon">💰</span>
              Khoảng giá
            </span>
            <div className="filter-chips">
              {PRICE_RANGES.map((range, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`filter-chip${activePriceIdx === idx || (idx === 0 && activePriceIdx === -1) ? " is-active" : ""}`}
                  onClick={() => setFilterPriceRange({ min: range.min, max: range.max })}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          {availableBrands.length > 0 && (
            <div className="filter-section">
              <span className="filter-section__label">
                <span className="filter-section__icon">🏷️</span>
                Thương hiệu
                {filterBrands.length > 0 && (
                  <span className="filter-section__count">{filterBrands.length} đã chọn</span>
                )}
              </span>
              <div className="filter-chips filter-chips--brands">
                {availableBrands.slice(0, 18).map((brand) => {
                  const isSelected = filterBrands.includes(brand);
                  return (
                    <button
                      key={brand}
                      type="button"
                      className={`filter-chip filter-chip--brand${isSelected ? " is-active" : ""}`}
                      onClick={() => toggleBrand(brand)}
                    >
                      {isSelected && <span className="filter-chip__check">✓</span>}
                      {brand}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Score Min */}
          <div className="filter-section">
            <span className="filter-section__label">
              <span className="filter-section__icon">⚡</span>
              AI Score tối thiểu
            </span>
            <div className="filter-chips">
              {AI_SCORE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`filter-chip filter-chip--score${filterAiScoreMin === opt.value ? " is-active" : ""}`}
                  onClick={() => setFilterAiScoreMin(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer: Clear + Result count */}
          <div className="filter-bar__footer">
            {activeFilterCount > 0 ? (
              <button
                type="button"
                className="filter-bar__clear-btn"
                onClick={clearAll}
              >
                🗑️ Xóa tất cả ({activeFilterCount})
              </button>
            ) : (
              <span className="filter-bar__hint">
                💡 Áp dụng bộ lọc để thu hẹp kết quả tìm kiếm
              </span>
            )}
            <span className={`filter-bar__match${activeFilterCount > 0 ? " has-filter" : ""}`}>
              {activeFilterCount > 0
                ? `Hiển thị ${filteredCount} / ${totalCount} sản phẩm`
                : `${totalCount} sản phẩm`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
