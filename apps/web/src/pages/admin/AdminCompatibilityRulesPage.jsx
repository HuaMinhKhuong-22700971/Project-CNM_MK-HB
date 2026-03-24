import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  changeAdminCompatibilityRuleStatus,
  createAdminCompatibilityRule,
  getAdminCompatibilityRules,
  updateAdminCompatibilityRule
} from "../../services/admin-compatibility.service";

const COMPONENT_OPTIONS = ["CPU", "MAINBOARD", "RAM", "GPU", "STORAGE", "PSU", "CASE"];
const RULE_TYPE_OPTIONS = ["ATTRIBUTE_MATCH", "ATTRIBUTE_NOT_MATCH"];

function createInitialFormState() {
  return {
    name: "",
    sourceComponentType: "CPU",
    targetComponentType: "MAINBOARD",
    ruleType: "ATTRIBUTE_MATCH",
    sourceAttributeKey: "socket",
    targetAttributeKey: "socket",
    description: ""
  };
}

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }

  return error.message || fallbackMessage;
}

function normalizeRulesResponse(response) {
  const payload = response?.data || response;

  if (Array.isArray(payload)) {
    return payload;
  }

  return Array.isArray(payload?.items) ? payload.items : [];
}

function normalizeRule(rule) {
  return {
    id: rule?.id,
    name: rule?.name || rule?.description || "Rule",
    sourceComponentType: String(rule?.sourceComponentType || rule?.source_component_type || "").toUpperCase(),
    targetComponentType: String(rule?.targetComponentType || rule?.target_component_type || "").toUpperCase(),
    ruleType: String(rule?.ruleType || rule?.rule_type || "ATTRIBUTE_MATCH").toUpperCase(),
    sourceAttributeKey: rule?.sourceAttributeKey || rule?.source_attribute_key || "",
    targetAttributeKey: rule?.targetAttributeKey || rule?.target_attribute_key || "",
    description: rule?.description || "",
    status: String(rule?.status || "ACTIVE").toUpperCase()
  };
}

function validateForm(values) {
  const errors = {};

  if (!String(values.name || "").trim()) {
    errors.name = "Nhập tên rule.";
  }

  if (!String(values.ruleType || "").trim()) {
    errors.ruleType = "Chọn loại rule.";
  }

  if (!String(values.sourceAttributeKey || "").trim()) {
    errors.sourceAttributeKey = "Nhập source attribute key.";
  }

  if (!String(values.targetAttributeKey || "").trim()) {
    errors.targetAttributeKey = "Nhập target attribute key.";
  }

  return errors;
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

export function AdminCompatibilityRulesPage() {
  const [rules, setRules] = useState([]);
  const [formValues, setFormValues] = useState(createInitialFormState());
  const [formErrors, setFormErrors] = useState({});
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const sortedRules = useMemo(() => {
    return [...rules].sort((left, right) => Number(right.id || 0) - Number(left.id || 0));
  }, [rules]);

  useEffect(() => {
    async function loadRules() {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await getAdminCompatibilityRules();
        setRules(normalizeRulesResponse(response).map(normalizeRule));
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Không thể tải danh sách luật tương thích."));
      } finally {
        setLoading(false);
      }
    }

    loadRules();
  }, []);

  function resetForm() {
    setFormValues(createInitialFormState());
    setFormErrors({});
    setEditingRuleId(null);
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setFormValues((prevState) => ({
      ...prevState,
      [name]: value
    }));

    setFormErrors((prevState) => ({
      ...prevState,
      [name]: ""
    }));

    setErrorMessage("");
    setSuccessMessage("");
  }

  function handleEditRule(rule) {
    setEditingRuleId(rule.id);
    setFormValues({
      name: rule.name,
      sourceComponentType: rule.sourceComponentType,
      targetComponentType: rule.targetComponentType,
      ruleType: rule.ruleType,
      sourceAttributeKey: rule.sourceAttributeKey,
      targetAttributeKey: rule.targetAttributeKey,
      description: rule.description
    });
    setFormErrors({});
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleSubmit(event) {
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
        sourceComponentType: formValues.sourceComponentType,
        targetComponentType: formValues.targetComponentType,
        ruleType: formValues.ruleType,
        sourceAttributeKey: formValues.sourceAttributeKey.trim(),
        targetAttributeKey: formValues.targetAttributeKey.trim(),
        description: String(formValues.description || "").trim()
      };

      const response = editingRuleId
        ? await updateAdminCompatibilityRule(editingRuleId, payload)
        : await createAdminCompatibilityRule(payload);

      const savedRule = normalizeRule(response?.data || response);

      setRules((prevState) => {
        if (editingRuleId) {
          return prevState.map((rule) => (rule.id === savedRule.id ? savedRule : rule));
        }

        return [savedRule, ...prevState];
      });

      setSuccessMessage(editingRuleId ? "Đã cập nhật luật tương thích." : "Đã tạo luật mới.");
      resetForm();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể lưu luật tương thích."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(rule) {
    const nextStatus = rule.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      setStatusLoadingId(rule.id);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await changeAdminCompatibilityRuleStatus(rule.id, nextStatus);
      const updatedRule = normalizeRule(response?.data || response);

      setRules((prevState) => prevState.map((item) => (item.id === updatedRule.id ? updatedRule : item)));
      setSuccessMessage(`Đã đổi trạng thái rule sang ${nextStatus}.`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể đổi trạng thái rule."));
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
          Compatibility rules
        </div>
        <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.02 }}>Luật tương thích linh kiện</h1>
        <p style={{ margin: 0, maxWidth: 780, color: "var(--color-muted)", lineHeight: 1.8 }}>
          Quản lý source component, target component, rule type và các attribute key để giải thích luồng kiểm tra tương thích của PC Builder.
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

      <div style={{ display: "grid", gridTemplateColumns: "430px minmax(0, 1fr)", gap: 24, alignItems: "start" }}>
        <section style={{ ...panelStyle, display: "grid", gap: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: 28 }}>{editingRuleId ? "Chỉnh sửa rule" : "Thêm rule mới"}</h2>
              <div style={{ color: "var(--color-muted)", lineHeight: 1.7 }}>
                Form này tập trung vào tính đúng logic hơn là phần trang trí, để thuận tiện cho việc thuyết trình và theo dõi.
              </div>
            </div>
            {editingRuleId ? (
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

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <label htmlFor="name" style={{ fontWeight: 700 }}>Tên rule</label>
              <input id="name" name="name" value={formValues.name} onChange={handleFormChange} style={inputStyle} />
              {formErrors.name ? <span style={{ color: "#b91c1c", fontSize: 14 }}>{formErrors.name}</span> : null}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ display: "grid", gap: 6 }}>
                <label htmlFor="sourceComponentType" style={{ fontWeight: 700 }}>Linh kiện nguồn</label>
                <select id="sourceComponentType" name="sourceComponentType" value={formValues.sourceComponentType} onChange={handleFormChange} style={inputStyle}>
                  {COMPONENT_OPTIONS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label htmlFor="targetComponentType" style={{ fontWeight: 700 }}>Linh kiện đích</label>
                <select id="targetComponentType" name="targetComponentType" value={formValues.targetComponentType} onChange={handleFormChange} style={inputStyle}>
                  {COMPONENT_OPTIONS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label htmlFor="ruleType" style={{ fontWeight: 700 }}>Loại rule</label>
              <select id="ruleType" name="ruleType" value={formValues.ruleType} onChange={handleFormChange} style={inputStyle}>
                {RULE_TYPE_OPTIONS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              {formErrors.ruleType ? <span style={{ color: "#b91c1c", fontSize: 14 }}>{formErrors.ruleType}</span> : null}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ display: "grid", gap: 6 }}>
                <label htmlFor="sourceAttributeKey" style={{ fontWeight: 700 }}>Source attribute key</label>
                <input id="sourceAttributeKey" name="sourceAttributeKey" value={formValues.sourceAttributeKey} onChange={handleFormChange} style={inputStyle} />
                {formErrors.sourceAttributeKey ? <span style={{ color: "#b91c1c", fontSize: 14 }}>{formErrors.sourceAttributeKey}</span> : null}
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label htmlFor="targetAttributeKey" style={{ fontWeight: 700 }}>Target attribute key</label>
                <input id="targetAttributeKey" name="targetAttributeKey" value={formValues.targetAttributeKey} onChange={handleFormChange} style={inputStyle} />
                {formErrors.targetAttributeKey ? <span style={{ color: "#b91c1c", fontSize: 14 }}>{formErrors.targetAttributeKey}</span> : null}
              </div>
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label htmlFor="description" style={{ fontWeight: 700 }}>Mô tả</label>
              <textarea id="description" name="description" rows={5} value={formValues.description} onChange={handleFormChange} style={{ ...inputStyle, resize: "vertical" }} />
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
              {submitting ? "Đang lưu..." : editingRuleId ? "Cập nhật rule" : "Thêm rule"}
            </button>
          </form>
        </section>

        <section style={{ ...panelStyle, display: "grid", gap: 18 }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: 30 }}>Danh sách rules</h2>
            <div style={{ color: "var(--color-muted)", lineHeight: 1.7 }}>
              Bảng hiển thị mỗi rule theo tên, cặp linh kiện, key đối chiếu và trạng thái kích hoạt.
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 20, borderRadius: 18, background: "rgba(255, 248, 237, 0.8)", color: "var(--color-muted)" }}>
              Đang tải danh sách rules...
            </div>
          ) : sortedRules.length === 0 ? (
            <div style={{ padding: 20, borderRadius: 18, background: "rgba(255, 248, 237, 0.8)", color: "var(--color-muted)" }}>
              Chưa có rule nào trong hệ thống.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid var(--color-line)", color: "var(--color-muted)", textTransform: "uppercase", fontSize: 12, letterSpacing: "0.08em" }}>
                    <th style={{ padding: "12px 10px" }}>Rule</th>
                    <th style={{ padding: "12px 10px" }}>Linh kiện nguồn</th>
                    <th style={{ padding: "12px 10px" }}>Linh kiện đích</th>
                    <th style={{ padding: "12px 10px" }}>Loại rule</th>
                    <th style={{ padding: "12px 10px" }}>Trạng thái</th>
                    <th style={{ padding: "12px 10px" }}>Tác vụ</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRules.map((rule) => (
                    <tr key={rule.id} style={{ borderBottom: "1px solid rgba(214, 208, 196, 0.7)" }}>
                      <td style={{ padding: "16px 10px" }}>
                        <div style={{ display: "grid", gap: 4 }}>
                          <div style={{ fontWeight: 800 }}>{rule.name}</div>
                          <div style={{ fontSize: 14, color: "var(--color-muted)", lineHeight: 1.6 }}>
                            {rule.description || "Không có mô tả bổ sung."}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 10px" }}>
                        <div style={{ fontWeight: 700 }}>{rule.sourceComponentType}</div>
                        <div style={{ fontSize: 14, color: "var(--color-muted)" }}>{rule.sourceAttributeKey}</div>
                      </td>
                      <td style={{ padding: "16px 10px" }}>
                        <div style={{ fontWeight: 700 }}>{rule.targetComponentType}</div>
                        <div style={{ fontSize: 14, color: "var(--color-muted)" }}>{rule.targetAttributeKey}</div>
                      </td>
                      <td style={{ padding: "16px 10px" }}>{rule.ruleType}</td>
                      <td style={{ padding: "16px 10px" }}>
                        <span style={{ display: "inline-flex", padding: "7px 12px", borderRadius: 999, fontSize: 12, fontWeight: 800, background: rule.status === "ACTIVE" ? "rgba(15, 76, 63, 0.12)" : "rgba(95, 108, 106, 0.12)", color: rule.status === "ACTIVE" ? "#0f4c3f" : "#5f6c6a" }}>
                          {rule.status}
                        </span>
                      </td>
                      <td style={{ padding: "16px 10px" }}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            type="button"
                            onClick={() => handleEditRule(rule)}
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
                            onClick={() => handleToggleStatus(rule)}
                            disabled={statusLoadingId === rule.id}
                            style={{
                              padding: "9px 12px",
                              borderRadius: 14,
                              border: "1px solid var(--color-line)",
                              background: "var(--color-surface)",
                              color: "var(--color-ink)",
                              fontWeight: 700,
                              opacity: statusLoadingId === rule.id ? 0.72 : 1
                            }}
                          >
                            {statusLoadingId === rule.id ? "Đang đổi..." : rule.status === "ACTIVE" ? "Tạm tắt" : "Kích hoạt"}
                          </button>
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
