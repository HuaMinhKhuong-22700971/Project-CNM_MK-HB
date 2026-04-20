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

export function ProductListPage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => {
    return {
      keyword: searchParams.get("keyword") || "",
      category_id: searchParams.get("category_id") || "",
      brand_id: searchParams.get("brand_id") || "",
      min_price: searchParams.get("min_price") || "",
      max_price: searchParams.get("max_price") || "",
      attribute_value_ids: searchParams.get("attribute_value_ids")
        ? searchParams.get("attribute_value_ids").split(",").map(id => Number(id)).filter(id => !isNaN(id))
        : [],
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 12,
      isCompareMode: searchParams.get("mode") === "compare"
    };
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
    keyword: filters.keyword || undefined,
    category_id: filters.category_id || undefined,
    brand_id: filters.brand_id || undefined,
    min_price: filters.min_price || undefined,
    max_price: filters.max_price || undefined,
    attribute_value_ids: filters.attribute_value_ids.length > 0 ? filters.attribute_value_ids.join(",") : undefined,
    page: filters.page,
    limit: filters.limit
  }), [filters]);

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

  // Sync state with URL params on mount
  useEffect(() => {
    const categoryId = searchParams.get("category_id");
    const brandId = searchParams.get("brand_id");
    const keyword = searchParams.get("keyword");

    if (categoryId || brandId || keyword) {
      setFilters((prev) => ({
        ...prev,
        category_id: categoryId || prev.category_id,
        brand_id: brandId || prev.brand_id,
        keyword: keyword || prev.keyword,
        page: 1
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await getProducts(queryParams);

        if (!ignore) {
          const normalized = normalizeProductResponse(response);
          setProducts(normalized.items);
          setPagination(normalized.pagination);
        }
      } catch (error) {
        if (!ignore) {
          if (axios.isAxiosError(error)) {
            setErrorMessage(error.response?.data?.message || "Không thể tải danh sách sản phẩm.");
          } else {
            setErrorMessage(error.message || "Không thể tải danh sách sản phẩm.");
          }
          setProducts([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      ignore = true;
    };
  }, [queryParams]);

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((prevState) => ({ ...prevState, [name]: value, page: 1 }));
  }

  function handleAttributeToggle(attributeValueId) {
    setFilters((prevState) => {
      const exists = prevState.attribute_value_ids.includes(attributeValueId);
      return {
        ...prevState,
        attribute_value_ids: exists
          ? prevState.attribute_value_ids.filter((item) => item !== attributeValueId)
          : [...prevState.attribute_value_ids, attributeValueId],
        page: 1
      };
    });
  }

  function clearAttributeFilters() {
    setFilters((prevState) => ({ ...prevState, attribute_value_ids: [], page: 1 }));
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    setFilters((prevState) => ({ ...prevState, page: 1 }));
  }

  function goToPage(nextPage) {
    setFilters((prevState) => ({ ...prevState, page: nextPage }));
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {filters.isCompareMode && (
        <section style={{ padding: "16px 24px", borderRadius: 20, background: "rgba(198,124,49,0.12)", border: "1px solid rgba(198,124,49,0.3)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>⚖️</span>
            <div>
              <div style={{ fontWeight: 800, color: "var(--primary)" }}>Chế độ chọn sản phẩm so sánh</div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>Bấm vào bất kỳ sản phẩm nào bên dưới để thêm vào danh sách so sánh hiện tại của bạn.</div>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => setFilters(prev => ({ ...prev, isCompareMode: false }))}
            style={{ padding: "8px 16px", borderRadius: 12, border: "1px solid var(--border)", background: "#fff", fontWeight: 700, cursor: "pointer" }}
          >
            Thoát chế độ so sánh
          </button>
        </section>
      )}

      <section style={{ padding: "34px 30px", borderRadius: 32, background: "radial-gradient(circle at top right, rgba(198,124,49,0.18), transparent 24%), linear-gradient(135deg, rgba(223,236,229,0.95), rgba(248,243,234,0.95))", border: "1px solid var(--border)", boxShadow: "var(--shadow)", display: "grid", gap: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--primary)" }}>Danh mục cửa hàng</div>
        <h1 style={{ margin: 0, fontSize: 52, lineHeight: 1, letterSpacing: "-0.06em", maxWidth: 720 }}>Sản phẩm cho gamer, creator và dân văn phòng</h1>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: 18, maxWidth: 760, lineHeight: 1.6 }}>Tìm nhanh máy tính, linh kiện và phụ kiện theo mức giá, danh mục, thương hiệu và cả thuộc tính kỹ thuật đã được admin cấu hình tự động.</p>
      </section>

      <section style={{ display: "grid", gap: 18, padding: 22, borderRadius: 26, background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow)", backdropFilter: "blur(16px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.04em" }}>Bộ lọc sản phẩm</div>
            <div style={{ color: "var(--muted)", marginTop: 4 }}>Thu hẹp kết quả theo từ khóa, danh mục, thương hiệu, khoảng giá và thuộc tính SKU.</div>
          </div>
          <div style={{ padding: "10px 14px", borderRadius: 999, background: "rgba(31, 76, 63, 0.08)", color: "var(--primary)", fontWeight: 800 }}>{pagination.totalItems || products.length} sản phẩm</div>
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 2fr) repeat(4, minmax(120px, 1fr)) auto", gap: 12 }}>
            <input name="keyword" value={filters.keyword} onChange={handleFilterChange} placeholder="Tìm theo tên sản phẩm..." style={inputStyle} />

            <select name="category_id" value={filters.category_id} onChange={handleFilterChange} style={inputStyle}>
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>

            <select name="brand_id" value={filters.brand_id} onChange={handleFilterChange} style={inputStyle}>
              <option value="">Tất cả thương hiệu</option>
              {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
            </select>

            <input name="min_price" value={filters.min_price} onChange={handleFilterChange} placeholder="Giá từ" style={inputStyle} />
            <input name="max_price" value={filters.max_price} onChange={handleFilterChange} placeholder="Giá đến" style={inputStyle} />

            <button type="submit" style={{ padding: "14px 20px", borderRadius: 16, border: "none", background: "linear-gradient(135deg, var(--primary), #2b6b58)", color: "#ffffff", fontWeight: 800, minWidth: 120 }}>
              Tìm kiếm
            </button>
          </div>

          {attributes.length > 0 ? (
            <div style={{ display: "grid", gap: 14, paddingTop: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ fontWeight: 700 }}>Bộ lọc thuộc tính</div>
                {filters.attribute_value_ids.length > 0 ? (
                  <button type="button" onClick={clearAttributeFilters} style={{ border: "none", background: "transparent", color: "var(--primary)", fontWeight: 700, cursor: "pointer" }}>
                    Xóa bộ lọc thuộc tính
                  </button>
                ) : null}
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {attributes.map((attribute) => (
                  <div key={attribute.id} style={{ display: "grid", gap: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{attribute.name}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {(attribute.values || []).map((item) => {
                        const checked = filters.attribute_value_ids.includes(item.id);
                        return (
                          <button key={item.id} type="button" onClick={() => handleAttributeToggle(item.id)} style={{ padding: "8px 12px", borderRadius: 999, border: checked ? "1px solid rgba(15, 76, 63, 0.26)" : "1px solid rgba(122, 92, 48, 0.18)", background: checked ? "rgba(15, 76, 63, 0.12)" : "rgba(255,255,255,0.9)", color: checked ? "var(--primary)" : "var(--text)", fontWeight: checked ? 700 : 500, cursor: "pointer" }}>
                            {item.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </form>
      </section>

      {loading ? <div style={{ padding: 24, borderRadius: 24, background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>Đang tải danh sách sản phẩm...</div> : null}
      {!loading && errorMessage ? <div style={{ padding: 18, borderRadius: 20, background: "rgba(255, 240, 236, 0.92)", border: "1px solid rgba(182, 64, 44, 0.22)", color: "var(--danger)", boxShadow: "var(--shadow)" }}>{errorMessage}</div> : null}

      {!loading && !errorMessage && !hasProducts ? (
        <div style={{ padding: 26, borderRadius: 24, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)", boxShadow: "var(--shadow)", display: "grid", gap: 8 }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text)" }}>Chưa có kết quả phù hợp</div>
          <div>Thử xóa bớt bộ lọc hoặc quay lại danh mục tổng quan để xem thêm sản phẩm.</div>
        </div>
      ) : null}

      {!loading && hasProducts ? (
        <>
          <div style={{ color: "var(--muted)", fontWeight: 700 }}>Đang hiển thị {products.length} sản phẩm. Tổng cộng: {pagination.totalItems || products.length}</div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
            {products.map((product) => (
              <ProductCard 
                key={`${product.product_id || product.id}-${product.slug || "item"}`} 
                product={product} 
                isCompareMode={filters.isCompareMode}
              />
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, paddingTop: 8 }}>
            <button type="button" onClick={() => goToPage(Math.max(1, Number(pagination.page || 1) - 1))} disabled={Number(pagination.page || 1) <= 1} style={{ padding: "11px 16px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface-strong)" }}>
              Trang trước
            </button>
            <span style={{ fontWeight: 700 }}>Trang {pagination.page || 1} / {pagination.totalPages || 1}</span>
            <button type="button" onClick={() => goToPage(Math.min(Number(pagination.totalPages || 1), Number(pagination.page || 1) + 1))} disabled={Number(pagination.page || 1) >= Number(pagination.totalPages || 1)} style={{ padding: "11px 16px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface-strong)" }}>
              Trang sau
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
