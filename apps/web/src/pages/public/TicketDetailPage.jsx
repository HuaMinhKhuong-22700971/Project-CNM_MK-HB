import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import axios from "axios";

import { addTicketMessage, getTicketDetail } from "../../services/ticket.service";
import { useAuth } from "../../hooks/useAuth";

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }

  return error.message || fallbackMessage;
}

export function TicketDetailPage() {
  const { ticketId } = useParams();
  const { authState, isAuthenticated } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadTicket() {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await getTicketDetail(ticketId);
        setTicket(response?.data || null);
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Không thể tải chi tiết ticket"));
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      loadTicket();
    }
  }, [isAuthenticated, ticketId]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  async function handleReply() {
    if (!replyMessage.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");
      const response = await addTicketMessage(ticketId, { message: replyMessage });
      setTicket(response?.data || null);
      setReplyMessage("");
      setSuccessMessage("Đã gửi phản hồi vào ticket");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể gửi phản hồi"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <div>
        <Link to="/tickets" style={{ color: "#2563eb", textDecoration: "none", fontWeight: 700 }}>← Quay lại danh sách ticket</Link>
      </div>

      {errorMessage ? <div style={{ padding: 14, borderRadius: 16, background: "#fff1f2", border: "1px solid #fecdd3", color: "#be123c" }}>{errorMessage}</div> : null}
      {successMessage ? <div style={{ padding: 14, borderRadius: 16, background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857" }}>{successMessage}</div> : null}

      {loading ? (
        <div>Đang tải ticket...</div>
      ) : !ticket ? (
        <div style={{ color: "#6b7280" }}>Không tìm thấy ticket.</div>
      ) : (
        <>
          <section style={{ padding: 24, borderRadius: 24, background: "#ffffff", border: "1px solid #e5e7eb", boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)", display: "grid", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start", flexWrap: "wrap" }}>
              <div style={{ display: "grid", gap: 6 }}>
                <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6b7280" }}>Ticket #{ticket.id}</div>
                <h1 style={{ margin: 0, fontSize: 36, lineHeight: 1.04 }}>{ticket.title}</h1>
                <div style={{ color: "#6b7280" }}>Người gửi: {authState?.user?.fullName || authState?.user?.email}</div>
              </div>
              <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
                <div style={{ padding: "8px 12px", borderRadius: 999, background: "#fff7ed", color: "#9a3412", fontWeight: 700 }}>{ticket.status}</div>
                <div style={{ color: "#6b7280" }}>Ưu tiên: {ticket.priority}</div>
                <div style={{ color: "#6b7280" }}>Kỹ thuật phụ trách: {ticket.assignee?.fullName || "Chưa phân công"}</div>
              </div>
            </div>
          </section>

          <section style={{ padding: 24, borderRadius: 24, background: "#ffffff", border: "1px solid #e5e7eb", boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)", display: "grid", gap: 14 }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>Lịch sử trao đổi</div>
            <div style={{ display: "grid", gap: 12 }}>
              {ticket.messages?.map((message) => {
                const senderId = message.sender?.id;
                const isMine = Number(senderId) === Number(authState?.user?.id);

                return (
                  <div key={message.id} style={{ justifySelf: isMine ? "end" : "start", maxWidth: "78%", padding: 14, borderRadius: 16, background: isMine ? "#fff7ed" : "#f3f4f6", border: `1px solid ${isMine ? "#fed7aa" : "#e5e7eb"}`, display: "grid", gap: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isMine ? "#c2410c" : "#374151" }}>
                      {message.sender?.fullName || message.sender?.email || "Hệ thống"}
                    </div>
                    <div style={{ lineHeight: 1.7 }}>{message.message}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{message.createdAt ? new Date(message.createdAt).toLocaleString("vi-VN") : "N/A"}</div>
                  </div>
                );
              })}
            </div>
          </section>

          <section style={{ padding: 24, borderRadius: 24, background: "#ffffff", border: "1px solid #e5e7eb", boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)", display: "grid", gap: 14 }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>Trả lời ticket</div>
            <textarea value={replyMessage} onChange={(event) => setReplyMessage(event.target.value)} rows={5} placeholder="Bổ sung thông tin, cập nhật tình trạng sự cố hoặc trao đổi thêm với nhân viên kỹ thuật..." style={{ width: "100%", padding: 14, borderRadius: 14, border: "1px solid #d1d5db", resize: "vertical" }} />
            <div>
              <button type="button" onClick={handleReply} disabled={submitting} style={{ padding: "12px 18px", borderRadius: 999, border: "none", background: "#ee4d2d", color: "#ffffff", fontWeight: 800 }}>
                {submitting ? "Đang gửi..." : "Gửi phản hồi"}
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
