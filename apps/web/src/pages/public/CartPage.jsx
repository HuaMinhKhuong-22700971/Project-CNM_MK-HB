import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../../hooks/useAuth";
import { getCart, removeCartItem, updateCartItem } from "../../services/cart.service";

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }

  return error.message || fallbackMessage;
}

function normalizeCartResponse(response) {
  return response?.data || response;
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

export function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingItemId, setProcessingItemId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const items = useMemo(() => cart?.items || [], [cart]);
  const totalAmount = Number(cart?.totalAmount || 0);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function loadCart() {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await getCart();
        setCart(normalizeCartResponse(response));
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Không thể tải giỏ hàng"));
      } finally {
        setLoading(false);
      }
    }

    loadCart();
  }, [isAuthenticated]);

  async function handleUpdateQuantity(itemId, nextQuantity) {
    if (nextQuantity <= 0) {
      return handleRemoveItem(itemId);
    }

    try {
      setProcessingItemId(String(itemId));
      setErrorMessage("");
      const response = await updateCartItem(itemId, { quantity: nextQuantity });
      setCart(normalizeCartResponse(response));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể cập nhật số lượng"));
    } finally {
      setProcessingItemId("");
    }
  }

  async function handleRemoveItem(itemId) {
    try {
      setProcessingItemId(String(itemId));
      setErrorMessage("");
      const response = await removeCartItem(itemId);
      setCart(normalizeCartResponse(response));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể xóa sản phẩm khỏi giỏ hàng"));
    } finally {
      setProcessingItemId("");
    }
  }

  if (!isAuthenticated) {
    return (
      <div style={{ display: "grid", gap: 16, padding: 24, borderRadius: 24, background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
        <h1 style={{ margin: 0 }}>Giỏ hàng</h1>
        <p style={{ margin: 0, color: "var(--muted)" }}>Bạn cần đăng nhập để xem giỏ hàng và tiếp tục đặt hàng.</p>
        <div>
          <Link to="/login" style={{ color: "var(--primary)", fontWeight: 700 }}>Đi đến trang đăng nhập</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: 24, borderRadius: 24, background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>Đang tải giỏ hàng...</div>;
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
        <h1 style={{ margin: "0 0 8px", fontSize: 48, lineHeight: 1, letterSpacing: "-0.06em" }}>Giỏ hàng</h1>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: 18 }}>Kiểm tra sản phẩm đã chọn, cập nhật số lượng và chuẩn bị thanh toán.</p>
      </section>

      {errorMessage ? (
        <div style={{ padding: 16, borderRadius: 16, background: "rgba(255, 240, 236, 0.92)", border: "1px solid rgba(182, 64, 44, 0.22)", color: "var(--danger)" }}>
          {errorMessage}
        </div>
      ) : null}

      {items.length === 0 ? (
        <div style={{ display: "grid", gap: 14, padding: 24, borderRadius: 24, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)", boxShadow: "var(--shadow)" }}>
          <div>Giỏ hàng hiện đang trống. Hãy quay lại trang sản phẩm để chọn linh kiện phù hợp.</div>
          <div>
            <Link to="/products" style={{ color: "var(--primary)", fontWeight: 700 }}>Xem danh sách sản phẩm</Link>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, alignItems: "start" }}>
          <section style={{ display: "grid", gap: 14 }}>
            {items.map((item) => {
              const isProcessing = processingItemId === String(item.id);

              return (
                <article
                  key={item.id}
                  style={{
                    display: "grid",
                    gap: 14,
                    padding: 20,
                    borderRadius: 24,
                    border: "1px solid var(--border)",
                    background: "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,251,244,0.88))",
                    boxShadow: "var(--shadow)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                    <div style={{ display: "grid", gap: 6 }}>
                      <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: "-0.03em" }}>{item.product?.name}</div>
                      <div style={{ fontSize: 14, color: "var(--muted)" }}>Mã SKU: {item.variant?.sku}</div>
                      <div style={{ fontSize: 14, color: "var(--muted)" }}>Đơn giá: {formatCurrency(item.unitPrice)} VND</div>
                      <div style={{ fontSize: 14, color: item.variant?.stock > 0 ? "var(--primary)" : "var(--danger)", fontWeight: 700 }}>
                        {item.variant?.stock > 0 ? `Còn ${item.variant?.stock} sản phẩm trong kho` : "Tạm hết hàng"}
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Thành tiền</div>
                      <div style={{ fontSize: 24, fontWeight: 800 }}>{formatCurrency(item.lineTotal)} VND</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, Number(item.quantity) - 1)}
                        disabled={isProcessing}
                        style={{ padding: "10px 14px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface-strong)" }}
                      >
                        -
                      </button>
                      <div style={{ minWidth: 40, textAlign: "center", fontWeight: 800 }}>{item.quantity}</div>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, Number(item.quantity) + 1)}
                        disabled={isProcessing}
                        style={{ padding: "10px 14px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface-strong)" }}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={isProcessing}
                      style={{ padding: "10px 14px", borderRadius: 14, border: "1px solid rgba(182, 64, 44, 0.22)", background: "rgba(255, 240, 236, 0.92)", color: "var(--danger)", fontWeight: 700 }}
                    >
                      {isProcessing ? "Đang xử lý..." : "Xóa khỏi giỏ hàng"}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>

          <aside
            style={{
              display: "grid",
              gap: 14,
              padding: 22,
              borderRadius: 24,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              position: "sticky",
              top: 24,
              boxShadow: "var(--shadow)"
            }}
          >
            <h2 style={{ margin: 0, fontSize: 28, letterSpacing: "-0.04em" }}>Tóm tắt đơn hàng</h2>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)" }}>
              <span>Số lượng sản phẩm</span>
              <span>{cart?.totalItems || 0}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 24 }}>
              <span>Tổng tiền</span>
              <span>{formatCurrency(totalAmount)} VND</span>
            </div>
            <button
              type="button"
              onClick={() => navigate("/checkout")}
              style={{ padding: 14, borderRadius: 16, border: "none", background: "linear-gradient(135deg, var(--primary), #2b6b58)", color: "#ffffff", fontWeight: 800 }}
            >
              Tiếp tục thanh toán
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
