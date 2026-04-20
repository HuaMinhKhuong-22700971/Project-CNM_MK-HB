import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { getAdminAttributes } from "../../services/admin-attributes.service";
import {
  createAdminSku,
  deleteAdminSku,
  getAdminSkuDetail,
  getAdminSkus,
  updateAdminSku
} from "../../services/admin-skus.service";
import { getAdminProducts } from "../../services/admin-products.service";

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

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }

  return error.message || fallbackMessage;
}

function normalizeItems(response) {
  const payload = response?.data || response;
  if (Array.isArray(payload)) {
    return payload;
  }
  return Array.isArray(payload?.items) ? payload.items : [];
}

function createInitialSkuForm() {
  return {
    productId: "",
    sku: "",
    price: "",
    stock: "",
    imageUrl: "",
    status: "ACTIVE",
    attributeValueIds: []
  };
}

function replaceAttributeSelection(currentIds, attribute, nextValueId) {
  const cleaned = currentIds.filter((valueId) => !attribute.values.some((value) => Number(value.id) === Number(valueId)));
  if (!nextValueId) {
    return cleaned;
  }
  return [...cleaned, Number(nextValueId)];
}

export function AdminSkusPage() {
  const [skus, setSkus] = useState([]);
  const [products, setProducts] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [formValues, setFormValues] = useState(createInitialSkuForm());
  const [editingSkuId, setEditingSkuId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const filteredSkus = useMemo(() => {
    const normalizedKeyword = String(searchKeyword || "").trim().toLowerCase();
    if (!normalizedKeyword) {
      return skus;
    }

    return skus.filter((sku) => [sku.sku, sku.product?.name, sku.product?.categoryName, sku.product?.brandName].join(" ").toLowerCase().includes(normalizedKeyword));
  }, [searchKeyword, skus]);

  async function loadInitialData() {
    try {
      setLoading(true);
      setErrorMessage("");
      const [skuResponse, productResponse, attributeResponse] = await Promise.all([
        getAdminSkus(),
        getAdminProducts({ page: 1, limit: 200 }),
        getAdminAttributes()
      ]);

      setSkus(normalizeItems(skuResponse));
      setProducts(normalizeItems(productResponse));
      setAttributes(normalizeItems(attributeResponse));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể tải dữ liệu SKU."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  function resetForm() {
    setFormValues(createInitialSkuForm());
    setEditingSkuId(null);
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    setSearchKeyword(keyword);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleAttributeSelect(attribute, valueId) {
    setFormValues((prev) => ({
      ...prev,
      attributeValueIds: replaceAttributeSelection(prev.attributeValueIds, attribute, valueId)
    }));
  }

  async function handleEditSku(skuId) {
    try {
      setSubmitting(true);
      const response = await getAdminSkuDetail(skuId);
      const sku = response?.data || response;
      setEditingSkuId(sku.id);
      setFormValues({
        productId: String(sku.productId || sku.product?.id || ""),
        sku: sku.sku || "",
        price: String(sku.price ?? ""),
        stock: String(sku.stock ?? ""),
        imageUrl: sku.imageUrl || "",
        status: sku.status || "ACTIVE",
        attributeValueIds: Array.isArray(sku.attributes) ? sku.attributes.map((item) => Number(item.attributeValueId)) : []
      });
      setErrorMessage("");
      setSuccessMessage("");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể tải chi tiết SKU."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      const payload = {
        productId: Number(formValues.productId),
        sku: formValues.sku,
        price: Number(formValues.price),
        stock: Number(formValues.stock || 0),
        imageUrl: formValues.imageUrl,
        status: formValues.status,
        attributeValueIds: formValues.attributeValueIds
      };

      if (editingSkuId) {
        await updateAdminSku(editingSkuId, payload);
        setSuccessMessage("Đã cập nhật SKU.");
      } else {
        await createAdminSku(payload);
        setSuccessMessage("Đã tạo SKU mới.");
      }

      resetForm();
      await loadInitialData();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể lưu SKU."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteSku(skuId) {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      await deleteAdminSku(skuId);
      setSuccessMessage("Đã xóa SKU.");
      await loadInitialData();
      if (editingSkuId === skuId) {
        resetForm();
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể xóa SKU."));
    }
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section style={{ ...panelStyle, display: "grid", gap: 10, background: "linear-gradient(135deg, rgba(15, 76, 63, 0.08), rgba(255, 248, 237, 0.95))" }}>
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--color-muted)" }}>
          Quản trị SKU và biến thể
        </div>
        <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.02 }}>Product SKUs</h1>
        <p style={{ margin: 0, maxWidth: 760, color: "var(--color-muted)", lineHeight: 1.8 }}>
          Mỗi SKU đại diện cho một cấu hình hoặc biến thể có giá, tồn kho và bộ thuộc tính riêng. Đây là lớp dữ liệu trực tiếp phục vụ cho trang chi tiết sản phẩm, bộ lọc và PC Builder.
        </p>
      </section>

      {errorMessage ? <div style={{ padding: 16, borderRadius: 18, background: "rgba(185, 28, 28, 0.08)", border: "1px solid rgba(185, 28, 28, 0.16)", color: "#991b1b" }}>{errorMessage}</div> : null}
      {successMessage ? <div style={{ padding: 16, borderRadius: 18, background: "rgba(15, 76, 63, 0.08)", border: "1px solid rgba(15, 76, 63, 0.16)", color: "#0f4c3f" }}>{successMessage}</div> : null}

      <div style={{ display: "grid", gridTemplateColumns: "420px minmax(0, 1fr)", gap: 24, alignItems: "start" }}>
        <section style={{ ...panelStyle, display: "grid", gap: 16 }}>
          <div>
            <h2 style={{ margin: "0 0 6px", fontSize: 28 }}>{editingSkuId ? "Sửa SKU" : "Thêm SKU"}</h2>
            <div style={{ color: "var(--color-muted)", lineHeight: 1.7 }}>Chọn sản phẩm, cập nhật giá, tồn kho và gán đúng bộ giá trị thuộc tính cho SKU này.</div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
            <select name="productId" value={formValues.productId} onChange={handleChange} style={inputStyle}>
              <option value="">Chọn sản phẩm</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select>
            <input name="sku" value={formValues.sku} onChange={handleChange} placeholder="Mã SKU" style={inputStyle} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input name="price" value={formValues.price} onChange={handleChange} placeholder="Giá" style={inputStyle} />
              <input name="stock" value={formValues.stock} onChange={handleChange} placeholder="Tồn kho" style={inputStyle} />
            </div>
            <input name="imageUrl" value={formValues.imageUrl} onChange={handleChange} placeholder="Image URL (tùy chọn)" style={inputStyle} />
            <select name="status" value={formValues.status} onChange={handleChange} style={inputStyle}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>

            <div style={{ display: "grid", gap: 12, paddingTop: 8 }}>
              <div style={{ fontWeight: 800 }}>Gán thuộc tính cho SKU</div>
              {attributes.map((attribute) => {
                const selectedValueId = attribute.values?.find((value) => formValues.attributeValueIds.includes(Number(value.id)))?.id || "";
                return (
                  <div key={attribute.id} style={{ display: "grid", gap: 6, padding: 12, borderRadius: 16, background: "rgba(255, 248, 237, 0.68)", border: "1px solid var(--color-line)" }}>
                    <div style={{ fontWeight: 700 }}>{attribute.name}</div>
                    <select value={selectedValueId} onChange={(event) => handleAttributeSelect(attribute, event.target.value)} style={inputStyle}>
                      <option value="">Không gán</option>
                      {(attribute.values || []).map((value) => <option key={value.id} value={value.id}>{value.value}</option>)}
                    </select>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="submit" disabled={submitting} style={{ padding: "13px 18px", borderRadius: 16, border: "none", background: "var(--color-accent)", color: "#fff", fontWeight: 800 }}>
                {editingSkuId ? "Cập nhật SKU" : "Thêm SKU"}
              </button>
              {editingSkuId ? <button type="button" onClick={resetForm} style={{ padding: "13px 18px", borderRadius: 16, border: "1px solid var(--color-line)", background: "#fff", fontWeight: 700 }}>Bỏ chọn</button> : null}
            </div>
          </form>
        </section>

        <section style={{ ...panelStyle, display: "grid", gap: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 16, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: 30 }}>Danh sách SKU</h2>
              <div style={{ color: "var(--color-muted)", lineHeight: 1.7 }}>SKU được hiển thị kèm bộ thuộc tính để admin kiểm tra nhanh khả năng tương thích và bộ lọc.</div>
            </div>
            <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 10 }}>
              <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm theo SKU hoặc tên sản phẩm" style={{ ...inputStyle, minWidth: 280 }} />
              <button type="submit" style={{ padding: "13px 18px", borderRadius: 16, border: "none", background: "var(--color-ink)", color: "#fff", fontWeight: 700 }}>Tìm</button>
            </form>
          </div>

          {loading ? (
            <div style={{ padding: 20, borderRadius: 18, background: "rgba(255, 248, 237, 0.8)", color: "var(--color-muted)" }}>Đang tải danh sách SKU...</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 960 }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid var(--color-line)", color: "var(--color-muted)", textTransform: "uppercase", fontSize: 12, letterSpacing: "0.08em" }}>
                    <th style={{ padding: "12px 10px" }}>SKU</th>
                    <th style={{ padding: "12px 10px" }}>Sản phẩm</th>
                    <th style={{ padding: "12px 10px" }}>Giá / tồn</th>
                    <th style={{ padding: "12px 10px" }}>Thuộc tính</th>
                    <th style={{ padding: "12px 10px" }}>Trạng thái</th>
                    <th style={{ padding: "12px 10px" }}>Tác vụ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSkus.map((sku) => (
                    <tr key={sku.id} style={{ borderBottom: "1px solid rgba(214, 208, 196, 0.7)" }}>
                      <td style={{ padding: "16px 10px", fontWeight: 800 }}>{sku.sku}</td>
                      <td style={{ padding: "16px 10px" }}>
                        <div style={{ display: "grid", gap: 4 }}>
                          <div style={{ fontWeight: 700 }}>{sku.product?.name}</div>
                          <div style={{ color: "var(--color-muted)", fontSize: 14 }}>{sku.product?.categoryName || "-"} · {sku.product?.brandName || "-"}</div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 10px" }}>
                        <div style={{ fontWeight: 700 }}>{Number(sku.price || 0).toLocaleString("vi-VN")} đ</div>
                        <div style={{ color: "var(--color-muted)", fontSize: 14 }}>Tồn: {Number(sku.stock || 0)}</div>
                      </td>
                      <td style={{ padding: "16px 10px" }}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {(sku.attributes || []).map((attribute) => <span key={`${sku.id}-${attribute.attributeValueId}`} style={{ display: "inline-flex", padding: "6px 10px", borderRadius: 999, background: "rgba(15, 76, 63, 0.08)", color: "#0f4c3f", fontSize: 13, fontWeight: 700 }}>{attribute.label}</span>)}
                          {(!sku.attributes || sku.attributes.length === 0) ? <span style={{ color: "var(--color-muted)", fontSize: 14 }}>Chưa gắn thuộc tính</span> : null}
                        </div>
                      </td>
                      <td style={{ padding: "16px 10px" }}>
                        <span style={{ display: "inline-flex", padding: "6px 10px", borderRadius: 999, background: sku.status === "ACTIVE" ? "rgba(15, 76, 63, 0.12)" : "rgba(95, 108, 106, 0.12)", color: sku.status === "ACTIVE" ? "#0f4c3f" : "#5f6c6a", fontSize: 12, fontWeight: 800 }}>{sku.status}</span>
                      </td>
                      <td style={{ padding: "16px 10px" }}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button type="button" onClick={() => handleEditSku(sku.id)} style={{ padding: "9px 12px", borderRadius: 14, border: "1px solid rgba(15, 76, 63, 0.16)", background: "rgba(15, 76, 63, 0.08)", color: "#0f4c3f", fontWeight: 700 }}>Sửa</button>
                          <button type="button" onClick={() => handleDeleteSku(sku.id)} style={{ padding: "9px 12px", borderRadius: 14, border: "1px solid rgba(185, 28, 28, 0.18)", background: "rgba(185, 28, 28, 0.08)", color: "#991b1b", fontWeight: 700 }}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
