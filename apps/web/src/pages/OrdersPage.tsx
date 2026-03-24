import { useEffect, useState } from "react";

import { apiRequest } from "../lib/api";
import type { ApiEnvelope, Order } from "../types/api";

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");

  async function loadOrders() {
    try {
      const response = await apiRequest<ApiEnvelope<Order[]>>("/orders/my", {}, true);
      setOrders(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot load orders");
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h1>Đơn hàng cua toi</h1>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {orders.map((order) => (
        <article key={order.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 12 }}>
          <h3>Ma don: {order.id}</h3>
          <p>Trang thai: {order.status}</p>
          <p>Thanh toán: {order.paymentStatus}</p>
          <p>Tong tien: {Number(order.totalAmount).toLocaleString("vi-VN")} VND</p>
          <p>Địa chỉ: {order.shippingAddress}</p>
        </article>
      ))}
      {orders.length === 0 && <p>Chua co đơn hàng nao</p>}
    </main>
  );
}

