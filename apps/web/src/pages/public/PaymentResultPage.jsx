import { Link, useSearchParams } from "react-router-dom";
function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }

  return error.message || fallbackMessage;
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

export function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success") === "true";
  const orderId = searchParams.get("orderId");
  const reason = searchParams.get("reason");
  if (!orderId) {
    return (
      <div style={{ padding: 24, borderRadius: 24, background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
        Không tìm thấy thông tin giao dịch hợp lệ.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section style={{ padding: "30px 28px", borderRadius: 32, background: success ? "linear-gradient(135deg, rgba(46, 213, 115, 0.08), rgba(228, 248, 239, 0.95))" : "linear-gradient(135deg, rgba(238,77,45,0.08), rgba(255,247,237,0.95))", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 44, lineHeight: 1, letterSpacing: "-0.05em", color: success ? "#0f4c3f" : "#ee4d2d" }}>
          {success ? "Giao dịch thành công!" : "Giao dịch thất bại"}
        </h1>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: 18 }}>
          {success ? "Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đã được thanh toán qua VNPAY." : "Rất tiếc, giao dịch của bạn không thể hoàn tất hoặc bị hủy bỏ."}
        </p>
      </section>

      <section style={{ display: "grid", gap: 18, padding: 24, borderRadius: 24, background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
        <div style={{ display: "grid", gap: 6 }}>
          <div style={{ fontSize: 14, color: "var(--muted)" }}>Tham chiếu đơn hàng</div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>#{orderId}</div>
          {reason && <div style={{ color: "var(--danger)" }}>Lý do lỗi: {reason}</div>}
        </div>

        <div style={{ display: "grid", gap: 10, color: "var(--muted)" }}>
          <div>Phương thức: Thanh toán trực tuyến VNPAY</div>
          <div>Trạng thái thanh toán: <strong style={{ color: success ? "#2ed573" : "#ff4757" }}>{success ? "PAID" : "FAILED_OR_CANCELED"}</strong></div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
          <Link to="/orders" style={{ padding: "12px 20px", borderRadius: 16, backgroundColor: "var(--primary)", color: "#fff", fontWeight: 700, textDecoration: "none" }}>
            Quản lý đơn hàng
          </Link>
          <Link to="/products" style={{ padding: "12px 20px", borderRadius: 16, border: "1px solid var(--border)", backgroundColor: "#fff", color: "var(--text)", fontWeight: 700, textDecoration: "none" }}>
            Tiếp tục mua sắm
          </Link>
        </div>
      </section>
    </div>
  );
}
