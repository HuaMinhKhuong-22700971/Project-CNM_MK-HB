import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { getBrands, getCategories, getProductDetail } from "../../services/catalog.service";
import {
  changeAdminProductStatus,
  createAdminProduct,
  getAdminProducts,
  updateAdminProduct
} from "../../services/admin-products.service";

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }

  return error.message || fallbackMessage;
}

function normalizeProductsResponse(response) {
  const payload = response?.data || response;

  if (Array.isArray(payload)) {
    return payload;
  }

  return Array.isArray(payload?.items) ? payload.items : [];
}

function normalizeEntityList(response) {
  const payload = response?.data || response;
  return Array.isArray(payload) ? payload : [];
}

function normalizeProductRow(product) {
  return {
    id: product?.product_id || product?.id,
    name: product?.product_name || product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    categoryId: product?.category_id || product?.category?.id || "",
    categoryName: product?.category_name || product?.category?.name || "",
    brandId: product?.brand_id || product?.brand?.id || "",
    brandName: product?.brand_name || product?.brand?.name || "",
    status: String(product?.status || "ACTIVE").toUpperCase(),
    variants: Array.isArray(product?.variants) ? product.variants : []
  };
}

function createInitialFormState() {
  return {
    name: "",
    slug: "",
    description: "",
    categoryId: "",
    brandId: ""
  };
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function validateForm(values) {
  const errors = {};

  if (!String(values.name || "").trim()) {
    errors.name = "Nhập tên sản phẩm.";
  }

  if (!String(values.slug || "").trim()) {
    errors.slug = "Slug không được để trống.";
  }

  if (!String(values.categoryId || "").trim()) {
    errors.categoryId = "Chọn danh mục cho sản phẩm.";
  }

  if (!String(values.brandId || "").trim()) {
    errors.brandId = "Chọn thương hiệu cho sản phẩm.";
  }

  return errors;
}

function getStatusChipStyle(status) {
  if (status === "ACTIVE") {
    return { background: "rgba(15, 76, 63, 0.12)", color: "#0f4c3f" };
  }

  return { background: "rgba(95, 108, 106, 0.12)", color: "#5f6c6a" };
}

const panelStyle = {
  padding: 24,
  borderRadius: 28,
  border: "1px solid var(--color-line)",
  background: "rgba(255, 255, 255, 0.88)",
  boxShadow: "var(--shadow-soft)",
  backdropFilter: "blur(14px)"
};

const inputStyle = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: 16,
  border: "1px solid var(--color-line)",
  background: "#fffdf9",
  color: "var(--color-ink)",
  font: "inherit"
};

export function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [formValues, setFormValues] = useState(createInitialFormState());
  const [formErrors, setFormErrors] = useState({});
  const [editingProductId, setEditingProductId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const filteredProducts = useMemo(() => {
    const normalizedKeyword = String(searchKeyword || "").trim().toLowerCase();

    if (!normalizedKeyword) {
      return products;
    }

    return products.filter((product) => {
      const haystack = [product.name, product.slug, product.categoryName, product.brandName].join(" ").toLowerCase();
      return haystack.includes(normalizedKeyword);
    });
  }, [products, searchKeyword]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        setErrorMessage("");

        const [productsResponse, categoriesResponse, brandsResponse] = await Promise.all([
          getAdminProducts({ page: 1, limit: 100 }),
          getCategories(),
          getBrands()
        ]);

        setProducts(normalizeProductsResponse(productsResponse).map(normalizeProductRow));
        setCategories(normalizeEntityList(categoriesResponse));
        setBrands(normalizeEntityList(brandsResponse));
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Không thể tải dữ liệu sản phẩm."));
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  function resetForm() {
    setFormValues(createInitialFormState());
    setFormErrors({});
    setEditingProductId(null);
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    setSearchKeyword(keyword);
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setFormValues((prevState) => {
      const nextState = {
        ...prevState,
        [name]: value
      };

      if (name === "name" && !editingProductId && !String(prevState.slug || "").trim()) {
        nextState.slug = slugify(value);
      }

      return nextState;
    });

    setFormErrors((prevState) => ({
      ...prevState,
      [name]: ""
    }));

    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleEditProduct(productId) {
    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await getProductDetail(productId);
      const detail = response?.data || response;

      setEditingProductId(detail.id);
      setFormValues({
        name: detail.name || "",
        slug: detail.slug || "",
        description: detail.description || "",
        categoryId: String(detail.category?.id || ""),
        brandId: String(detail.brand?.id || "")
      });
      setFormErrors({});
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể tải chi tiết sản phẩm."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitForm(event) {
    event.preventDefault();

    const nextErrors = validateForm(formValues);
    setFormErrors(nextErrors);
    setErrorMessage("");
    setSuccessMessage("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: formValues.name.trim(),
        slug: formValues.slug.trim(),
        description: String(formValues.description || "").trim(),
        categoryId: Number(formValues.categoryId),
        brandId: Number(formValues.brandId)
      };

      const response = editingProductId
        ? await updateAdminProduct(editingProductId, payload)
        : await createAdminProduct(payload);

      const savedProduct = normalizeProductRow(response?.data || response);

      setProducts((prevState) => {
        if (editingProductId) {
          return prevState.map((product) => (product.id === savedProduct.id ? savedProduct : product));
        }

        return [savedProduct, ...prevState];
      });

      setSuccessMessage(editingProductId ? "Đã cập nhật sản phẩm." : "Đã tạo sản phẩm mới.");
      resetForm();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể lưu sản phẩm."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(product) {
    const nextStatus = product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      setStatusLoadingId(product.id);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await changeAdminProductStatus(product.id, nextStatus);
      const updatedProduct = normalizeProductRow(response?.data || response);

      setProducts((prevState) => prevState.map((item) => (item.id === updatedProduct.id ? updatedProduct : item)));
      setSuccessMessage(`Đã chuyển trạng thái sản phẩm sang ${nextStatus}.`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể cập nhật trạng thái sản phẩm."));
    } finally {
      setStatusLoadingId(null);
    }
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section
        style={{
          ...panelStyle,
          display: "grid",
          gap: 10,
          background: "linear-gradient(135deg, rgba(15, 76, 63, 0.08), rgba(255, 248, 237, 0.95))"
        }}
      >
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--color-muted)" }}>
          Quản trị sản phẩm
        </div>
        <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.02 }}>Danh mục bán hàng</h1>
        <p style={{ margin: 0, maxWidth: 760, color: "var(--color-muted)", lineHeight: 1.8 }}>
          Quản lý tên sản phẩm, slug, danh mục, thương hiệu và trạng thái hiển thị trong một màn hình rõ ràng. Form và bảng được đặt cạnh nhau để thao tác nhanh khi demo.
        </p>
      </section>

      {errorMessage ? (
        <div style={{ padding: 16, borderRadius: 18, background: "rgba(185, 28, 28, 0.08)", border: "1px solid rgba(185, 28, 28, 0.16)", color: "#991b1b" }}>
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div style={{ padding: 16, borderRadius: 18, background: "rgba(15, 76, 63, 0.08)", border: "1px solid rgba(15, 76, 63, 0.16)", color: "#0f4c3f" }}>
          {successMessage}
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "380px minmax(0, 1fr)", gap: 24, alignItems: "start" }}>
        <section style={{ ...panelStyle, display: "grid", gap: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: 28 }}>{editingProductId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
              <div style={{ color: "var(--color-muted)", lineHeight: 1.7 }}>
                Điền thông tin cơ bản trước khi bổ sung thêm SKU và thuộc tính nâng cao.
              </div>
            </div>
            {editingProductId ? (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: "10px 14px",
                  borderRadius: 999,
                  border: "1px solid var(--color-line)",
                  background: "var(--color-surface)",
                  color: "var(--color-ink)",
                  fontWeight: 700
                }}
              >
                Tạo mới
              </button>
            ) : null}
          </div>

          <form onSubmit={handleSubmitForm} style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <label htmlFor="name" style={{ fontWeight: 700 }}>Tên sản phẩm</label>
              <input id="name" name="name" value={formValues.name} onChange={handleFormChange} style={inputStyle} />
              {formErrors.name ? <span style={{ color: "#b91c1c", fontSize: 14 }}>{formErrors.name}</span> : null}
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label htmlFor="slug" style={{ fontWeight: 700 }}>Slug</label>
              <input id="slug" name="slug" value={formValues.slug} onChange={handleFormChange} style={inputStyle} />
              {formErrors.slug ? <span style={{ color: "#b91c1c", fontSize: 14 }}>{formErrors.slug}</span> : null}
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label htmlFor="description" style={{ fontWeight: 700 }}>Mô tả ngắn</label>
              <textarea id="description" name="description" rows={5} value={formValues.description} onChange={handleFormChange} style={{ ...inputStyle, resize: "vertical" }} />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label htmlFor="categoryId" style={{ fontWeight: 700 }}>Danh mục</label>
              <select id="categoryId" name="categoryId" value={formValues.categoryId} onChange={handleFormChange} style={inputStyle}>
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              {formErrors.categoryId ? <span style={{ color: "#b91c1c", fontSize: 14 }}>{formErrors.categoryId}</span> : null}
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label htmlFor="brandId" style={{ fontWeight: 700 }}>Thương hiệu</label>
              <select id="brandId" name="brandId" value={formValues.brandId} onChange={handleFormChange} style={inputStyle}>
                <option value="">Chọn thương hiệu</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
              {formErrors.brandId ? <span style={{ color: "#b91c1c", fontSize: 14 }}>{formErrors.brandId}</span> : null}
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "14px 18px",
                borderRadius: 18,
                border: "none",
                background: "var(--color-accent)",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: 16,
                cursor: submitting ? "wait" : "pointer",
                opacity: submitting ? 0.72 : 1
              }}
            >
              {submitting ? "Đang lưu..." : editingProductId ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
            </button>
          </form>
        </section>

        <section style={{ ...panelStyle, display: "grid", gap: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 16, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: 30 }}>Danh sách sản phẩm</h2>
              <div style={{ color: "var(--color-muted)", lineHeight: 1.7 }}>
                Tìm nhanh theo tên, slug, danh mục hoặc thương hiệu. Bảng hiển thị tối ưu để quan sát khi demo trên màn hình lớn.
              </div>
            </div>
            <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm theo tên, slug, danh mục, thương hiệu"
                style={{ ...inputStyle, minWidth: 300 }}
              />
              <button
                type="submit"
                style={{
                  padding: "13px 18px",
                  borderRadius: 16,
                  border: "none",
                  background: "var(--color-ink)",
                  color: "#ffffff",
                  fontWeight: 700
                }}
              >
                Tìm kiếm
              </button>
            </form>
          </div>

          {loading ? (
            <div style={{ padding: 20, borderRadius: 18, background: "rgba(255, 248, 237, 0.8)", color: "var(--color-muted)" }}>
              Đang tải danh sách sản phẩm...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ padding: 20, borderRadius: 18, background: "rgba(255, 248, 237, 0.8)", color: "var(--color-muted)" }}>
              Không tìm thấy sản phẩm phù hợp.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid var(--color-line)", color: "var(--color-muted)", textTransform: "uppercase", fontSize: 12, letterSpacing: "0.08em" }}>
                    <th style={{ padding: "12px 10px" }}>Sản phẩm</th>
                    <th style={{ padding: "12px 10px" }}>Slug</th>
                    <th style={{ padding: "12px 10px" }}>Danh mục</th>
                    <th style={{ padding: "12px 10px" }}>Thương hiệu</th>
                    <th style={{ padding: "12px 10px" }}>Trạng thái</th>
                    <th style={{ padding: "12px 10px" }}>Tác vụ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const statusStyle = getStatusChipStyle(product.status);

                    return (
                      <tr key={product.id} style={{ borderBottom: "1px solid rgba(214, 208, 196, 0.7)" }}>
                        <td style={{ padding: "16px 10px" }}>
                          <div style={{ display: "grid", gap: 4 }}>
                            <div style={{ fontWeight: 800 }}>{product.name}</div>
                            <div style={{ fontSize: 14, color: "var(--color-muted)", lineHeight: 1.6 }}>
                              {product.description || "Chưa có mô tả ngắn cho sản phẩm này."}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "16px 10px", color: "var(--color-muted)" }}>{product.slug || "-"}</td>
                        <td style={{ padding: "16px 10px" }}>{product.categoryName || "Chưa gắn"}</td>
                        <td style={{ padding: "16px 10px" }}>{product.brandName || "Chưa gắn"}</td>
                        <td style={{ padding: "16px 10px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              padding: "7px 12px",
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 800,
                              ...statusStyle
                            }}
                          >
                            {product.status}
                          </span>
                        </td>
                        <td style={{ padding: "16px 10px" }}>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button
                              type="button"
                              onClick={() => handleEditProduct(product.id)}
                              style={{
                                padding: "9px 12px",
                                borderRadius: 14,
                                border: "1px solid rgba(15, 76, 63, 0.16)",
                                background: "rgba(15, 76, 63, 0.08)",
                                color: "#0f4c3f",
                                fontWeight: 700
                              }}
                            >
                              Chỉnh sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(product)}
                              disabled={statusLoadingId === product.id}
                              style={{
                                padding: "9px 12px",
                                borderRadius: 14,
                                border: "1px solid var(--color-line)",
                                background: "var(--color-surface)",
                                color: "var(--color-ink)",
                                fontWeight: 700,
                                opacity: statusLoadingId === product.id ? 0.72 : 1
                              }}
                            >
                              {statusLoadingId === product.id ? "Đang đổi..." : product.status === "ACTIVE" ? "Chuyển sang ẩn" : "Kích hoạt lại"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
