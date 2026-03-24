import { useEffect, useState } from "react";

import { apiRequest } from "../lib/api";
import type { ApiEnvelope, CartData } from "../types/api";

export function CartPage() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [address, setAddress] = useState("123 Nguyen Trai, District 1, Ho Chi Minh City");
  const [error, setError] = useState("");

  async function loadCart() {
    try {
      const response = await apiRequest<ApiEnvelope<CartData>>("/cart", {}, true);
      setCart(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot load cart");
    }
  }

  async function removeItem(itemId: string) {
    await apiRequest(`/cart/items/${itemId}`, { method: "DELETE" }, true);
    loadCart();
  }

  async function checkout() {
    try {
      const response = await apiRequest<ApiEnvelope<{ id: string }>>(
        "/orders/checkout",
        {
          method: "POST",
          body: JSON.stringify({
            paymentMethod: "COD",
            shippingAddress: address
          })
        },
        true
      );
      alert(`Dat hang thanh cong. Ma don: ${response.data.id}`);
      loadCart();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Checkout failed");
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  return (
    <main style={{ maxWidth: 840, margin: "0 auto", padding: 16 }}>
      <h1>Giỏ hàng</h1>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {!cart && <p>Đang tải...</p>}
      {cart && (
        <>
          {cart.items.length === 0 && <p>Giỏ hàng trong</p>}
          {cart.items.map((item) => (
            <div key={item.id} style={{ borderBottom: "1px solid #ddd", padding: "10px 0" }}>
              <strong>{item.product.name}</strong> x {item.quantity}
              <div>{Number(item.product.price).toLocaleString("vi-VN")} VND</div>
              <button onClick={() => removeItem(item.id)}>Xóa</button>
            </div>
          ))}

          <h3>Tong: {Number(cart.subtotal).toLocaleString("vi-VN")} VND</h3>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            style={{ width: "100%", marginBottom: 12 }}
          />
          <button disabled={cart.items.length === 0} onClick={checkout}>
            Dat hang (COD)
          </button>
        </>
      )}
    </main>
  );
}

