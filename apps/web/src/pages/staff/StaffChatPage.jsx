import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../../hooks/useAuth";
import { usePcBuilder } from "../../hooks/usePcBuilder";
import {
  acceptChatSession,
  closeChatSession,
  getChatQueue,
  getChatSession,
  sendChatMessage
} from "../../services/chat.service";

const QUICK_REPLIES = [
  "Chào bạn, PC Mall rất vui được hỗ trợ bạn!",
  "Bạn cho mình biết ngân sách và nhu cầu sử dụng chính để mình tư vấn đúng hơn nhé.",
  "Mình đã gửi đề xuất cấu hình/sản phẩm, bạn xem và phản hồi giúp mình.",
  "Nếu bạn muốn chốt nhanh, mình có thể gửi link sản phẩm và hỗ trợ lên đơn."
];

const STATUS_FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "waiting_staff", label: "Yêu cầu mới" },
  { value: "assigned", label: "Đang xử lý" },
  { value: "waiting_customer", label: "Chờ khách" }
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

function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function getStatusMeta(status) {
  const normalized = String(status || "").toLowerCase();
  if (["waiting", "waiting_staff", "open"].includes(normalized)) return { tone: "warning", label: "Yêu cầu mới" };
  if (["assigned", "active"].includes(normalized)) return { tone: "info", label: "Đang xử lý" };
  if (normalized === "waiting_customer") return { tone: "success", label: "Chờ khách" };
  return { tone: "neutral", label: "Đã giải quyết" };
}

export default function StaffChatPage() {
  const { authState } = useAuth();
  const staffName = authState?.user?.fullName || authState?.user?.email || "Nhân viên bán hàng";
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [productTitle, setProductTitle] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const messagesEndRef = useRef(null);

  const {
    activeBuild,
    totalPrice,
    actions: { clearAll }
  } = usePcBuilder("Tư vấn khách hàng");

  const waitingCount = useMemo(
    () => sessions.filter((session) => ["waiting", "waiting_staff", "open"].includes(String(session.status || "").toLowerCase())).length,
    [sessions]
  );

  const filteredSessions = useMemo(() => {
    if (statusFilter === "all") return sessions;
    return sessions.filter((session) => {
      const status = String(session.status || "").toLowerCase();
      if (statusFilter === "waiting_staff") return ["waiting", "waiting_staff", "open"].includes(status);
      if (statusFilter === "assigned") return ["assigned", "active"].includes(status);
      return status === statusFilter;
    });
  }, [sessions, statusFilter]);

  const loadQueue = useCallback(async () => {
    try {
      const response = await getChatQueue();
      const list = getEnvelopeData(response, []);
      setSessions(Array.isArray(list) ? list : []);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể tải hàng đợi tư vấn."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 5000);
    return () => clearInterval(interval);
  }, [loadQueue]);

  useEffect(() => {
    if (!activeSession?.sessionId) return undefined;
    const poll = async () => {
      try {
        const response = await getChatSession(activeSession.sessionId);
        setActiveSession(getEnvelopeData(response, null));
      } catch {
        /* ignore poll errors */
      }
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [activeSession?.sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, actionLoading]);

  useEffect(() => {
    if (!successMessage) return undefined;
    const timer = setTimeout(() => setSuccessMessage(""), 3500);
    return () => clearTimeout(timer);
  }, [successMessage]);

  async function handleSelectSession(session) {
    setErrorMessage("");
    const status = String(session.status || "").toLowerCase();
    if (["waiting", "waiting_staff", "open"].includes(status)) {
      try {
        setActionLoading("accept");
        const response = await acceptChatSession(session.sessionId, { staffName });
        const accepted = getEnvelopeData(response, null);
        setActiveSession(accepted);
        setSuccessMessage(`Đã nhận phiên tư vấn: ${accepted.customerName}`);
        await loadQueue();
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Không thể nhận phiên tư vấn."));
      } finally {
        setActionLoading("");
      }
      return;
    }
    setActiveSession(session);
  }

  async function handleSendMessage(buildData = null) {
    if (!activeSession?.sessionId) return;
    const trimmed = String(message || "").trim();
    if (!trimmed && !buildData) return;

    try {
      setActionLoading("send");
      await sendChatMessage(activeSession.sessionId, {
        sender: "staff",
        text: buildData ? "Nhân viên đã gửi đề xuất cấu hình/sản phẩm." : trimmed,
        buildData: buildData || undefined
      });
      setMessage("");
      const response = await getChatSession(activeSession.sessionId);
      setActiveSession(getEnvelopeData(response, null));
      await loadQueue();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể gửi tin nhắn."));
    } finally {
      setActionLoading("");
    }
  }

  async function handleSendProductSuggestion() {
    const title = String(productTitle || "").trim();
    const url = String(productUrl || "").trim();
    if (!title && !url) {
      setErrorMessage("Nhập tên sản phẩm hoặc link sản phẩm cần gửi cho khách.");
      return;
    }

    await handleSendMessage({
      productSuggestion: {
        title: title || "Sản phẩm PC Mall đề xuất",
        url
      }
    });
    setProductTitle("");
    setProductUrl("");
  }

  async function handleCloseSession() {
    if (!activeSession?.sessionId) return;
    if (!confirm("Kết thúc phiên tư vấn này?")) return;
    try {
      setActionLoading("close");
      await closeChatSession(activeSession.sessionId);
      setActiveSession(null);
      setSuccessMessage("Đã đóng phiên tư vấn.");
      await loadQueue();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể đóng phiên."));
    } finally {
      setActionLoading("");
    }
  }

  function handleShareBuild() {
    const components = activeBuild?.components || {};
    if (Object.keys(components).length === 0) {
      setErrorMessage("Chưa có linh kiện trong cấu hình tư vấn. Mở PC Builder để chọn.");
      return;
    }
    if (window.confirm("Gửi cấu hình đang soạn cho khách hàng?")) {
      handleSendMessage(activeBuild);
    }
  }

  return (
    <div className="staff-chat">
      <section className="staff-page-head">
        <div>
          <p className="staff-eyebrow">Nhân viên kinh doanh</p>
          <h1>Sales consultation center</h1>
          <p>Nhận yêu cầu tư vấn từ AI Chat, phản hồi khách, gửi cấu hình PC và gợi ý sản phẩm để hỗ trợ chốt đơn.</p>
        </div>
        <div className="staff-head-actions">
          <span className="staff-chat-pill staff-chat-pill--wait">{waitingCount} yêu cầu mới</span>
          <Link to="/pc-builder" target="_blank" rel="noreferrer" className="staff-btn staff-btn--secondary">
            Mở PC Builder
          </Link>
        </div>
      </section>

      {errorMessage ? <div className="staff-alert staff-alert--error">{errorMessage}</div> : null}
      {successMessage ? <div className="staff-alert staff-alert--success">{successMessage}</div> : null}

      <div className="staff-chat-workspace">
        <aside className="staff-chat-queue staff-card">
          <div className="staff-panel-head">
            <div>
              <h2>Yêu cầu tư vấn</h2>
              <p>Lọc và chọn phiên để nhận hoặc tiếp tục chat.</p>
            </div>
          </div>
          <div className="staff-status-tabs">
            {STATUS_FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                className={statusFilter === item.value ? "staff-status-tab staff-status-tab--active" : "staff-status-tab"}
                onClick={() => setStatusFilter(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="staff-chat-queue-list">
            {loading ? (
              <div className="staff-empty">Đang tải hàng đợi...</div>
            ) : filteredSessions.length === 0 ? (
              <div className="staff-empty">Chưa có yêu cầu tư vấn phù hợp.</div>
            ) : (
              filteredSessions.map((session) => {
                const isActive = activeSession?.sessionId === session.sessionId;
                const statusMeta = getStatusMeta(session.status);
                return (
                  <button
                    key={session.sessionId}
                    type="button"
                    className={`staff-chat-queue-item${isActive ? " staff-chat-queue-item--active" : ""}`}
                    onClick={() => handleSelectSession(session)}
                    disabled={Boolean(actionLoading)}
                  >
                    <span className={`staff-status staff-status--${statusMeta.tone}`}>{statusMeta.label}</span>
                    <strong>{session.customerName}</strong>
                    <small>{session.conversationType === "SALES_CONSULTATION" ? "Sales consultation" : "Human support"}</small>
                    <span>{formatTime(session.updatedAt || session.createdAt)}</span>
                    {session.staffName ? <small>NV: {session.staffName}</small> : null}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <main className="staff-chat-main staff-card">
          {!activeSession ? (
            <div className="staff-chat-empty">
              <div className="staff-chat-empty__icon">💬</div>
              <h3>Chọn phiên tư vấn để bắt đầu</h3>
              <p>Khách có thể gửi yêu cầu từ trang AI Tư Vấn PC Mall.</p>
            </div>
          ) : (
            <>
              <div className="staff-chat-main-head">
                <div>
                  <h3>{activeSession.customerName}</h3>
                  <p>
                    Phiên {activeSession.sessionId.slice(0, 8)}... · {getStatusMeta(activeSession.status).label}
                    {activeSession.staffName ? ` · ${activeSession.staffName}` : ""}
                  </p>
                </div>
                <div className="staff-action-row">
                  <button type="button" className="staff-btn staff-btn--primary" onClick={handleShareBuild} disabled={Boolean(actionLoading)}>
                    Gửi cấu hình PC
                  </button>
                  <button type="button" className="staff-btn staff-btn--danger" onClick={handleCloseSession} disabled={Boolean(actionLoading)}>
                    Kết thúc phiên
                  </button>
                </div>
              </div>

              <div className="staff-chat-quick">
                {QUICK_REPLIES.map((text) => (
                  <button key={text} type="button" className="staff-chat-quick-btn" onClick={() => setMessage(text)}>
                    {text}
                  </button>
                ))}
              </div>

              <div className="staff-chat-messages">
                {(activeSession.messages || []).map((m) => {
                  if (m.sender === "system") {
                    return (
                      <div key={m.id} className="staff-chat-bubble staff-chat-bubble--system">
                        {m.text}
                      </div>
                    );
                  }
                  const isStaff = m.sender === "staff";
                  return (
                    <div key={m.id} className={`staff-chat-bubble-row${isStaff ? " staff-chat-bubble-row--staff" : ""}`}>
                      <div className={`staff-chat-bubble${isStaff ? " staff-chat-bubble--staff" : ""}`}>
                        <p>{m.text}</p>
                        <span>{formatTime(m.timestamp)}</span>
                        {m.buildData?.components ? (
                          <div className="staff-chat-build-card">
                            <strong>Đề xuất cấu hình</strong>
                            {Object.entries(m.buildData.components).map(([type, item]) => (
                              <div key={type} className="staff-chat-build-line">
                                <span>{type.toUpperCase()}</span>
                                <span>{Number(item?.variant?.price || item?.price || 0).toLocaleString("vi-VN")} đ</span>
                              </div>
                            ))}
                            <div className="staff-chat-build-total">
                              Tổng: {Number(m.buildData.totalPrice || 0).toLocaleString("vi-VN")} đ
                            </div>
                          </div>
                        ) : null}
                        {m.buildData?.productSuggestion ? (
                          <div className="staff-chat-build-card">
                            <strong>Gợi ý sản phẩm</strong>
                            <p>{m.buildData.productSuggestion.title}</p>
                            {m.buildData.productSuggestion.url ? (
                              <a href={m.buildData.productSuggestion.url} target="_blank" rel="noreferrer">
                                Mở link sản phẩm
                              </a>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="staff-chat-compose">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Nhập tin nhắn tư vấn..."
                  disabled={activeSession.status === "resolved" || Boolean(actionLoading)}
                />
                <button
                  type="button"
                  className="staff-btn staff-btn--primary"
                  onClick={() => handleSendMessage()}
                  disabled={!message.trim() || Boolean(actionLoading)}
                >
                  Gửi
                </button>
              </div>
            </>
          )}
        </main>

        <aside className="staff-chat-tools staff-card">
          <div className="staff-section-title">
            <h3>Công cụ tư vấn</h3>
            <p>Gửi cấu hình, link sản phẩm và hỗ trợ khách ra quyết định nhanh hơn.</p>
          </div>
          <div className="staff-chat-draft">
            <span>Cấu hình đang soạn</span>
            <strong>{Number(totalPrice || 0).toLocaleString("vi-VN")} đ</strong>
            <small>{Object.keys(activeBuild?.components || {}).length} linh kiện đã chọn</small>
            <Link to="/pc-builder" target="_blank" rel="noreferrer" className="staff-btn staff-btn--shipping">
              Mở PC Builder
            </Link>
            <button type="button" className="staff-btn staff-btn--secondary" onClick={clearAll}>
              Xóa nháp
            </button>
          </div>
          <div className="staff-chat-draft">
            <span>Gửi sản phẩm đề xuất</span>
            <input value={productTitle} onChange={(event) => setProductTitle(event.target.value)} placeholder="Tên sản phẩm hoặc cấu hình" />
            <input value={productUrl} onChange={(event) => setProductUrl(event.target.value)} placeholder="Link sản phẩm PC Mall" />
            <button type="button" className="staff-btn staff-btn--primary" onClick={handleSendProductSuggestion} disabled={!activeSession || Boolean(actionLoading)}>
              Gửi link sản phẩm
            </button>
          </div>
          <Link to="/staff/orders" className="staff-btn staff-btn--dark">
            Xử lý đơn hàng →
          </Link>
        </aside>
      </div>
    </div>
  );
}
