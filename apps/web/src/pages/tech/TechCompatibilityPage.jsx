import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

function getErrorMessage(error, fallback) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }
  return error?.message || fallback;
}

function normalizeRulesResponse(response) {
  const payload = response?.data || response;
  if (Array.isArray(payload)) return payload;
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

export function TechCompatibilityPage() {
  const [rules, setRules] = useState([]);
  const [formValues, setFormValues] = useState(createInitialFormState());
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const sortedRules = useMemo(
    () => [...rules].sort((a, b) => Number(b.id || 0) - Number(a.id || 0)),
    [rules]
  );

  useEffect(() => {
    async function loadRules() {
      try {
        setLoading(true);
        const response = await getAdminCompatibilityRules();
        setRules(normalizeRulesResponse(response).map(normalizeRule));
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Không thể tải luật tương thích."));
      } finally {
        setLoading(false);
      }
    }
    loadRules();
  }, []);

  useEffect(() => {
    if (!successMessage) return undefined;
    const timer = setTimeout(() => setSuccessMessage(""), 3500);
    return () => clearTimeout(timer);
  }, [successMessage]);

  function resetForm() {
    setFormValues(createInitialFormState());
    setEditingRuleId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!formValues.name.trim()) {
      setErrorMessage("Nhập tên rule.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
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
      setRules((prev) =>
        editingRuleId ? prev.map((rule) => (rule.id === savedRule.id ? savedRule : rule)) : [savedRule, ...prev]
      );
      setSuccessMessage(editingRuleId ? "Đã cập nhật rule." : "Đã tạo rule mới.");
      resetForm();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể lưu rule."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(rule) {
    const nextStatus = rule.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const response = await changeAdminCompatibilityRuleStatus(rule.id, nextStatus);
      const updated = normalizeRule(response?.data || response);
      setRules((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setSuccessMessage(`Rule #${rule.id} → ${nextStatus}`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể đổi trạng thái."));
    }
  }

  return (
    <div className="tech-compat">
      <section className="tech-page-head">
        <div>
          <p className="tech-eyebrow">Nhân viên kỹ thuật</p>
          <h1>Luật tương thích PC Builder</h1>
          <p>Cấu hình các rule kiểm tra socket, RAM, PSU và những ràng buộc giữa các nhóm linh kiện trong PC Builder.</p>
        </div>
        <div className="tech-head-actions">
          <Link to="/tech/tickets" className="tech-btn tech-btn--secondary">
            ← Ticket kỹ thuật
          </Link>
          <Link to="/pc-builder" target="_blank" rel="noreferrer" className="tech-btn tech-btn--secondary">
            Mở PC Builder
          </Link>
        </div>
      </section>

      {errorMessage ? <div className="tech-alert tech-alert--error">{errorMessage}</div> : null}
      {successMessage ? <div className="tech-alert tech-alert--success">{successMessage}</div> : null}

      <div className="tech-compat-workspace">
        <section className="tech-card tech-compat-form">
          <div className="tech-section-title">
            <h3>{editingRuleId ? `Sửa rule #${editingRuleId}` : "Thêm rule mới"}</h3>
            <p>Định nghĩa cặp linh kiện và thuộc tính cần khớp để trình dựng cấu hình đánh giá tương thích.</p>
          </div>

          <form onSubmit={handleSubmit} className="tech-form-grid">
            <label>
              Tên rule
              <input name="name" value={formValues.name} onChange={(event) => setFormValues({ ...formValues, name: event.target.value })} />
            </label>

            <label>
              Nguồn (source)
              <select
                name="sourceComponentType"
                value={formValues.sourceComponentType}
                onChange={(event) => setFormValues({ ...formValues, sourceComponentType: event.target.value })}
              >
                {COMPONENT_OPTIONS.map((component) => (
                  <option key={component} value={component}>
                    {component}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Đích (target)
              <select
                name="targetComponentType"
                value={formValues.targetComponentType}
                onChange={(event) => setFormValues({ ...formValues, targetComponentType: event.target.value })}
              >
                {COMPONENT_OPTIONS.map((component) => (
                  <option key={component} value={component}>
                    {component}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Loại rule
              <select name="ruleType" value={formValues.ruleType} onChange={(event) => setFormValues({ ...formValues, ruleType: event.target.value })}>
                {RULE_TYPE_OPTIONS.map((ruleType) => (
                  <option key={ruleType} value={ruleType}>
                    {ruleType}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Source attribute
              <input
                name="sourceAttributeKey"
                value={formValues.sourceAttributeKey}
                onChange={(event) => setFormValues({ ...formValues, sourceAttributeKey: event.target.value })}
              />
            </label>

            <label>
              Target attribute
              <input
                name="targetAttributeKey"
                value={formValues.targetAttributeKey}
                onChange={(event) => setFormValues({ ...formValues, targetAttributeKey: event.target.value })}
              />
            </label>

            <label className="tech-form-span">
              Mô tả
              <textarea
                name="description"
                rows={3}
                value={formValues.description}
                onChange={(event) => setFormValues({ ...formValues, description: event.target.value })}
              />
            </label>

            <div className="tech-action-row">
              <button type="submit" className="tech-btn tech-btn--primary" disabled={submitting}>
                {submitting ? "Đang lưu..." : editingRuleId ? "Cập nhật" : "Tạo rule"}
              </button>
              {editingRuleId ? (
                <button type="button" className="tech-btn tech-btn--secondary" onClick={resetForm}>
                  Hủy sửa
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="tech-card">
          <div className="tech-section-title">
            <h3>Danh sách rule ({sortedRules.length})</h3>
            <p>Bật hoặc tắt rule để kiểm soát PC Builder ngay lập tức.</p>
          </div>

          {loading ? (
            <div className="tech-empty">Đang tải...</div>
          ) : sortedRules.length === 0 ? (
            <div className="tech-empty">Chưa có rule nào.</div>
          ) : (
            <div className="tech-rule-list">
              {sortedRules.map((rule) => (
                <div key={rule.id} className="tech-rule-row">
                  <div>
                    <strong>
                      #{rule.id} {rule.name}
                    </strong>
                    <span>
                      {rule.sourceComponentType} → {rule.targetComponentType} · {rule.ruleType}
                    </span>
                    <span>
                      {rule.sourceAttributeKey} ↔ {rule.targetAttributeKey}
                    </span>
                    {rule.description ? <span>{rule.description}</span> : null}
                  </div>

                  <div className="tech-rule-row__actions">
                    <span className={`tech-status tech-status--${rule.status === "ACTIVE" ? "success" : "neutral"}`}>{rule.status}</span>
                    <button type="button" className="tech-btn tech-btn--secondary" onClick={() => handleToggleStatus(rule)}>
                      {rule.status === "ACTIVE" ? "Tắt" : "Bật"}
                    </button>
                    <button
                      type="button"
                      className="tech-btn tech-btn--secondary"
                      onClick={() => {
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
                      }}
                    >
                      Sửa
                    </button>
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
