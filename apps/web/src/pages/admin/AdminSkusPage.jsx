import { useEffect, useMemo, useState } from "react";

import {
  AdminAlerts,
  AdminBadge,
  AdminBtn,
  AdminCard,
  AdminEmpty,
  AdminField,
  AdminForm,
  AdminPage,
  AdminPageHead,
  AdminTableWrap,
  AdminWorkspace,
  useAdminToast
} from "../../components/admin/AdminUi";
import { getAdminAttributes } from "../../services/admin-attributes.service";
import { getAdminErrorMessage, normalizeAdminList } from "../../utils/adminUi";
import {
  createAdminSku,
  deleteAdminSku,
  getAdminSkuDetail,
  getAdminSkus,
  updateAdminSku
} from "../../services/admin-skus.service";
import { getAdminProducts } from "../../services/admin-products.service";

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

  useAdminToast(successMessage, () => setSuccessMessage(""));

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

      setSkus(normalizeAdminList(skuResponse));
      setProducts(normalizeAdminList(productResponse));
      setAttributes(normalizeAdminList(attributeResponse));
    } catch (error) {
      setErrorMessage(getAdminErrorMessage(error, "Không thể tải dữ liệu SKU."));
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
      setErrorMessage(getAdminErrorMessage(error, "Không thể tải chi tiết SKU."));
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
      setErrorMessage(getAdminErrorMessage(error, "Không thể lưu SKU."));
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
      setErrorMessage(getAdminErrorMessage(error, "Không thể xóa SKU."));
    }
  }

  return (
    <AdminPage>
      <AdminPageHead
        eyebrow="Catalog"
        title="SKU & biến thể"
        description="Giá, tồn kho, ảnh và gán thuộc tính kỹ thuật — lớp dữ liệu cho cửa hàng và PC Builder."
      />
      <AdminAlerts errorMessage={errorMessage} successMessage={successMessage} />
      <AdminWorkspace columns="form-list">
        <AdminCard>
          <div className="admin-section-title">
            <h3>{editingSkuId ? "Sửa SKU" : "Thêm SKU"}</h3>
            <p>Chọn sản phẩm và gán thuộc tính (socket, RAM…).</p>
          </div>
          <AdminForm onSubmit={handleSubmit}>
            <select name="productId" className="admin-input" value={formValues.productId} onChange={handleChange}>
              <option value="">Chọn sản phẩm</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input name="sku" className="admin-input" value={formValues.sku} onChange={handleChange} placeholder="Mã SKU" />
            <div className="admin-form admin-form--grid">
              <input name="price" className="admin-input" value={formValues.price} onChange={handleChange} placeholder="Giá" />
              <input name="stock" className="admin-input" value={formValues.stock} onChange={handleChange} placeholder="Tồn kho" />
            </div>
            <input name="imageUrl" className="admin-input" value={formValues.imageUrl} onChange={handleChange} placeholder="URL ảnh" />
            <select name="status" className="admin-input" value={formValues.status} onChange={handleChange}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
            {attributes.map((attribute) => {
              const selectedValueId =
                attribute.values?.find((v) => formValues.attributeValueIds.includes(Number(v.id)))?.id || "";
              return (
                <div key={attribute.id} className="admin-attribute-block">
                  <strong>{attribute.name}</strong>
                  <select className="admin-input" value={selectedValueId} onChange={(e) => handleAttributeSelect(attribute, e.target.value)}>
                    <option value="">Không gán</option>
                    {(attribute.values || []).map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.value}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
            <div className="admin-action-row">
              <AdminBtn type="submit" variant="primary" disabled={submitting}>
                {editingSkuId ? "Cập nhật" : "Thêm SKU"}
              </AdminBtn>
              {editingSkuId ? (
                <AdminBtn variant="secondary" onClick={resetForm}>
                  Bỏ chọn
                </AdminBtn>
              ) : null}
            </div>
          </AdminForm>
        </AdminCard>
        <AdminCard>
          <div className="admin-panel-head">
            <div className="admin-section-title">
              <h3>Danh sách SKU</h3>
            </div>
            <form onSubmit={handleSearchSubmit} className="admin-search-row">
              <input className="admin-input" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm SKU…" />
              <AdminBtn type="submit" variant="dark">
                Tìm
              </AdminBtn>
            </form>
          </div>
          {loading ? (
            <AdminEmpty>Đang tải…</AdminEmpty>
          ) : (
            <AdminTableWrap>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Sản phẩm</th>
                    <th>Giá / tồn</th>
                    <th>Thuộc tính</th>
                    <th>TT</th>
                    <th>Tác vụ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSkus.map((sku) => (
                    <tr key={sku.id}>
                      <td>
                        <strong>{sku.sku}</strong>
                      </td>
                      <td>
                        {sku.product?.name}
                        <div style={{ fontSize: 13, color: "#64748b" }}>
                          {sku.product?.categoryName} · {sku.product?.brandName}
                        </div>
                      </td>
                      <td>
                        {Number(sku.price || 0).toLocaleString("vi-VN")} đ<br />
                        <small>Tồn: {sku.stock}</small>
                      </td>
                      <td>
                        <div className="admin-tag-list">
                          {(sku.attributes || []).map((a) => (
                            <span key={`${sku.id}-${a.attributeValueId}`} className="admin-tag">
                              {a.label}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <AdminBadge tone={sku.status === "ACTIVE" ? "success" : "neutral"}>{sku.status}</AdminBadge>
                      </td>
                      <td>
                        <div className="admin-action-row">
                          <AdminBtn variant="secondary" onClick={() => handleEditSku(sku.id)}>
                            Sửa
                          </AdminBtn>
                          <AdminBtn variant="danger" onClick={() => handleDeleteSku(sku.id)}>
                            Xóa
                          </AdminBtn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTableWrap>
          )}
        </AdminCard>
      </AdminWorkspace>
    </AdminPage>
  );
}
