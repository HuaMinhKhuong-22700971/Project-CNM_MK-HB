import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { register, googleLoginMock } from "../../services/auth.service";
import { setAuthState } from "../../store/authStore";

const ICON_SIZE = 18;

// SVG Icons
const UserIcon = () => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const EmailIcon = () => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
  </svg>
);

const PhoneIcon = () => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const LockIcon = () => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const SECTION_STYLE = {
  padding: "56px",
  background: "rgba(255, 255, 255, 0.85)",
  backdropFilter: "blur(40px) saturate(180%)",
  borderRadius: "40px",
  border: "1px solid rgba(255, 255, 255, 0.7)",
  boxShadow: "0 25px 80px rgba(0, 0, 0, 0.06), inset 0 0 0 1px rgba(255,255,255,1)",
  animation: "fadeInBlur 0.8s cubic-bezier(0.16, 1, 0.3, 1) both"
};

const inputWrapperStyle = { position: "relative", display: "flex", alignItems: "center" };
const inputIconStyle = { position: "absolute", left: "20px", color: "var(--market-primary)", opacity: 0.6, pointerEvents: "none" };
const inputStyle = { padding: "18px 24px 18px 54px", borderRadius: "20px", border: "1px solid rgba(0, 0, 0, 0.08)", outline: "none", width: "100%", background: "rgba(248, 250, 252, 0.8)", color: "#1e293b", fontSize: "15px", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", fontWeight: "600" };

function validateForm(values) {
  const errors = {};
  if (!String(values.full_name || "").trim()) errors.full_name = "Vui lòng nhập họ tên";
  if (!String(values.email || "").trim()) errors.email = "Vui lòng nhập email";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(values.email).trim())) errors.email = "Email không hợp lệ";
  if (!String(values.password || "").trim()) errors.password = "Vui lòng nhập mật khẩu";
  else if (String(values.password).length < 6) errors.password = "Mật khẩu tối thiểu 6 ký tự";
  return errors;
}

export function RegisterPage() {
  const [formValues, setFormValues] = useState({ full_name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMockGoogle, setShowMockGoogle] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [manualEntry, setManualEntry] = useState({ fullName: "", email: "" });
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validateForm(formValues);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setIsSubmitting(true);
      await register({ ...formValues });
      setStatus({ type: "success", message: "Chào mừng bạn! Đang chuyển hướng..." });
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setStatus({ type: "error", message: axios.isAxiosError(error) ? (error.response?.data?.message || "Đăng ký thất bại") : error.message });
    } finally { setIsSubmitting(false); }
  }

  const handleGoogleMockSelection = async (account) => {
    setShowMockGoogle(false);
    setIsManualEntry(false);
    try {
      setIsSubmitting(true);
      setStatus({ type: "info", message: `Đang xác thực qua Google với tài khoản ${account.email}...` });
      const response = await googleLoginMock({ email: account.email, fullName: account.fullName });
      
      // Update global auth state to ensure session is recognized system-wide
      if (response.success && response.data) {
        setAuthState({
          accessToken: response.data.accessToken,
          user: response.data.user
        });
        
        setStatus({ type: "success", message: "Đăng nhập Google thành công! Chào mừng bạn." });
        setTimeout(() => navigate("/"), 1500);
      } else {
        throw new Error("Dữ liệu trả về không hợp lệ");
      }
    } catch (error) {
      setStatus({ type: "error", message: "Lỗi đăng nhập Google giả lập." });
    } finally { setIsSubmitting(false); }
  };

  const handleManualGoogleSubmit = (e) => {
    e.preventDefault();
    if (!manualEntry.email || !manualEntry.fullName) return;
    handleGoogleMockSelection(manualEntry);
  };

  return (
    <div style={{ 
      minHeight: "100vh", display: "grid", placeItems: "center", padding: "80px 20px",
      background: "radial-gradient(circle at 0% 0%, rgba(32, 120, 202, 0.08) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(15, 76, 63, 0.08) 0%, transparent 50%)"
    }}>
      <style>{`
        @keyframes fadeInBlur { from { opacity: 0; transform: translateY(30px); filter: blur(10px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
        @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        input:focus { background: #fff !important; border-color: var(--market-primary) !important; box-shadow: 0 10px 25px rgba(32, 120, 202, 0.1); transform: translateY(-2px); }
        .social-btn:hover { background: #fff !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .mock-account:hover { background: #f8fafc; }
      `}</style>

      {/* Mock Google Account Selector */}
      {showMockGoogle && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", zIndex: 2000 }}>
           <div style={{ background: "#fff", padding: 32, borderRadius: 24, width: "100%", maxWidth: 420, animation: "scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                 <GoogleIcon />
                 <h3 style={{ fontSize: 20, fontWeight: 800, marginTop: 12 }}>{isManualEntry ? "Nhập tài khoản của bạn" : "Chọn một tài khoản"}</h3>
                 <p style={{ color: "#64748b", fontSize: 14 }}>để tiếp tục tới **PC Mall**</p>
              </div>

              {!isManualEntry ? (
                <div style={{ display: "grid", gap: 12 }}>
                   {[
                     { fullName: "Minh Khương", email: "khuong.minh@example.com", avatar: "MK" },
                     { fullName: "Test User", email: "tester.pro@gmail.com", avatar: "TU" }
                   ].map((acc, i) => (
                     <div key={i} onClick={() => handleGoogleMockSelection(acc)} className="mock-account" style={{ display: "flex", alignItems: "center", gap: 16, padding: 16, borderRadius: 16, border: "1px solid #f1f5f9", cursor: "pointer", transition: "0.2s" }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#e2e8f0", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13 }}>{acc.avatar}</div>
                        <div style={{ flex: 1 }}>
                           <div style={{ fontWeight: 700, fontSize: 15 }}>{acc.fullName}</div>
                           <div style={{ fontSize: 13, color: "#64748b" }}>{acc.email}</div>
                        </div>
                     </div>
                   ))}
                   
                   <button onClick={() => setIsManualEntry(true)} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px", borderRadius: 16, border: "1px dashed #cbd5e1", background: "none", cursor: "pointer", transition: "0.2s", textAlign: "left", width: "100%" }} className="mock-account">
                      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "1.5px dashed #cbd5e1", display: "grid", placeItems: "center", fontSize: 20, color: "#94a3b8" }}>+</div>
                      <div>
                         <div style={{ fontWeight: 700, fontSize: 15, color: "#475569" }}>Sử dụng tài khoản khác</div>
                         <div style={{ fontSize: 12, color: "#94a3b8" }}>Nhập Gmail cá nhân của bạn</div>
                      </div>
                   </button>

                   <button onClick={() => setShowMockGoogle(false)} style={{ marginTop: 12, padding: "12px", borderRadius: 12, border: "none", background: "#f1f5f9", fontWeight: 700, cursor: "pointer" }}>Hủy bỏ</button>
                </div>
              ) : (
                <form onSubmit={handleManualGoogleSubmit} style={{ display: "grid", gap: 16 }}>
                   <div style={{ display: "grid", gap: 8 }}>
                      <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginLeft: 4 }}>Họ và tên</label>
                      <input 
                        required
                        placeholder="VD: Nguyễn Văn A"
                        value={manualEntry.fullName}
                        onChange={(e) => setManualEntry(p => ({ ...p, fullName: e.target.value }))}
                        style={{ ...inputStyle, padding: "14px 20px" }}
                      />
                   </div>
                   <div style={{ display: "grid", gap: 8 }}>
                      <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginLeft: 4 }}>Email cá nhân (Gmail)</label>
                      <input 
                        required
                        type="email"
                        placeholder="user@gmail.com"
                        value={manualEntry.email}
                        onChange={(e) => setManualEntry(p => ({ ...p, email: e.target.value }))}
                        style={{ ...inputStyle, padding: "14px 20px" }}
                      />
                   </div>
                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                      <button type="button" onClick={() => setIsManualEntry(false)} style={{ padding: "14px", borderRadius: 14, border: "none", background: "#f1f5f9", fontWeight: 700, cursor: "pointer" }}>Quay lại</button>
                      <button type="submit" style={{ padding: "14px", borderRadius: 14, border: "none", background: "var(--market-primary)", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Tiếp tục</button>
                   </div>
                </form>
              )}
           </div>
        </div>
      )}

      <div style={{ maxWidth: 640, width: "100%", ...SECTION_STYLE }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
           <h1 style={{ fontSize: 42, fontWeight: 950, marginBottom: 12, letterSpacing: "-0.05em", color: "#0f172a" }}>Gia nhập PC Mall</h1>
           <p style={{ color: "#64748b", fontSize: 17 }}>Hệ sinh thái linh kiện cao cấp từ chuyên gia.</p>
        </div>

        {status.message && (
            <div style={{ 
                padding: "16px 20px", borderRadius: 16, marginBottom: 32, textAlign: "center", fontSize: 14, fontWeight: 700, 
                background: status.type === "error" ? "#fef2f2" : (status.type === "success" ? "#f0fdf4" : "#eff6ff"),
                color: status.type === "error" ? "#991b1b" : (status.type === "success" ? "#166534" : "#1e40af")
            }}>
                {status.message}
            </div>
        )}

        <div style={{ marginBottom: 32 }}>
           <button type="button" onClick={() => { setShowMockGoogle(true); setIsManualEntry(false); }} className="social-btn" style={{ width: "100%", height: 64, borderRadius: 20, border: "1.5px solid #f1f5f9", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, cursor: "pointer", transition: "all 0.2s" }}>
             <GoogleIcon /> <span style={{ fontWeight: 800, fontSize: 16, color: "#1e293b" }}>Tiếp tục đăng ký với Google</span>
           </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
            <div style={{ flex: 1, height: 1, background: "#f1f5f9" }}></div>
            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>Hoặc dùng Email</span>
            <div style={{ flex: 1, height: 1, background: "#f1f5f9" }}></div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 24 }}>
          <div style={inputWrapperStyle}>
            <div style={inputIconStyle}><UserIcon /></div>
            <input name="full_name" value={formValues.full_name} onChange={handleChange} placeholder="Họ và tên" style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={inputWrapperStyle}>
              <div style={inputIconStyle}><EmailIcon /></div>
              <input name="email" type="email" value={formValues.email} onChange={handleChange} placeholder="Email" style={inputStyle} />
            </div>
            <div style={inputWrapperStyle}>
              <div style={inputIconStyle}><PhoneIcon /></div>
              <input name="phone" value={formValues.phone} onChange={handleChange} placeholder="Số điện thoại" style={inputStyle} />
            </div>
          </div>
          
          <div style={inputWrapperStyle}>
            <div style={inputIconStyle}><LockIcon /></div>
            <input name="password" type="password" value={formValues.password} onChange={handleChange} placeholder="Mật khẩu" style={inputStyle} />
          </div>

          <button type="submit" disabled={isSubmitting} style={{ height: 68, borderRadius: 22, border: "none", background: "linear-gradient(135deg, var(--market-primary), #1e40af)", color: "#fff", fontSize: 17, fontWeight: 900, cursor: isSubmitting ? "not-allowed" : "pointer", boxShadow: "0 10px 25px rgba(32, 120, 202, 0.2)", marginTop: 8 }}>
            {isSubmitting ? "Đang xử lý..." : "HOÀN TẤT ĐĂNG KÝ"}
          </button>
          <p style={{ textAlign: "center", color: "#64748b", fontSize: 16 }}>Đã có tài khoản? <Link to="/login" style={{ color: "var(--market-primary)", fontWeight: 800 }}>Đăng nhập</Link></p>
        </form>
      </div>
    </div>
  );
}
