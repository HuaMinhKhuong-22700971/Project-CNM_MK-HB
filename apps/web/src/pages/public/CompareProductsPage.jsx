import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";

import { getCategories, getCompareProducts, getProductDetail, getProducts } from "../../services/catalog.service";
import { getStoredCompareIds, MAX_COMPARE_ITEMS, normalizeCompareIds, storeCompareIds } from "../../utils/compare";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

function getErrorMessage(error, fallback) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }
  return error?.message || fallback;
}

const MAX_COMPARE = MAX_COMPARE_ITEMS;

const SLOT_COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981"];

function getProductId(product) {
  return String(product?.product_id || product?.id || "");
}

function getProductName(product, fallback = "Sản phẩm đang cập nhật") {
  return product?.product_name || product?.name || fallback;
}

function getProductImage(product) {
  return (
    product?.image_url ||
    product?.defaultVariant?.imageUrl ||
    product?.primaryVariant?.image_url ||
    product?.variants?.[0]?.image_url ||
    product?.skus?.[0]?.image_url ||
    ""
  );
}

function getPrimaryVariant(product) {
  return product?.primaryVariant || product?.variants?.[0] || product?.skus?.[0] || product?.defaultVariant || null;
}

function getProductPrice(product) {
  const variant = getPrimaryVariant(product);
  return Number(variant?.price ?? product?.price ?? product?.pricing?.minPrice ?? 0);
}

function getProductStock(product) {
  const variant = getPrimaryVariant(product);
  return Number(variant?.stock_quantity ?? variant?.stock ?? product?.stock_quantity ?? product?.stock ?? 0);
}

function getCategoryName(product) {
  return product?.category?.name || product?.category_name || "—";
}

export function CompareProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Selected products to compare (array of IDs)
  const [selectedIds, setSelectedIds] = useState(() => {
    const ids = searchParams.get("ids");
    if (ids) return normalizeCompareIds(ids);
    return getStoredCompareIds();
  });

  const [selectedProductMap, setSelectedProductMap] = useState({});

  // Compare result from API
  const [compareResult, setCompareResult] = useState(null);
  const [loadingCompare, setLoadingCompare] = useState(false);
  const [compareError, setCompareError] = useState("");

  // Search panel
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);
  const searchTimerRef = useRef(null);

  // Load categories
  useEffect(() => {
    getCategories().then(res => {
      const list = res?.data || res || [];
      setCategories(Array.isArray(list) ? list : []);
    }).catch(() => {});
  }, []);

  // Auto-compare when selectedIds change
  useEffect(() => {
    storeCompareIds(selectedIds);
    if (selectedIds.length > 0) {
      setSearchParams({ ids: selectedIds.join(",") }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }

    if (selectedIds.length >= 2) {
      runCompare(selectedIds);
    } else {
      setCompareResult(null);
    }
  }, [selectedIds]);

  useEffect(() => {
    if (selectedIds.length === 0) {
      setSelectedProductMap({});
      return;
    }

    let cancelled = false;
    const missingIds = selectedIds.filter((id) => !selectedProductMap[id]);
    if (missingIds.length === 0) return;

    Promise.all(
      missingIds.map(async (id) => {
        try {
          const response = await getProductDetail(id);
          return [id, response?.data || response];
        } catch (_error) {
          return [id, null];
        }
      })
    ).then((entries) => {
      if (cancelled) return;
      setSelectedProductMap((prev) => {
        const next = { ...prev };
        entries.forEach(([id, product]) => {
          if (product) next[id] = product;
        });
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [selectedIds, selectedProductMap]);

  // Search products (debounced)
  useEffect(() => {
    if (!showSearch) return;
    clearTimeout(searchTimerRef.current);
    if (!searchQuery && !selectedCategory) {
      setSearchResults([]);
      return;
    }
    searchTimerRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const params = { limit: 20 };
        if (searchQuery) params.search = searchQuery;
        if (selectedCategory) params.category_id = selectedCategory;
        const res = await getProducts(params);
        const payload = res?.data || res;
        const items = Array.isArray(payload) ? payload : (Array.isArray(payload?.items) ? payload.items : []);
        setSearchResults(items);
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 350);
  }, [searchQuery, selectedCategory, showSearch]);

  // Close search panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function runCompare(ids) {
    setLoadingCompare(true);
    setCompareError("");
    setCompareResult(null);
    try {
      const res = await getCompareProducts(ids.join(","));
      const data = res?.data || res;
      setCompareResult(data);
      if (Array.isArray(data?.items)) {
        setSelectedProductMap((prev) => {
          const next = { ...prev };
          data.items.forEach((item) => {
            const id = getProductId(item);
            if (id) next[id] = item;
          });
          return next;
        });
      }
    } catch (err) {
      setCompareError(getErrorMessage(err, "Không thể so sánh sản phẩm. Vui lòng thử lại."));
    } finally {
      setLoadingCompare(false);
    }
  }

  function addProduct(product) {
    const id = getProductId(product);
    if (!id) return;
    if (selectedIds.includes(id)) return;
    if (selectedIds.length >= MAX_COMPARE) return;
    setSelectedProductMap(prev => ({ ...prev, [id]: product }));
    setSelectedIds(prev => normalizeCompareIds([...prev, id]));
    setShowSearch(false);
    setSearchQuery("");
  }

  function removeProduct(id) {
    setSelectedIds(prev => prev.filter(p => p !== String(id)));
  }

  function clearAll() {
    setSelectedIds([]);
    setSelectedProductMap({});
    setCompareResult(null);
    setSearchParams({});
  }

  const comparedItems = useMemo(() => (
    Array.isArray(compareResult?.items) ? compareResult.items : []
  ), [compareResult]);

  const attributeNames = useMemo(() => (
    Array.isArray(compareResult?.attributes) ? compareResult.attributes : []
  ), [compareResult]);

  // Merge all specs rows
  const allSpecKeys = useMemo(() => {
    const keys = new Set();
    comparedItems.forEach(item => {
      const specs = item.compareSpecs || item.attributes || {};
      Object.keys(specs).forEach(k => keys.add(k));
    });
    return Array.from(keys);
  }, [comparedItems]);

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", paddingBottom: 80 }}>

      {/* ── Header ── */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", padding: "56px 20px 80px", color: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
            <div>
              <h1 style={{ fontSize: 40, fontWeight: 900, margin: "0 0 10px" }}>⚖️ So sánh sản phẩm</h1>
              <p style={{ fontSize: 16, color: "#94a3b8", margin: 0 }}>
                Đặt tối đa 4 sản phẩm lên cùng một bảng để so sánh chi tiết thông số, giá và tồn kho.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {selectedIds.length > 0 && (
                <button
                  onClick={clearAll}
                  style={{ padding: "10px 20px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}
                >
                  🗑️ Xóa tất cả
                </button>
              )}
              {selectedIds.length >= 2 && (
                <button
                  onClick={() => runCompare(selectedIds)}
                  style={{ padding: "10px 24px", background: "linear-gradient(135deg, #3b82f6, #2563eb)", border: "none", borderRadius: 12, color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 800 }}
                >
                  🔄 So sánh lại
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "-36px auto 0", padding: "0 20px", position: "relative", zIndex: 10 }}>

        {/* ── Product Slot Picker ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
          {Array.from({ length: MAX_COMPARE }).map((_, slotIndex) => {
            const id = selectedIds[slotIndex];
            const item = comparedItems.find(p => getProductId(p) === String(id)) || selectedProductMap[id];
            const color = SLOT_COLORS[slotIndex];

            if (id && !loadingCompare) {
              const imageUrl = getProductImage(item);
              const price = getProductPrice(item);
              const stock = getProductStock(item);
              return (
                <div key={slotIndex} style={{ background: "#fff", borderRadius: 24, border: `2px solid ${color}`, overflow: "hidden", boxShadow: `0 8px 24px ${color}22`, position: "relative" }}>
                  <div style={{ background: color, height: 4 }} />
                  <button
                    onClick={() => removeProduct(id)}
                    title="Xóa khỏi so sánh"
                    style={{ position: "absolute", top: 12, right: 12, width: 28, height: 28, borderRadius: "50%", background: "#fee2e2", border: "none", color: "#ef4444", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}
                  >
                    ×
                  </button>
                  <div style={{ padding: "20px 20px 16px" }}>
                    {/* Product image or placeholder */}
                    <div style={{ height: 120, borderRadius: 16, background: imageUrl ? `center/contain no-repeat url(${imageUrl})` : `linear-gradient(135deg, ${color}22, ${color}11)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 12 }}>
                      {!imageUrl && "📦"}
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600, marginBottom: 4 }}>{getCategoryName(item)}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", lineHeight: 1.35, marginBottom: 8 }}>
                      {getProductName(item, `Sản phẩm #${id}`)}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, color }}>
                      {price > 0 ? `${formatCurrency(price)}đ` : "—"}
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                      Tồn kho: {stock || "—"}
                    </div>
                  </div>
                </div>
              );
            }

            // Empty slot
            return (
              <div key={slotIndex} style={{ background: "#fff", borderRadius: 24, border: "2px dashed #e2e8f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 220, cursor: "pointer", transition: "border-color 0.2s", position: "relative" }}
                onClick={() => setShowSearch(true)}
                onMouseEnter={e => e.currentTarget.style.borderColor = color}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
              >
                <div style={{ width: 52, height: 52, borderRadius: 16, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 12 }}>+</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#64748b" }}>Thêm sản phẩm</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Slot {slotIndex + 1}</div>
              </div>
            );
          })}
        </div>

        {/* ── Search Panel ── */}
        <div ref={searchRef} style={{ marginBottom: 32, position: "relative" }}>
          {/* Search trigger input */}
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <div style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 18 }}>🔍</div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
                onFocus={() => setShowSearch(true)}
                placeholder="Tìm sản phẩm để so sánh... (VD: Intel i5, RTX 4070)"
                style={{ width: "100%", height: 52, borderRadius: 16, border: "1px solid #e2e8f0", background: "#fff", paddingLeft: 50, paddingRight: 16, fontSize: 15, boxSizing: "border-box", boxShadow: showSearch ? "0 0 0 3px #3b82f620" : "0 2px 8px rgba(0,0,0,0.04)", outline: "none", transition: "box-shadow 0.2s" }}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={e => { setSelectedCategory(e.target.value); setShowSearch(true); }}
              style={{ height: 52, padding: "0 16px", borderRadius: 16, border: "1px solid #e2e8f0", background: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", minWidth: 160 }}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Search results dropdown */}
          {showSearch && (searchQuery || selectedCategory) && (
            <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, background: "#fff", borderRadius: 20, border: "1px solid #e2e8f0", boxShadow: "0 20px 40px rgba(0,0,0,0.12)", zIndex: 100, maxHeight: 400, overflowY: "auto" }}>
              {searchLoading ? (
                <div style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>🔄 Đang tìm kiếm...</div>
              ) : searchResults.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>Không tìm thấy sản phẩm nào.</div>
              ) : (
                searchResults.map(product => {
                  const id = getProductId(product);
                  const isSelected = selectedIds.includes(id);
                  const isFull = selectedIds.length >= MAX_COMPARE;
                  const imageUrl = getProductImage(product);
                  return (
                    <div
                      key={id}
                      onClick={() => !isSelected && !isFull && addProduct(product)}
                      style={{
                        display: "flex", alignItems: "center", gap: 16, padding: "14px 20px",
                        cursor: isSelected || isFull ? "default" : "pointer",
                        opacity: isFull && !isSelected ? 0.4 : 1,
                        borderBottom: "1px solid #f1f5f9",
                        transition: "background 0.15s",
                        background: isSelected ? "#f0f9ff" : "#fff"
                      }}
                      onMouseEnter={e => { if (!isSelected && !isFull) e.currentTarget.style.background = "#f8fafc"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = isSelected ? "#f0f9ff" : "#fff"; }}
                    >
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: imageUrl ? `center/contain no-repeat url(${imageUrl})` : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>
                        {!imageUrl && "📦"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {getProductName(product)}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                          {getCategoryName(product)} · ID: {id}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 800, padding: "4px 12px", borderRadius: 8, background: isSelected ? "#dbeafe" : "#f1f5f9", color: isSelected ? "#1d4ed8" : "#64748b", flexShrink: 0 }}>
                        {isSelected ? "✓ Đã thêm" : isFull ? "Đầy" : "+ Thêm"}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* ── Status Messages ── */}
        {selectedIds.length === 1 && (
          <div style={{ padding: "16px 24px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 16, marginBottom: 24, color: "#92400e", fontWeight: 600, fontSize: 14 }}>
            💡 Thêm ít nhất 1 sản phẩm nữa để bắt đầu so sánh.
          </div>
        )}

        {compareError && (
          <div style={{ padding: "16px 24px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 16, marginBottom: 24, color: "#b91c1c", fontWeight: 600, fontSize: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>🛑 {compareError}</span>
            <button onClick={() => setCompareError("")} style={{ background: "none", border: "none", color: "#b91c1c", fontSize: 20, cursor: "pointer" }}>×</button>
          </div>
        )}

        {loadingCompare && (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
            <div style={{ width: 48, height: 48, border: "4px solid #e2e8f0", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
            So sánh đang được thực hiện...
          </div>
        )}

        {/* ── Comparison Table ── */}
        {!loadingCompare && comparedItems.length >= 2 && (
          <div style={{ background: "#fff", borderRadius: 28, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: `220px repeat(${comparedItems.length}, 1fr)`, borderBottom: "2px solid #f1f5f9" }}>
              <div style={{ padding: "20px 24px", background: "#f8fafc", fontWeight: 800, fontSize: 14, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Tiêu chí so sánh
              </div>
              {comparedItems.map((item, i) => {
                const color = SLOT_COLORS[i] || "#3b82f6";
                const price = getProductPrice(item);
                const itemId = getProductId(item);
                return (
                  <div key={itemId} style={{ padding: "20px 20px", borderLeft: `3px solid ${color}`, background: `${color}08` }}>
                    <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 4 }}>{getCategoryName(item)}</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#0f172a", lineHeight: 1.3, marginBottom: 8 }}>{getProductName(item)}</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color }}>{price > 0 ? `${formatCurrency(price)}đ` : "—"}</div>
                    <Link
                      to={`/products/${item.slug || itemId}`}
                      style={{ display: "inline-block", marginTop: 8, fontSize: 12, color, textDecoration: "none", fontWeight: 700 }}
                    >
                      Xem chi tiết →
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Fixed rows: Price, Stock */}
            {[
              {
                label: "💰 Giá bán",
                render: (item) => {
                  const price = getProductPrice(item);
                  return <span style={{ fontWeight: 800, color: "#0f172a" }}>{price > 0 ? `${formatCurrency(price)}đ` : "—"}</span>;
                }
              },
              {
                label: "📦 Tồn kho",
                render: (item) => {
                  const qty = getProductStock(item);
                  return <span style={{ fontWeight: 700, color: qty > 0 ? "#15803d" : "#ef4444" }}>{qty > 0 ? `${qty} sản phẩm` : "Hết hàng"}</span>;
                }
              },
              {
                label: "🏷 Thương hiệu",
                render: (item) => item.brand?.name || "—"
              },
              {
                label: "📂 Danh mục",
                render: (item) => getCategoryName(item)
              }
            ].map((row, ri) => (
              <div key={ri} style={{ display: "grid", gridTemplateColumns: `220px repeat(${comparedItems.length}, 1fr)`, borderBottom: "1px solid #f1f5f9", background: ri % 2 === 0 ? "#fff" : "#fafbff" }}>
                <div style={{ padding: "16px 24px", fontWeight: 700, fontSize: 14, color: "#374151", background: "#f8fafc", borderRight: "1px solid #f1f5f9" }}>{row.label}</div>
                {comparedItems.map((item, ci) => (
                  <div key={getProductId(item)} style={{ padding: "16px 20px", fontSize: 14, borderLeft: ci > 0 ? "1px solid #f1f5f9" : "none" }}>
                    {row.render(item)}
                  </div>
                ))}
              </div>
            ))}

            {/* Dynamic spec rows */}
            {(attributeNames.length > 0 ? attributeNames : allSpecKeys).length > 0 && (
              <>
                <div style={{ padding: "14px 24px", background: "#f8fafc", borderTop: "2px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
                  <div style={{ fontWeight: 900, fontSize: 14, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>⚙️ Thông số kỹ thuật</div>
                </div>
                {(attributeNames.length > 0 ? attributeNames : allSpecKeys).map((key, ki) => {
                  // Find best value for highlighting
                  const values = comparedItems.map(item => {
                    const specs = item.compareSpecs || item.attributes || {};
                    return specs[key] || "—";
                  });
                  return (
                    <div key={ki} style={{ display: "grid", gridTemplateColumns: `220px repeat(${comparedItems.length}, 1fr)`, borderBottom: "1px solid #f1f5f9", background: ki % 2 === 0 ? "#fff" : "#fafbff" }}>
                      <div style={{ padding: "14px 24px", fontWeight: 600, fontSize: 13, color: "#64748b", background: "#f8fafc", borderRight: "1px solid #f1f5f9", textTransform: "capitalize" }}>
                        {String(key).replace(/_/g, " ")}
                      </div>
                      {comparedItems.map((item, ci) => {
                        const specs = item.compareSpecs || item.attributes || {};
                        const val = specs[key] || "—";
                        const isMissing = val === "—";
                        return (
                          <div key={getProductId(item)} style={{ padding: "14px 20px", fontSize: 13, borderLeft: ci > 0 ? "1px solid #f1f5f9" : "none", color: isMissing ? "#cbd5e1" : "#0f172a", fontWeight: isMissing ? 400 : 600 }}>
                            {val}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </>
            )}

            {/* Add to cart row */}
            <div style={{ display: "grid", gridTemplateColumns: `220px repeat(${comparedItems.length}, 1fr)`, background: "#f8fafc", borderTop: "2px solid #e2e8f0" }}>
              <div style={{ padding: "20px 24px", fontWeight: 700, fontSize: 13, color: "#64748b" }}>Thao tác</div>
              {comparedItems.map((item, ci) => {
                const color = SLOT_COLORS[ci] || "#3b82f6";
                const itemId = getProductId(item);
                return (
                  <div key={itemId} style={{ padding: "20px 20px", borderLeft: ci > 0 ? "1px solid #e2e8f0" : "none", display: "flex", flexDirection: "column", gap: 8 }}>
                    <Link
                      to={`/products/${item.slug || itemId}`}
                      style={{ display: "block", textAlign: "center", padding: "10px 16px", background: `linear-gradient(135deg, ${color}, ${color}cc)`, color: "#fff", borderRadius: 12, fontWeight: 800, fontSize: 13, textDecoration: "none" }}
                    >
                      🛒 Xem & Mua
                    </Link>
                    <button
                      onClick={() => removeProduct(itemId)}
                      style={{ padding: "8px 16px", background: "none", border: "1px solid #e2e8f0", borderRadius: 12, color: "#94a3b8", fontSize: 13, cursor: "pointer", fontWeight: 600 }}
                    >
                      Xóa khỏi SS
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {selectedIds.length === 0 && !loadingCompare && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>⚖️</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#374151", marginBottom: 12 }}>Chưa có sản phẩm nào</h2>
            <p style={{ fontSize: 16, maxWidth: 400, margin: "0 auto 24px" }}>
              Dùng ô tìm kiếm phía trên hoặc vào trang sản phẩm và nhấn nút "So sánh" để thêm vào đây.
            </p>
            <Link to="/products" style={{ display: "inline-block", padding: "12px 28px", background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", borderRadius: 14, fontWeight: 800, textDecoration: "none", fontSize: 15 }}>
              Duyệt sản phẩm →
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        select option { background: #fff; color: #0f172a; }
      `}</style>
    </div>
  );
}
