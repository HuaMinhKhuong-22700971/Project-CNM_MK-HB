const fs = require('fs');
const path = require('path');

const pageFile = path.join(__dirname, '../apps/web/src/pages/public/PcBuilderPage.jsx');
let code = fs.readFileSync(pageFile, 'utf8');

// 1. Insert calculation logic right after completionPercent
const targetCalc = `  const completionPercent = Math.round((Math.min(selectedCount, insights.requiredCount) / insights.requiredCount) * 100);`;
const newCalc = `  const completionPercent = Math.round((Math.min(selectedCount, insights.requiredCount) / insights.requiredCount) * 100);

  /* Budget Exceeded Warning Calculation */
  const userBudget = Number(suggestionForm.budget || 25000000);
  const isBudgetExceeded = totalPrice > 0 && userBudget > 0 && totalPrice > userBudget * 1.05;
  const budgetDiff = totalPrice - userBudget;
  const budgetExceededPercent = Math.round((budgetDiff / userBudget) * 100);

  const mostExpensiveComponent = useMemo(() => {
    if (!selectedItems) return null;
    let highest = null;
    let maxPrice = 0;
    Object.entries(selectedItems).forEach(([type, item]) => {
      const p = getSelectedProduct(item);
      const price = getItemPrice(item);
      if (price > maxPrice) {
        maxPrice = price;
        highest = { type: type.toUpperCase(), name: getProductName(p), price };
      }
    });
    return highest;
  }, [selectedItems]);`;

code = code.replace(targetCalc, newCalc);

// 2. Render warning banner in workspace
const targetRender = `            {/* Candidate Builds Panel (Best Value, Best Performance, Budget Safe) */}
            {candidateBuilds && (
              <CandidateBuildsPanel
                candidateBuilds={candidateBuilds}
                activeCandidateTab={activeCandidateTab}
                onSelectCandidateTab={setActiveCandidateTab}
                onApplyCandidateBuild={handleApplyCandidateBuild}
                isApplying={processingComponent === "apply-candidate"}
              />
            )}`;

const newRender = `            {/* Candidate Builds Panel (Best Value, Best Performance, Budget Safe) */}
            {candidateBuilds && (
              <CandidateBuildsPanel
                candidateBuilds={candidateBuilds}
                activeCandidateTab={activeCandidateTab}
                onSelectCandidateTab={setActiveCandidateTab}
                onApplyCandidateBuild={handleApplyCandidateBuild}
                isApplying={processingComponent === "apply-candidate"}
              />
            )}

            {/* ⚠️ BUDGET EXCEEDED WARNING BANNER */}
            {isBudgetExceeded && (
              <div style={{
                backgroundColor: "#fff7ed",
                border: "1px solid #fed7aa",
                borderRadius: "16px",
                padding: "16px 20px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 4px 12px rgba(234, 88, 12, 0.08)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span style={{ fontSize: "28px" }}>⚠️</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#c2410c" }}>
                      Vượt Ngân Sách {budgetExceededPercent}% (+{formatCurrency(budgetDiff)}đ)
                    </h4>
                    <p style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "#9a3412", lineHeight: "1.4" }}>
                      Hạn mức của bạn: <strong>{formatCurrency(userBudget)}đ</strong>. Cấu hình hiện tại: <strong>{formatCurrency(totalPrice)}đ</strong>.
                      {mostExpensiveComponent && (
                        <span> Gợi ý tiết kiệm: Đổi linh kiện cao giá nhất <strong>{mostExpensiveComponent.type} ({mostExpensiveComponent.name})</strong> xuống dòng thấp hơn.</span>
                      )}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                  {candidateBuilds?.budgetSafe && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCandidateTab("budgetSafe");
                        handleApplyCandidateBuild(candidateBuilds.budgetSafe);
                      }}
                      style={{
                        backgroundColor: "#ea580c",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "10px",
                        padding: "8px 14px",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}
                    >
                      💡 Áp Dụng Budget Safe
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRunWhatIf(-5000000)}
                    disabled={isWhatIfLoading}
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#c2410c",
                      border: "1px solid #fdba74",
                      borderRadius: "10px",
                      padding: "8px 14px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                  >
                    🔮 Mô phỏng -5Tr
                  </button>
                </div>
              </div>
            )}`;

code = code.replace(targetRender, newRender);

fs.writeFileSync(pageFile, code, 'utf8');
console.log('✅ Successfully added Budget Exceeded Warning Banner to PcBuilderPage.jsx!');
