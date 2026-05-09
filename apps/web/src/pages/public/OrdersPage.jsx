import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../../hooks/useAuth";
import { getMyOrders } from "../../services/order.service";
import { routeConfig } from "../../routes/routeConfig";

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }

  return error.message || fallbackMessage;
}

function normalizeOrdersResponse(response) {
  return response?.data || response;
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

function getOrderStatusLabel(status) {
  const labels = {
    PENDING: "Chờ xác nhận",
    PROCESSING: "Đang xử lý",
    SHIPPED: "Đã giao vận",
    DELIVERED: "Hoàn thành",
    CANCELED: "Đã hủy",
    PAID: "Đã thanh toán"
  };

  return labels[String(status || "").toUpperCase()] || status || "Chưa cập nhật";
}

function getShipmentStatusLabel(status) {
  const labels = {
    CREATED: "Đã tạo vận đơn",
    READY_TO_SHIP: "Sẵn sàng giao",
    IN_TRANSIT: "Đang vận chuyển",
    DELIVERED: "Đã giao thành công",
    FAILED: "Giao thất bại",
    RETURNED: "Đã hoàn hàng",
    CANCELED: "Đã hủy vận đơn"
  };

  return labels[String(status || "").toUpperCase()] || status || "Chưa cập nhật";
}

export function OrdersPage() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const createdOrderId = useMemo(() => location.state?.createdOrderId || null, [location.state]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function loadOrders() {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await getMyOrders();
        const normalized = normalizeOrdersResponse(response);
        setOrders(Array.isArray(normalized) ? normalized : []);
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Không thể tải lịch sử đơn hàng"));
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div style={{ display: "grid", gap: 16, padding: 24, borderRadius: 24, background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
        <h1 style={{ margin: 0 }}>Đơn hàng của tôi</h1>
        <p style={{ margin: 0, color: "var(--muted)" }}>Bạn cần đăng nhập để xem lịch sử mua hàng.</p>
        <div>
          <Link to="/login" style={{ color: "var(--primary)", fontWeight: 700 }}>Đi đến trang đăng nhập</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: 24, borderRadius: 24, background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>Đang tải lịch sử đơn hàng...</div>;
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section
        style={{
          padding: "30px 28px",
          borderRadius: 32,
          background: "radial-gradient(circle at top right, rgba(198,124,49,0.18), transparent 20%), linear-gradient(135deg, rgba(223,236,229,0.95), rgba(248,243,234,0.95))",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow)"
        }}
      >
        <h1 style={{ margin: "0 0 8px", fontSize: 48, lineHeight: 1, letterSpacing: "-0.06em" }}>Đơn hàng của tôi</h1>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: 18 }}>Theo dõi trạng thái đơn hàng, thanh toán và thông tin giao hàng ở một nơi.</p>
      </section>

      {createdOrderId ? (
        <div style={{ padding: 16, borderRadius: 16, background: "rgba(228, 248, 239, 0.92)", border: "1px solid rgba(31, 76, 63, 0.18)", color: "var(--primary)" }}>
          Đơn hàng mới đã được tạo thành công. Mã đơn của bạn là <strong>#{createdOrderId}</strong>.
        </div>
      ) : null}

      {errorMessage ? (
        <div style={{ padding: 16, borderRadius: 16, background: "rgba(255, 240, 236, 0.92)", border: "1px solid rgba(182, 64, 44, 0.22)", color: "var(--danger)" }}>
          {errorMessage}
        </div>
      ) : null}

      {orders.length === 0 ? (
        <div style={{ display: "grid", gap: 14, padding: 24, borderRadius: 24, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)", boxShadow: "var(--shadow)" }}>
          <div>Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm để hệ thống tạo lịch sử đơn hàng cho bạn.</div>
          <div>
            <Link to="/products" style={{ color: "var(--primary)", fontWeight: 700 }}>Bắt đầu mua sắm</Link>
          </div>
        </div>
      ) : (
        <section style={{ display: "grid", gap: 16 }}>
          {orders.map((order) => (
            <article
              key={order.id}
              style={{
                display: "grid",
                gap: 14,
                padding: 22,
                borderRadius: 24,
                border: createdOrderId === order.id ? "1px solid rgba(31, 76, 63, 0.28)" : "1px solid var(--border)",
                background: createdOrderId === order.id ? "rgba(228, 248, 239, 0.76)" : "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,251,244,0.88))",
                boxShadow: "var(--shadow)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div style={{ display: "grid", gap: 4 }}>
                  <div style={{ fontWeight: 800, fontSize: 24, letterSpacing: "-0.03em" }}>Đơn hàng #{order.id}</div>
                  <div style={{ fontSize: 14, color: "var(--muted)" }}>Trạng thái: {getOrderStatusLabel(order.status)}</div>
                  <div style={{ fontSize: 14, color: "var(--muted)" }}>
                    Thanh toán: {order.paymentMethod || "Chưa cập nhật"} - {order.paymentStatus || "Chưa cập nhật"}
                  </div>
                </div>

                <div style={{ textAlign: "right", display: "grid", gap: 4 }}>
                  <div style={{ fontSize: 14, color: "var(--muted)" }}>Tổng thanh toán</div>
                  <div style={{ fontWeight: 800, fontSize: 26 }}>{formatCurrency(order.finalAmount)} VND</div>
                </div>
              </div>

              <div style={{ display: "grid", gap: 6, color: "var(--muted)" }}>
                <div>Địa chỉ giao hàng: {order.shippingAddress || "Chưa có dữ liệu"}</div>
                <div>Tạm tính: {formatCurrency(order.totalAmount)} VND</div>
                <div>Phí vận chuyển: {formatCurrency(order.shippingFee)} VND</div>
                {order.shipment ? (
                  <div>Vận đơn: {order.shipment.trackingCode || "Đang cập nhật"} - {getShipmentStatusLabel(order.shipment.status || "CREATED")}</div>
                ) : (
                  <div>Vận đơn: Chưa tạo vận đơn</div>
                )}
                <div>Ngày tạo: {order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "Không rõ"}</div>
              </div>

              <div>
                <Link to={routeConfig.public.orderDetail.replace(":orderId", String(order.id))} style={{ color: "var(--primary)", fontWeight: 700 }}>
                  Xem chi tiết đơn hàng
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
