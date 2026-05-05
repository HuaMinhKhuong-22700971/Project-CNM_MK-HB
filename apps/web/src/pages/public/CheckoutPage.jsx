import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../../hooks/useAuth";
import { getCart } from "../../services/cart.service";
import { createOrder, createVnpayUrl } from "../../services/order.service";
import { getMyAddresses, createMyAddress } from "../../services/auth.service";

const ICON_SIZE = 18;

// SVG Icons
const UserIcon = () => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const MapPinIcon = () => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const CreditCardIcon = () => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const SECTION_STYLE = {
  padding: "32px",
  background: "rgba(255, 255, 255, 0.85)",
  backdropFilter: "blur(30px) saturate(180%)",
  borderRadius: "32px",
  border: "1px solid rgba(255, 255, 255, 0.7)",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.04), inset 0 0 0 1px rgba(255,255,255,1)",
  animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both"
};

const inputStyle = {
  padding: "16px 20px",
  borderRadius: "16px",
  border: "1px solid rgba(0, 0, 0, 0.06)",
  outline: "none",
  width: "100%",
  background: "rgba(248, 250, 252, 0.7)",
  color: "#1e293b",
  fontSize: "15px",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  fontWeight: "600"
};

const PAYMENT_METHOD_OPTIONS = [
  { value: "COD", label: "Thanh toán khi nhận hàng (COD)" },
  { value: "VNPAY", label: "Chuyển khoản trực tuyến (VNPAY)" }
];

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated, authState } = useAuth();
  const user = authState?.user;

  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
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

  // New address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: "", phone: "", province: "", district: "", ward: "", address_line: ""
  });

  // Auto-populate new address form with user details
  useEffect(() => {
    if (user) {
      setNewAddress(prev => ({
        ...prev,
        full_name: prev.full_name || user.fullName || user.full_name || "",
        phone: prev.phone || user.phone || ""
      }));
    }
  }, [user]);

  const items = useMemo(() => cart?.items || [], [cart]);
  const totalAmount = Number(cart?.totalAmount || 0);
  const shippingFee = Number(formValues.shippingFee || 0);
  const finalAmount = useMemo(() => totalAmount + shippingFee, [shippingFee, totalAmount]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function initCheckout() {
      try {
        setLoading(true);
        const [cartRes, addrRes] = await Promise.all([
          getCart(),
          getMyAddresses()
        ]);
        
        const cartData = cartRes?.data || cartRes;
        const addrData = addrRes?.data || addrRes;
        
        setCart(cartData);
        setAddresses(addrData || []);
        
        if (addrData && addrData.length > 0) {
          setFormValues(prev => ({ ...prev, addressId: String(addrData[0].id) }));
        }
      } catch (error) {
        setErrorMessage("Không thể tải thông tin thanh toán");
      } finally {
        setLoading(false);
      }
    }

    initCheckout();
  }, [isAuthenticated]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: "" }));
  }

  async function handleCreateAddress(e) {
    e.preventDefault();
    try {
      setIsAddingAddress(true);
      setErrorMessage("");
      const res = await createMyAddress(newAddress);
      const createdDetails = res?.data?.data || res.data;
      
      setAddresses(prev => [createdDetails, ...prev]);
      setFormValues(prev => ({ ...prev, addressId: String(createdDetails.id) }));
      setShowAddressForm(false);
      setNewAddress({ full_name: "", phone: "", province: "", district: "", ward: "", address_line: "" });
    } catch(error) {
      setErrorMessage(axios.isAxiosError(error) ? (error.response?.data?.message || "Lỗi tạo địa chỉ") : error.message);
    } finally {
      setIsAddingAddress(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!formValues.addressId && addresses.length === 0) {
      setErrorMessage("Vui lòng thêm địa chỉ giao hàng trước khi thanh toán");
      return;
    }
    if (!formValues.addressId) {
      setErrors({ addressId: "Vui lòng chọn địa chỉ giao hàng" });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const selectedAddressObj = addresses.find(a => String(a.id) === formValues.addressId);
      const shippingAddressStr = selectedAddressObj 
         ? `${selectedAddressObj.full_name || user?.fullName} - ${selectedAddressObj.phone} - ${selectedAddressObj.address_line}, ${selectedAddressObj.ward}, ${selectedAddressObj.district}, ${selectedAddressObj.province}`
         : "";

      const response = await createOrder({
        shippingAddress: shippingAddressStr,
        addressId: Number(formValues.addressId),
        paymentMethod: formValues.paymentMethod,
        shippingFee: Number(formValues.shippingFee || 0),
        note: String(formValues.note || "").trim() || undefined
      });

      const order = response?.data?.data || response?.data || response;

      if (formValues.paymentMethod === "VNPAY") {
        const urlRes = await createVnpayUrl(order.id, { amount: finalAmount });
        const urlData = urlRes?.data?.data || urlRes?.data || urlRes;
        
        if (urlData?.paymentUrl) {
          window.location.href = urlData.paymentUrl;
        } else {
          throw new Error("Lỗi VNPAY: Không lấy được paymentUrl");
        }
        return;
      }

      navigate("/orders", { replace: true, state: { createdOrderId: order.id } });
    } catch (error) {
      console.error("LỖI ĐẶT HÀNG:", error);
      let errMsg = "Đặt hàng thất bại. Vui lòng thử lại.";
      if (error.response?.data?.message) {
         errMsg += ` (Chi tiết: ${error.response.data.message})`;
         if (error.response.data.errors) {
             errMsg += ` - ${JSON.stringify(error.response.data.errors)}`;
         }
      } else if (error.message) {
         errMsg += ` (Chi tiết: ${error.message})`;
      }
      setErrorMessage(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isAuthenticated) return (
    <div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <div style={{...SECTION_STYLE, textAlign: 'center', maxWidth: 500}}>
            <div style={{ fontSize: 64, marginBottom: 24, padding: "20px", display: "inline-block", background: "#f1f5f9", borderRadius: "50%" }}>🔒</div>
            <h2 style={{ fontSize: 28, fontWeight: 900 }}>Yêu cầu đăng nhập</h2>
            <p style={{ color: "#64748b", margin: "16px 0 32px", fontSize: 16 }}>Bạn cần đăng nhập để thực hiện thanh toán và theo dõi siêu phẩm công nghệ.</p>
            <Link to="/login" style={{ padding: "14px 32px", borderRadius: 16, background: "var(--market-primary)", color: "#fff", textDecoration: "none", fontWeight: 800 }}>Đăng nhập ngay</Link>
        </div>
    </div>
  );

  if (loading) return <div style={{ minHeight: "80vh", display: "grid", placeItems: "center", fontSize: 18, color: "#64748b", fontWeight: 700 }}>Đang thiết lập đơn hàng hoàn hảo...</div>;

  if (items.length === 0) return (
     <div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
         <div style={{...SECTION_STYLE, textAlign: 'center', maxWidth: 500}}>
             <div style={{ fontSize: 64, marginBottom: 24, opacity: 0.3 }}>🛒</div>
             <h2 style={{ fontSize: 28, fontWeight: 900 }}>Giỏ hàng bạn siêu nhẹ</h2>
             <p style={{ color: "#64748b", margin: "16px 0 32px", fontSize: 16 }}>Chưa có linh kiện nào chờ được rước về cả.</p>
             <Link to="/products" style={{ padding: "14px 32px", borderRadius: 16, background: "var(--market-primary)", color: "#fff", textDecoration: "none", fontWeight: 800 }}>Khám phá linh kiện</Link>
         </div>
     </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .address-card { cursor: pointer; border: 2px solid transparent; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .address-card.selected { border-color: rgba(37, 99, 235, 0.5); background: rgba(37, 99, 235, 0.03); box-shadow: 0 10px 25px rgba(37, 99, 235, 0.1); transform: translateY(-2px); }
        .address-card:hover:not(.selected) { background: #f8fafc; border-color: #cbd5e1; transform: translateY(-2px); }
        select:focus, textarea:focus, input:focus { border-color: var(--market-primary) !important; background: #fff !important; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1); }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(32, 120, 202, 0.3); }
      `}</style>

      <div style={{ marginBottom: 40, animation: "fadeInUp 0.4s ease both" }}>
        <h1 style={{ fontSize: 42, fontWeight: 950, letterSpacing: "-0.05em", color: "#0f172a", marginBottom: 8 }}>Thanh toán</h1>
        <p style={{ color: "#64748b", fontSize: 17, fontWeight: 600 }}>Tối ưu hóa quy trình, đảm bảo an toàn giao dịch tuyệt đối.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 32, alignItems: "start" }}>
        
        <div style={{ display: "grid", gap: 32 }}>
          {/* Customer Info (Auto-populated correctly) */}
          <section style={{...SECTION_STYLE, animationDelay: "0.1s"}}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ background: "rgba(37, 99, 235, 0.1)", color: "var(--market-primary)", width: 40, height: 40, borderRadius: "50%", display: "grid", placeItems: "center" }}><UserIcon /></div>
                <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: "#1e293b" }}>Thông tin khách hàng</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div>
                    <label style={{ fontSize: 13, color: "#64748b", fontWeight: 700, display: "block", marginBottom: 8, paddingLeft: 4 }}>Họ và tên</label>
                    <div style={{ ...inputStyle, background: "#f8fafc", cursor: "not-allowed", border: "1px dashed #cbd5e1" }}>{user?.fullName || user?.full_name || "Chưa cập nhật"}</div>
                </div>
                <div>
                    <label style={{ fontSize: 13, color: "#64748b", fontWeight: 700, display: "block", marginBottom: 8, paddingLeft: 4 }}>Email đăng nhập</label>
                    <div style={{ ...inputStyle, background: "#f8fafc", cursor: "not-allowed", border: "1px dashed #cbd5e1" }}>{user?.email || "Chưa cập nhật"}</div>
                </div>
            </div>
          </section>

          {/* Shipping Address Selection */}
          <section style={{...SECTION_STYLE, animationDelay: "0.2s"}}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981", width: 40, height: 40, borderRadius: "50%", display: "grid", placeItems: "center" }}><MapPinIcon /></div>
                <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: "#1e293b" }}>Địa chỉ giao hàng</h2>
            </div>
            
            <div style={{ display: "grid", gap: 16 }}>
                {showAddressForm || addresses.length === 0 ? (
                   <form onSubmit={handleCreateAddress} style={{ display: "grid", gap: 16, background: "rgba(248, 250, 252, 0.6)", padding: 24, borderRadius: 24, border: "1px dashed #cbd5e1" }}>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Mở rộng tủ địa chỉ</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                         <input required placeholder="Họ và tên người nhận" value={newAddress.full_name} onChange={e => setNewAddress(p => ({...p, full_name: e.target.value}))} style={{...inputStyle, padding: "14px 20px"}} />
                         <input required placeholder="Số điện thoại" value={newAddress.phone} onChange={e => setNewAddress(p => ({...p, phone: e.target.value}))} style={{...inputStyle, padding: "14px 20px"}} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                         <input required placeholder="Tỉnh / Thành phố" value={newAddress.province} onChange={e => setNewAddress(p => ({...p, province: e.target.value}))} style={{...inputStyle, padding: "14px 20px"}} />
                         <input required placeholder="Quận / Huyện" value={newAddress.district} onChange={e => setNewAddress(p => ({...p, district: e.target.value}))} style={{...inputStyle, padding: "14px 20px"}} />
                         <input required placeholder="Phường / Xã" value={newAddress.ward} onChange={e => setNewAddress(p => ({...p, ward: e.target.value}))} style={{...inputStyle, padding: "14px 20px"}} />
                      </div>
                      <input required placeholder="Địa chỉ cụ thể (Số nhà, Tên đường)" value={newAddress.address_line} onChange={e => setNewAddress(p => ({...p, address_line: e.target.value}))} style={{...inputStyle, padding: "14px 20px"}} />
                      
                      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                          {addresses.length > 0 && (
                             <button type="button" onClick={() => setShowAddressForm(false)} style={{ padding: "12px 24px", borderRadius: 16, border: "none", background: "#f1f5f9", fontWeight: 800, cursor: "pointer" }}>Hủy</button>
                          )}
                          <button type="submit" disabled={isAddingAddress} style={{ padding: "12px 24px", borderRadius: 16, border: "none", background: "var(--market-primary)", color: "#fff", fontWeight: 800, cursor: isAddingAddress ? "not-allowed" : "pointer" }}>{isAddingAddress ? "Đang lưu..." : "Lưu địa chỉ & Giao đến đây"}</button>
                      </div>
                   </form>
                ) : (
                  <>
                    <div style={{ display: "grid", gap: 16 }}>
                        {addresses.map(addr => (
                            <div 
                              key={addr.id} 
                              onClick={() => setFormValues(p => ({ ...p, addressId: String(addr.id) }))}
                              className={`address-card ${formValues.addressId === String(addr.id) ? "selected" : ""}`}
                              style={{ padding: 24, borderRadius: 24, background: "#fff", border: "1.5px solid #e2e8f0", position: "relative" }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "center" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                      <span style={{ fontWeight: 900, color: "#1e293b", fontSize: 17 }}>{addr.full_name || user?.fullName}</span>
                                      {formValues.addressId === String(addr.id) && (
                                         <span style={{ background: "var(--market-primary)", color: "#fff", fontSize: 10, padding: "2px 8px", borderRadius: 12, fontWeight: 800 }}>CHỌN LÀM ĐIỂM ĐẾN</span>
                                      )}
                                    </div>
                                    <span style={{ fontSize: 11, background: "#f1f5f9", color: "#64748b", padding: "4px 12px", borderRadius: "8px", fontWeight: 800 }}>ĐỊA CHỈ #{addr.id}</span>
                                </div>
                                <div style={{ fontSize: 15, color: "#475569", lineHeight: 1.6, display: "flex", gap: 8 }}>
                                    <span style={{opacity:0.5}}>📍</span> {addr.address_line}, {addr.ward}, {addr.district}, {addr.province}
                                </div>
                                <div style={{ marginTop: 12, fontSize: 15, fontWeight: 800, color: "#334155", display: "flex", gap: 8 }}>
                                    <span style={{opacity:0.5}}>📞</span> {addr.phone || "Chưa cung cấp số điện thoại"}
                                </div>
                                {formValues.addressId === String(addr.id) && (
                                    <div style={{ position: "absolute", top: -10, right: -10, width: 28, height: 28, borderRadius: "50%", background: "var(--market-primary)", color: "#fff", display: "grid", placeItems: "center", border: "3px solid #fff", boxShadow: "0 4px 10px rgba(37,99,235,0.3)" }}>✓</div>
                                )}
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={() => setShowAddressForm(true)} style={{ marginTop: 8, textAlign: "center", width: "100%", padding: "16px", borderRadius: 16, border: "1px dashed var(--market-primary)", color: "var(--market-primary)", background: "rgba(37,99,235,0.02)", fontWeight: 800, cursor: "pointer", fontSize: 15, transition: "background 0.2s" }} onMouseEnter={(e) => e.target.style.background = "rgba(37,99,235,0.08)"} onMouseLeave={(e) => e.target.style.background = "rgba(37,99,235,0.02)"}>+ Thiết lập địa chỉ nhận mới</button>
                  </>
                )}
                {errors.addressId && <div style={{ color: "#ef4444", fontSize: 14, fontWeight: 800, marginTop: 4 }}>⚠️ {errors.addressId}</div>}
            </div>
          </section>

          {/* Payment & Notes */}
          <section style={{...SECTION_STYLE, animationDelay: "0.3s"}}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", width: 40, height: 40, borderRadius: "50%", display: "grid", placeItems: "center" }}><CreditCardIcon /></div>
                <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: "#1e293b" }}>Phương thức & Ghi chú</h2>
            </div>
            
            <div style={{ display: "grid", gap: 24 }}>
                <div>
                   <label style={{ fontSize: 13, color: "#64748b", fontWeight: 700, display: "block", marginBottom: 8, paddingLeft: 4 }}>Hình thức thanh toán</label>
                   <select 
                     name="paymentMethod" 
                     value={formValues.paymentMethod} 
                     onChange={handleChange} 
                     style={{...inputStyle, cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231e293b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 20px top 50%", backgroundSize: "12px auto"}}
                   >
                       {PAYMENT_METHOD_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                   </select>
                </div>
                <div>
                   <label style={{ fontSize: 13, color: "#64748b", fontWeight: 700, display: "block", marginBottom: 8, paddingLeft: 4 }}>Ghi chú đặc biệt cho đơn vị vận chuyển (nếu có)</label>
                   <textarea 
                     name="note" 
                     rows={3} 
                     value={formValues.note} 
                     onChange={handleChange} 
                     placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến..." 
                     style={{ ...inputStyle, resize: "none" }}
                   />
                </div>
            </div>
          </section>
        </div>

        {/* Order Summary Sidebar */}
        <aside style={{ position: "sticky", top: 40 }}>
            <div style={{ ...SECTION_STYLE, padding: 32, animationDelay: "0.4s" }}>
                <h2 style={{ fontSize: 24, fontWeight: 950, marginBottom: 24, letterSpacing: "-0.02em" }}>Sản phẩm của bạn</h2>
                
                <div style={{ display: "grid", gap: 20, maxHeight: 400, overflowY: "auto", paddingRight: 8, marginBottom: 24, borderBottom: "1px solid #f1f5f9", paddingBottom: 24 }}>
                    {items.map(item => (
                        <div key={item.id} style={{ display: "flex", gap: 16 }}>
                            <div style={{ width: 80, height: 80, borderRadius: 16, background: "#f8fafc", overflow: "hidden", flexShrink: 0, border: "1px solid #f1f5f9", display: "grid", placeItems: "center" }}>
                                {item.product?.imageUrl || item.variant?.imageUrl ? (
                                    <img src={item.product?.imageUrl || item.variant?.imageUrl} alt="" style={{ width: "85%", height: "85%", objectFit: "contain" }} />
                                ) : (
                                    <span style={{ fontSize: 32, opacity: 0.2 }}>📦</span>
                                )}
                            </div>
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                <div style={{ fontSize: 15, fontWeight: 900, color: "#1e293b", marginBottom: 6, lineHeight: 1.4 }}>{item.product?.name}</div>
                                <div style={{ fontSize: 13, color: "#64748b", display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
                                    <span>SL: {item.quantity}</span>
                                    <span style={{ color: "var(--market-primary)", fontWeight: 800 }}>{formatCurrency(item.unitPrice)} đ</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: "grid", gap: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontWeight: 700, fontSize: 15 }}>
                        <span>Tổng tiền hàng</span>
                        <span style={{ color: "#1e293b" }}>{formatCurrency(totalAmount)} đ</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontWeight: 700, fontSize: 15 }}>
                        <span>Phí vận chuyển</span>
                        <span style={{ color: "#059669", background: "rgba(5, 150, 105, 0.1)", padding: "2px 8px", borderRadius: 6 }}>Miễn phí</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, fontWeight: 950, color: "#0f172a", marginTop: 12, alignItems: "flex-end" }}>
                        <span>Tổng cộng</span>
                        <div style={{ textAlign: "right" }}>
                           <span style={{ color: "var(--market-primary)", fontSize: 28 }}>{formatCurrency(finalAmount)} đ</span>
                           <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, marginTop: 4 }}>(Đã tính VAT)</div>
                        </div>
                    </div>
                </div>

                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || items.length === 0}
                  className="submit-btn"
                  style={{ 
                    width: "100%", height: 68, marginTop: 32, borderRadius: 24, border: "none", 
                    background: "linear-gradient(135deg, var(--market-primary), #1e40af)", 
                    color: "#fff", fontSize: 17, fontWeight: 900, cursor: isSubmitting ? "not-allowed" : "pointer",
                    boxShadow: "0 10px 25px rgba(32, 120, 202, 0.2)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                >
                    {isSubmitting ? "ĐANG XỬ LÝ..." : "HOÀN TẤT ĐẶT HÀNG"}
                </button>

                {errorMessage && (
                    <div style={{ marginTop: 20, padding: 16, borderRadius: 16, background: "rgba(239,68,68,0.08)", color: "#b91c1c", fontSize: 14, fontWeight: 800, textAlign: "center", border: "1px solid rgba(239,68,68,0.2)" }}>
                        ⚠️ {errorMessage}
                    </div>
                )}
            </div>
            
            <div style={{ marginTop: 24, padding: 24, background: 'rgba(245, 166, 35, 0.05)', borderRadius: 24, border: '1px dashed #f5a623', display: 'flex', gap: 16, alignItems: 'center' }}>
                 <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', display: 'grid', placeItems: 'center', fontSize: 22, boxShadow: "0 4px 10px rgba(245, 166, 35, 0.1)" }}>🛡️</div>
                 <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#d97706" }}>Mua sắm đảm bảo 100%</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#b45309", opacity: 0.8, marginTop: 4 }}>Bảo mật dữ liệu tuyệt đối với SSL</div>
                 </div>
            </div>
        </aside>

      </div>
    </div>
  );
}
