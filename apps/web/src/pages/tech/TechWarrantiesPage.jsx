import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  getTechWarrantyRequests,
  updateTechWarrantyRequest
} from "../../services/warranty.service";
import { resolveProductImage } from "../../utils/productImage";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "RECEIVED", label: "Đã tiếp nhận" },
  { value: "INSPECTING", label: "Đang kiểm tra" },
  { value: "REPAIRING", label: "Đang sửa" },
  { value: "WAITING_PARTS", label: "Chờ linh kiện" },
  { value: "REPLACEMENT", label: "Đổi mới" },
  { value: "COMPLETED", label: "Hoàn tất" }
];

const SEVERITY_META = {
  LOW: { label: "Nhẹ", tone: "success" },
  MEDIUM: { label: "Trung bình", tone: "info" },
  HIGH: { label: "Nặng", tone: "warning" },
  CRITICAL: { label: "Khẩn cấp", tone: "danger" }
};

const STATUS_META = {
  RECEIVED: { label: "Đã tiếp nhận", tone: "info" },
  INSPECTING: { label: "Đang kiểm tra", tone: "warning" },
  REPAIRING: { label: "Đang sửa", tone: "warning" },
  WAITING_PARTS: { label: "Chờ linh kiện", tone: "danger" },
  REPLACEMENT: { label: "Đổi mới", tone: "success" },
  COMPLETED: { label: "Hoàn tất", tone: "success" }
};

function getEnvelopeData(response, fallback) {
  if (response && typeof response === "object" && "data" in response) {
    return response.data ?? fallback;
  }
  return response ?? fallback;
}

function getErrorMessage(error, fallback) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }
  return error?.message || fallback;
}

function formatDateTime(value) {
  if (!value) return "Chưa có";
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

function getStatusMeta(status) {
  return STATUS_META[String(status || "RECEIVED").toUpperCase()] || STATUS_META.RECEIVED;
}

function getSeverityMeta(severity) {
  return SEVERITY_META[String(severity || "MEDIUM").toUpperCase()] || SEVERITY_META.MEDIUM;
}

export function TechWarrantiesPage() {
  const [requests, setRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formState, setFormState] = useState({
    status: "INSPECTING",
    technicianNote: "",
    media: []
  });

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getTechWarrantyRequests({
        status: statusFilter || undefined,
        keyword: keyword.trim() || undefined
      });
      const nextRequests = getEnvelopeData(response, []);
      setRequests(Array.isArray(nextRequests) ? nextRequests : []);
      if (Array.isArray(nextRequests) && nextRequests.length > 0) {
        setSelectedRequestId((current) => (nextRequests.some((item) => item.id === current) ? current : nextRequests[0].id));
      } else {
        setSelectedRequestId(null);
      }
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error, "Không thể tải danh sách yêu cầu bảo hành.") });
    } finally {
      setLoading(false);
    }
  }, [keyword, statusFilter]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadRequests();
    }, 15000);
    return () => clearInterval(interval);
  }, [loadRequests]);

  useEffect(() => {
    if (!message.text) return undefined;
    const timer = setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  const selectedRequest = useMemo(
    () => requests.find((item) => item.id === selectedRequestId) || null,
    [requests, selectedRequestId]
  );

  useEffect(() => {
    if (!selectedRequest) return;
    setFormState({
      status: selectedRequest.status || "INSPECTING",
      technicianNote: "",
      media: []
    });
  }, [selectedRequest]);

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((item) => ["RECEIVED", "INSPECTING", "REPAIRING", "WAITING_PARTS", "REPLACEMENT"].includes(String(item.status || "").toUpperCase())).length,
      critical: requests.filter((item) => String(item.severity || "").toUpperCase() === "CRITICAL").length,
      completed: requests.filter((item) => String(item.status || "").toUpperCase() === "COMPLETED").length
    };
  }, [requests]);

  function handleFiles(files) {
    setFormState((prev) => ({
      ...prev,
      media: Array.from(files || []).slice(0, 4)
    }));
  }

  async function handleUpdateRequest(event) {
    event.preventDefault();
    if (!selectedRequest) return;

    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      const response = await updateTechWarrantyRequest(selectedRequest.id, {
        status: formState.status,
        technicianNote: formState.technicianNote,
        media: formState.media
      });
      const updated = getEnvelopeData(response, null);
      setRequests((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setMessage({ type: "success", text: updated.emailMock || "Đã cập nhật tiến trình bảo hành." });
      setFormState((prev) => ({ ...prev, technicianNote: "", media: [] }));
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error, "Không thể cập nhật yêu cầu bảo hành.") });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="tech-warranty-page">
      <style>{`
        .tech-warranty-page { display: grid; gap: 24px; }
        .tech-warranty-hero { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 20px; padding: 28px; border-radius: 28px; background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%); color: #fff; box-shadow: 0 24px 48px rgba(15, 23, 42, 0.16); }
        .tech-warranty-hero__summary { display: grid; gap: 12px; align-content: stretch; }
        .tech-warranty-stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
        .tech-warranty-stat, .tech-warranty-panel { background: #fff; border: 1px solid #dbe4ef; border-radius: 22px; box-shadow: 0 18px 42px rgba(15, 23, 42, 0.06); }
        .tech-warranty-stat { padding: 18px; }
        .tech-warranty-stat span { display: block; color: #64748b; font-size: 13px; font-weight: 800; }
        .tech-warranty-stat strong { display: block; margin-top: 6px; color: #0f172a; font-size: 30px; }
        .tech-warranty-workspace { display: grid; grid-template-columns: 320px minmax(0, 1fr) 360px; gap: 24px; align-items: start; }
        .tech-warranty-panel__body { padding: 22px; display: grid; gap: 16px; }
        .tech-warranty-filters { display: grid; gap: 10px; }
        .tech-warranty-input, .tech-warranty-select, .tech-warranty-textarea { width: 100%; box-sizing: border-box; border-radius: 14px; border: 1px solid #dbe4ef; background: #f8fafc; color: #0f172a; }
        .tech-warranty-input, .tech-warranty-select { min-height: 46px; padding: 0 14px; font-weight: 650; }
        .tech-warranty-textarea { min-height: 120px; padding: 14px; resize: vertical; font: inherit; }
        .tech-warranty-request-list { display: grid; gap: 12px; max-height: 900px; overflow-y: auto; }
        .tech-warranty-request-card { display: grid; gap: 10px; padding: 16px; text-align: left; border: 1px solid #e2e8f0; background: #fff; border-radius: 18px; cursor: pointer; transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
        .tech-warranty-request-card:hover { transform: translateY(-1px); box-shadow: 0 14px 26px rgba(37, 99, 235, 0.10); }
        .tech-warranty-request-card--active { border-color: #60a5fa; box-shadow: 0 16px 30px rgba(59, 130, 246, 0.14); background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%); }
        .tech-warranty-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .tech-warranty-pill { display: inline-flex; align-items: center; justify-content: center; min-height: 28px; padding: 0 10px; border-radius: 999px; font-size: 12px; font-weight: 900; }
        .tech-warranty-pill--info { background: #eff6ff; color: #1d4ed8; }
        .tech-warranty-pill--warning { background: #fff7ed; color: #b45309; }
        .tech-warranty-pill--danger { background: #fef2f2; color: #b91c1c; }
        .tech-warranty-pill--success { background: #ecfdf5; color: #047857; }
        .tech-warranty-media { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 18px; }
        .tech-warranty-media__image { min-height: 220px; border-radius: 22px; background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%); display: grid; place-items: center; overflow: hidden; border: 1px solid #e2e8f0; }
        .tech-warranty-media__image img { width: 100%; height: 220px; object-fit: contain; padding: 18px; }
        .tech-warranty-meta-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .tech-warranty-meta-card { padding: 14px; border-radius: 16px; background: #f8fafc; border: 1px solid #e2e8f0; }
        .tech-warranty-meta-card span { display: block; font-size: 12px; font-weight: 800; color: #64748b; }
        .tech-warranty-meta-card strong { display: block; margin-top: 6px; color: #0f172a; }
        .tech-warranty-timeline { display: grid; gap: 12px; }
        .tech-warranty-timeline-item { display: grid; grid-template-columns: 14px minmax(0, 1fr); gap: 12px; align-items: start; }
        .tech-warranty-timeline-dot { width: 12px; height: 12px; margin-top: 4px; border-radius: 999px; background: linear-gradient(135deg, #22c55e, #14b8a6); box-shadow: 0 0 0 5px #ecfeff; }
        .tech-warranty-attachments { display: grid; gap: 12px; }
        .tech-warranty-attachment { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 16px; background: #f8fafc; border: 1px solid #e2e8f0; }
        .tech-warranty-actions { display: grid; gap: 12px; }
        .tech-warranty-button { min-height: 46px; border: none; border-radius: 14px; cursor: pointer; font-weight: 900; }
        .tech-warranty-button--primary { color: #fff; background: linear-gradient(135deg, #2563eb, #1d4ed8); }
        .tech-warranty-button--secondary { color: #0f172a; background: #fff; border: 1px solid #dbe4ef; }
        .tech-warranty-empty { padding: 32px; border-radius: 18px; background: #f8fafc; color: #64748b; text-align: center; }
        .tech-warranty-alert { padding: 14px 16px; border-radius: 16px; font-weight: 800; }
        .tech-warranty-alert--error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
        .tech-warranty-alert--success { background: #ecfdf5; color: #047857; border: 1px solid #bbf7d0; }
        @media (max-width: 1280px) {
          .tech-warranty-hero, .tech-warranty-workspace { grid-template-columns: 1fr; }
          .tech-warranty-stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 820px) {
          .tech-warranty-stat-grid, .tech-warranty-media, .tech-warranty-meta-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="tech-warranty-hero">
        <div>
          <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em", color: "#93c5fd", fontWeight: 900 }}>Warranty operations</div>
          <h1 style={{ margin: "10px 0 10px", fontSize: 34, lineHeight: 1.08 }}>Trung tâm xử lý bảo hành theo luồng thực tế</h1>
          <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.7 }}>
            Nhận yêu cầu từ khách, xem lịch sử sản phẩm, cập nhật tiến trình, đính kèm hình ảnh xử lý và trả trạng thái về dashboard bảo hành của người dùng.
          </p>
        </div>
        <div className="tech-warranty-hero__summary">
          <div className="tech-warranty-meta-card" style={{ background: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.16)" }}>
            <span style={{ color: "#bfdbfe" }}>Yêu cầu đang mở</span>
            <strong style={{ color: "#fff", fontSize: 30 }}>{stats.pending}</strong>
          </div>
          <div className="tech-warranty-meta-card" style={{ background: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.16)" }}>
            <span style={{ color: "#bfdbfe" }}>Khẩn cấp</span>
            <strong style={{ color: "#fff", fontSize: 30 }}>{stats.critical}</strong>
          </div>
        </div>
      </section>

      <section className="tech-warranty-stat-grid">
        <article className="tech-warranty-stat"><span>Tổng yêu cầu</span><strong>{stats.total}</strong></article>
        <article className="tech-warranty-stat"><span>Đang xử lý</span><strong>{stats.pending}</strong></article>
        <article className="tech-warranty-stat"><span>Khẩn cấp</span><strong>{stats.critical}</strong></article>
        <article className="tech-warranty-stat"><span>Hoàn tất</span><strong>{stats.completed}</strong></article>
      </section>

      {message.text ? (
        <div className={`tech-warranty-alert ${message.type === "error" ? "tech-warranty-alert--error" : "tech-warranty-alert--success"}`}>
          {message.text}
        </div>
      ) : null}

      <div className="tech-warranty-workspace">
        <aside className="tech-warranty-panel">
          <div className="tech-warranty-panel__body">
            <div>
              <h2 style={{ margin: 0, color: "#0f172a" }}>Danh sách yêu cầu</h2>
              <p style={{ margin: "6px 0 0", color: "#64748b" }}>Lọc theo trạng thái và chọn yêu cầu để xử lý.</p>
            </div>

            <div className="tech-warranty-filters">
              <input
                className="tech-warranty-input"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm theo tên sản phẩm, serial, khách hàng..."
              />
              <select className="tech-warranty-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="tech-warranty-request-list">
              {loading ? (
                <div className="tech-warranty-empty">Đang tải yêu cầu bảo hành...</div>
              ) : requests.length === 0 ? (
                <div className="tech-warranty-empty">Chưa có yêu cầu bảo hành phù hợp bộ lọc.</div>
              ) : (
                requests.map((request) => {
                  const statusMeta = getStatusMeta(request.status);
                  const severityMeta = getSeverityMeta(request.severity);
                  return (
                    <button
                      key={request.id}
                      type="button"
                      className={`tech-warranty-request-card${request.id === selectedRequestId ? " tech-warranty-request-card--active" : ""}`}
                      onClick={() => setSelectedRequestId(request.id)}
                    >
                      <div className="tech-warranty-row">
                        <span className={`tech-warranty-pill tech-warranty-pill--${statusMeta.tone}`}>{statusMeta.label}</span>
                        <span className={`tech-warranty-pill tech-warranty-pill--${severityMeta.tone}`}>{severityMeta.label}</span>
                      </div>
                      <strong style={{ color: "#0f172a", fontSize: 16 }}>{request.productName}</strong>
                      <div style={{ color: "#475569", fontSize: 14 }}>Khách: {request.customerName || request.customerEmail || "Khách vãng lai"}</div>
                      <div style={{ color: "#64748b", fontSize: 13 }}>Serial: {request.serialNumber || "Chưa có"} · Đơn: #{request.orderId || "—"}</div>
                      <div style={{ color: "#64748b", fontSize: 13 }}>{formatDateTime(request.createdAt)}</div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        <main className="tech-warranty-panel">
          <div className="tech-warranty-panel__body">
            {!selectedRequest ? (
              <div className="tech-warranty-empty">Chọn một yêu cầu để xem chi tiết bảo hành và timeline xử lý.</div>
            ) : (
              <>
                <div className="tech-warranty-media">
                  <div className="tech-warranty-media__image">
                    <img
                      src={resolveProductImage({
                        image_url: selectedRequest.imageUrl,
                        thumbnail_url: selectedRequest.imageUrl,
                        category_name: selectedRequest.categoryName,
                        name: selectedRequest.productName
                      })}
                      alt={selectedRequest.productName}
                    />
                  </div>

                  <div style={{ display: "grid", gap: 14 }}>
                    <div className="tech-warranty-row">
                      <div>
                        <h2 style={{ margin: 0, fontSize: 26, color: "#0f172a" }}>{selectedRequest.productName}</h2>
                        <p style={{ margin: "6px 0 0", color: "#64748b" }}>Yêu cầu #{selectedRequest.id} · {selectedRequest.statusLabel}</p>
                      </div>
                      <span className={`tech-warranty-pill tech-warranty-pill--${getStatusMeta(selectedRequest.status).tone}`}>
                        {getStatusMeta(selectedRequest.status).label}
                      </span>
                    </div>

                    <div className="tech-warranty-meta-grid">
                      <article className="tech-warranty-meta-card"><span>Khách hàng</span><strong>{selectedRequest.customerName || "Khách vãng lai"}</strong></article>
                      <article className="tech-warranty-meta-card"><span>Số điện thoại</span><strong>{selectedRequest.customerPhone || "Chưa có"}</strong></article>
                      <article className="tech-warranty-meta-card"><span>Serial</span><strong>{selectedRequest.serialNumber || "Chưa có"}</strong></article>
                      <article className="tech-warranty-meta-card"><span>Đơn hàng</span><strong>#{selectedRequest.orderId || "—"}</strong></article>
                      <article className="tech-warranty-meta-card"><span>Giá trị tham chiếu</span><strong>{formatCurrency(selectedRequest.price)} đ</strong></article>
                      <article className="tech-warranty-meta-card"><span>Ngày tiếp nhận</span><strong>{formatDateTime(selectedRequest.createdAt)}</strong></article>
                    </div>

                    <article className="tech-warranty-meta-card">
                      <span>Mô tả lỗi</span>
                      <strong style={{ fontSize: 15, lineHeight: 1.65 }}>{selectedRequest.issueDescription || "Khách chưa mô tả chi tiết."}</strong>
                      {selectedRequest.extraNote ? (
                        <div style={{ marginTop: 10, color: "#475569", lineHeight: 1.65 }}>Ghi chú thêm: {selectedRequest.extraNote}</div>
                      ) : null}
                    </article>
                  </div>
                </div>

                {selectedRequest.attachments?.length ? (
                  <section style={{ display: "grid", gap: 12 }}>
                    <h3 style={{ margin: 0, color: "#0f172a" }}>Minh chứng khách hàng gửi</h3>
                    <div className="tech-warranty-attachments">
                      {selectedRequest.attachments.map((attachment) => (
                        <article key={attachment.id} className="tech-warranty-attachment">
                          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#eff6ff", display: "grid", placeItems: "center", color: "#1d4ed8", fontWeight: 900 }}>
                            {String(attachment.mimeType || "").startsWith("video/") ? "VID" : attachment.mimeType === "application/pdf" ? "PDF" : "IMG"}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <strong style={{ display: "block", color: "#0f172a" }}>{attachment.fileUrl.split("/").pop()}</strong>
                            <a href={attachment.fileUrl} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "none", fontWeight: 800 }}>
                              Mở tệp đính kèm
                            </a>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ) : null}

                <section style={{ display: "grid", gap: 12 }}>
                  <h3 style={{ margin: 0, color: "#0f172a" }}>Timeline xử lý</h3>
                  <div className="tech-warranty-timeline">
                    {(selectedRequest.timeline || []).map((event, index) => (
                      <article key={`${event.key || event.label}-${index}`} className="tech-warranty-timeline-item">
                        <div className="tech-warranty-timeline-dot" />
                        <div>
                          <strong style={{ display: "block", color: "#0f172a" }}>{event.label}</strong>
                          <small style={{ color: "#64748b" }}>{event.timestamp ? formatDateTime(event.timestamp) : "Đang chờ cập nhật"}</small>
                          {event.note ? <p style={{ margin: "6px 0 0", color: "#475569", lineHeight: 1.65 }}>{event.note}</p> : null}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        </main>

        <aside className="tech-warranty-panel">
          <div className="tech-warranty-panel__body">
            <div>
              <h2 style={{ margin: 0, color: "#0f172a" }}>Cập nhật tiến trình</h2>
              <p style={{ margin: "6px 0 0", color: "#64748b" }}>Thao tác tại đây sẽ đồng bộ về dashboard bảo hành của khách hàng.</p>
            </div>

            {!selectedRequest ? (
              <div className="tech-warranty-empty">Chọn yêu cầu từ danh sách bên trái để cập nhật trạng thái.</div>
            ) : (
              <form className="tech-warranty-actions" onSubmit={handleUpdateRequest}>
                <select className="tech-warranty-select" value={formState.status} onChange={(event) => setFormState((prev) => ({ ...prev, status: event.target.value }))}>
                  {STATUS_OPTIONS.filter((option) => option.value).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <textarea
                  className="tech-warranty-textarea"
                  value={formState.technicianNote}
                  onChange={(event) => setFormState((prev) => ({ ...prev, technicianNote: event.target.value }))}
                  placeholder="Ghi chú kỹ thuật: đã kiểm tra gì, chờ linh kiện gì, đề xuất đổi mới hay đã hoàn tất..."
                />

                <div className="tech-warranty-meta-card">
                  <span>Ảnh/video xử lý</span>
                  <input type="file" accept="image/*,video/*,application/pdf" multiple onChange={(event) => handleFiles(event.target.files)} />
                  {formState.media.length ? (
                    <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                      {formState.media.map((file) => (
                        <div key={`${file.name}-${file.size}`} style={{ color: "#475569", fontSize: 14 }}>{file.name}</div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <button className="tech-warranty-button tech-warranty-button--primary" disabled={saving}>
                  {saving ? "Đang cập nhật..." : "Lưu tiến trình bảo hành"}
                </button>
              </form>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
