import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../../hooks/useAuth";
import {
  addTicketMessage,
  getManageTickets,
  getTicketDetail,
  getTicketStats,
  updateTicket
} from "../../services/ticket.service";
import {
  TICKET_REPLY_TEMPLATES,
  getTicketPriorityMeta,
  getTicketStatusMeta,
  isTechSender,
  translateTicketText
} from "../../utils/ticketTech";

const STATUS_OPTIONS = ["", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const PRIORITY_OPTIONS = ["", "LOW", "MEDIUM", "HIGH", "URGENT"];
const SCOPE_OPTIONS = [
  { value: "UNASSIGNED", label: "Chưa giao" },
  { value: "ASSIGNED", label: "Được giao cho tôi" },
  { value: "ALL", label: "Tất cả" }
];

function getErrorMessage(error, fallback) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }
  return error?.message || fallback;
}

function getEnvelopeData(response, fallback) {
  if (response && typeof response === "object" && "data" in response) {
    return response.data ?? fallback;
  }
  return response ?? fallback;
}

function formatDate(value) {
  if (!value) return "Không rõ";
  return new Date(value).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export function TechTicketsPage() {
  const { authState } = useAuth();
  const currentUserId = authState?.user?.id;
  const techName = authState?.user?.fullName || "Nhân viên kỹ thuật";

  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [scope, setScope] = useState("UNASSIGNED");
  const [keyword, setKeyword] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const messagesEndRef = useRef(null);

  const loadStats = useCallback(async () => {
    try {
      const response = await getTicketStats();
      setStats(getEnvelopeData(response, null));
    } catch {
      setStats(null);
    }
  }, []);

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await getManageTickets({
        scope,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        keyword: keyword.trim() || undefined
      });
      const list = getEnvelopeData(response, []);
      const normalized = Array.isArray(list) ? list : [];
      setTickets(normalized);

      if (normalized.length === 0) {
        setSelectedTicketId(null);
        setSelectedTicket(null);
        return;
      }

      if (!normalized.some((item) => item.id === selectedTicketId)) {
        setSelectedTicketId(normalized[0].id);
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể tải danh sách ticket."));
    } finally {
      setLoading(false);
    }
  }, [scope, statusFilter, priorityFilter, keyword, selectedTicketId]);

  useEffect(() => {
    loadTickets();
    loadStats();
  }, [loadTickets, loadStats]);

  useEffect(() => {
    if (!selectedTicketId) {
      setSelectedTicket(null);
      return;
    }

    async function loadDetail() {
      try {
        setDetailLoading(true);
        const response = await getTicketDetail(selectedTicketId);
        setSelectedTicket(getEnvelopeData(response, null));
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Không thể tải chi tiết ticket."));
      } finally {
        setDetailLoading(false);
      }
    }

    loadDetail();
  }, [selectedTicketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicket?.messages, actionLoading]);

  useEffect(() => {
    if (!successMessage) return undefined;
    const timer = setTimeout(() => setSuccessMessage(""), 3500);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const filteredCount = tickets.length;
  const selectedStatusMeta = getTicketStatusMeta(selectedTicket?.status);
  const selectedPriorityMeta = getTicketPriorityMeta(selectedTicket?.priority);
  const canAssignSelf = selectedTicket && !selectedTicket.assignedToId;
  const isMine = Number(selectedTicket?.assignedToId) === Number(currentUserId);

  async function refreshAll() {
    await Promise.all([loadTickets(), loadStats()]);
    if (selectedTicketId) {
      const response = await getTicketDetail(selectedTicketId);
      setSelectedTicket(getEnvelopeData(response, null));
    }
  }

  async function handleAction(type, data) {
    if (!selectedTicket) return;

    try {
      setActionLoading(type);
      setErrorMessage("");
      let response;

      if (type === "reply") {
        response = await addTicketMessage(selectedTicket.id, { message: data });
        setReplyMessage("");
      } else {
        response = await updateTicket(selectedTicket.id, data);
      }

      const updated = getEnvelopeData(response, null);
      setSelectedTicket(updated);
      setTickets((prev) => prev.map((t) => (t.id === selectedTicket.id ? { ...t, ...updated } : t)));
      setSuccessMessage(type === "reply" ? "Đã gửi phản hồi." : "Đã cập nhật ticket.");
      await loadStats();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể thực hiện thao tác."));
    } finally {
      setActionLoading("");
    }
  }

  function handleSendReply() {
    const trimmed = replyMessage.trim();
    if (!trimmed) return;
    handleAction("reply", trimmed);
  }

  function handleAssignToMe() {
    handleAction("assign", { assignedToId: currentUserId, status: "IN_PROGRESS" });
  }

  function handleResolve() {
    handleAction("resolve", { status: "RESOLVED" });
  }

  function handleClose() {
    if (!confirm("Đóng ticket này? Khách sẽ không thể tiếp tục trao đổi.")) return;
    handleAction("close", { status: "CLOSED" });
  }

  const statusTabs = useMemo(
    () => [
      { value: "", label: "Tất cả" },
      { value: "OPEN", label: "Mới" },
      { value: "IN_PROGRESS", label: "Đang xử lý" },
      { value: "RESOLVED", label: "Đã giải quyết" }
    ],
    []
  );

  return (
    <div className="tech-tickets">
      <section className="tech-page-head">
        <div>
          <p className="tech-eyebrow">Nhân viên kỹ thuật</p>
          <h1>Xử lý yêu cầu hỗ trợ</h1>
          <p>Tiếp nhận ticket, phản hồi khách hàng và cập nhật trạng thái xử lý tại một màn hình chuyên nghiệp.</p>
        </div>
        <div className="tech-head-actions">
          <button type="button" className="tech-btn tech-btn--secondary" onClick={refreshAll} disabled={Boolean(actionLoading)}>
            Làm mới
          </button>
          <Link to="/tech/compatibility" className="tech-btn tech-btn--secondary">
            Luật tương thích
          </Link>
        </div>
      </section>

      <section className="tech-metrics" aria-label="Tổng quan ticket">
        <div className="tech-metric">
          <span>Chưa giao</span>
          <strong>{stats?.unassigned ?? "—"}</strong>
          <small>Ticket OPEN chưa có người nhận</small>
        </div>
        <div className="tech-metric">
          <span>Đang xử lý (tôi)</span>
          <strong>{stats?.myActive ?? "—"}</strong>
          <small>Ticket được giao cho bạn</small>
        </div>
        <div className="tech-metric">
          <span>Đang hiển thị</span>
          <strong>{filteredCount}</strong>
          <small>{SCOPE_OPTIONS.find((s) => s.value === scope)?.label || scope}</small>
        </div>
      </section>

      {errorMessage ? <div className="tech-alert tech-alert--error">{errorMessage}</div> : null}
      {successMessage ? <div className="tech-alert tech-alert--success">{successMessage}</div> : null}

      <div className="tech-workspace">
        <aside className="tech-tickets-panel">
          <div className="tech-panel-head">
            <div>
              <h2>Danh sách ticket</h2>
              <p>Chọn ticket để xem hội thoại và thao tác.</p>
            </div>
          </div>

          <div className="tech-filters">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm tiêu đề, mô tả..."
              aria-label="Tìm ticket"
            />
            <select value={scope} onChange={(e) => setScope(e.target.value)} aria-label="Phạm vi ticket">
              {SCOPE_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} aria-label="Lọc ưu tiên">
              <option value="">Mọi ưu tiên</option>
              {PRIORITY_OPTIONS.filter(Boolean).map((p) => (
                <option key={p} value={p}>
                  {getTicketPriorityMeta(p).label}
                </option>
              ))}
            </select>
          </div>

          <div className="tech-status-tabs">
            {statusTabs.map((tab) => (
              <button
                key={tab.value || "all"}
                type="button"
                className={statusFilter === tab.value ? "is-active" : ""}
                onClick={() => setStatusFilter(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="tech-ticket-list">
            {loading ? (
              <div className="tech-empty">Đang tải ticket...</div>
            ) : tickets.length === 0 ? (
              <div className="tech-empty">Không có ticket phù hợp bộ lọc.</div>
            ) : (
              tickets.map((ticket) => {
                const statusMeta = getTicketStatusMeta(ticket.status);
                const priorityMeta = getTicketPriorityMeta(ticket.priority);
                const isActive = ticket.id === selectedTicketId;

                return (
                  <button
                    key={ticket.id}
                    type="button"
                    className={`tech-ticket-row${isActive ? " tech-ticket-row--active" : ""}`}
                    onClick={() => setSelectedTicketId(ticket.id)}
                  >
                    <div className="tech-ticket-row__top">
                      <span className={`tech-status tech-status--${statusMeta.tone}`}>{statusMeta.label}</span>
                      <span className={`tech-priority tech-priority--${priorityMeta.tone}`}>{priorityMeta.label}</span>
                    </div>
                    <span className="tech-ticket-row__title">#{ticket.id} · {translateTicketText(ticket.title)}</span>
                    <span className="tech-ticket-row__meta">{ticket.reporter?.fullName || ticket.reporter?.email || "Khách"}</span>
                    <span className="tech-ticket-row__date">{formatDate(ticket.createdAt)}</span>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <main className="tech-detail">
          {detailLoading ? (
            <section className="tech-card tech-empty">Đang tải chi tiết ticket...</section>
          ) : !selectedTicket ? (
            <section className="tech-card tech-empty">
              <div className="tech-detail-empty__icon">🎫</div>
              Chọn một ticket để bắt đầu xử lý.
            </section>
          ) : (
            <>
              <section className="tech-ticket-summary tech-card">
                <div className="tech-ticket-summary__main">
                  <span className={`tech-status tech-status--${selectedStatusMeta.tone}`}>{selectedStatusMeta.label}</span>
                  <p>
                    Ticket #{selectedTicket.id} · {formatDate(selectedTicket.createdAt)}
                  </p>
                  <h2>{translateTicketText(selectedTicket.title)}</h2>
                  <div className="tech-ticket-desc">{translateTicketText(selectedTicket.description)}</div>
                  <div className="tech-reporter">
                    <strong>{selectedTicket.reporter?.fullName || "Khách hàng"}</strong>
                    <span>{selectedTicket.reporter?.email}</span>
                    {selectedTicket.assignee ? (
                      <span>
                        Người xử lý: <strong>{selectedTicket.assignee.fullName}</strong>
                      </span>
                    ) : (
                      <span className="tech-reporter__warn">Chưa có người nhận xử lý</span>
                    )}
                  </div>
                </div>
                <div className="tech-ticket-summary__side">
                  <span>Ưu tiên</span>
                  <strong className={`tech-priority tech-priority--${selectedPriorityMeta.tone}`}>{selectedPriorityMeta.label}</strong>
                </div>
                <div className="tech-action-row">
                  {canAssignSelf ? (
                    <button type="button" className="tech-btn tech-btn--primary" onClick={handleAssignToMe} disabled={Boolean(actionLoading)}>
                      Nhận xử lý
                    </button>
                  ) : null}
                  {isMine && selectedTicket.status !== "RESOLVED" && selectedTicket.status !== "CLOSED" ? (
                    <button type="button" className="tech-btn tech-btn--success" onClick={handleResolve} disabled={Boolean(actionLoading)}>
                      Đánh dấu đã giải quyết
                    </button>
                  ) : null}
                  {selectedTicket.status !== "CLOSED" ? (
                    <button type="button" className="tech-btn tech-btn--secondary" onClick={handleClose} disabled={Boolean(actionLoading)}>
                      Đóng ticket
                    </button>
                  ) : null}
                </div>
              </section>

              <section className="tech-card tech-ticket-thread">
                <div className="tech-section-title">
                  <h3>Hội thoại hỗ trợ</h3>
                  <p>Phản hồi khách và theo dõi tiến độ xử lý.</p>
                </div>

                <div className="tech-messages">
                  {(selectedTicket.messages || []).length === 0 ? (
                    <div className="tech-empty tech-empty--compact">Chưa có tin nhắn — gửi phản hồi đầu tiên cho khách.</div>
                  ) : (
                    (selectedTicket.messages || []).map((m) => {
                      const isTech = isTechSender(m.sender?.role);
                      return (
                        <div key={m.id} className={`tech-message-row${isTech ? " tech-message-row--tech" : ""}`}>
                          <div className="tech-message-meta">
                            {m.sender?.fullName || "Người dùng"} · {formatTime(m.createdAt)}
                          </div>
                          <div className={`tech-message-bubble${isTech ? " tech-message-bubble--tech" : ""}`}>
                            {translateTicketText(m.message)}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {selectedTicket.status !== "CLOSED" ? (
                  <>
                    <div className="tech-quick-replies">
                      {TICKET_REPLY_TEMPLATES.map((text) => (
                        <button key={text} type="button" className="tech-quick-reply-btn" onClick={() => setReplyMessage(text)}>
                          {text.slice(0, 48)}…
                        </button>
                      ))}
                    </div>

                    <div className="tech-compose-controls">
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => handleAction("status", { status: e.target.value })}
                        disabled={Boolean(actionLoading)}
                        aria-label="Trạng thái ticket"
                      >
                        {STATUS_OPTIONS.filter(Boolean).map((s) => (
                          <option key={s} value={s}>
                            {getTicketStatusMeta(s).label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={selectedTicket.priority}
                        onChange={(e) => handleAction("priority", { priority: e.target.value })}
                        disabled={Boolean(actionLoading)}
                        aria-label="Ưu tiên ticket"
                      >
                        {PRIORITY_OPTIONS.filter(Boolean).map((p) => (
                          <option key={p} value={p}>
                            {getTicketPriorityMeta(p).label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="tech-compose">
                      <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder={`Phản hồi với tư cách ${techName}...`}
                        rows={3}
                        disabled={Boolean(actionLoading)}
                      />
                      <button
                        type="button"
                        className="tech-btn tech-btn--primary"
                        onClick={handleSendReply}
                        disabled={!replyMessage.trim() || actionLoading === "reply"}
                      >
                        {actionLoading === "reply" ? "Đang gửi..." : "Gửi phản hồi"}
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="tech-help">Ticket đã đóng — không thể gửi thêm tin nhắn.</p>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
