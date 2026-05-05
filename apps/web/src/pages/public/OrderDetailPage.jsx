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
  return response?.data?.data || response?.data || response;
}

function mapDbOrderToUi(dbOrder) {
  if (!dbOrder) return null;
  return {
    id: dbOrder.id,
    status: dbOrder.status,
    paymentMethod: dbOrder.payment_method || dbOrder.paymentMethod,
    paymentStatus: dbOrder.payment_status || dbOrder.paymentStatus,
    shippingAddress: dbOrder.shipping_address || dbOrder.shippingAddress,
    createdAt: dbOrder.created_at || dbOrder.createdAt,
    note: dbOrder.note,
    trackingCode: dbOrder.tracking_code || dbOrder.trackingCode,
    totalAmount: dbOrder.total_amount || dbOrder.totalAmount,
    shippingFee: dbOrder.shipping_fee || dbOrder.shippingFee || 0,
    finalAmount: dbOrder.final_amount || dbOrder.finalAmount || dbOrder.total_amount || dbOrder.totalAmount || 0,
    items: (dbOrder.OrderItem || dbOrder.items || []).map(item => ({
      id: item.id,
      productName: item.name_snapshot || item.nameSnapshot || item.productName || item.product?.name || "Sản phẩm",
      sku: item.sku_snapshot || item.skuSnapshot || item.sku,
      quantity: item.quantity,
      unitPrice: item.unit_price || item.unitPrice,
      lineTotal: item.line_total || item.lineTotal,
      imageUrl: item.ProductSku?.image_url || item.ProductSku?.imageUrl || item.imageUrl || item.product?.imageUrl || null
    }))
  };
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
        const rawData = normalizeResponse(response);
        setOrder(mapDbOrderToUi(rawData));
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
      <section style={{ padding: "36px 32px", borderRadius: 24, background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
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
              <div key={item.id} style={{ display: "flex", gap: 16, padding: 18, borderRadius: 18, background: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                <div style={{ width: 64, height: 64, borderRadius: 12, background: "linear-gradient(135deg, #f8fafc, #fff)", border: "1px solid #e2e8f0", display: "grid", placeItems: "center", flexShrink: 0, overflow: "hidden" }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} />
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  )}
                </div>
                <div style={{ flex: 1, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{item.productName}</div>
                    <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>SKU: {item.sku || "Không rõ"}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, fontSize: 18 }}>{formatCurrency(item.lineTotal)} VND</div>
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

          {order.trackingCode && (
            <section style={{ display: "grid", gap: 14, padding: 24, borderRadius: 24, background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", border: "1px solid #bbf7d0", boxShadow: "0 4px 12px rgba(34, 197, 94, 0.1)" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#22c55e", color: "#fff", display: "grid", placeItems: "center", boxShadow: "0 2px 8px rgba(34, 197, 94, 0.3)" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "#166534", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800 }}>Mã vận đơn (Theo dõi hành trình)</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#14532d", letterSpacing: "0.02em" }}>{order.trackingCode}</div>
                </div>
              </div>
              <p style={{ margin: 0, color: "#15803d", fontSize: 14 }}>Đơn hàng đang trên đường giao. Tra cứu mã vận đơn trên trang chủ đối tác để theo dõi lộ trình nhanh nhất.</p>
            </section>
          )}

          <section style={{ display: "grid", gap: 14, padding: 24, borderRadius: 24, background: "#fff", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
            <h2 style={{ margin: 0, fontSize: 24 }}>Chi tiết thanh toán</h2>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)" }}>
                 <span>Tạm tính</span>
                 <span>{formatCurrency(order.totalAmount)} VND</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)" }}>
                 <span>Phí dịch vụ & vận chuyển</span>
                 <span>{formatCurrency(order.shippingFee)} VND</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 22, paddingTop: 16, marginTop: 4, borderTop: "1px dashed #cbd5e1" }}>
                 <span>Cần thanh toán</span>
                 <span style={{ color: "var(--primary)" }}>{formatCurrency(order.finalAmount)} VND</span>
              </div>
            </div>
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
