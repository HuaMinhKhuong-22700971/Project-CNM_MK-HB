import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { httpClient } from "../../services/http";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

export function MockPaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const [status, setStatus] = useState("pending"); // pending | paying | success | failed
  const [selectedCard, setSelectedCard] = useState("9704198526191432198");

  const MOCK_CARDS = [
    { number: "9704198526191432198", name: "NGUYEN VAN A", bank: "NCB", label: "NCB Test Card" },
    { number: "9704195798459170488", name: "NGUYEN VAN A", bank: "NCB", label: "NCB Test Card 2" },
  ];

  async function handlePay() {
    setStatus("paying");
    try {
      // Call our own mock-pay endpoint to mark as paid
      await httpClient.post(`/orders/${orderId}/mock-pay`);
      setStatus("success");
      setTimeout(() => {
        navigate(`/payment/result?success=true&orderId=${orderId}`);
      }, 2500);
    } catch (err) {
      setStatus("failed");
    }
  }

  function handleCancel() {
    navigate(`/payment/result?success=false&orderId=${orderId}&reason=user_cancelled`);
  }

  if (!orderId) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        Không tìm thấy thông tin giao dịch.
        <br />
        <Link to="/" style={{ color: "var(--primary)" }}>Về trang chủ</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 480, background: "#fff", borderRadius: 24, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #003687, #0055c4)", padding: "24px 28px", color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 8, padding: "4px 10px", fontSize: 22, fontWeight: 900, letterSpacing: 1 }}>
              VNPAY
            </div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>Cổng thanh toán trực tuyến</div>
            <div style={{ marginLeft: "auto", background: "#ff6b00", borderRadius: 6, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
              MÔ PHỎNG
            </div>
          </div>
          <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 4 }}>Tổng thanh toán</div>
          <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1 }}>{formatCurrency(amount)} <span style={{ fontSize: 18 }}>VND</span></div>
          <div style={{ marginTop: 8, fontSize: 13, opacity: 0.7 }}>Mã giao dịch: #{orderId}</div>
        </div>

        <div style={{ padding: 28 }}>
          {status === "success" ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#16a34a" }}>Thanh toán thành công!</div>
              <div style={{ color: "#666", marginTop: 8 }}>Đang chuyển hướng về đơn hàng...</div>
            </div>
          ) : status === "failed" ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#dc2626" }}>Thanh toán thất bại!</div>
              <button onClick={handleCancel} style={{ marginTop: 16, padding: "12px 24px", borderRadius: 12, background: "#003687", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>
                Quay lại đơn hàng
              </button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 12 }}>Chọn thẻ / tài khoản thanh toán (Test)</div>
                {MOCK_CARDS.map(card => (
                  <div
                    key={card.number}
                    onClick={() => setSelectedCard(card.number)}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 12,
                      border: `2px solid ${selectedCard === card.number ? "#003687" : "#e5e7eb"}`,
                      background: selectedCard === card.number ? "#f0f4ff" : "#fff",
                      cursor: "pointer",
                      marginBottom: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{ width: 40, height: 26, background: "#003687", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 24, height: 14, background: "#ffd700", borderRadius: 2 }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#333" }}>{card.label}</div>
                      <div style={{ fontSize: 12, color: "#888" }}>**** **** **** {card.number.slice(-4)} — {card.name}</div>
                    </div>
                    {selectedCard === card.number && (
                      <div style={{ marginLeft: "auto", color: "#003687", fontWeight: 800 }}>✓</div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ background: "#fffbeb", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#92400e", border: "1px solid #fde68a" }}>
                💡 Đây là môi trường mô phỏng thanh toán nội bộ. Nhấn <strong>"Thanh toán"</strong> để xác nhận giao dịch.
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={handleCancel}
                  style={{ flex: 1, padding: "14px", borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff", color: "#666", fontWeight: 700, cursor: "pointer", fontSize: 15 }}
                >
                  Hủy giao dịch
                </button>
                <button
                  onClick={handlePay}
                  disabled={status === "paying"}
                  style={{
                    flex: 2,
                    padding: "14px",
                    borderRadius: 12,
                    background: status === "paying" ? "#93c5fd" : "linear-gradient(135deg, #003687, #0055c4)",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 16,
                    border: "none",
                    cursor: status === "paying" ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  {status === "paying" ? "Đang xử lý..." : `Thanh toán ${formatCurrency(amount)} VND`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
