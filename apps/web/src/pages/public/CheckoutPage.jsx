import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../../hooks/useAuth";
import { getCart } from "../../services/cart.service";
import { createOrder } from "../../services/order.service";
import { createPayment } from "../../services/payment.service";

const PAYMENT_METHOD_OPTIONS = [
  { value: "COD", label: "Thanh toán khi nhận hàng" },
  { value: "VNPAY", label: "Thanh toán online (sandbox / mock VNPAY)" }
];

const inputStyle = {
  padding: "14px 16px",
  borderRadius: 16,
  border: "1px solid rgba(122, 92, 48, 0.18)",
  outline: "none",
  width: "100%",
  background: "rgba(255,255,255,0.88)",
  color: "var(--text)"
};

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }

  return error.message || fallbackMessage;
}

function normalizeCartResponse(response) {
  return response?.data || response;
}

function normalizeOrderResponse(response) {
  return response?.data || response;
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

function validateForm(values) {
  const errors = {};

  if (!String(values.addressId || "").trim()) {
    errors.addressId = "Vui lòng nhập mã địa chỉ";
  } else if (!/^\d+$/.test(String(values.addressId).trim())) {
    errors.addressId = "Mã địa chỉ phải là số nguyên dương";
  }

  if (!String(values.paymentMethod || "").trim()) {
    errors.paymentMethod = "Vui lòng chọn phương thức thanh toán";
  }

  if (String(values.shippingFee || "").trim()) {
    const parsedShippingFee = Number(values.shippingFee);

    if (!Number.isFinite(parsedShippingFee) || parsedShippingFee < 0) {
      errors.shippingFee = "Phí vận chuyển phải là số không âm";
    }
  }

  return errors;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [formValues, setFormValues] = useState({
    addressId: "",
    paymentMethod: "COD",
    shippingFee: "0",
    note: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const items = useMemo(() => cart?.items || [], [cart]);
  const totalAmount = Number(cart?.totalAmount || 0);
  const shippingFee = Number(formValues.shippingFee || 0);
  const finalAmount = useMemo(() => totalAmount + (Number.isFinite(shippingFee) ? shippingFee : 0), [shippingFee, totalAmount]);

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
        setErrorMessage(getErrorMessage(error, "Không thể tải giỏ hàng để thanh toán"));
      } finally {
        setLoading(false);
      }
    }

    loadCart();
  }, [isAuthenticated]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormValues((prevState) => ({
      ...prevState,
      [name]: value
    }));

    setErrors((prevState) => ({
      ...prevState,
      [name]: ""
    }));

    setErrorMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateForm(formValues);
    setErrors(nextErrors);
    setErrorMessage("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await createOrder({
        addressId: Number(formValues.addressId),
        paymentMethod: formValues.paymentMethod,
        shippingFee: Number(formValues.shippingFee || 0),
        note: String(formValues.note || "").trim() || undefined
      });

      const order = normalizeOrderResponse(response);

      if (String(formValues.paymentMethod).toUpperCase() === "VNPAY") {
        const paymentResponse = await createPayment({
          orderId: order.id,
          paymentMethod: "VNPAY",
          note: "Created from checkout sandbox flow"
        });
        const payment = paymentResponse?.data || paymentResponse;
        navigate(`/payment/result?paymentId=${payment.id}`, { replace: true });
        return;
      }

      navigate("/orders", {
        replace: true,
        state: {
          createdOrderId: order.id
        }
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể tạo đơn hàng"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div style={{ display: "grid", gap: 16, padding: 24, borderRadius: 24, background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
        <h1 style={{ margin: 0 }}>Thanh toán</h1>
        <p style={{ margin: 0, color: "var(--muted)" }}>Bạn cần đăng nhập để tiếp tục đặt hàng.</p>
        <div>
          <Link to="/login" style={{ color: "var(--primary)", fontWeight: 700 }}>Đi đến trang đăng nhập</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: 24, borderRadius: 24, background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>Đang tải thông tin thanh toán...</div>;
  }

  if (items.length === 0) {
    return (
      <div style={{ display: "grid", gap: 14, padding: 24, borderRadius: 24, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)", boxShadow: "var(--shadow)" }}>
        <div>Giỏ hàng đang trống, bạn chưa thể tạo đơn hàng.</div>
        <div>
          <Link to="/products" style={{ color: "var(--primary)", fontWeight: 700 }}>Quay lại danh sách sản phẩm</Link>
        </div>
      </div>
    );
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
        <h1 style={{ margin: "0 0 8px", fontSize: 48, lineHeight: 1, letterSpacing: "-0.06em" }}>Thanh toán</h1>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: 18 }}>Xác nhận thông tin giao hàng, chọn COD hoặc thanh toán online sandbox để hoàn tất đơn mua.</p>
      </section>

      {errorMessage ? (
        <div style={{ padding: 16, borderRadius: 16, background: "rgba(255, 240, 236, 0.92)", border: "1px solid rgba(182, 64, 44, 0.22)", color: "var(--danger)" }}>
          {errorMessage}
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, alignItems: "start" }}>
        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gap: 18,
            padding: 24,
            borderRadius: 24,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            boxShadow: "var(--shadow)"
          }}
        >
          <section style={{ display: "grid", gap: 12 }}>
            <div>
              <h2 style={{ margin: "0 0 6px", fontSize: 28, letterSpacing: "-0.04em" }}>Thông tin giao hàng</h2>
              <p style={{ margin: 0, color: "var(--muted)" }}>Nhập mã địa chỉ đã tồn tại trong hệ thống để backend lấy đúng thông tin giao hàng.</p>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label htmlFor="addressId" style={{ fontWeight: 700 }}>Mã địa chỉ</label>
              <input id="addressId" name="addressId" value={formValues.addressId} onChange={handleChange} placeholder="Ví dụ: 1" style={inputStyle} />
              {errors.addressId ? <span style={{ color: "var(--danger)", fontSize: 14 }}>{errors.addressId}</span> : null}
            </div>

            <div style={{ padding: 14, borderRadius: 16, background: "rgba(31, 76, 63, 0.08)", border: "1px solid rgba(31, 76, 63, 0.12)", color: "var(--primary)", fontSize: 14 }}>
              Gợi ý: hãy dùng địa chỉ có sẵn trong bảng <strong>addresses</strong>, ví dụ mã địa chỉ <strong>1</strong> cho tài khoản demo.
            </div>
          </section>

          <section style={{ display: "grid", gap: 12 }}>
            <div>
              <h2 style={{ margin: "0 0 6px", fontSize: 28, letterSpacing: "-0.04em" }}>Thanh toán</h2>
              <p style={{ margin: 0, color: "var(--muted)" }}>Nếu chọn online, hệ thống sẽ chuyển sang màn hình kết quả thanh toán để mô phỏng gateway VNPAY sandbox.</p>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label htmlFor="paymentMethod" style={{ fontWeight: 700 }}>Phương thức thanh toán</label>
              <select id="paymentMethod" name="paymentMethod" value={formValues.paymentMethod} onChange={handleChange} style={inputStyle}>
                {PAYMENT_METHOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.paymentMethod ? <span style={{ color: "var(--danger)", fontSize: 14 }}>{errors.paymentMethod}</span> : null}
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label htmlFor="shippingFee" style={{ fontWeight: 700 }}>Phí vận chuyển</label>
              <input id="shippingFee" name="shippingFee" value={formValues.shippingFee} onChange={handleChange} placeholder="0" style={inputStyle} />
              {errors.shippingFee ? <span style={{ color: "var(--danger)", fontSize: 14 }}>{errors.shippingFee}</span> : null}
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label htmlFor="note" style={{ fontWeight: 700 }}>Ghi chú</label>
              <textarea id="note" name="note" rows={4} value={formValues.note} onChange={handleChange} placeholder="Thêm ghi chú nếu cần" style={{ ...inputStyle, resize: "vertical" }} />
            </div>
          </section>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: 14,
              borderRadius: 16,
              border: "none",
              background: isSubmitting ? "#94a3b8" : "linear-gradient(135deg, var(--primary), #2b6b58)",
              color: "#ffffff",
              fontWeight: 800
            }}
          >
            {isSubmitting ? "Đang xử lý..." : formValues.paymentMethod === "VNPAY" ? "Tạo đơn và chuyển sang cổng thanh toán mock" : "Xác nhận đặt hàng"}
          </button>
        </form>

        <aside
          style={{
            display: "grid",
            gap: 16,
            padding: 22,
            borderRadius: 24,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            position: "sticky",
            top: 24,
            boxShadow: "var(--shadow)"
          }}
        >
          <div>
            <h2 style={{ margin: "0 0 6px", fontSize: 28, letterSpacing: "-0.04em" }}>Đơn hàng của bạn</h2>
            <p style={{ margin: 0, color: "var(--muted)" }}>Kiểm tra lại thông tin sản phẩm trước khi đặt mua.</p>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {items.map((item) => (
              <div key={item.id} style={{ paddingBottom: 12, borderBottom: "1px solid rgba(122, 92, 48, 0.12)", display: "grid", gap: 4 }}>
                <div style={{ fontWeight: 800 }}>{item.product?.name}</div>
                <div style={{ fontSize: 14, color: "var(--muted)" }}>SKU: {item.variant?.sku}</div>
                <div style={{ fontSize: 14, color: "var(--muted)" }}>
                  {item.quantity} x {formatCurrency(item.unitPrice)} VND
                </div>
                <div style={{ fontWeight: 700 }}>{formatCurrency(item.lineTotal)} VND</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)" }}>
              <span>Tạm tính</span>
              <span>{formatCurrency(totalAmount)} VND</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)" }}>
              <span>Phí vận chuyển</span>
              <span>{formatCurrency(shippingFee)} VND</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, fontWeight: 800 }}>
              <span>Tổng cộng</span>
              <span>{formatCurrency(finalAmount)} VND</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
