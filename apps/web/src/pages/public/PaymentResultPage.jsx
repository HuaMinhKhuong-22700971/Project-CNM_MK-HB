import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";

import { confirmPayment, getPaymentStatus } from "../../services/payment.service";

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
  const paymentId = searchParams.get("paymentId");
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isPending = useMemo(() => String(payment?.status || "") === "PENDING_GATEWAY", [payment]);

  useEffect(() => {
    if (!paymentId) {
      setLoading(false);
      setErrorMessage("Không tìm thấy paymentId.");
      return;
    }

    async function loadPayment() {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await getPaymentStatus(paymentId);
        setPayment(response?.data || response);
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Không thể tải thông tin thanh toán."));
      } finally {
        setLoading(false);
      }
    }

    loadPayment();
  }, [paymentId]);

  async function handleConfirm(status) {
    if (!paymentId) {
      return;
    }

    try {
      setActionLoading(true);
      setErrorMessage("");
      const response = await confirmPayment(paymentId, { status });
      setPayment(response?.data || response);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể cập nhật trạng thái thanh toán."));
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return <div style={{ padding: 24, borderRadius: 24, background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>Đang tải thông tin thanh toán...</div>;
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section style={{ padding: "30px 28px", borderRadius: 32, background: "linear-gradient(135deg, rgba(238,77,45,0.08), rgba(255,247,237,0.95))", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 44, lineHeight: 1, letterSpacing: "-0.05em" }}>Kết quả thanh toán</h1>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: 18 }}>Mô phỏng quy trình thanh toán online theo flow sandbox để dễ nâng cấp lên VNPAY thật.</p>
      </section>

      {errorMessage ? <div style={{ padding: 16, borderRadius: 16, background: "rgba(255, 240, 236, 0.92)", border: "1px solid rgba(182, 64, 44, 0.22)", color: "var(--danger)" }}>{errorMessage}</div> : null}

      {payment ? (
        <section style={{ display: "grid", gap: 18, padding: 24, borderRadius: 24, background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ fontSize: 14, color: "var(--muted)" }}>Payment #{payment.id}</div>
            <div style={{ fontSize: 32, fontWeight: 800 }}>{formatCurrency(payment.amount)} VND</div>
            <div style={{ color: "var(--muted)" }}>Đơn hàng #{payment.orderId} - {payment.provider}</div>
          </div>

          <div style={{ display: "grid", gap: 10, color: "var(--muted)" }}>
            <div>Phương thức: {payment.paymentMethod}</div>
            <div>Trạng thái thanh toán: <strong style={{ color: "var(--text)" }}>{payment.status}</strong></div>
            <div>Mã giao dịch: {payment.transactionCode || "Chưa có"}</div>
          </div>

          {isPending ? (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button type="button" onClick={() => handleConfirm("PAID")} disabled={actionLoading} style={{ padding: "12px 16px", borderRadius: 14, border: "none", background: "#ee4d2d", color: "#fff", fontWeight: 700 }}>
                {actionLoading ? "Đang xử lý..." : "Mô phỏng thanh toán thành công"}
              </button>
              <button type="button" onClick={() => handleConfirm("FAILED")} disabled={actionLoading} style={{ padding: "12px 16px", borderRadius: 14, border: "1px solid #d1d5db", background: "#fff", color: "#111827", fontWeight: 700 }}>
                {actionLoading ? "Đang xử lý..." : "Mô phỏng thanh toán thất bại"}
              </button>
            </div>
          ) : null}

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/orders" style={{ color: "var(--primary)", fontWeight: 700 }}>Xem đơn hàng của tôi</Link>
            <Link to="/checkout" style={{ color: "var(--primary)", fontWeight: 700 }}>Quay lại checkout</Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
