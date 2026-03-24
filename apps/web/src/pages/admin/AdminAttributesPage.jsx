import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  createAdminAttribute,
  createAdminAttributeValue,
  deleteAdminAttribute,
  deleteAdminAttributeValue,
  getAdminAttributes,
  updateAdminAttribute,
  updateAdminAttributeValue
} from "../../services/admin-attributes.service";

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

function normalizeAttributesResponse(response) {
  const payload = response?.data || response;
  return Array.isArray(payload) ? payload : [];
}

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

  const totalValues = useMemo(
    () => attributes.reduce((sum, attribute) => sum + (attribute.values?.length || 0), 0),
    [attributes]
  );

  async function loadAttributes() {
    try {
      setLoading(true);
      const response = await getAdminAttributes();
      setAttributes(normalizeAttributesResponse(response));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể tải danh sách thuộc tính."));
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
      setErrorMessage("");
      setSuccessMessage("");

      if (editingAttributeId) {
        await updateAdminAttribute(editingAttributeId, { name: attributeName });
        setSuccessMessage("Đã cập nhật thuộc tính.");
      } else {
        await createAdminAttribute({ name: attributeName });
        setSuccessMessage("Đã tạo thuộc tính mới.");
      }

      resetAttributeForm();
      await loadAttributes();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể lưu thuộc tính."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitValue(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      const payload = {
        attributeId: Number(valueForm.attributeId),
        value: valueForm.value
      };

      if (editingValueId) {
        await updateAdminAttributeValue(editingValueId, payload);
        setSuccessMessage("Đã cập nhật giá trị thuộc tính.");
      } else {
        await createAdminAttributeValue(payload);
        setSuccessMessage("Đã tạo giá trị thuộc tính mới.");
      }

      resetValueForm();
      await loadAttributes();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể lưu giá trị thuộc tính."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteAttribute(attributeId) {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      await deleteAdminAttribute(attributeId);
      setSuccessMessage("Đã xóa thuộc tính và toàn bộ giá trị liên quan.");
      await loadAttributes();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể xóa thuộc tính."));
    }
  }

  async function handleDeleteValue(attributeValueId) {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      await deleteAdminAttributeValue(attributeValueId);
      setSuccessMessage("Đã xóa giá trị thuộc tính.");
      await loadAttributes();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể xóa giá trị thuộc tính."));
    }
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section style={{ ...panelStyle, display: "grid", gap: 10, background: "linear-gradient(135deg, rgba(15, 76, 63, 0.08), rgba(255, 248, 237, 0.95))" }}>
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--color-muted)" }}>
          Quản trị thuộc tính động
        </div>
        <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.02 }}>Thuộc tính và giá trị</h1>
        <p style={{ margin: 0, maxWidth: 760, color: "var(--color-muted)", lineHeight: 1.8 }}>
          Đây là lớp dữ liệu dùng chung cho bộ lọc sản phẩm, SKU và PC Builder. Mỗi thuộc tính có thể có nhiều giá trị và được gán trực tiếp vào SKU.
        </p>
      </section>

      {errorMessage ? <div style={{ padding: 16, borderRadius: 18, background: "rgba(185, 28, 28, 0.08)", border: "1px solid rgba(185, 28, 28, 0.16)", color: "#991b1b" }}>{errorMessage}</div> : null}
      {successMessage ? <div style={{ padding: 16, borderRadius: 18, background: "rgba(15, 76, 63, 0.08)", border: "1px solid rgba(15, 76, 63, 0.16)", color: "#0f4c3f" }}>{successMessage}</div> : null}

      <div style={{ display: "grid", gridTemplateColumns: "380px 380px minmax(0, 1fr)", gap: 24, alignItems: "start" }}>
        <section style={{ ...panelStyle, display: "grid", gap: 16 }}>
          <h2 style={{ margin: 0, fontSize: 28 }}>{editingAttributeId ? "Sửa thuộc tính" : "Thêm thuộc tính"}</h2>
          <form onSubmit={handleSubmitAttribute} style={{ display: "grid", gap: 12 }}>
            <input value={attributeName} onChange={(event) => setAttributeName(event.target.value)} placeholder="Ví dụ: Socket, RAM Type, Chipset" style={inputStyle} />
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" disabled={submitting} style={{ padding: "13px 18px", borderRadius: 16, border: "none", background: "var(--color-accent)", color: "#fff", fontWeight: 800 }}>
                {editingAttributeId ? "Cập nhật" : "Thêm mới"}
              </button>
              {editingAttributeId ? <button type="button" onClick={resetAttributeForm} style={{ padding: "13px 18px", borderRadius: 16, border: "1px solid var(--color-line)", background: "#fff", fontWeight: 700 }}>Bỏ chọn</button> : null}
            </div>
          </form>
        </section>

        <section style={{ ...panelStyle, display: "grid", gap: 16 }}>
          <h2 style={{ margin: 0, fontSize: 28 }}>{editingValueId ? "Sửa giá trị" : "Thêm giá trị"}</h2>
          <form onSubmit={handleSubmitValue} style={{ display: "grid", gap: 12 }}>
            <select value={valueForm.attributeId} onChange={(event) => setValueForm((prev) => ({ ...prev, attributeId: event.target.value }))} style={inputStyle}>
              <option value="">Chọn thuộc tính</option>
              {attributes.map((attribute) => <option key={attribute.id} value={attribute.id}>{attribute.name}</option>)}
            </select>
            <input value={valueForm.value} onChange={(event) => setValueForm((prev) => ({ ...prev, value: event.target.value }))} placeholder="Ví dụ: LGA1700, DDR5, ATX" style={inputStyle} />
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" disabled={submitting} style={{ padding: "13px 18px", borderRadius: 16, border: "none", background: "var(--color-accent)", color: "#fff", fontWeight: 800 }}>
                {editingValueId ? "Cập nhật" : "Thêm giá trị"}
              </button>
              {editingValueId ? <button type="button" onClick={resetValueForm} style={{ padding: "13px 18px", borderRadius: 16, border: "1px solid var(--color-line)", background: "#fff", fontWeight: 700 }}>Bỏ chọn</button> : null}
            </div>
          </form>
        </section>

        <section style={{ ...panelStyle, display: "grid", gap: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 16 }}>
            <div>
              <h2 style={{ margin: "0 0 6px", fontSize: 30 }}>Danh sách thuộc tính</h2>
              <div style={{ color: "var(--color-muted)" }}>{attributes.length} thuộc tính, {totalValues} giá trị</div>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 20, borderRadius: 18, background: "rgba(255, 248, 237, 0.8)", color: "var(--color-muted)" }}>Đang tải dữ liệu...</div>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {attributes.map((attribute) => (
                <div key={attribute.id} style={{ border: "1px solid var(--color-line)", borderRadius: 20, padding: 18, display: "grid", gap: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 800 }}>{attribute.name}</div>
                      <div style={{ color: "var(--color-muted)", marginTop: 4 }}>{attribute.values?.length || 0} giá trị</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="button" onClick={() => { setEditingAttributeId(attribute.id); setAttributeName(attribute.name); }} style={{ padding: "10px 12px", borderRadius: 14, border: "1px solid rgba(15, 76, 63, 0.16)", background: "rgba(15, 76, 63, 0.08)", color: "#0f4c3f", fontWeight: 700 }}>Sửa</button>
                      <button type="button" onClick={() => handleDeleteAttribute(attribute.id)} style={{ padding: "10px 12px", borderRadius: 14, border: "1px solid rgba(185, 28, 28, 0.18)", background: "rgba(185, 28, 28, 0.08)", color: "#991b1b", fontWeight: 700 }}>Xóa</button>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {(attribute.values || []).map((value) => (
                      <span key={value.id} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, background: "rgba(15, 76, 63, 0.08)", color: "#0f4c3f", fontWeight: 700 }}>
                        {value.value}
                        <button type="button" onClick={() => { setEditingValueId(value.id); setValueForm({ attributeId: String(attribute.id), value: value.value }); }} style={{ border: "none", background: "transparent", color: "inherit", cursor: "pointer", fontWeight: 800 }}>Sửa</button>
                        <button type="button" onClick={() => handleDeleteValue(value.id)} style={{ border: "none", background: "transparent", color: "#991b1b", cursor: "pointer", fontWeight: 800 }}>Xóa</button>
                      </span>
                    ))}
                    {(!attribute.values || attribute.values.length === 0) ? <div style={{ color: "var(--color-muted)" }}>Chưa có giá trị nào cho thuộc tính này.</div> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
