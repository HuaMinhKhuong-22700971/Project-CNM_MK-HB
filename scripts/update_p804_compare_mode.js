const fs = require('fs');
const path = require('path');

const pageFile = path.join(__dirname, '../apps/web/src/pages/public/PcBuilderPage.jsx');
let code = fs.readFileSync(pageFile, 'utf8');

// 1. Add import for CompareDrawer
code = code.replace(
  'import { FinalReviewModal } from "../../components/pc-builder/FinalReviewModal";',
  'import { FinalReviewModal } from "../../components/pc-builder/FinalReviewModal";\nimport { CompareDrawer } from "../../components/pc-builder/CompareDrawer";'
);

// 2. Add state
const targetState = `  const [isFinalReviewOpen, setIsFinalReviewOpen] = useState(false);`;
const newState = `  const [isFinalReviewOpen, setIsFinalReviewOpen] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [isCompareDrawerOpen, setIsCompareDrawerOpen] = useState(false);`;

code = code.replace(targetState, newState);

// 3. Update BuilderProductCard signature & footer
const oldCardSignature = `function BuilderProductCard({ activeComponent, isSelected, processingComponent, loading, onSelect, onOpenDetail, product, selectedItems, suggestionForm, totalPrice }) {`;
const newCardSignature = `function BuilderProductCard({ activeComponent, isSelected, processingComponent, loading, onSelect, onOpenDetail, product, selectedItems, suggestionForm, totalPrice, isCompared, onToggleCompare }) {`;

code = code.replace(oldCardSignature, newCardSignature);

const oldCardFooter = `          <button
            type="button"
            className={\`btn-select\${isSelected ? " is-selected" : ""}\`}
            disabled={isProcessing || loading}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(activeComponent, product);
            }}
          >
            {isProcessing ? "Đang chọn..." : isSelected ? "✓ Đã chọn" : "Chọn"}
          </button>`;

const newCardFooter = `          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11.5px",
                fontWeight: "700",
                color: isCompared ? "#2563eb" : "#64748b",
                cursor: "pointer"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={Boolean(isCompared)}
                onChange={(e) => onToggleCompare(product, e.target.checked)}
                style={{ width: "14px", height: "14px", cursor: "pointer" }}
              />
              So sánh
            </label>

            <button
              type="button"
              className={\`btn-select\${isSelected ? " is-selected" : ""}\`}
              disabled={isProcessing || loading}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(activeComponent, product);
              }}
            >
              {isProcessing ? "Đang chọn..." : isSelected ? "✓ Đã chọn" : "Chọn"}
            </button>
          </div>`;

code = code.replace(oldCardFooter, newCardFooter);

// 4. Update BuilderProductCard call in grid
const oldCardCall = `                        <BuilderProductCard
                          activeComponent={activeComponent}
                          isSelected={isSelected}
                          loading={loading}
                          onSelect={handleSelectProduct}
                          onOpenDetail={(prod) => setDetailModalProduct(prod)}
                          processingComponent={processingComponent}
                          product={product}
                          selectedItems={selectedItems}
                          suggestionForm={suggestionForm}
                          totalPrice={totalPrice}
                        />`;

const newCardCall = `                        <BuilderProductCard
                          activeComponent={activeComponent}
                          isSelected={isSelected}
                          loading={loading}
                          onSelect={handleSelectProduct}
                          onOpenDetail={(prod) => setDetailModalProduct(prod)}
                          processingComponent={processingComponent}
                          product={product}
                          selectedItems={selectedItems}
                          suggestionForm={suggestionForm}
                          totalPrice={totalPrice}
                          isCompared={compareList.some((p) => (p.product_id || p.id) === productId)}
                          onToggleCompare={(prod, isChecked) => {
                            if (isChecked) {
                              if (compareList.length >= 3) {
                                actions.setError("Chỉ hỗ trợ so sánh tối đa 3 sản phẩm cùng lúc.");
                                return;
                              }
                              setCompareList((prev) => [...prev.filter((p) => (p.product_id || p.id) !== productId), prod]);
                            } else {
                              setCompareList((prev) => prev.filter((p) => (p.product_id || p.id) !== productId));
                            }
                          }}
                        />`;

code = code.replace(oldCardCall, newCardCall);

// 5. Add floating Compare Bar & CompareDrawer at end of page
const oldFinalModalRender = `{/* ── FINAL PRE-PURCHASE AI REVIEW MODAL ─────────────── */}`;

const newCompareRender = `{/* ── FLOATING COMPARE BAR ───────────────────────────── */}
      {compareList.length > 0 && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          backgroundColor: "#0f172a",
          color: "#ffffff",
          padding: "12px 18px",
          borderRadius: "16px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.35)",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          zIndex: 999,
          border: "1px solid #334155"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "22px" }}>📊</span>
            <div>
              <strong style={{ fontSize: "13.5px", display: "block", color: "#f8fafc" }}>
                Đã chọn {compareList.length}/3 sản phẩm
              </strong>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                Danh mục: {activeComponent.toUpperCase()}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCompareDrawerOpen(true)}
            style={{
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              padding: "8px 16px",
              fontSize: "12.5px",
              fontWeight: "800",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)"
            }}
          >
            📊 So Sánh Side-by-Side →
          </button>

          <button
            type="button"
            onClick={() => setCompareList([])}
            style={{
              backgroundColor: "transparent",
              color: "#94a3b8",
              border: "none",
              fontSize: "16px",
              cursor: "pointer",
              padding: "0 4px"
            }}
            title="Bỏ danh sách so sánh"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── COMPARE MATRIX DRAWER MODAL ─────────────────────── */}
      <CompareDrawer
        isOpen={isCompareDrawerOpen}
        onClose={() => setIsCompareDrawerOpen(false)}
        compareList={compareList}
        activeComponent={activeComponent}
        onSelectProduct={handleSelectProduct}
        onRemoveFromCompare={(pId) => setCompareList((prev) => prev.filter((p) => (p.product_id || p.id) !== pId))}
        onClearCompare={() => {
          setCompareList([]);
          setIsCompareDrawerOpen(false);
        }}
      />

      {/* ── FINAL PRE-PURCHASE AI REVIEW MODAL ─────────────── */}`;

code = code.replace(oldFinalModalRender, newCompareRender);

fs.writeFileSync(pageFile, code, 'utf8');
console.log('✅ Successfully integrated Compare Mode and CompareDrawer into PcBuilderPage.jsx!');
