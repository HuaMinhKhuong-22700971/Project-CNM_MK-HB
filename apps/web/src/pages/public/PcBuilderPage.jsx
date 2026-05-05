import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { BuildComponentSection } from "../../components/common/BuildComponentSection";
import { useAuth } from "../../hooks/useAuth";
import { getCategories, getProductDetail, getProducts } from "../../services/catalog.service";
import { httpClient } from "../../services/http";
import {
  addBuildItem,
  checkRawCompatibility,
  createBuild,
  removeBuildItem,
  saveBuild,
  suggestBuild
} from "../../services/pc-builder.service";

const COMPONENT_SECTIONS = [
  { componentType: "cpu",       label: "CPU",        categoryName: "CPU" },
  { componentType: "mainboard", label: "Mainboard",  categoryName: "MAINBOARD" },
  { componentType: "ram",       label: "RAM",        categoryName: "RAM" },
  { componentType: "gpu",       label: "GPU",        categoryName: "GPU" },
  { componentType: "storage",   label: "Lưu trữ",   categoryName: "STORAGE" },
  { componentType: "psu",       label: "Nguồn",      categoryName: "PSU" },
  { componentType: "case",      label: "Vỏ máy",    categoryName: "CASE" }
];

const PURPOSE_OPTIONS = [
  { value: "gaming",       label: "🎮 Gaming" },
  { value: "office",       label: "💼 Văn phòng" },
  { value: "programming",  label: "💻 Lập trình" },
  { value: "design",       label: "🎨 Đồ họa" }
];

function createInitialSelectorState() {
  return COMPONENT_SECTIONS.reduce((acc, s) => {
    acc[s.componentType] = { productId: "", variantId: "", variants: [] };
    return acc;
  }, {});
}

function findCategoryIdByName(categories, categoryName) {
  const matched = categories.find(
    (c) => String(c.name || "").trim().toUpperCase() === String(categoryName || "").trim().toUpperCase()
  );
  return matched?.id || null;
}

function normalizeProductsResponse(response) {
  const payload = response?.data || response;
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.items) ? payload.items : [];
}

function getErrorMessage(error, fallback) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    return error.response?.data?.message || error.response?.data?.error || fallback;
  }
  return error?.message || fallback;
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

export function PcBuilderPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [buildName, setBuildName] = useState("Cấu hình của tôi");
  const [build, setBuild] = useState(null);
  const [guestBuild, setGuestBuild] = useState(() => {
    try {
      const saved = localStorage.getItem("guest_pc_build");
      return saved ? JSON.parse(saved) : { components: {}, totalPrice: 0 };
    } catch { return { components: {}, totalPrice: 0 }; }
  });

  const [categories, setCategories] = useState([]);
  const [optionsByComponent, setOptionsByComponent] = useState({});
  const [selectorState, setSelectorState] = useState(createInitialSelectorState());
  const [compatibilityResult, setCompatibilityResult] = useState(null);
  const [suggestionResult, setSuggestionResult] = useState(null);
  const [suggestionForm, setSuggestionForm] = useState({ purpose: "gaming", budget: "25000000" });

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [processingComponent, setProcessingComponent] = useState("");
  const [generalLoading, setGeneralLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [applyingAI, setApplyingAI] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const activeBuild = useMemo(() => isAuthenticated ? build : guestBuild, [isAuthenticated, build, guestBuild]);
  const totalPrice = useMemo(() => Number(activeBuild?.totalPrice || 0), [activeBuild]);
  const selectedItemsMap = useMemo(() => activeBuild?.components || {}, [activeBuild]);
  const selectedCount = useMemo(() => Object.keys(selectedItemsMap).length, [selectedItemsMap]);

  function showSuccess(msg) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 4000);
  }

  // ── Initial Data Fetch ───────────────────────────────────────────────────────
  useEffect(() => {
    const initData = async () => {
      try {
        setLoadingInitial(true);
        const catResp = await getCategories();
        const catList = catResp?.data || catResp || [];
        setCategories(catList);

        const results = await Promise.all(
          COMPONENT_SECTIONS.map(async (section) => {
            const categoryId = findCategoryIdByName(catList, section.categoryName);
            if (!categoryId) return [section.componentType, []];
            const prodResp = await getProducts({ category_id: categoryId, limit: 100 });
            return [section.componentType, normalizeProductsResponse(prodResp)];
          })
        );
        setOptionsByComponent(Object.fromEntries(results));
      } catch (err) {
        setErrorMessage("Lỗi tải dữ liệu. Vui lòng tải lại trang.");
      } finally {
        setLoadingInitial(false);
      }
    };
    initData();
  }, []);

  // ── Load Current Build (authenticated users) ──────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;
    httpClient.get("/pc-builder/current")
      .then(res => {
        const data = res?.data?.data || res?.data || res;
        if (data?.id) setBuild(data);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  // ── Persist Guest Build ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem("guest_pc_build", JSON.stringify(guestBuild));
    }
  }, [guestBuild, isAuthenticated]);

  // ── Helper: Ensure build exists ──────────────────────────────────────────
  async function ensureBuildExists() {
    if (build?.id) return build;
    const resp = await createBuild({ name: buildName.trim() || "Cấu hình mới" });
    const nextBuild = resp?.data?.data || resp?.data || resp;
    setBuild(nextBuild);
    return nextBuild;
  }

  // ── Manual Selection Handlers ─────────────────────────────────────────────
  async function handleProductChange(componentType, productId) {
    setErrorMessage("");
    if (!productId) {
      setSelectorState(prev => ({ ...prev, [componentType]: { productId: "", variantId: "", variants: [] } }));
      return;
    }
    try {
      setProcessingComponent(componentType);
      const resp = await getProductDetail(productId);
      const product = resp?.data?.data || resp?.data || resp;
      const variants = product?.variants || product?.skus || [];
      const normalizedVariants = variants.map(v => ({
        variant_id: v.variant_id || v.id,
        sku: v.sku || `SKU-${v.variant_id || v.id}`,
        price: v.price || 0,
        stock: v.stock || 0
      }));
      setSelectorState(prev => ({ ...prev, [componentType]: { productId, variantId: "", variants: normalizedVariants } }));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể tải phiên bản sản phẩm."));
    } finally {
      setProcessingComponent("");
    }
  }

  function handleVariantChange(componentType, variantId) {
    setSelectorState(prev => ({ ...prev, [componentType]: { ...prev[componentType], variantId } }));
  }

  async function handleApplyComponent(componentType) {
    const sel = selectorState[componentType];
    if (!sel?.variantId) {
      setErrorMessage("Vui lòng chọn phiên bản sản phẩm trước.");
      return;
    }

    setGeneralLoading(true);
    setErrorMessage("");
    try {
      if (isAuthenticated) {
        const currentBuild = await ensureBuildExists();
        const resp = await addBuildItem(currentBuild.id, {
          productVariantId: Number(sel.variantId),
          componentType: componentType
        });
        const updatedBuild = resp?.data?.data || resp?.data || resp;
        setBuild(updatedBuild);
      } else {
        const product = optionsByComponent[componentType]?.find(
          p => String(p.product_id || p.id) === String(sel.productId)
        );
        const variant = sel.variants.find(v => String(v.variant_id) === String(sel.variantId));
        setGuestBuild(prev => {
          const newComponents = { ...prev.components };
          newComponents[componentType] = { product, variant };
          const newTotal = Object.values(newComponents).reduce(
            (sum, item) => sum + Number(item.variant?.price || 0), 0
          );
          return { components: newComponents, totalPrice: newTotal };
        });
      }
      setCompatibilityResult(null);
      showSuccess(`✅ Đã thêm ${componentType.toUpperCase()} vào cấu hình!`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể thêm linh kiện."));
    } finally {
      setGeneralLoading(false);
    }
  }

  async function handleRemoveComponent(componentType) {
    setGeneralLoading(true);
    setErrorMessage("");
    try {
      if (isAuthenticated && build?.id) {
        const resp = await removeBuildItem(build.id, componentType);
        const updatedBuild = resp?.data?.data || resp?.data || resp;
        setBuild(updatedBuild);
      } else {
        setGuestBuild(prev => {
          const newComponents = { ...prev.components };
          delete newComponents[componentType];
          const newTotal = Object.values(newComponents).reduce(
            (sum, item) => sum + Number(item.variant?.price || 0), 0
          );
          return { components: newComponents, totalPrice: newTotal };
        });
      }
      setSelectorState(prev => ({
        ...prev,
        [componentType]: { productId: "", variantId: "", variants: [] }
      }));
      setCompatibilityResult(null);
      showSuccess(`🗑️ Đã xóa ${componentType.toUpperCase()} khỏi cấu hình.`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Thao tác thất bại."));
    } finally {
      setGeneralLoading(false);
    }
  }

  // ── Compatibility Check ───────────────────────────────────────────────────
  async function handleCheckCompatibility() {
    if (selectedCount < 2) {
      setErrorMessage("Vui lòng chọn ít nhất 2 linh kiện để kiểm tra tương thích.");
      return;
    }
    setGeneralLoading(true);
    setCompatibilityResult(null);
    setErrorMessage("");
    try {
      const components = Object.entries(selectedItemsMap).map(([type, item]) => ({
        component_type: type,
        variant_id: item.variant?.id || item.variant?.variant_id || item.variant?.skuId
      })).filter(c => c.variant_id);

      const resp = await checkRawCompatibility({ components });
      const result = resp?.data?.data || resp?.data || resp;
      setCompatibilityResult(result);
      if (result?.compatible) {
        showSuccess("✅ Cấu hình tương thích hoàn toàn!");
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Lỗi kiểm tra tương thích."));
    } finally {
      setGeneralLoading(false);
    }
  }

  // ── AI Advisor ─────────────────────────────────────────────────────────────
  async function handleSuggestionSubmit(e) {
    e.preventDefault();
    const budget = Number(suggestionForm.budget);
    if (!budget || budget < 1000000) {
      setErrorMessage("Ngân sách phải lớn hơn 1.000.000 VNĐ.");
      return;
    }
    setAiLoading(true);
    setErrorMessage("");
    setSuggestionResult(null);
    try {
      const resp = await suggestBuild({ requirements: suggestionForm.purpose, budget });
      const result = resp?.data?.data || resp?.data || resp;
      setSuggestionResult(result);
      showSuccess("🤖 AI Advisor đã tạo cấu hình gợi ý!");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể tạo gợi ý AI. Vui lòng thử lại."));
    } finally {
      setAiLoading(false);
    }
  }

  // ── Apply AI Suggestions ──────────────────────────────────────────────────
  async function handleApplyAllSuggestions() {
    if (!suggestionResult) return;
    setApplyingAI(true);
    setErrorMessage("");

    const items = Array.isArray(suggestionResult.items)
      ? suggestionResult.items
      : Object.values(suggestionResult.components || {});

    let appliedCount = 0;
    let currentBuildRef = build;

    for (const comp of items) {
      const componentType = String(comp.componentType || comp.component_type || "").toLowerCase();
      const skuId = comp.variant?.id || comp.variant_id || comp.skuId;
      if (!componentType || !skuId) continue;

      try {
        if (isAuthenticated) {
          if (!currentBuildRef?.id) {
            const newBuild = await createBuild({ name: buildName.trim() || "Cấu hình AI" });
            currentBuildRef = newBuild?.data?.data || newBuild?.data || newBuild;
            setBuild(currentBuildRef);
          }
          const resp = await addBuildItem(currentBuildRef.id, {
            productVariantId: Number(skuId),
            componentType
          });
          const updatedBuild = resp?.data?.data || resp?.data || resp;
          currentBuildRef = updatedBuild;
          setBuild(updatedBuild);
        } else {
          setGuestBuild(prev => {
            const newComponents = { ...prev.components };
            newComponents[componentType] = {
              product: { id: comp.product_id, name: comp.product_name || comp.name },
              variant: { variant_id: skuId, sku: `SKU-${skuId}`, price: comp.price || comp.variant?.price || 0 }
            };
            const newTotal = Object.values(newComponents).reduce(
              (sum, item) => sum + Number(item.variant?.price || 0), 0
            );
            return { components: newComponents, totalPrice: newTotal };
          });
        }
        appliedCount++;
      } catch (_err) {
        // Continue applying others even if one fails
      }
    }

    setApplyingAI(false);
    setSuggestionResult(null);
    setSelectorState(createInitialSelectorState());
    setCompatibilityResult(null);
    showSuccess(`🚀 Đã áp dụng ${appliedCount} linh kiện từ AI vào cấu hình!`);
  }

  // ── Save Build ────────────────────────────────────────────────────────────
  async function handleSaveBuild() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!build?.id) {
      setErrorMessage("Chưa có cấu hình để lưu. Hãy thêm ít nhất một linh kiện.");
      return;
    }
    setGeneralLoading(true);
    setErrorMessage("");
    try {
      await saveBuild(build.id, { name: buildName });
      showSuccess("💾 Lưu cấu hình thành công!");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể lưu cấu hình."));
    } finally {
      setGeneralLoading(false);
    }
  }

  // ── Clear All ─────────────────────────────────────────────────────────────
  function handleClearAll() {
    if (!confirm("Bạn có chắc muốn xóa toàn bộ cấu hình không?")) return;
    if (isAuthenticated) {
      setBuild(prev => prev ? { ...prev, components: {}, totalPrice: 0, items: [] } : null);
    }
    setGuestBuild({ components: {}, totalPrice: 0 });
    setSelectorState(createInitialSelectorState());
    setCompatibilityResult(null);
    setSuggestionResult(null);
  }

  // ── Loading Screen ────────────────────────────────────────────────────────
  if (loadingInitial) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        <div style={{ width: 64, height: 64, border: "5px solid rgba(255,255,255,0.1)", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <h2 style={{ marginTop: 24, fontWeight: 300, letterSpacing: "0.1em" }}>Đang tải dữ liệu...</h2>
      </div>
    );
  }

  return (
    <div className="market-page" style={{ background: "#f8fafc", minHeight: "100vh", paddingBottom: 140 }}>

      {/* ── Header ── */}
      <header style={{ background: "#0f172a", padding: "60px 0 100px", color: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24 }}>
            <div>
              <h1 style={{ fontSize: 44, fontWeight: 900, marginBottom: 12 }}>⚙️ Xây dựng cấu hình PC</h1>
              <p style={{ fontSize: 18, color: "#94a3b8", maxWidth: 560 }}>Tư vấn AI thông minh – Lắp ráp trọn bộ PC chuyên nghiệp.</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>TỔNG GIÁ TẠM TÍNH</div>
              <div style={{ fontSize: 42, fontWeight: 900, color: "#3b82f6" }}>{formatCurrency(totalPrice)}đ</div>
              {isAuthenticated && (
                <div style={{ marginTop: 12 }}>
                  <input
                    value={buildName}
                    onChange={e => setBuildName(e.target.value)}
                    placeholder="Tên cấu hình..."
                    style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: "8px 16px", color: "#fff", fontSize: 14, width: 220 }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: "-40px auto 0", padding: "0 20px", position: "relative", zIndex: 2 }}>

        {/* ── Guest notice ── */}
        {!isAuthenticated && (
          <div style={{ padding: "20px 28px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}>
            <div style={{ color: "#64748b", fontSize: 14 }}>💡 Đăng nhập để lưu cấu hình vào tài khoản và đặt hàng.</div>
            <Link to="/login" style={{ padding: "8px 20px", background: "#3b82f6", color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>Đăng nhập</Link>
          </div>
        )}

        {/* ── Error Banner ── */}
        {errorMessage && (
          <div style={{ padding: "18px 28px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 20, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ color: "#b91c1c", fontWeight: 600, fontSize: 14 }}>🛑 {errorMessage}</div>
            <button onClick={() => setErrorMessage("")} style={{ background: "none", border: "none", color: "#b91c1c", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
          </div>
        )}

        {/* ── AI Suggestion Result ── */}
        {suggestionResult && (
          <section style={{ marginBottom: 40, padding: 32, background: "linear-gradient(135deg, #1e293b, #0f172a)", color: "#fff", borderRadius: 32, border: "1px solid rgba(59,130,246,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: "#60a5fa" }}>🤖 Cấu hình AI Gợi ý</h2>
              <button onClick={() => setSuggestionResult(null)} style={{ background: "none", border: "none", color: "#64748b", fontSize: 24, cursor: "pointer" }}>×</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 28 }}>
              {(Array.isArray(suggestionResult.items) ? suggestionResult.items : Object.values(suggestionResult.components || {})).map((comp, idx) => {
                const type = String(comp.componentType || comp.component_type || "").toUpperCase();
                const name = comp.product_name || comp.product?.name || comp.name || "—";
                const price = comp.variant?.price || comp.price || 0;
                return (
                  <div key={idx} style={{ padding: "16px 18px", background: "rgba(255,255,255,0.06)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ fontSize: 11, color: "#60a5fa", fontWeight: 800, marginBottom: 6 }}>{type}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, lineHeight: 1.4 }}>{name}</div>
                    <div style={{ fontSize: 13, color: "#94a3b8" }}>{formatCurrency(price)}đ</div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={handleApplyAllSuggestions}
                disabled={applyingAI}
                style={{ flex: 1, height: 52, borderRadius: 16, background: "linear-gradient(135deg, #3b82f6, #2563eb)", border: "none", color: "#fff", fontWeight: 900, fontSize: 15, cursor: applyingAI ? "wait" : "pointer" }}
              >
                {applyingAI ? "Đang áp dụng..." : "🚀 Áp dụng toàn bộ vào cấu hình"}
              </button>
              <button
                onClick={() => setSuggestionResult(null)}
                style={{ padding: "0 24px", height: 52, borderRadius: 16, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontWeight: 700, cursor: "pointer" }}
              >
                Bỏ qua
              </button>
            </div>
          </section>
        )}

        {/* ── Compatibility Result Panel ── */}
        {compatibilityResult && (
          <div style={{
            marginBottom: 32, padding: "20px 28px", borderRadius: 20,
            background: compatibilityResult.compatible ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${compatibilityResult.compatible ? "#86efac" : "#fca5a5"}`,
            display: "flex", justifyContent: "space-between", alignItems: "flex-start"
          }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: compatibilityResult.compatible ? "#15803d" : "#b91c1c", marginBottom: 8 }}>
                {compatibilityResult.compatible ? "✅ Cấu hình tương thích!" : "⚠️ Phát hiện xung đột:"}
              </div>
              {!compatibilityResult.compatible && (Array.isArray(compatibilityResult.issues) || []).map((issue, i) => (
                <div key={i} style={{ fontSize: 13, color: "#b91c1c", marginTop: 4 }}>• {issue.message || JSON.stringify(issue)}</div>
              ))}
            </div>
            <button onClick={() => setCompatibilityResult(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#94a3b8" }}>×</button>
          </div>
        )}

        {/* ── Main Grid: Components + Sidebar ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 370px", gap: 40, alignItems: "start" }}>

          {/* Component Sections */}
          <div style={{ display: "grid", gap: 28 }}>
            {COMPONENT_SECTIONS.map((section, index) => (
              <div key={section.componentType} style={{ animation: `fadeInUp 0.4s ease forwards`, animationDelay: `${index * 0.05}s`, opacity: 0 }}>
                <BuildComponentSection
                  title={section.label}
                  componentType={section.componentType}
                  products={optionsByComponent[section.componentType] || []}
                  selectedProductId={selectorState[section.componentType]?.productId || ""}
                  selectedVariantId={selectorState[section.componentType]?.variantId || ""}
                  variantOptions={selectorState[section.componentType]?.variants || []}
                  selectedItem={selectedItemsMap[section.componentType] || null}
                  loading={processingComponent === section.componentType}
                  disabled={generalLoading || applyingAI}
                  onProductChange={handleProductChange}
                  onVariantChange={handleVariantChange}
                  onApply={handleApplyComponent}
                  onRemove={handleRemoveComponent}
                />
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <aside style={{ display: "grid", gap: 24, position: "sticky", top: 32 }}>

            {/* Actions Panel */}
            <div style={{ background: "#fff", borderRadius: 28, padding: 28, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 20 }}>⚡ Công cụ</h3>
              <div style={{ display: "grid", gap: 12 }}>
                <button
                  onClick={handleCheckCompatibility}
                  disabled={generalLoading || selectedCount < 2}
                  style={{ height: 52, borderRadius: 14, background: selectedCount >= 2 ? "#f0f9ff" : "#f8fafc", border: `1px solid ${selectedCount >= 2 ? "#93c5fd" : "#e2e8f0"}`, color: selectedCount >= 2 ? "#1d4ed8" : "#94a3b8", fontWeight: 800, fontSize: 15, cursor: selectedCount >= 2 ? "pointer" : "not-allowed" }}
                >
                  🔍 Kiểm tra tương thích
                  {selectedCount < 2 && <div style={{ fontSize: 11, fontWeight: 400, color: "#94a3b8", marginTop: 2 }}>Chọn ít nhất 2 linh kiện</div>}
                </button>

                <button
                  onClick={handleSaveBuild}
                  disabled={generalLoading}
                  style={{ height: 52, borderRadius: 14, background: "linear-gradient(135deg, #3b82f6, #2563eb)", border: "none", color: "#fff", fontWeight: 900, fontSize: 15, cursor: "pointer" }}
                >
                  {generalLoading ? "Đang xử lý..." : "💾 Lưu cấu hình"}
                </button>

                <button
                  onClick={handleClearAll}
                  style={{ height: 44, borderRadius: 14, background: "none", border: "1px solid #fca5a5", color: "#ef4444", fontWeight: 700, cursor: "pointer" }}
                >
                  🗑️ Xóa toàn bộ
                </button>
              </div>

              {/* Build Summary */}
              <div style={{ marginTop: 20, padding: "16px 20px", background: "#f8fafc", borderRadius: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "#64748b" }}>Đã chọn</span>
                  <span style={{ fontWeight: 800, color: "#0f172a" }}>{selectedCount} / 7 linh kiện</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#64748b" }}>Tổng cộng</span>
                  <span style={{ fontWeight: 900, color: "#3b82f6", fontSize: 16 }}>{formatCurrency(totalPrice)}đ</span>
                </div>
                {selectedCount > 0 && (
                  <div style={{ marginTop: 12 }}>
                    {COMPONENT_SECTIONS.map(s => (
                      <div key={s.componentType} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: selectedItemsMap[s.componentType] ? "#22c55e" : "#e2e8f0", flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: selectedItemsMap[s.componentType] ? "#15803d" : "#94a3b8" }}>
                          {s.label} {selectedItemsMap[s.componentType] ? `— ${selectedItemsMap[s.componentType].product?.name?.slice(0, 22) || ""}...` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* AI Advisor Panel */}
            <div style={{ background: "linear-gradient(160deg, #1e293b, #0f172a)", borderRadius: 28, padding: 28, color: "#fff", border: "1px solid rgba(59,130,246,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🤖</div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>AI Advisor</h3>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>Gợi ý cấu hình thông minh</div>
                </div>
              </div>
              <form onSubmit={handleSuggestionSubmit} style={{ display: "grid", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 700, marginBottom: 8 }}>NGÂN SÁCH (VNĐ)</label>
                  <input
                    type="number"
                    min="1000000"
                    step="1000000"
                    value={suggestionForm.budget}
                    onChange={e => setSuggestionForm(p => ({ ...p, budget: e.target.value }))}
                    placeholder="VD: 25000000"
                    style={{ width: "100%", height: 48, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "0 16px", color: "#fff", fontSize: 15, fontWeight: 700, boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 700, marginBottom: 8 }}>NHU CẦU SỬ DỤNG</label>
                  <select
                    value={suggestionForm.purpose}
                    onChange={e => setSuggestionForm(p => ({ ...p, purpose: e.target.value }))}
                    style={{ width: "100%", height: 48, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "0 16px", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
                  >
                    {PURPOSE_OPTIONS.map(o => <option key={o.value} value={o.value} style={{ background: "#1e293b" }}>{o.label}</option>)}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={aiLoading}
                  style={{ height: 52, borderRadius: 14, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", border: "none", color: "#fff", fontWeight: 900, fontSize: 16, cursor: aiLoading ? "wait" : "pointer" }}
                >
                  {aiLoading ? "⏳ Đang tạo gợi ý..." : "✨ Lấy gợi ý AI"}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Success Toast ── */}
      {successMessage && (
        <div style={{ position: "fixed", top: 32, right: 32, zIndex: 9999, padding: "16px 24px", background: "#059669", color: "#fff", borderRadius: 16, boxShadow: "0 20px 40px rgba(0,0,0,0.2)", fontWeight: 700, animation: "slideIn 0.3s ease-out", maxWidth: 360 }}>
          {successMessage}
        </div>
      )}

      {/* ── Bottom Status Bar ── */}
      <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 48px)", maxWidth: 960, background: "rgba(15,23,42,0.95)", backdropFilter: "blur(12px)", borderRadius: 20, padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff", zIndex: 100, boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase" }}>Đã chọn</div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>{selectedCount} / 7</div>
          </div>
          <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.1)" }} />
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>TƯƠNG THÍCH</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: compatibilityResult === null ? "rgba(255,255,255,0.5)" : compatibilityResult.compatible ? "#4ade80" : "#f87171" }}>
              {compatibilityResult === null ? "Chưa kiểm tra" : compatibilityResult.compatible ? "✓ OK" : "⚠️ Có lỗi"}
            </div>
          </div>
          {applyingAI && (
            <>
              <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.1)" }} />
              <div style={{ color: "#60a5fa", fontSize: 13, fontWeight: 700 }}>🤖 Đang áp dụng AI...</div>
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>TỔNG CỘNG</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#3b82f6" }}>{formatCurrency(totalPrice)}đ</div>
          </div>
          <button
            onClick={handleSaveBuild}
            disabled={generalLoading}
            style={{ height: 44, padding: "0 24px", borderRadius: 12, background: "linear-gradient(135deg, #3b82f6, #2563eb)", border: "none", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 14 }}
          >
            💾 Lưu ngay
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
}
