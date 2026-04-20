import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isSuccess = searchParams.get("success") === "true";
  const orderId = searchParams.get("orderId");
  const reason = searchParams.get("reason");

  return (
    <main style={{ maxWidth: 840, margin: "0 auto", padding: 32, textAlign: "center" }}>
      {isSuccess ? (
        <div>
          <h1 style={{ color: "green" }}>Thanh toán thành công!</h1>
          <p>Mã đơn hàng của bạn: <strong>{orderId}</strong></p>
          <p>Cảm ơn bạn đã mua sắm tại hệ thống của chúng tôi.</p>
        </div>
      ) : (
        <div>
          <h1 style={{ color: "red" }}>Thanh toán thất bại</h1>
          <p>Đã xảy ra lỗi trong quá trình giao dịch.</p>
          {reason && <p>Lý do: <em>{reason}</em></p>}
        </div>
      )}

      <button style={{ marginTop: 24, padding: "10px 20px" }} onClick={() => navigate("/orders")}>
        Xem lịch sử đơn hàng
      </button>
    </main>
  );
}
