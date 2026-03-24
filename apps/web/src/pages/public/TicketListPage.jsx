import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";

import { getMyTickets } from "../../services/ticket.service";
import { useAuth } from "../../hooks/useAuth";

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }

  return error.message || fallbackMessage;
}

const STATUS_COLORS = {
  OPEN: "#f59e0b",
  IN_PROGRESS: "#2563eb",
  RESOLVED: "#16a34a",
  CLOSED: "#6b7280"
};

export function TicketListPage() {
  const { isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadTickets() {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await getMyTickets();
        setTickets(response?.data || []);
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Không thể tải danh sách ticket"));
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      loadTickets();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <section style={{ padding: 28, borderRadius: 30, background: "linear-gradient(135deg, rgba(238, 77, 45, 0.12), rgba(255, 247, 237, 0.95))", border: "1px solid rgba(238, 77, 45, 0.12)", boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)", display: "grid", gap: 10 }}>
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.16em", color: "#9a3412" }}>Hỗ trợ kỹ thuật</div>
        <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1 }}>Ticket hỗ trợ của bạn</h1>
        <p style={{ margin: 0, maxWidth: 860, color: "#7c2d12", lineHeight: 1.7 }}>
          Theo dõi toàn bộ ticket đã gửi, xem trạng thái xử lý và trò chuyện lại với nhân viên kỹ thuật trong cùng một luồng hỗ trợ.
        </p>
        <div>
          <Link to="/tickets/new" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "12px 18px", borderRadius: 999, background: "#ee4d2d", color: "#ffffff", textDecoration: "none", fontWeight: 800 }}>
            Tạo ticket mới
          </Link>
        </div>
      </section>

      {errorMessage ? (
        <div style={{ padding: 14, borderRadius: 16, background: "#fff1f2", border: "1px solid #fecdd3", color: "#be123c" }}>{errorMessage}</div>
      ) : null}

      <section style={{ padding: 22, borderRadius: 24, background: "#ffffff", border: "1px solid #e5e7eb", boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)", display: "grid", gap: 16 }}>
        {loading ? (
          <div>Đang tải danh sách ticket...</div>
        ) : tickets.length === 0 ? (
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Bạn chưa có ticket nào</div>
            <div style={{ color: "#6b7280" }}>Khi gặp sự cố kỹ thuật, bạn có thể tạo ticket để đội ngũ kỹ thuật theo dõi và hỗ trợ.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {tickets.map((ticket) => (
              <Link key={ticket.id} to={`/tickets/${ticket.id}`} style={{ display: "grid", gap: 10, padding: 18, borderRadius: 18, border: "1px solid #e5e7eb", background: "#ffffff", color: "inherit", textDecoration: "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{ticket.title}</div>
                  <div style={{ padding: "6px 12px", borderRadius: 999, background: `${STATUS_COLORS[ticket.status] || "#6b7280"}15`, color: STATUS_COLORS[ticket.status] || "#6b7280", fontWeight: 800 }}>
                    {ticket.status}
                  </div>
                </div>
                <div style={{ color: "#6b7280", lineHeight: 1.7 }}>{ticket.description}</div>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 14, color: "#4b5563" }}>
                  <span>Ưu tiên: {ticket.priority}</span>
                  <span>Kỹ thuật phụ trách: {ticket.assignee?.fullName || "Chưa phân công"}</span>
                  <span>Tạo lúc: {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString("vi-VN") : "N/A"}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
