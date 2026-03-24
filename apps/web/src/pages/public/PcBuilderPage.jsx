import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { BuildComponentSection } from "../../components/common/BuildComponentSection";
import { useAuth } from "../../hooks/useAuth";
import { getCategories, getProductDetail, getProducts } from "../../services/catalog.service";
import {
  addBuildItem,
  checkBuildCompatibility,
  createBuild,
  removeBuildItem,
  replaceBuildItem,
  saveBuild,
  suggestBuild
} from "../../services/pc-builder.service";

const COMPONENT_SECTIONS = [
  { componentType: "cpu", label: "CPU", categoryName: "CPU" },
  { componentType: "mainboard", label: "Mainboard", categoryName: "MAINBOARD" },
  { componentType: "ram", label: "RAM", categoryName: "RAM" },
  { componentType: "gpu", label: "GPU", categoryName: "GPU" },
  { componentType: "storage", label: "Lưu trữ", categoryName: "STORAGE" },
  { componentType: "psu", label: "Nguồn", categoryName: "PSU" },
  { componentType: "case", label: "Vỏ máy", categoryName: "CASE" }
];

const PURPOSE_OPTIONS = [
  { value: "gaming", label: "Gaming" },
  { value: "office", label: "Văn phòng" },
  { value: "programming", label: "Lập trình" },
  { value: "design", label: "Đồ họa" }
];

const QUICK_PRESETS = [
  { label: "Gaming 15 triệu", purpose: "gaming", budget: 15000000 },
  { label: "Gaming 20 triệu", purpose: "gaming", budget: 20000000 },
  { label: "Văn phòng 10 triệu", purpose: "office", budget: 10000000 },
  { label: "Lập trình 18 triệu", purpose: "programming", budget: 18000000 },
  { label: "Đồ họa 25 triệu", purpose: "design", budget: 25000000 }
];

function createInitialSelectorState() {
  return COMPONENT_SECTIONS.reduce((accumulator, section) => {
    accumulator[section.componentType] = {
      productId: "",
      variantId: "",
      variants: []
    };
    return accumulator;
  }, {});
}

function findCategoryIdByName(categories, categoryName) {
  const matched = categories.find(
    (category) => String(category.name || "").trim().toUpperCase() === String(categoryName || "").trim().toUpperCase()
  );
  return matched?.id || null;
}

function normalizeProductsResponse(response) {
  const payload = response?.data || response;
  return Array.isArray(payload?.items) ? payload.items : [];
}

function normalizeBuildResponse(response) {
  return response?.data || response;
}

function normalizeCompatibilityResponse(response) {
  return response?.data || response;
}

function normalizeSuggestionResponse(response) {
  return response?.data || response;
}

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }

  return error.message || fallbackMessage;
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

function createSuggestionFormFromPreset(preset) {
  return {
    purpose: preset.purpose,
    budget: String(preset.budget)
  };
}

export function PcBuilderPage() {
  const { isAuthenticated } = useAuth();
  const [buildName, setBuildName] = useState("Battle Station Demo");
  const [build, setBuild] = useState(null);
  const [optionsByComponent, setOptionsByComponent] = useState({});
  const [selectorState, setSelectorState] = useState(createInitialSelectorState());
  const [compatibilityResult, setCompatibilityResult] = useState(null);
  const [suggestionForm, setSuggestionForm] = useState({ purpose: "gaming", budget: "20000000" });
  const [suggestionResult, setSuggestionResult] = useState(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [processingComponent, setProcessingComponent] = useState("");
  const [generalLoading, setGeneralLoading] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const totalPrice = useMemo(() => Number(build?.totalPrice || 0), [build]);
  const selectedItemsMap = useMemo(() => build?.components || {}, [build]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    async function loadComponentOptions() {
      try {
        setLoadingOptions(true);
        setErrorMessage("");

        const categoriesResponse = await getCategories();
        const categoryList = Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : [];

        const results = await Promise.all(
          COMPONENT_SECTIONS.map(async (section) => {
            const categoryId = findCategoryIdByName(categoryList, section.categoryName);

            if (!categoryId) {
              return [section.componentType, []];
            }

            const productsResponse = await getProducts({ category_id: categoryId, page: 1, limit: 50 });
            return [section.componentType, normalizeProductsResponse(productsResponse)];
          })
        );

        setOptionsByComponent(Object.fromEntries(results));
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Không thể tải danh sách linh kiện."));
      } finally {
        setLoadingOptions(false);
      }
    }

    loadComponentOptions();
  }, [isAuthenticated]);

  async function ensureBuildExists() {
    if (build?.id) {
      return build;
    }

    const response = await createBuild({ name: buildName.trim() || "Battle Station Demo" });
    const nextBuild = normalizeBuildResponse(response);
    setBuild(nextBuild);
    return nextBuild;
  }

  async function handleProductChange(componentType, productId) {
    setSelectorState((prevState) => ({
      ...prevState,
      [componentType]: {
        productId,
        variantId: "",
        variants: []
      }
    }));

    if (!productId) {
      return;
    }

    try {
      setProcessingComponent(componentType);
      const detailResponse = await getProductDetail(productId);
      const detail = detailResponse?.data || detailResponse;
      const variants = Array.isArray(detail?.variants) ? detail.variants : [];

      setSelectorState((prevState) => ({
        ...prevState,
        [componentType]: {
          productId,
          variantId: variants[0]?.variant_id ? String(variants[0].variant_id) : "",
          variants
        }
      }));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể tải chi tiết sản phẩm."));
    } finally {
      setProcessingComponent("");
    }
  }

  function handleVariantChange(componentType, variantId) {
    setSelectorState((prevState) => ({
      ...prevState,
      [componentType]: {
        ...prevState[componentType],
        variantId
      }
    }));
  }

  async function handleApplyComponent(componentType) {
    const currentSelection = selectorState[componentType];

    if (!currentSelection?.variantId) {
      return;
    }

    try {
      setProcessingComponent(componentType);
      setErrorMessage("");
      setSuccessMessage("");
      setCompatibilityResult(null);

      const currentBuild = await ensureBuildExists();
      const selectedItem = selectedItemsMap[componentType];
      const payload = {
        componentType,
        productVariantId: Number(currentSelection.variantId),
        quantity: 1
      };

      const response = selectedItem
        ? await replaceBuildItem(currentBuild.id, componentType, payload)
        : await addBuildItem(currentBuild.id, payload);

      setBuild(normalizeBuildResponse(response));
      setSuccessMessage(selectedItem ? "Đã thay linh kiện trong cấu hình." : "Đã thêm linh kiện vào cấu hình.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể cập nhật cấu hình."));
    } finally {
      setProcessingComponent("");
    }
  }

  async function handleRemoveComponent(componentType) {
    if (!build?.id || !selectedItemsMap[componentType]) {
      return;
    }

    try {
      setProcessingComponent(componentType);
      setErrorMessage("");
      setSuccessMessage("");
      setCompatibilityResult(null);

      const response = await removeBuildItem(build.id, componentType);
      setBuild(normalizeBuildResponse(response));
      setSuccessMessage("Đã xóa linh kiện khỏi cấu hình.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể xóa linh kiện."));
    } finally {
      setProcessingComponent("");
    }
  }

  async function handleCheckCompatibility() {
    if (!build?.id) {
      setErrorMessage("Bạn chưa có cấu hình để kiểm tra tương thích.");
      return;
    }

    try {
      setGeneralLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      const response = await checkBuildCompatibility(build.id);
      const result = normalizeCompatibilityResponse(response);
      setCompatibilityResult(result);
      setSuccessMessage(result.compatible ? "Cấu hình hiện tại tương thích." : "Cấu hình hiện tại có xung đột linh kiện.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể kiểm tra tương thích."));
    } finally {
      setGeneralLoading(false);
    }
  }

  async function handleSaveBuild() {
    try {
      setGeneralLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const currentBuild = await ensureBuildExists();
      const response = await saveBuild(currentBuild.id, { name: buildName.trim() || "Battle Station Demo" });

      setBuild(normalizeBuildResponse(response));
      setSuccessMessage("Đã lưu cấu hình thành công.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể lưu cấu hình."));
    } finally {
      setGeneralLoading(false);
    }
  }

  async function loadSuggestion(nextForm = suggestionForm) {
    try {
      setSuggestionLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await suggestBuild({
        purpose: nextForm.purpose,
        budget: Number(nextForm.budget)
      });

      const result = normalizeSuggestionResponse(response);
      setSuggestionResult(result);
      setSuccessMessage("Đã tạo cấu hình gợi ý theo ngân sách.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể tạo cấu hình gợi ý."));
    } finally {
      setSuggestionLoading(false);
    }
  }

  async function handleSuggestionSubmit(event) {
    event.preventDefault();
    if (!Number(suggestionForm.budget)) {
      setErrorMessage("Ngân sách phải lớn hơn 0.");
      return;
    }
    await loadSuggestion(suggestionForm);
  }

  async function handleQuickPreset(preset) {
    const nextForm = createSuggestionFormFromPreset(preset);
    setSuggestionForm(nextForm);
    await loadSuggestion(nextForm);
  }

  async function handleApplySuggestion() {
    if (!suggestionResult?.items?.length) {
      return;
    }

    try {
      setGeneralLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      setCompatibilityResult(null);

      let currentBuild = await ensureBuildExists();

      for (const item of suggestionResult.items) {
        const payload = {
          componentType: item.componentType,
          productVariantId: Number(item.variant?.id),
          quantity: 1
        };

        const existingItem = currentBuild?.components?.[item.componentType];
        const response = existingItem
          ? await replaceBuildItem(currentBuild.id, item.componentType, payload)
          : await addBuildItem(currentBuild.id, payload);

        currentBuild = normalizeBuildResponse(response);
      }

      setBuild(currentBuild);
      setBuildName(`${suggestionResult.purpose || "Suggested"} setup`);
      setSuccessMessage("Đã áp dụng cấu hình gợi ý vào build hiện tại.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể áp dụng cấu hình gợi ý."));
    } finally {
      setGeneralLoading(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="market-panel">
        <div className="market-empty" style={{ display: "grid", gap: 12, justifyItems: "start" }}>
          <strong style={{ fontSize: 28, color: "var(--market-text)" }}>Bạn cần đăng nhập để sử dụng PC Builder</strong>
          <span style={{ maxWidth: 680 }}>
            Đăng nhập để tạo cấu hình, lưu build, kiểm tra tương thích và nhận gợi ý theo ngân sách.
          </span>
          <Link className="market-btn market-btn--primary" to="/login">
            Đi đến trang đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="market-builder">
      <section className="market-builder__hero">
        <div className="market-builder__hero-top">
          <div>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--market-primary-dark)" }}>
              PC Builder chuyên nghiệp
            </div>
            <h1 style={{ margin: "8px 0 10px", fontSize: "clamp(34px, 4vw, 54px)", lineHeight: 0.95 }}>
              Tự lắp cấu hình PC với bố cục như bàn build linh kiện thật.
            </h1>
            <p style={{ margin: 0, maxWidth: 760, color: "var(--market-muted)", lineHeight: 1.8, fontSize: 17 }}>
              Chọn từng nhóm linh kiện, theo dõi tổng giá theo thời gian thực, nhận cấu hình gợi ý từ hệ thống và kiểm
              tra tương thích ngay trước khi đặt hàng.
            </p>
          </div>
          <div className="market-builder__summary">
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--market-primary-dark)" }}>
              Tổng tạm tính
            </div>
            <strong>{formatCurrency(totalPrice)}đ</strong>
            <span>{Object.keys(selectedItemsMap).length || 0} nhóm linh kiện đã chọn</span>
          </div>
        </div>
      </section>

      <section className="market-builder__board">
        <aside className="market-builder__sidebar">
          <div className="market-panel" style={{ padding: 20 }}>
            <div className="market-section-title" style={{ marginBottom: 8 }}>Tên cấu hình</div>
            <input className="market-field" value={buildName} onChange={(event) => setBuildName(event.target.value)} placeholder="Ví dụ: Gaming 20 triệu" />
          </div>

          <div className="market-panel" style={{ padding: 20 }}>
            <div className="market-panel__title">Gợi ý theo ngân sách</div>
            <div className="market-panel__subtitle">Chọn preset nhanh hoặc nhập ngân sách và mục đích sử dụng.</div>
            <div className="market-builder__preset-grid" style={{ marginTop: 16 }}>
              {QUICK_PRESETS.map((preset) => (
                <button key={`${preset.purpose}-${preset.budget}`} className="market-builder__preset" type="button" onClick={() => handleQuickPreset(preset)} disabled={suggestionLoading || generalLoading}>
                  {preset.label}
                </button>
              ))}
            </div>
            <form onSubmit={handleSuggestionSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
              <input
                className="market-field"
                value={suggestionForm.budget}
                onChange={(event) => setSuggestionForm((prevState) => ({ ...prevState, budget: event.target.value }))}
                placeholder="Nhập ngân sách, ví dụ 20000000"
              />
              <select
                className="market-select"
                value={suggestionForm.purpose}
                onChange={(event) => setSuggestionForm((prevState) => ({ ...prevState, purpose: event.target.value }))}
              >
                {PURPOSE_OPTIONS.map((purpose) => (
                  <option key={purpose.value} value={purpose.value}>{purpose.label}</option>
                ))}
              </select>
              <button className="market-btn market-btn--primary" type="submit" disabled={suggestionLoading || generalLoading}>
                {suggestionLoading ? "Đang gợi ý..." : "Lấy cấu hình gợi ý"}
              </button>
            </form>
          </div>

          <div className="market-panel" style={{ padding: 20 }}>
            <div className="market-panel__title">Trạng thái cấu hình</div>
            <div className="market-panel__subtitle">Kiểm tra tương thích trước khi lưu để tránh xung đột giữa CPU, mainboard, RAM và nguồn.</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
              <button className="market-btn market-btn--ghost" type="button" onClick={handleCheckCompatibility} disabled={generalLoading || suggestionLoading || !build?.id}>
                {generalLoading ? "Đang xử lý..." : "Kiểm tra tương thích"}
              </button>
              <button className="market-btn market-btn--primary" type="button" onClick={handleSaveBuild} disabled={generalLoading || suggestionLoading}>
                Lưu cấu hình
              </button>
            </div>
          </div>
        </aside>

        <div className="market-builder__content">
          {errorMessage ? <div className="market-empty" style={{ color: "#b91c1c" }}>{errorMessage}</div> : null}
          {successMessage ? <div className="market-empty" style={{ color: "#166534" }}>{successMessage}</div> : null}

          {suggestionResult ? (
            <section className="market-panel">
              <div className="market-panel__head">
                <div>
                  <div className="market-panel__title">Cấu hình gợi ý</div>
                  <div className="market-panel__subtitle">{suggestionResult.explanation}</div>
                </div>
                <button className="market-btn market-btn--primary" type="button" onClick={handleApplySuggestion} disabled={generalLoading || suggestionLoading}>
                  Đưa vào cấu hình hiện tại
                </button>
              </div>
              <div className="market-grid-two" style={{ marginBottom: 16 }}>
                <div className="market-empty" style={{ textAlign: "left" }}>
                  <strong>Ngân sách:</strong> {formatCurrency(suggestionResult.budget)}đ
                </div>
                <div className="market-empty" style={{ textAlign: "left" }}>
                  <strong>Tổng đề xuất:</strong> {formatCurrency(suggestionResult.totalPrice)}đ
                </div>
              </div>
              <div className="market-product-grid">
                {suggestionResult.items?.map((item) => (
                  <div key={`${item.componentType}-${item.variant?.id}`} className="market-build-card">
                    <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--market-muted)" }}>
                      {item.componentType}
                    </div>
                    <strong>{item.product?.name}</strong>
                    <span style={{ color: "var(--market-muted)" }}>SKU: {item.variant?.sku || "-"}</span>
                    <span style={{ fontWeight: 700 }}>{formatCurrency(item.variant?.price)}đ</span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {compatibilityResult ? (
            <section className="market-panel">
              <div className="market-panel__title">Kết quả tương thích</div>
              <div className="market-panel__subtitle">
                {compatibilityResult.compatible ? "Cấu hình hiện tại đang tương thích." : "Phát hiện xung đột cần xử lý trước khi đặt hàng."}
              </div>
              {!compatibilityResult.compatible && Array.isArray(compatibilityResult.issues) ? (
                <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
                  {compatibilityResult.issues.map((issue, index) => (
                    <div key={`${issue.ruleId || index}-${index}`} className="market-empty" style={{ color: "#b91c1c", textAlign: "left" }}>
                      {issue.message}
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}

          {loadingOptions ? (
            <div className="market-panel">
              <div className="market-empty">Đang tải danh sách linh kiện...</div>
            </div>
          ) : (
            COMPONENT_SECTIONS.map((section) => (
              <BuildComponentSection
                key={section.componentType}
                title={section.label}
                componentType={section.componentType}
                products={optionsByComponent[section.componentType] || []}
                selectedProductId={selectorState[section.componentType]?.productId || ""}
                selectedVariantId={selectorState[section.componentType]?.variantId || ""}
                variantOptions={selectorState[section.componentType]?.variants || []}
                selectedItem={selectedItemsMap[section.componentType] || null}
                loading={processingComponent === section.componentType}
                disabled={generalLoading || suggestionLoading}
                onProductChange={handleProductChange}
                onVariantChange={handleVariantChange}
                onApply={handleApplyComponent}
                onRemove={handleRemoveComponent}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
