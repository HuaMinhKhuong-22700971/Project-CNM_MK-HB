import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";

import { createVnpayUrl } from "../../services/order.service";
import { routeConfig } from "../../routes/routeConfig";

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }
  return error.message || fallbackMessage;
}

export function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success") === "true";
  const orderId = searchParams.get("orderId");
  const reason = searchParams.get("reason");
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState("");

  async function handleRetryPay() {
    if (!orderId) return;
    try {
      setPayLoading(true);
      setPayError("");
      const urlRes = await createVnpayUrl(orderId, {});
      const urlData = urlRes?.data?.data || urlRes?.data || urlRes;
      if (urlData?.paymentUrl) {
        window.location.href = urlData.paymentUrl;
        return;
      }
      throw new Error("Không lấy được liên kết thanh toán");
    } catch (error) {
      setPayError(getErrorMessage(error, "Không thể mở lại cổng thanh toán"));
      setPayLoading(false);
    }
  }

  if (!orderId) {
    return (
      <div style={{ padding: 24, borderRadius: 24, background: "var(--surface)", border: "1px solid var(--border)" }}>
        Không tìm thấy thông tin giao dịch hợp lệ.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section
        style={{
          padding: "30px 28px",
          borderRadius: 32,
          background: success
            ? "linear-gradient(135deg, rgba(46, 213, 115, 0.08), rgba(228, 248, 239, 0.95))"
            : "linear-gradient(135deg, rgba(238,77,45,0.08), rgba(255,247,237,0.95))",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow)"
        }}
      >
        <h1 style={{ margin: "0 0 8px", fontSize: 44, lineHeight: 1, letterSpacing: "-0.05em", color: success ? "#0f4c3f" : "#ee4d2d" }}>
          {success ? "Thanh toán thành công" : "Thanh toán chưa hoàn tất"}
        </h1>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: 18 }}>
          {success
            ? "Cảm ơn bạn. Đơn hàng đã được ghi nhận thanh toán (VNPay sandbox hoặc mock demo)."
            : "Giao dịch bị hủy hoặc thất bại. Bạn có thể thử lại từ trang đơn hàng."}
        </p>
      </section>

      <section style={{ display: "grid", gap: 18, padding: 24, borderRadius: 24, background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div>
          <div style={{ fontSize: 14, color: "var(--muted)" }}>Mã đơn hàng</div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>#{orderId}</div>
          {reason ? <div style={{ color: "var(--danger)", marginTop: 8 }}>Lý do: {reason}</div> : null}
        </div>

        {payError ? (
          <div style={{ padding: 12, borderRadius: 12, background: "#fef2f2", color: "#b91c1c" }}>{payError}</div>
        ) : null}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link
            to={routeConfig.public.orderDetail.replace(":orderId", String(orderId))}
            style={{ padding: "12px 20px", borderRadius: 16, background: "var(--primary)", color: "#fff", fontWeight: 700, textDecoration: "none" }}
          >
            Xem chi tiết đơn
          </Link>
          <Link to="/orders" style={{ padding: "12px 20px", borderRadius: 16, border: "1px solid var(--border)", background: "#fff", fontWeight: 700, textDecoration: "none", color: "var(--text)" }}>
            Danh sách đơn hàng
          </Link>
          {!success ? (
            <button
              type="button"
              disabled={payLoading}
              onClick={handleRetryPay}
              style={{ padding: "12px 20px", borderRadius: 16, border: "none", background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer" }}
            >
              {payLoading ? "Đang mở..." : "Thử thanh toán lại"}
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
