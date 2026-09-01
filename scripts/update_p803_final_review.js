const fs = require('fs');
const path = require('path');

const pageFile = path.join(__dirname, '../apps/web/src/pages/public/PcBuilderPage.jsx');
let code = fs.readFileSync(pageFile, 'utf8');

// 1. Add import
code = code.replace(
  'import { WhatIfComparisonPanel } from "../../components/pc-builder/WhatIfComparisonPanel";',
  'import { WhatIfComparisonPanel } from "../../components/pc-builder/WhatIfComparisonPanel";\nimport { FinalReviewModal } from "../../components/pc-builder/FinalReviewModal";'
);

// 2. Add state
const targetState = `  const [isAutoBuilding, setIsAutoBuilding] = useState(false);`;
const newState = `  const [isAutoBuilding, setIsAutoBuilding] = useState(false);
  const [isFinalReviewOpen, setIsFinalReviewOpen] = useState(false);`;

code = code.replace(targetState, newState);

// 3. Update handleBuyWholeBuild and add executeBuyWholeBuild
const oldBuyHandler = `  async function handleBuyWholeBuild() {
    const ids = Object.values(selectedItems).map(getVariantId).filter(Boolean);
    if (ids.length === 0) { actions.setError("Chưa có linh kiện để mua."); return; }
    if (!isAuthenticated) { navigate(routeConfig.public.login); return; }
    setProcessingComponent("cart");
    try {
      await Promise.all(ids.map((productVariantId) => addItemToCart({ productVariantId, quantity: 1 })));
      setLocalMessage("✅ Đã thêm toàn bộ linh kiện vào giỏ hàng. Đang chuyển đến thanh toán...");
      navigate(routeConfig.public.checkout);
    } catch { actions.setError("Không thể mua nguyên bộ cấu hình."); }
    finally { setProcessingComponent(""); }
  }`;

const newBuyHandler = `  async function handleBuyWholeBuild() {
    const ids = Object.values(selectedItems).map(getVariantId).filter(Boolean);
    if (ids.length === 0) { actions.setError("Chưa có linh kiện để mua."); return; }
    if (!isAuthenticated) { navigate(routeConfig.public.login); return; }
    setIsFinalReviewOpen(true);
  }

  async function executeBuyWholeBuild(options = {}) {
    const ids = Object.values(selectedItems).map(getVariantId).filter(Boolean);
    setProcessingComponent("cart");
    setIsFinalReviewOpen(false);
    try {
      await Promise.all(ids.map((productVariantId) => addItemToCart({ productVariantId, quantity: 1 })));
      setLocalMessage("✅ Đã xác nhận & nạp toàn bộ linh kiện vào giỏ hàng. Đang chuyển đến trang thanh toán...");
      navigate(routeConfig.public.checkout);
    } catch {
      actions.setError("Không thể mua nguyên bộ cấu hình.");
    } finally {
      setProcessingComponent("");
    }
  }`;

code = code.replace(oldBuyHandler, newBuyHandler);

// 4. Render FinalReviewModal at end of page
const targetModal = `{/* ── REQUIREMENT WIZARD MODAL ───────────────────────── */}`;
const newModal = `{/* ── FINAL PRE-PURCHASE AI REVIEW MODAL ─────────────── */}
      <FinalReviewModal
        isOpen={isFinalReviewOpen}
        onClose={() => setIsFinalReviewOpen(false)}
        selectedItems={selectedItems}
        totalPrice={totalPrice}
        xaiReport={backendXaiReport || insights}
        insights={insights}
        suggestionForm={suggestionForm}
        onConfirmPurchase={executeBuyWholeBuild}
        isProcessing={processingComponent === "cart"}
      />

      {/* ── REQUIREMENT WIZARD MODAL ───────────────────────── */}`;

code = code.replace(targetModal, newModal);

fs.writeFileSync(pageFile, code, 'utf8');
console.log('✅ Successfully integrated FinalReviewModal into PcBuilderPage.jsx!');
