import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../../hooks/useAuth";
import {
  activateWarranty,
  getEligibleWarrantyItems,
  getMyWarrantyRequests,
  getMyWarranties,
  lookupWarranty,
  submitWarrantyRequest
} from "../../services/warranty.service";

const STATUS_META = {
  ACTIVE: { label: "Còn bảo hành", tone: "#047857", bg: "#ecfdf5", border: "#bbf7d0" },
  EXPIRED: { label: "Hết bảo hành", tone: "#b91c1c", bg: "#fef2f2", border: "#fecaca" },
  RECEIVED: { label: "Đã tiếp nhận", tone: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
  INSPECTING: { label: "Đang kiểm tra", tone: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  REPAIRING: { label: "Đang sửa", tone: "#b45309", bg: "#fffbeb", border: "#fde68a" },
  COMPLETED: { label: "Hoàn tất", tone: "#047857", bg: "#ecfdf5", border: "#bbf7d0" }
};

const DEFAULT_TIMELINE = [
  { key: "RECEIVED", label: "Đã tiếp nhận" },
  { key: "INSPECTING", label: "Đang kiểm tra" },
  { key: "REPAIRING", label: "Đang sửa" },
  { key: "COMPLETED", label: "Hoàn tất" }
];

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }
  return error?.message || fallbackMessage;
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString("vi-VN") : "-";
}

function getStatusMeta(status) {
  return STATUS_META[String(status || "").toUpperCase()] || STATUS_META.ACTIVE;
}

function getTimeline(status, timeline) {
  if (Array.isArray(timeline) && timeline.length > 0) return timeline;
  const normalized = String(status || "RECEIVED").toUpperCase();
  const activeIndex = Math.max(DEFAULT_TIMELINE.findIndex((step) => step.key === normalized), 0);
  return DEFAULT_TIMELINE.map((step, index) => ({ ...step, done: index <= activeIndex }));
}

function getQrImageUrl(warrantyCode) {
  const url = `${window.location.origin}/warranties?lookup=${encodeURIComponent(warrantyCode || "")}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(url)}`;
}

function Timeline({ status, timeline }) {
  const steps = getTimeline(status, timeline);
  return (
    <div className="warranty-timeline">
      {steps.map((step) => (
        <div key={step.key} className={`warranty-step${step.done ? " warranty-step--done" : ""}`}>
          <span />
          <strong>{step.label}</strong>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const meta = getStatusMeta(status);
  return (
    <span style={{ display: "inline-flex", padding: "6px 10px", borderRadius: 999, background: meta.bg, border: `1px solid ${meta.border}`, color: meta.tone, fontSize: 12, fontWeight: 900 }}>
      {meta.label}
    </span>
  );
}

export function WarrantiesPage() {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [eligibleItems, setEligibleItems] = useState([]);
  const [myWarranties, setMyWarranties] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lookupCode, setLookupCode] = useState(searchParams.get("lookup") || "");
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [selectedOrderItemId, setSelectedOrderItemId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [requestForm, setRequestForm] = useState({
    lookupValue: searchParams.get("lookup") || "",
    customerName: "",
    customerPhone: "",
    issueDescription: "",
    media: null
  });

  async function loadUserData() {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [eligibleResp, myResp, requestResp] = await Promise.all([
        getEligibleWarrantyItems(),
        getMyWarranties(),
        getMyWarrantyRequests()
      ]);
      const eligible = eligibleResp?.data || [];
      setEligibleItems(eligible);
      setMyWarranties(myResp?.data || []);
      setMyRequests(requestResp?.data || []);
      if (eligible.length > 0) setSelectedOrderItemId(String(eligible[0].id));
    } catch (_error) {
      setMessage({ type: "error", text: "Không thể tải dữ liệu bảo hành tài khoản." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUserData();
  }, [isAuthenticated]);

  useEffect(() => {
    const lookup = searchParams.get("lookup");
    if (lookup) {
      setLookupCode(lookup);
      setRequestForm((prev) => ({ ...prev, lookupValue: lookup }));
    }
  }, [searchParams]);

  const stats = useMemo(() => {
    const active = myWarranties.filter((item) => String(item.status).toUpperCase() === "ACTIVE").length;
    const expiring = myWarranties.filter((item) => {
      if (!item.expiresAt) return false;
      const days = (new Date(item.expiresAt).getTime() - Date.now()) / 86400000;
      return days >= 0 && days <= 30;
    }).length;
    return {
      total: myWarranties.length,
      active,
      expiring,
      requests: myRequests.length
    };
  }, [myRequests, myWarranties]);

  async function handleLookup(event) {
    event.preventDefault();
    if (!lookupCode.trim()) return;

    try {
      setLookupLoading(true);
      setLookupError("");
      setLookupResult(null);
      const response = await lookupWarranty(lookupCode.trim());
      setLookupResult(response.data);
      setRequestForm((prev) => ({ ...prev, lookupValue: lookupCode.trim(), warrantyId: response.data?.id }));
    } catch (error) {
      setLookupError(getErrorMessage(error, "Không tìm thấy thông tin bảo hành. Vui lòng kiểm tra mã đơn hàng, serial hoặc số điện thoại."));
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleActivate(event) {
    event.preventDefault();
    if (!selectedOrderItemId) return;

    try {
      setSubmitting(true);
      setMessage({ type: "", text: "" });
      const response = await activateWarranty({ orderItemId: Number(selectedOrderItemId) });
      setMessage({ type: "success", text: `Đã kích hoạt bảo hành: ${response.data.warrantyCode}` });
      await loadUserData();
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error, "Không thể kích hoạt bảo hành.") });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitRequest(event) {
    event.preventDefault();
    try {
      setSubmitting(true);
      setMessage({ type: "", text: "" });
      await submitWarrantyRequest(requestForm);
      setMessage({ type: "success", text: "Đã gửi yêu cầu bảo hành. Bộ phận kỹ thuật sẽ tiếp nhận và cập nhật tiến trình." });
      setRequestForm((prev) => ({ ...prev, issueDescription: "", media: null }));
      if (isAuthenticated) await loadUserData();
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error, "Không thể gửi yêu cầu bảo hành.") });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="warranty-page">
      <style>{`
        .warranty-page { min-height: 100vh; background: #f8fafc; padding: 34px 20px 80px; }
        .warranty-shell { max-width: 1220px; margin: 0 auto; display: grid; gap: 24px; }
        .warranty-hero { padding: 34px; border-radius: 28px; background: linear-gradient(135deg, #0f172a, #1e293b); color: #fff; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 24px; align-items: end; }
        .warranty-grid { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 24px; align-items: start; }
        .warranty-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 22px; box-shadow: 0 18px 48px rgba(15,23,42,0.06); }
        .warranty-card__body { padding: 24px; }
        .warranty-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
        .warranty-stat { padding: 18px; border-radius: 18px; background: #fff; border: 1px solid #e2e8f0; }
        .warranty-input { width: 100%; height: 46px; border-radius: 12px; border: 1px solid #dbe4ef; background: #f8fafc; padding: 0 14px; box-sizing: border-box; outline: none; font-weight: 650; }
        .warranty-textarea { width: 100%; min-height: 110px; border-radius: 12px; border: 1px solid #dbe4ef; background: #f8fafc; padding: 14px; box-sizing: border-box; outline: none; resize: vertical; font-weight: 650; font-family: inherit; }
        .warranty-btn { height: 46px; border-radius: 12px; border: none; background: #2563eb; color: #fff; font-weight: 900; cursor: pointer; padding: 0 16px; }
        .warranty-btn--light { background: #fff; color: #0f172a; border: 1px solid #dbe4ef; }
        .warranty-timeline { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
        .warranty-step { display: grid; gap: 6px; color: #94a3b8; font-size: 12px; font-weight: 800; }
        .warranty-step span { height: 7px; border-radius: 999px; background: #e2e8f0; }
        .warranty-step--done { color: #047857; }
        .warranty-step--done span { background: linear-gradient(90deg, #22c55e, #14b8a6); }
        .warranty-product { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 18px; padding: 18px; border: 1px solid #edf2f7; border-radius: 18px; }
        @media (max-width: 980px) {
          .warranty-hero, .warranty-grid { grid-template-columns: 1fr; }
          .warranty-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 620px) {
          .warranty-page { padding: 18px 12px 60px; }
          .warranty-hero { padding: 24px; }
          .warranty-stats, .warranty-timeline, .warranty-product { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="warranty-shell">
        <section className="warranty-hero">
          <div>
            <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em", color: "#93c5fd", fontWeight: 900 }}>PC Mall warranty center</div>
            <h1 style={{ margin: "10px 0", fontSize: 42, lineHeight: 1.04 }}>Bảo hành điện tử linh kiện PC</h1>
            <p style={{ margin: 0, color: "#cbd5e1", maxWidth: 760, lineHeight: 1.7 }}>
              Tra cứu bằng mã đơn hàng, serial, số điện thoại hoặc QR. Khách đã đăng nhập có dashboard sản phẩm còn bảo hành, upload ảnh/video lỗi và theo dõi tiến trình xử lý.
            </p>
          </div>
          <Link to="/orders" className="warranty-btn warranty-btn--light" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>Đơn hàng của tôi</Link>
        </section>

        {isAuthenticated ? (
          <section className="warranty-stats">
            <div className="warranty-stat"><div style={{ color: "#64748b", fontWeight: 800 }}>Tổng bảo hành</div><strong style={{ fontSize: 30 }}>{stats.total}</strong></div>
            <div className="warranty-stat"><div style={{ color: "#64748b", fontWeight: 800 }}>Còn hiệu lực</div><strong style={{ fontSize: 30, color: "#047857" }}>{stats.active}</strong></div>
            <div className="warranty-stat"><div style={{ color: "#64748b", fontWeight: 800 }}>Sắp hết hạn</div><strong style={{ fontSize: 30, color: "#b45309" }}>{stats.expiring}</strong></div>
            <div className="warranty-stat"><div style={{ color: "#64748b", fontWeight: 800 }}>Yêu cầu đã gửi</div><strong style={{ fontSize: 30, color: "#1d4ed8" }}>{stats.requests}</strong></div>
          </section>
        ) : null}

        {message.text ? (
          <div style={{ padding: 16, borderRadius: 16, background: message.type === "success" ? "#ecfdf5" : "#fef2f2", border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fecaca"}`, color: message.type === "success" ? "#047857" : "#b91c1c", fontWeight: 800 }}>
            {message.text}
          </div>
        ) : null}

        <div className="warranty-grid">
          <main style={{ display: "grid", gap: 24 }}>
            {isAuthenticated ? (
              <section className="warranty-card">
                <div className="warranty-card__body">
                  <h2 style={{ margin: "0 0 18px", fontSize: 24 }}>Sản phẩm còn bảo hành</h2>
                  {loading ? (
                    <div style={{ color: "#64748b" }}>Đang tải dữ liệu bảo hành...</div>
                  ) : myWarranties.length > 0 ? (
                    <div style={{ display: "grid", gap: 14 }}>
                      {myWarranties.map((warranty) => (
                        <article key={warranty.id} className="warranty-product">
                          <div style={{ display: "grid", gap: 10 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                              <div>
                                <h3 style={{ margin: 0, fontSize: 18 }}>{warranty.item?.productName || "Sản phẩm"}</h3>
                                <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>SKU/Serial: {warranty.item?.sku || "-"} · Mã BH: <strong>{warranty.warrantyCode}</strong></div>
                              </div>
                              <StatusBadge status={warranty.status} />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, color: "#475569", fontSize: 14 }}>
                              <div>Kích hoạt: <strong>{formatDate(warranty.activatedAt)}</strong></div>
                              <div>Hết hạn: <strong>{formatDate(warranty.expiresAt)}</strong></div>
                              <div>Đơn hàng: <strong>#{warranty.orderId || "-"}</strong></div>
                            </div>
                            <Timeline status={warranty.status} timeline={warranty.timeline} />
                          </div>
                          <div style={{ display: "grid", gap: 8, justifyItems: "center" }}>
                            <img src={getQrImageUrl(warranty.warrantyCode)} alt={`QR ${warranty.warrantyCode}`} width="92" height="92" style={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                            <button type="button" className="warranty-btn warranty-btn--light" style={{ height: 36 }} onClick={() => setRequestForm((prev) => ({ ...prev, lookupValue: warranty.warrantyCode, warrantyId: warranty.id }))}>Gửi yêu cầu</button>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: 30, textAlign: "center", background: "#f8fafc", borderRadius: 16, color: "#64748b" }}>Chưa có sản phẩm bảo hành. Hệ thống sẽ tự tạo khi đơn hàng được giao thành công.</div>
                  )}
                </div>
              </section>
            ) : (
              <section className="warranty-card">
                <div className="warranty-card__body">
                  <h2 style={{ margin: "0 0 14px", fontSize: 24 }}>Khách vãng lai</h2>
                  <p style={{ marginTop: 0, color: "#64748b", lineHeight: 1.7 }}>Bạn có thể tra cứu và gửi yêu cầu bảo hành mà không cần đăng nhập. Đăng nhập sẽ giúp theo dõi đầy đủ lịch sử xử lý.</p>
                  <Link to="/login" className="warranty-btn" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>Đăng nhập để quản lý tập trung</Link>
                </div>
              </section>
            )}

            <section className="warranty-card">
              <div className="warranty-card__body">
                <h2 style={{ margin: "0 0 18px", fontSize: 24 }}>Tiến trình yêu cầu bảo hành</h2>
                {myRequests.length > 0 ? (
                  <div style={{ display: "grid", gap: 14 }}>
                    {myRequests.map((request) => (
                      <div key={request.id} style={{ padding: 18, border: "1px solid #edf2f7", borderRadius: 18, display: "grid", gap: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                          <strong>Yêu cầu #{request.id}</strong>
                          <StatusBadge status={request.status} />
                        </div>
                        <div style={{ color: "#64748b", lineHeight: 1.6 }}>{request.issueDescription}</div>
                        <Timeline status={request.status} timeline={request.timeline} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Timeline status="RECEIVED" />
                )}
              </div>
            </section>
          </main>

          <aside style={{ display: "grid", gap: 24 }}>
            <section className="warranty-card">
              <div className="warranty-card__body">
                <h2 style={{ margin: "0 0 14px", fontSize: 22 }}>Tra cứu nhanh</h2>
                <form onSubmit={handleLookup} style={{ display: "grid", gap: 12 }}>
                  <input className="warranty-input" value={lookupCode} onChange={(event) => setLookupCode(event.target.value)} placeholder="Mã đơn, serial, SĐT, mã BH..." />
                  <button className="warranty-btn" disabled={lookupLoading}>{lookupLoading ? "Đang tra cứu..." : "Kiểm tra bảo hành"}</button>
                </form>
                {lookupResult ? (
                  <div style={{ marginTop: 18, padding: 16, borderRadius: 16, background: "#f0f9ff", border: "1px solid #bae6fd", display: "grid", gap: 10 }}>
                    <strong>{lookupResult.productName || lookupResult.item?.productName}</strong>
                    <StatusBadge status={lookupResult.status} />
                    <div style={{ fontSize: 13, color: "#475569" }}>Mã: {lookupResult.warrantyCode}</div>
                    <div style={{ fontSize: 13, color: "#475569" }}>Hết hạn: {formatDate(lookupResult.expiresAt)}</div>
                    <Timeline status={lookupResult.status} timeline={lookupResult.timeline} />
                  </div>
                ) : null}
                {lookupError ? <div style={{ marginTop: 14, color: "#b91c1c", fontWeight: 800, fontSize: 14 }}>{lookupError}</div> : null}
              </div>
            </section>

            <section className="warranty-card">
              <div className="warranty-card__body">
                <h2 style={{ margin: "0 0 14px", fontSize: 22 }}>Gửi yêu cầu bảo hành</h2>
                <form onSubmit={handleSubmitRequest} style={{ display: "grid", gap: 12 }}>
                  <input className="warranty-input" value={requestForm.lookupValue} onChange={(event) => setRequestForm((prev) => ({ ...prev, lookupValue: event.target.value }))} placeholder="Mã BH / serial / mã đơn" />
                  <input className="warranty-input" value={requestForm.customerName} onChange={(event) => setRequestForm((prev) => ({ ...prev, customerName: event.target.value }))} placeholder="Họ tên" />
                  <input className="warranty-input" value={requestForm.customerPhone} onChange={(event) => setRequestForm((prev) => ({ ...prev, customerPhone: event.target.value }))} placeholder="Số điện thoại" />
                  <textarea className="warranty-textarea" value={requestForm.issueDescription} onChange={(event) => setRequestForm((prev) => ({ ...prev, issueDescription: event.target.value }))} placeholder="Mô tả lỗi, tình trạng sản phẩm..." />
                  <input type="file" accept="image/*,video/*" onChange={(event) => setRequestForm((prev) => ({ ...prev, media: event.target.files?.[0] || null }))} />
                  <button className="warranty-btn" disabled={submitting}>{submitting ? "Đang gửi..." : "Gửi yêu cầu"}</button>
                </form>
              </div>
            </section>

            {isAuthenticated && eligibleItems.length > 0 ? (
              <section className="warranty-card">
                <div className="warranty-card__body">
                  <h2 style={{ margin: "0 0 14px", fontSize: 22 }}>Kích hoạt thủ công</h2>
                  <form onSubmit={handleActivate} style={{ display: "grid", gap: 12 }}>
                    <select className="warranty-input" value={selectedOrderItemId} onChange={(event) => setSelectedOrderItemId(event.target.value)}>
                      {eligibleItems.map((item) => <option key={item.id} value={item.id}>{item.productName}</option>)}
                    </select>
                    <button className="warranty-btn" disabled={submitting}>Kích hoạt</button>
                  </form>
                </div>
              </section>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
