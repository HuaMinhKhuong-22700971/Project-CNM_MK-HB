import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

import { ProductCard } from "../../components/common/ProductCard";
import { getProductFilterOptions, getProducts } from "../../services/catalog.service";

const inputStyle = {
  padding: "14px 16px",
  borderRadius: 16,
  border: "1px solid rgba(122, 92, 48, 0.18)",
  outline: "none",
  width: "100%",
  background: "rgba(255,255,255,0.88)",
  color: "var(--text)",
  font: "inherit"
};

function normalizeProductResponse(data) {
  const payload = data?.data || data;

  if (Array.isArray(payload)) {
    return {
      items: payload,
      pagination: {
        page: 1,
        limit: payload.length,
        totalItems: payload.length,
        totalPages: 1
      }
    };
  }

  return {
    items: Array.isArray(payload?.items) ? payload.items : [],
    pagination: payload?.pagination || {
      page: 1,
      limit: 12,
      totalItems: 0,
      totalPages: 0
    }
  };
}

function normalizeFilterOptions(data) {
  const payload = data?.data || data || {};
  return {
    categories: Array.isArray(payload.categories) ? payload.categories : [],
    brands: Array.isArray(payload.brands) ? payload.brands : [],
    attributes: Array.isArray(payload.attributes) ? payload.attributes : []
  };
}

function parseAttributeIdsFromUrl(searchParams) {
  const raw = searchParams.get("attribute_value_ids") || "";
  return raw
    .split(",")
    .map((item) => Number(String(item).trim()))
    .filter((id) => Number.isInteger(id) && id > 0);
}

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialCategoryId = searchParams.get("category_id") || "";
  const initialBrandId = searchParams.get("brand_id") || "";
  const initialSort = searchParams.get("sort") || "newest";

  const [filters, setFilters] = useState({
    search: initialSearch,
    category_id: initialCategoryId,
    brand_id: initialBrandId,
    min_price: searchParams.get("min_price") || "",
    max_price: searchParams.get("max_price") || "",
    attribute_value_ids: parseAttributeIdsFromUrl(searchParams),
    sort: initialSort,
    page: Number(searchParams.get("page") || 1),
    limit: 12
  });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, totalItems: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const hasProducts = products.length > 0;

  const queryParams = useMemo(() => ({
    search: filters.search || undefined,
    category_id: filters.category_id || undefined,
    brand_id: filters.brand_id || undefined,
    min_price: filters.min_price || undefined,
    max_price: filters.max_price || undefined,
    attribute_value_ids: filters.attribute_value_ids.length > 0 ? filters.attribute_value_ids.join(",") : undefined,
    sort: filters.sort !== "newest" ? filters.sort : undefined,
    page: filters.page,
    limit: filters.limit
  }), [filters]);

  function syncFiltersToUrl(nextFilters) {
    const params = new URLSearchParams();
    if (nextFilters.search) params.set("search", nextFilters.search);
    if (nextFilters.category_id) params.set("category_id", nextFilters.category_id);
    if (nextFilters.brand_id) params.set("brand_id", nextFilters.brand_id);
    if (nextFilters.min_price) params.set("min_price", nextFilters.min_price);
    if (nextFilters.max_price) params.set("max_price", nextFilters.max_price);
    if (nextFilters.attribute_value_ids?.length) {
      params.set("attribute_value_ids", nextFilters.attribute_value_ids.join(","));
    }
    if (nextFilters.sort && nextFilters.sort !== "newest") params.set("sort", nextFilters.sort);
    if (nextFilters.page > 1) params.set("page", String(nextFilters.page));
    setSearchParams(params);
  }

  useEffect(() => {
    async function loadFilterData() {
      try {
        const response = await getProductFilterOptions();
        const normalized = normalizeFilterOptions(response);
        setCategories(normalized.categories);
        setBrands(normalized.brands);
        setAttributes(normalized.attributes);
      } catch (_error) {
        setCategories([]);
        setBrands([]);
        setAttributes([]);
      }
    }

    loadFilterData();
  }, []);

  // Sync state with URL searchParams changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: searchParams.get("search") || "",
      category_id: searchParams.get("category_id") || "",
      brand_id: searchParams.get("brand_id") || "",
      min_price: searchParams.get("min_price") || "",
      max_price: searchParams.get("max_price") || "",
      attribute_value_ids: parseAttributeIdsFromUrl(searchParams),
      sort: searchParams.get("sort") || "newest",
      page: Number(searchParams.get("page") || 1)
    }));
  }, [searchParams]);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await getProducts(queryParams);
        const normalized = normalizeProductResponse(response);
        setProducts(normalized.items);
        setPagination(normalized.pagination);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setErrorMessage(error.response?.data?.message || "Không thể tải danh sách sản phẩm.");
        } else {
          setErrorMessage(error.message || "Không thể tải danh sách sản phẩm.");
        }
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [queryParams]);

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((prevState) => ({ ...prevState, [name]: value, page: 1 }));
  }

  function handleAttributeToggle(attributeValueId) {
    const numericId = Number(attributeValueId);
    setFilters((prevState) => {
      const exists = prevState.attribute_value_ids.includes(numericId);
      const next = {
        ...prevState,
        attribute_value_ids: exists
          ? prevState.attribute_value_ids.filter((item) => item !== numericId)
          : [...prevState.attribute_value_ids, numericId],
        page: 1
      };
      syncFiltersToUrl(next);
      return next;
    });
  }

  function clearAttributeFilters() {
    setFilters((prevState) => {
      const next = { ...prevState, attribute_value_ids: [], page: 1 };
      syncFiltersToUrl(next);
      return next;
    });
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    const next = { ...filters, page: 1 };
    setFilters(next);
    syncFiltersToUrl(next);
  }

  function goToPage(nextPage) {
    setFilters((prevState) => {
      const next = { ...prevState, page: nextPage };
      syncFiltersToUrl(next);
      return next;
    });
  }

  return (
    <div style={{ display: "grid", gap: 32 }}>
      {/* Premium Hero Section */}
      <section style={{ padding: "48px 40px", borderRadius: 32, background: "radial-gradient(circle at top right, rgba(16, 185, 129, 0.12), transparent 40%), linear-gradient(135deg, #0b1120, #111827)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 40px -12px rgba(0,0,0,0.3)", display: "grid", gap: 16, color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: "50%", height: "100%", background: "url('https://www.transparenttextures.com/patterns/cubes.png')", opacity: 0.05, pointerEvents: "none" }} />
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#34d399", position: "relative" }}>Danh mục cửa hàng</div>
        <h1 style={{ margin: 0, fontSize: 48, lineHeight: 1.1, letterSpacing: "-0.04em", maxWidth: 720, position: "relative" }}>Khám phá thế giới công nghệ đỉnh cao</h1>
        <p style={{ margin: 0, color: "#9ca3af", fontSize: 18, maxWidth: 760, lineHeight: 1.6, position: "relative" }}>Tìm nhanh máy tính, linh kiện và phụ kiện chính hãng với mức giá tốt nhất, được lọc chuyên sâu theo từng thông số kỹ thuật.</p>
      </section>

      {/* Main Layout: Sidebar & Content */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 32, alignItems: "start" }}>
        
        {/* SIDEBAR FILTER */}
        <aside style={{ background: "var(--surface)", padding: 24, borderRadius: 24, border: "1px solid var(--border)", boxShadow: "0 8px 30px rgba(0,0,0,0.04)", position: "sticky", top: 100, display: "grid", gap: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
             <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "var(--text)" }}>Lọc sản phẩm</h2>
          </div>
          
          <form onSubmit={handleSearchSubmit} style={{ display: "grid", gap: 20 }}>
            {/* Search */}
            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text-light)" }}>TỪ KHÓA</label>
              <input name="search" value={filters.search} onChange={handleFilterChange} placeholder="Tên sản phẩm..." style={{ ...inputStyle, background: "var(--surface-strong)" }} />
            </div>

            {/* Category */}
            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text-light)" }}>DANH MỤC</label>
              <select name="category_id" value={filters.category_id} onChange={handleFilterChange} style={{ ...inputStyle, background: "var(--surface-strong)", appearance: "none" }}>
                <option value="">Tất cả</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Brand */}
            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text-light)" }}>THƯƠNG HIỆU</label>
              <select name="brand_id" value={filters.brand_id} onChange={handleFilterChange} style={{ ...inputStyle, background: "var(--surface-strong)", appearance: "none" }}>
                <option value="">Tất cả</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            {/* Price Range */}
            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text-light)" }}>KHOẢNG GIÁ (VNĐ)</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <input name="min_price" value={filters.min_price} onChange={handleFilterChange} placeholder="Từ..." style={{ ...inputStyle, padding: "10px", fontSize: 14, background: "var(--surface-strong)" }} />
                <input name="max_price" value={filters.max_price} onChange={handleFilterChange} placeholder="Đến..." style={{ ...inputStyle, padding: "10px", fontSize: 14, background: "var(--surface-strong)" }} />
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "1px dashed var(--border)", margin: "8px 0" }} />

            {/* Technical Attributes */}
            {attributes.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
                Chưa có thuộc tính kỹ thuật trong dữ liệu. Admin có thể thêm tại mục Thuộc tính & SKU.
              </p>
            ) : null}

            {attributes.length > 0 ? (
              <div style={{ display: "grid", gap: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text-light)", margin: 0 }}>THÔNG SỐ KỸ THUẬT</label>
                   {filters.attribute_value_ids.length > 0 && (
                     <button type="button" onClick={clearAttributeFilters} style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0 }}>Xoá lọc</button>
                   )}
                </div>

                {attributes.map((attr) => (
                  <div key={attr.id} style={{ display: "grid", gap: 10 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{attr.name}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {(attr.values || []).map((val) => {
                        const valueId = Number(val.id);
                        const isChecked = filters.attribute_value_ids.includes(valueId);
                        return (
                          <button 
                            key={val.id} 
                            type="button" 
                            onClick={() => handleAttributeToggle(valueId)} 
                            style={{ 
                              padding: "6px 12px", borderRadius: 8, fontSize: 13, cursor: "pointer", transition: "all 0.2s",
                              border: isChecked ? "1.5px solid var(--primary)" : "1.5px solid transparent", 
                              background: isChecked ? "rgba(16, 185, 129, 0.1)" : "var(--surface-strong)", 
                              color: isChecked ? "var(--primary)" : "var(--text)", 
                              fontWeight: isChecked ? 700 : 500 
                            }}>
                            {val.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <button type="submit" style={{ padding: "14px", borderRadius: 16, border: "none", background: "var(--text)", color: "var(--surface)", fontWeight: 800, fontSize: 15, cursor: "pointer", marginTop: 8, transition: "transform 0.2s" }} onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"} onMouseOut={(e) => e.target.style.transform = "translateY(0)"}>
              ÁP DỤNG BỘ LỘC
            </button>
          </form>
        </aside>

        {/* MAIN PRODUCT GRID */}
        <main style={{ display: "grid", gap: 24 }}>
          {/* Header Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", background: "var(--surface)", borderRadius: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.03)", border: "1px solid var(--border)" }}>
             <div style={{ fontWeight: 600, color: "var(--text)" }}>
                Hiển thị <span style={{ color: "var(--primary)", fontWeight: 800 }}>{products.length}</span> trên tổng số <span style={{ fontWeight: 800 }}>{pagination.totalItems || products.length}</span> kết quả
             </div>
             
             <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
               <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-light)" }}>Sắp xếp:</span>
               <select
                 name="sort"
                 value={filters.sort}
                 onChange={(event) => {
                   const next = { ...filters, sort: event.target.value, page: 1 };
                   setFilters(next);
                   syncFiltersToUrl(next);
                 }}
                 style={{ 
                   ...inputStyle, 
                   width: "auto", 
                   padding: "12px 16px", 
                   fontSize: 14, 
                   fontWeight: 600,
                   minWidth: "180px",
                   cursor: "pointer",
                   background: "var(--surface-strong)",
                   transition: "all 0.2s"
                 }}
                 onMouseOver={(e) => e.target.style.borderColor = "var(--primary)"}
                 onMouseOut={(e) => e.target.style.borderColor = "rgba(122, 92, 48, 0.18)"}
               >
                 <option value="newest">🆕 Mới nhất</option>
                 <option value="price_asc">💰 Giá tăng dần</option>
                 <option value="price_desc">💰 Giá giảm dần</option>
                 <option value="name_asc">🔤 Tên A-Z</option>
               </select>
             </div>
          </div>

          {/* Grid or Status States */}
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", background: "var(--surface)", borderRadius: 24, border: "1px solid var(--border)"}}>
               <div style={{ width: 40, height: 40, border: "4px solid var(--primary)", borderRightColor: "transparent", borderRadius: "50%", margin: "0 auto", animation: "spin 1s linear infinite" }} />
               <div style={{ marginTop: 16, fontWeight: 600, color: "var(--text)" }}>Đang tải danh sách...</div>
            </div>
          ) : null}
          
          {!loading && errorMessage ? (
            <div style={{ padding: 24, borderRadius: 20, background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#b91c1c", fontWeight: 600 }}>
              ⚠️ {errorMessage}
            </div>
          ) : null}

          {!loading && !errorMessage && !hasProducts ? (
            <div style={{ padding: 48, textAlign: "center", borderRadius: 24, background: "var(--surface)", border: "1px dashed var(--border)" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>Không tìm thấy sản phẩm nào</div>
              <div style={{ color: "var(--muted)" }}>Hãy thử thay đổi điều kiện lọc hoặc xóa bớt thông số kỹ thuật.</div>
            </div>
          ) : null}

          {!loading && hasProducts ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
                {products.map((product) => <ProductCard key={`${product.product_id || product.id}-${product.slug || "item"}`} product={product} />)}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 16 }}>
                  <button type="button" onClick={() => goToPage(Math.max(1, Number(pagination.page || 1) - 1))} disabled={Number(pagination.page || 1) <= 1} style={{ padding: "12px 20px", borderRadius: 12, border: "none", background: Number(pagination.page) <= 1 ? "var(--surface-strong)" : "var(--surface)", color: "var(--text)", fontWeight: 700, cursor: Number(pagination.page) <= 1 ? "not-allowed" : "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                    &larr; Trang trước
                  </button>
                  <span style={{ fontWeight: 800, padding: "10px 20px", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)" }}>
                    {pagination.page || 1} / {pagination.totalPages || 1}
                  </span>
                  <button type="button" onClick={() => goToPage(Math.min(Number(pagination.totalPages || 1), Number(pagination.page || 1) + 1))} disabled={Number(pagination.page || 1) >= Number(pagination.totalPages || 1)} style={{ padding: "12px 20px", borderRadius: 12, border: "none", background: Number(pagination.page) >= Number(pagination.totalPages) ? "var(--surface-strong)" : "var(--surface)", color: "var(--text)", fontWeight: 700, cursor: Number(pagination.page) >= Number(pagination.totalPages) ? "not-allowed" : "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                    Trang sau &rarr;
                  </button>
                </div>
              )}
            </>
          ) : null}
        </main>
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
