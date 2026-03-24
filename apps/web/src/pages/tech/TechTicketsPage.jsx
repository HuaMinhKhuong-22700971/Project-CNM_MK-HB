import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { addTicketMessage, getManageTickets, getTicketDetail, updateTicket } from "../../services/ticket.service";
import { useAuth } from "../../hooks/useAuth";

const STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"];

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }

  return error.message || fallbackMessage;
}

export function TechTicketsPage() {
  const { authState } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [scope, setScope] = useState("ASSIGNED");
  const [replyMessage, setReplyMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const currentUserId = authState?.user?.id;
  const selectedStatus = useMemo(() => selectedTicket?.status || "OPEN", [selectedTicket]);
  const selectedPriority = useMemo(() => selectedTicket?.priority || "MEDIUM", [selectedTicket]);

  useEffect(() => {
    async function loadTickets() {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await getManageTickets({ scope, status: statusFilter || undefined });
        const nextTickets = response?.data || [];
        setTickets(nextTickets);

        if (nextTickets.length > 0) {
          const nextSelectedId = selectedTicketId && nextTickets.some((ticket) => ticket.id === selectedTicketId)
            ? selectedTicketId
            : nextTickets[0].id;
          setSelectedTicketId(nextSelectedId);
        } else {
          setSelectedTicketId(null);
          setSelectedTicket(null);
        }
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Không thể tải danh sách ticket kỹ thuật"));
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, [scope, statusFilter, selectedTicketId]);

  useEffect(() => {
    if (!selectedTicketId) {
      setSelectedTicket(null);
      return;
    }

    async function loadTicketDetail() {
      try {
        setDetailLoading(true);
        setErrorMessage("");
        const response = await getTicketDetail(selectedTicketId);
        setSelectedTicket(response?.data || null);
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Không thể tải chi tiết ticket"));
      } finally {
        setDetailLoading(false);
      }
    }

    loadTicketDetail();
  }, [selectedTicketId]);

  function updateTicketInList(updatedTicket) {
    setTickets((prevState) => prevState.map((item) => (item.id === updatedTicket.id ? { ...item, ...updatedTicket } : item)));
    setSelectedTicket(updatedTicket);
  }

  async function handleAssignToMe() {
    if (!selectedTicket || !currentUserId) {
      return;
    }

    try {
      setActionLoading("assign");
      setErrorMessage("");
      setSuccessMessage("");
      const response = await updateTicket(selectedTicket.id, {
        assignedToId: currentUserId,
        status: selectedTicket.status === "OPEN" ? "IN_PROGRESS" : selectedTicket.status
      });
      updateTicketInList(response?.data || null);
      setSuccessMessage("Đã nhận xử lý ticket thành công");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể nhận xử lý ticket"));
    } finally {
      setActionLoading("");
    }
  }

  async function handleStatusChange(nextStatus) {
    if (!selectedTicket) {
      return;
    }

    try {
      setActionLoading("status");
      setErrorMessage("");
      setSuccessMessage("");
      const response = await updateTicket(selectedTicket.id, { status: nextStatus });
      updateTicketInList(response?.data || null);
      setSuccessMessage("Đã cập nhật trạng thái ticket");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể cập nhật trạng thái ticket"));
    } finally {
      setActionLoading("");
    }
  }

  async function handlePriorityChange(nextPriority) {
    if (!selectedTicket) {
      return;
    }

    try {
      setActionLoading("priority");
      setErrorMessage("");
      setSuccessMessage("");
      const response = await updateTicket(selectedTicket.id, { priority: nextPriority });
      updateTicketInList(response?.data || null);
      setSuccessMessage("Đã cập nhật mức ưu tiên ticket");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể cập nhật mức ưu tiên"));
    } finally {
      setActionLoading("");
    }
  }

  async function handleSendReply() {
    if (!selectedTicket || !replyMessage.trim()) {
      return;
    }

    try {
      setActionLoading("reply");
      setErrorMessage("");
      setSuccessMessage("");
      const response = await addTicketMessage(selectedTicket.id, { message: replyMessage });
      updateTicketInList(response?.data || null);
      setReplyMessage("");
      setSuccessMessage("Đã gửi phản hồi kỹ thuật");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể gửi phản hồi"));
    } finally {
      setActionLoading("");
    }
  }

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <section style={{ padding: 28, borderRadius: 28, background: "linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(239, 246, 255, 0.9))", border: "1px solid rgba(59, 130, 246, 0.12)", boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)", display: "grid", gap: 8 }}>
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.16em", color: "#1d4ed8" }}>Technical support workflow</div>
        <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1 }}>Xử lý ticket hỗ trợ kỹ thuật</h1>
        <p style={{ margin: 0, maxWidth: 860, color: "#1e3a8a", lineHeight: 1.7 }}>
          Theo dõi ticket được giao, cập nhật trạng thái xử lý và trao đổi trực tiếp với khách hàng thông qua lịch sử message trong ticket.
        </p>
      </section>

      {errorMessage ? <div style={{ padding: 14, borderRadius: 16, background: "#fff1f2", border: "1px solid #fecdd3", color: "#be123c" }}>{errorMessage}</div> : null}
      {successMessage ? <div style={{ padding: 14, borderRadius: 16, background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857" }}>{successMessage}</div> : null}

      <div style={{ display: "grid", gridTemplateColumns: "380px minmax(0, 1fr)", gap: 20, alignItems: "start" }}>
        <section style={{ padding: 18, borderRadius: 22, background: "#ffffff", border: "1px solid #e5e7eb", boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)", display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <select value={scope} onChange={(event) => setScope(event.target.value)} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #d1d5db", background: "#ffffff" }}>
              <option value="ASSIGNED">Ticket được giao</option>
              <option value="ALL">Tất cả ticket kỹ thuật</option>
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #d1d5db", background: "#ffffff" }}>
              <option value="">Tất cả trạng thái</option>
              {STATUS_OPTIONS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div>Đang tải ticket...</div>
          ) : tickets.length === 0 ? (
            <div style={{ color: "#6b7280" }}>Không có ticket phù hợp với bộ lọc hiện tại.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {tickets.map((ticket) => {
                const isActive = ticket.id === selectedTicketId;

                return (
                  <button key={ticket.id} type="button" onClick={() => setSelectedTicketId(ticket.id)} style={{ textAlign: "left", display: "grid", gap: 8, width: "100%", padding: 16, borderRadius: 18, border: isActive ? "1px solid #bfdbfe" : "1px solid #e5e7eb", background: isActive ? "#eff6ff" : "#ffffff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ fontWeight: 800 }}>#{ticket.id}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>{ticket.status}</div>
                    </div>
                    <div style={{ fontWeight: 700 }}>{ticket.title}</div>
                    <div style={{ fontSize: 14, color: "#6b7280" }}>Khách: {ticket.reporter?.fullName || ticket.reporter?.email || `User #${ticket.reporterId}`}</div>
                    <div style={{ fontSize: 14, color: "#6b7280" }}>Phụ trách: {ticket.assignee?.fullName || "Chưa phân công"}</div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section style={{ padding: 22, borderRadius: 24, background: "#ffffff", border: "1px solid #e5e7eb", boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)", display: "grid", gap: 18 }}>
          {detailLoading ? (
            <div>Đang tải chi tiết ticket...</div>
          ) : !selectedTicket ? (
            <div style={{ color: "#6b7280" }}>Chọn một ticket để bắt đầu xử lý.</div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start", flexWrap: "wrap" }}>
                <div style={{ display: "grid", gap: 6 }}>
                  <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6b7280" }}>Ticket kỹ thuật</div>
                  <h2 style={{ margin: 0, fontSize: 34 }}>{selectedTicket.title}</h2>
                  <div style={{ color: "#6b7280" }}>Người gửi: {selectedTicket.reporter?.fullName || selectedTicket.reporter?.email || `User #${selectedTicket.reporterId}`}</div>
                </div>
                <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
                  <div style={{ padding: "8px 12px", borderRadius: 999, background: "#eff6ff", color: "#1d4ed8", fontWeight: 700 }}>{selectedTicket.status}</div>
                  <div style={{ color: "#6b7280" }}>Ưu tiên: {selectedTicket.priority}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 18 }}>
                <div style={{ display: "grid", gap: 14 }}>
                  <div style={{ padding: 18, borderRadius: 18, background: "#f9fafb", border: "1px solid #e5e7eb", display: "grid", gap: 12 }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>Nội dung ticket và lịch sử trao đổi</div>
                    <div style={{ display: "grid", gap: 12 }}>
                      {selectedTicket.messages?.map((message) => {
                        const senderRole = String(message.sender?.role || "CUSTOMER").toUpperCase();
                        const isTechSide = ["ADMIN", "TECH_STAFF", "TECHNICIAN"].includes(senderRole);

                        return (
                          <div key={message.id} style={{ justifySelf: isTechSide ? "end" : "start", maxWidth: "80%", padding: 14, borderRadius: 16, background: isTechSide ? "#dbeafe" : "#f3f4f6", border: `1px solid ${isTechSide ? "#bfdbfe" : "#e5e7eb"}`, display: "grid", gap: 6 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: isTechSide ? "#1d4ed8" : "#374151" }}>
                              {message.sender?.fullName || message.sender?.email || "Khách hàng"}
                            </div>
                            <div style={{ lineHeight: 1.7 }}>{message.message}</div>
                            <div style={{ fontSize: 12, color: "#6b7280" }}>{message.createdAt ? new Date(message.createdAt).toLocaleString("vi-VN") : "N/A"}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ padding: 18, borderRadius: 18, background: "#f9fafb", border: "1px solid #e5e7eb", display: "grid", gap: 12 }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>Phản hồi kỹ thuật</div>
                    <textarea value={replyMessage} onChange={(event) => setReplyMessage(event.target.value)} rows={5} placeholder="Cập nhật tình trạng kiểm tra, hướng dẫn khách kiểm tra thêm hoặc thông báo kết quả xử lý..." style={{ width: "100%", padding: 14, borderRadius: 14, border: "1px solid #d1d5db", resize: "vertical" }} />
                    <div>
                      <button type="button" onClick={handleSendReply} disabled={actionLoading === "reply"} style={{ padding: "12px 16px", borderRadius: 14, border: "none", background: "#2563eb", color: "#ffffff", fontWeight: 700 }}>
                        {actionLoading === "reply" ? "Đang gửi..." : "Gửi phản hồi"}
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 14 }}>
                  <div style={{ padding: 18, borderRadius: 18, background: "#f9fafb", border: "1px solid #e5e7eb", display: "grid", gap: 12 }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>Phân công và xử lý</div>
                    <div style={{ color: "#6b7280" }}>Kỹ thuật đang phụ trách: {selectedTicket.assignee?.fullName || "Chưa phân công"}</div>
                    <button type="button" onClick={handleAssignToMe} disabled={actionLoading === "assign"} style={{ padding: "12px 16px", borderRadius: 14, border: "none", background: "#111827", color: "#ffffff", fontWeight: 700 }}>
                      {actionLoading === "assign" ? "Đang nhận..." : "Nhận xử lý ticket"}
                    </button>
                  </div>

                  <div style={{ padding: 18, borderRadius: 18, background: "#f9fafb", border: "1px solid #e5e7eb", display: "grid", gap: 12 }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>Cập nhật ticket</div>
                    <select value={selectedStatus} onChange={(event) => handleStatusChange(event.target.value)} style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #d1d5db", background: "#ffffff" }}>
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <select value={selectedPriority} onChange={(event) => handlePriorityChange(event.target.value)} style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #d1d5db", background: "#ffffff" }}>
                      {PRIORITY_OPTIONS.map((priority) => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
