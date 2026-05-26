import { useEffect, useMemo, useState } from "react";

import {
  AdminAlerts,
  AdminBtn,
  AdminCard,
  AdminEmpty,
  AdminForm,
  AdminPage,
  AdminPageHead,
  AdminWorkspace,
  useAdminToast
} from "../../components/admin/AdminUi";
import {
  createAdminAttribute,
  createAdminAttributeValue,
  deleteAdminAttribute,
  deleteAdminAttributeValue,
  getAdminAttributes,
  updateAdminAttribute,
  updateAdminAttributeValue
} from "../../services/admin-attributes.service";
import { getAdminErrorMessage, normalizeAdminList } from "../../utils/adminUi";

export function AdminAttributesPage() {
  const [attributes, setAttributes] = useState([]);
  const [attributeName, setAttributeName] = useState("");
  const [editingAttributeId, setEditingAttributeId] = useState(null);
  const [valueForm, setValueForm] = useState({ attributeId: "", value: "" });
  const [editingValueId, setEditingValueId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useAdminToast(successMessage, () => setSuccessMessage(""));

  const totalValues = useMemo(
    () => attributes.reduce((sum, a) => sum + (a.values?.length || 0), 0),
    [attributes]
  );

  async function loadAttributes() {
    try {
      setLoading(true);
      const response = await getAdminAttributes();
      setAttributes(normalizeAdminList(response));
    } catch (error) {
      setErrorMessage(getAdminErrorMessage(error, "Không thể tải thuộc tính."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAttributes();
  }, []);

  function resetAttributeForm() {
    setAttributeName("");
    setEditingAttributeId(null);
  }

  function resetValueForm() {
    setValueForm({ attributeId: "", value: "" });
    setEditingValueId(null);
  }

  async function handleSubmitAttribute(event) {
    event.preventDefault();
    try {
      setSubmitting(true);
      if (editingAttributeId) {
        await updateAdminAttribute(editingAttributeId, { name: attributeName });
        setSuccessMessage("Đã cập nhật thuộc tính.");
      } else {
        await createAdminAttribute({ name: attributeName });
        setSuccessMessage("Đã tạo thuộc tính.");
      }
      resetAttributeForm();
      await loadAttributes();
    } catch (error) {
      setErrorMessage(getAdminErrorMessage(error, "Không thể lưu thuộc tính."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitValue(event) {
    event.preventDefault();
    try {
      setSubmitting(true);
      const payload = { attributeId: Number(valueForm.attributeId), value: valueForm.value };
      if (editingValueId) {
        await updateAdminAttributeValue(editingValueId, payload);
        setSuccessMessage("Đã cập nhật giá trị.");
      } else {
        await createAdminAttributeValue(payload);
        setSuccessMessage("Đã tạo giá trị.");
      }
      resetValueForm();
      await loadAttributes();
    } catch (error) {
      setErrorMessage(getAdminErrorMessage(error, "Không thể lưu giá trị."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteAttribute(id) {
    try {
      await deleteAdminAttribute(id);
      setSuccessMessage("Đã xóa thuộc tính.");
      await loadAttributes();
    } catch (error) {
      setErrorMessage(getAdminErrorMessage(error, "Không thể xóa."));
    }
  }

  async function handleDeleteValue(id) {
    try {
      await deleteAdminAttributeValue(id);
      setSuccessMessage("Đã xóa giá trị.");
      await loadAttributes();
    } catch (error) {
      setErrorMessage(getAdminErrorMessage(error, "Không thể xóa."));
    }
  }

  return (
    <AdminPage>
      <AdminPageHead
        eyebrow="Catalog"
        title="Thuộc tính động"
        description="Socket, RAM, chipset… dùng cho bộ lọc sản phẩm, SKU và PC Builder."
      />
      <AdminAlerts errorMessage={errorMessage} successMessage={successMessage} />
      <AdminWorkspace columns="triple">
        <AdminCard>
          <div className="admin-section-title">
            <h3>{editingAttributeId ? "Sửa thuộc tính" : "Thêm thuộc tính"}</h3>
          </div>
          <AdminForm onSubmit={handleSubmitAttribute}>
            <input className="admin-input" value={attributeName} onChange={(e) => setAttributeName(e.target.value)} placeholder="Ví dụ: Socket" />
            <AdminBtn type="submit" variant="primary" disabled={submitting}>
              {editingAttributeId ? "Cập nhật" : "Thêm"}
            </AdminBtn>
          </AdminForm>
        </AdminCard>
        <AdminCard>
          <div className="admin-section-title">
            <h3>{editingValueId ? "Sửa giá trị" : "Thêm giá trị"}</h3>
          </div>
          <AdminForm onSubmit={handleSubmitValue}>
            <select className="admin-input" value={valueForm.attributeId} onChange={(e) => setValueForm((p) => ({ ...p, attributeId: e.target.value }))}>
              <option value="">Chọn thuộc tính</option>
              {attributes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <input className="admin-input" value={valueForm.value} onChange={(e) => setValueForm((p) => ({ ...p, value: e.target.value }))} placeholder="Ví dụ: LGA1700" />
            <AdminBtn type="submit" variant="primary" disabled={submitting}>
              {editingValueId ? "Cập nhật" : "Thêm giá trị"}
            </AdminBtn>
          </AdminForm>
        </AdminCard>
        <AdminCard>
          <div className="admin-section-title">
            <h3>Danh sách ({attributes.length} / {totalValues} giá trị)</h3>
          </div>
          {loading ? (
            <AdminEmpty>Đang tải…</AdminEmpty>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {attributes.map((attribute) => (
                <div key={attribute.id} className="admin-attribute-block">
                  <div className="admin-panel-head">
                    <div>
                      <strong style={{ fontSize: 17 }}>{attribute.name}</strong>
                      <div style={{ color: "#64748b", fontSize: 13 }}>{attribute.values?.length || 0} giá trị</div>
                    </div>
                    <div className="admin-action-row">
                      <AdminBtn
                        variant="secondary"
                        onClick={() => {
                          setEditingAttributeId(attribute.id);
                          setAttributeName(attribute.name);
                        }}
                      >
                        Sửa
                      </AdminBtn>
                      <AdminBtn variant="danger" onClick={() => handleDeleteAttribute(attribute.id)}>
                        Xóa
                      </AdminBtn>
                    </div>
                  </div>
                  <div className="admin-tag-list">
                    {(attribute.values || []).map((value) => (
                      <span key={value.id} className="admin-tag">
                        {value.value}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingValueId(value.id);
                            setValueForm({ attributeId: String(attribute.id), value: value.value });
                          }}
                        >
                          ✎
                        </button>
                        <button type="button" onClick={() => handleDeleteValue(value.id)}>
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminCard>
      </AdminWorkspace>
    </AdminPage>
  );
}
