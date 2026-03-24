import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../../hooks/useAuth";
import { getOrderDetail } from "../../services/order.service";
import { routeConfig } from "../../routes/routeConfig";

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }

  return error?.message || fallbackMessage;
}

function normalizeResponse(response) {
  return response?.data || response;
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "grid", gap: 4 }}>
      <div style={{ fontSize: 13, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value || "Chưa có dữ liệu"}</div>
    </div>
  );
}

export function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !orderId) {
      setLoading(false);
      return;
    }

    async function loadOrder() {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await getOrderDetail(orderId);
        setOrder(normalizeResponse(response));
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Không thể tải chi tiết đơn hàng"));
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [isAuthenticated, orderId]);

  const itemCount = useMemo(() => (order?.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0), [order]);

  if (!isAuthenticated) {
    return (
      <div style={{ display: "grid", gap: 16, padding: 24, borderRadius: 24, background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
        <h1 style={{ margin: 0 }}>Chi tiết đơn hàng</h1>
        <p style={{ margin: 0, color: "var(--muted)" }}>Bạn cần đăng nhập để xem thông tin đơn hàng.</p>
        <div>
          <Link to={routeConfig.public.login} style={{ color: "var(--primary)", fontWeight: 700 }}>Đi đến trang đăng nhập</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: 24, borderRadius: 24, background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>Đang tải chi tiết đơn hàng...</div>;
  }

  if (errorMessage) {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ padding: 18, borderRadius: 18, background: "rgba(255, 240, 236, 0.92)", border: "1px solid rgba(182, 64, 44, 0.22)", color: "var(--danger)" }}>
          {errorMessage}
        </div>
        <div>
          <button type="button" onClick={() => navigate(routeConfig.public.orders)} style={{ padding: "12px 18px", borderRadius: 999, border: "1px solid var(--border)", background: "#fff", cursor: "pointer", fontWeight: 700 }}>
            Quay lại danh sách đơn hàng
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section style={{ padding: "30px 28px", borderRadius: 32, background: "radial-gradient(circle at top right, rgba(198,124,49,0.18), transparent 20%), linear-gradient(135deg, rgba(223,236,229,0.95), rgba(248,243,234,0.95))", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", alignItems: "end" }}>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)" }}>Chi tiết đơn hàng</div>
            <h1 style={{ margin: 0, fontSize: 44, lineHeight: 1, letterSpacing: "-0.05em" }}>Đơn hàng #{order.id}</h1>
            <div style={{ color: "var(--muted)" }}>Theo dõi đầy đủ trạng thái, vận đơn, thanh toán và thông tin sản phẩm trong đơn.</div>
          </div>

          <div style={{ textAlign: "right", display: "grid", gap: 6 }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Tổng thanh toán</div>
            <div style={{ fontWeight: 800, fontSize: 30 }}>{formatCurrency(order.finalAmount)} VND</div>
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <div style={{ padding: 20, borderRadius: 20, background: "#fff", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}><InfoRow label="Trạng thái đơn" value={order.status} /></div>
        <div style={{ padding: 20, borderRadius: 20, background: "#fff", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}><InfoRow label="Phương thức thanh toán" value={order.paymentMethod} /></div>
        <div style={{ padding: 20, borderRadius: 20, background: "#fff", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}><InfoRow label="Trạng thái thanh toán" value={order.paymentStatus} /></div>
        <div style={{ padding: 20, borderRadius: 20, background: "#fff", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}><InfoRow label="Số lượng sản phẩm" value={String(itemCount)} /></div>
      </section>

      <section style={{ display: "grid", gap: 24, gridTemplateColumns: "minmax(0, 1.3fr) minmax(320px, 0.9fr)", alignItems: "start" }}>
        <div style={{ display: "grid", gap: 18, padding: 24, borderRadius: 24, background: "#fff", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 28 }}>Sản phẩm trong đơn</h2>
            <p style={{ margin: "8px 0 0", color: "var(--muted)" }}>Chi tiết từng sản phẩm, số lượng và thành tiền cho mỗi SKU đã đặt mua.</p>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {(order.items || []).map((item) => (
              <div key={item.id} style={{ display: "grid", gap: 8, padding: 18, borderRadius: 18, background: "#f9fafb", border: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{item.productName}</div>
                    <div style={{ fontSize: 14, color: "var(--muted)" }}>SKU: {item.sku || "Không rõ"}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700 }}>{formatCurrency(item.lineTotal)} VND</div>
                    <div style={{ fontSize: 14, color: "var(--muted)" }}>{formatCurrency(item.unitPrice)} x {item.quantity}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gap: 18 }}>
          <section style={{ display: "grid", gap: 14, padding: 24, borderRadius: 24, background: "#fff", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
            <h2 style={{ margin: 0, fontSize: 24 }}>Thông tin giao hàng</h2>
            <InfoRow label="Địa chỉ" value={order.shippingAddress} />
            <InfoRow label="Ngày tạo" value={order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "Không rõ"} />
            <InfoRow label="Ghi chú" value={order.note || "Không có ghi chú"} />
          </section>

          <section style={{ display: "grid", gap: 14, padding: 24, borderRadius: 24, background: "#fff", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
            <h2 style={{ margin: 0, fontSize: 24 }}>Thanh toán và vận đơn</h2>
            <InfoRow label="Tạm tính" value={`${formatCurrency(order.totalAmount)} VND`} />
            <InfoRow label="Phí vận chuyển" value={`${formatCurrency(order.shippingFee)} VND`} />
            <InfoRow label="Tổng thanh toán" value={`${formatCurrency(order.finalAmount)} VND`} />
            <InfoRow label="Tracking code" value={order.shipment?.trackingCode || "Chưa có vận đơn"} />
            <InfoRow label="Trạng thái vận đơn" value={order.shipment?.status || "Chưa tạo vận đơn"} />
          </section>

          <section style={{ display: "grid", gap: 12, padding: 24, borderRadius: 24, background: "#fff", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
            <h2 style={{ margin: 0, fontSize: 24 }}>Tiện ích nhanh</h2>
            <Link to={routeConfig.public.warranties} style={{ color: "var(--primary)", fontWeight: 700 }}>Kiểm tra bảo hành điện tử</Link>
            <Link to={routeConfig.public.orders} style={{ color: "var(--primary)", fontWeight: 700 }}>Quay lại lịch sử đơn hàng</Link>
          </section>
        </div>
      </section>
    </div>
  );
}
