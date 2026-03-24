import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

import { createTicket } from "../../services/ticket.service";
import { useAuth } from "../../hooks/useAuth";

const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"];

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }

  return error.message || fallbackMessage;
}

export function TicketCreatePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setErrorMessage("");
      const response = await createTicket({
        title,
        priority,
        description
      });
      const ticket = response?.data;
      navigate(`/tickets/${ticket.id}`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể tạo ticket."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <section style={{ padding: 28, borderRadius: 30, background: "linear-gradient(135deg, rgba(238, 77, 45, 0.12), rgba(255, 247, 237, 0.95))", border: "1px solid rgba(238, 77, 45, 0.12)", boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)", display: "grid", gap: 10 }}>
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.16em", color: "#9a3412" }}>Gửi yêu cầu hỗ trợ</div>
        <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1 }}>Tạo ticket kỹ thuật mới</h1>
        <p style={{ margin: 0, maxWidth: 780, color: "#7c2d12", lineHeight: 1.7 }}>
          Mô tả rõ vấn đề bạn đang gặp, tình trạng linh kiện, cấu hình đang sử dụng và mong muốn hỗ trợ để nhân viên kỹ thuật phản hồi nhanh hơn.
        </p>
      </section>

      <form onSubmit={handleSubmit} style={{ padding: 24, borderRadius: 24, background: "#ffffff", border: "1px solid #e5e7eb", boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)", display: "grid", gap: 16 }}>
        {errorMessage ? (
          <div style={{ padding: 14, borderRadius: 14, background: "#fff1f2", border: "1px solid #fecdd3", color: "#be123c" }}>{errorMessage}</div>
        ) : null}

        <div style={{ display: "grid", gap: 8 }}>
          <label htmlFor="ticket-title" style={{ fontWeight: 700 }}>Tiêu đề ticket</label>
          <input id="ticket-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ví dụ: Mainboard không nhận RAM DDR5" style={{ padding: "14px 16px", borderRadius: 14, border: "1px solid #d1d5db" }} />
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <label htmlFor="ticket-priority" style={{ fontWeight: 700 }}>Mức ưu tiên</label>
          <select id="ticket-priority" value={priority} onChange={(event) => setPriority(event.target.value)} style={{ padding: "14px 16px", borderRadius: 14, border: "1px solid #d1d5db", background: "#ffffff" }}>
            {PRIORITY_OPTIONS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <label htmlFor="ticket-description" style={{ fontWeight: 700 }}>Mô tả vấn đề</label>
          <textarea id="ticket-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={8} placeholder="Mô tả chi tiết sự cố, cấu hình đang dùng, bước đã thử và ảnh hưởng hiện tại..." style={{ padding: "14px 16px", borderRadius: 14, border: "1px solid #d1d5db", resize: "vertical" }} />
        </div>

        <button type="submit" disabled={submitting} style={{ justifySelf: "start", padding: "12px 18px", borderRadius: 999, border: "none", background: "#ee4d2d", color: "#ffffff", fontWeight: 800 }}>
          {submitting ? "Đang gửi..." : "Gửi ticket"}
        </button>
      </form>
    </div>
  );
}
