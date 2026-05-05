import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../../hooks/useAuth";
import { activateWarranty, getEligibleWarrantyItems, getMyWarranties, lookupWarranty } from "../../services/warranty.service";

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }
  return error.message || fallbackMessage;
}

function formatDateTime(value) {
  return value ? new Date(value).toLocaleDateString("vi-VN") : "-";
}

export function WarrantiesPage() {
  const { isAuthenticated } = useAuth();
  const [eligibleItems, setEligibleItems] = useState([]);
  const [myWarranties, setMyWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Public Lookup State
  const [lookupCode, setLookupCode] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");

  // Activation State
  const [selectedOrderItemId, setSelectedOrderItemId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function loadUserData() {
      try {
        setLoading(true);
        const [eligibleResp, myResp] = await Promise.all([
          getEligibleWarrantyItems(),
          getMyWarranties()
        ]);
        setEligibleItems(eligibleResp?.data || []);
        setMyWarranties(myResp?.data || []);
        if (eligibleResp?.data?.length > 0) {
          setSelectedOrderItemId(String(eligibleResp.data[0].id));
        }
      } catch (err) {
        console.error("Failed to load user warranty data", err);
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, [isAuthenticated]);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!lookupCode.trim()) return;
    
    try {
      setLookupLoading(true);
      setLookupError("");
      setLookupResult(null);
      const resp = await lookupWarranty(lookupCode.trim());
      setLookupResult(resp.data);
    } catch (err) {
      setLookupError(getErrorMessage(err, "Không tìm thấy thông tin cho mã này. Bạn có thể thử lại hoặc đăng nhập để kiểm tra."));
    } finally {
      setLookupLoading(false);
    }
  };

  const handleActivate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setMsg({ type: '', text: '' });
      const resp = await activateWarranty({ orderItemId: Number(selectedOrderItemId) });
      setMsg({ type: 'success', text: `Kích hoạt thành công! Mã: ${resp.data.warrantyCode}` });
      setMyWarranties(prev => [resp.data, ...prev]);
      setEligibleItems(prev => prev.filter(i => String(i.id) !== String(selectedOrderItemId)));
    } catch (err) {
      setMsg({ type: 'error', text: getErrorMessage(err, "Lỗi kích hoạt.") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="market-container" style={{ padding: "40px 0 80px" }}>
      {/* Dynamic Header */}
      <section style={{ marginBottom: 40, borderBottom: '1px solid #eee', paddingBottom: 24 }}>
        <h1 style={{ fontSize: 42, fontWeight: 900, color: '#0f172a', marginBottom: 16 }}>Trung tâm Bảo hành PC Mall</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ padding: '6px 12px', background: '#e2e8f0', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>Tốc độ xử lý: 24h</span>
          <span style={{ padding: '6px 12px', background: '#dcfce7', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#15803d' }}>Hệ thống Online 24/7</span>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48 }}>
        {/* Left Column: Direct Content & Policies */}
        <section>
          <div className="market-panel" style={{ padding: 40, background: '#fff', borderRadius: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Chính sách Bảo hành Toàn diện</h2>
            
            <div style={{ display: 'grid', gap: 32 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--market-primary)', marginBottom: 12 }}>1. Hình thức Bảo hành Điện tử</h3>
                <p style={{ lineHeight: 1.8, color: '#444' }}>
                  Tại PC Mall, chúng tôi áp dụng 100% hình thức bảo hành điện tử. Bạn không cần giữ hóa đơn giấy hay thẻ nhựa. Mọi thông tin đã được lưu vết qua **Mã bảo hành** hoặc **Serial Number** của thiết bị. Khi cần hỗ trợ, bạn chỉ cần mang thiết bị qua trung tâm, kỹ thuật viên sẽ quét mã để kiểm tra hạn dùng ngay lập tức.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--market-primary)', marginBottom: 12 }}>2. Thời gian bảo hành tiêu chuẩn</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                   <div style={{ padding: 16, background: '#f8fafc', borderRadius: 16 }}>
                      <div style={{ fontWeight: 800 }}>CPU/Linh kiện chính</div>
                      <div style={{ fontSize: 14, color: '#15803d' }}>36 tháng (Đổi mới 1:1)</div>
                   </div>
                   <div style={{ padding: 16, background: '#f8fafc', borderRadius: 16 }}>
                      <div style={{ fontWeight: 800 }}>Gaming Gear / Phụ kiện</div>
                      <div style={{ fontSize: 14, color: 'var(--market-muted)' }}>12 - 24 tháng</div>
                   </div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--market-primary)', marginBottom: 12 }}>3. Quy trình thực hiện</h3>
                <div style={{ display: 'grid', gap: 12 }}>
                   <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12 }}>1</div>
                      <div style={{ fontSize: 15 }}>Kiểm tra tình trạng bảo hành qua công cụ tra cứu nhanh bên cạnh.</div>
                   </div>
                   <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12 }}>2</div>
                      <div style={{ fontSize: 15 }}>Đăng nhập và tạo phiếu hỗ trợ (Ticket) nếu phát hiện lỗi phần cứng.</div>
                   </div>
                   <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12 }}>3</div>
                      <div style={{ fontSize: 15 }}>Mang thiết bị kèm mã Ticket đến PC Mall để được xử lý ưu tiên.</div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* User History (If logged in, visible below policy) */}
          {isAuthenticated && (
            <div className="market-panel" style={{ padding: 40, marginTop: 32 }}>
               <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Lịch sử Bảo hành của bạn</h2>
               <div style={{ display: 'grid', gap: 16 }}>
                  {myWarranties.length > 0 ? myWarranties.map(w => (
                    <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 20, border: '1px solid #eee', borderRadius: 16 }}>
                       <div>
                          <div style={{ fontWeight: 800, marginBottom: 4 }}>{w.item.productName}</div>
                          <div style={{ fontSize: 13, color: 'var(--market-muted)' }}>Mã: <span style={{ color: 'var(--market-primary)', fontWeight: 600 }}>{w.warrantyCode}</span></div>
                       </div>
                       <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: 12, fontWeight: 800, color: w.status === 'ACTIVE' ? '#22c55e' : '#ef4444' }}>{w.status}</span>
                          <div style={{ fontSize: 12, color: 'var(--market-muted)', marginTop: 4 }}>Hết hạn: {formatDateTime(w.expiresAt)}</div>
                       </div>
                    </div>
                  )) : (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--market-muted)', background: '#f8fafc', borderRadius: 16 }}>Chưa có dữ liệu bảo hành nào được lưu trên tài khoản.</div>
                  )}
               </div>
            </div>
          )}
        </section>

        {/* Right Column: Tools & Quick Actions */}
        <aside style={{ position: 'sticky', top: 100, height: 'fit-content' }}>
          {/* Quick Lookup Card */}
          <div className="market-panel" style={{ padding: 32, border: '2px solid var(--market-primary)', boxShadow: '0 20px 40px rgba(59,130,246,0.1)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Tra cứu nhanh</h3>
            <p style={{ fontSize: 14, color: 'var(--market-muted)', marginBottom: 20 }}>Nhập mã serial dán trên sản phẩm để kiểm tra thời hạn bảo hành ngay.</p>
            
            <form onSubmit={handleLookup} style={{ display: 'grid', gap: 12 }}>
              <input 
                placeholder="Nhập mã bảo hành..." 
                value={lookupCode}
                onChange={(e) => setLookupCode(e.target.value)}
                style={{ height: 50, borderRadius: 12, border: '1px solid #ddd', padding: '0 16px', outline: 'none', background: '#f8fafc' }}
              />
              <button className="market-btn market-btn--primary" style={{ height: 50, width: '100%' }} disabled={lookupLoading}>
                {lookupLoading ? "Đang truy vấn..." : "Kiểm tra ngay"}
              </button>
            </form>

            {lookupResult && (
              <div style={{ marginTop: 24, padding: 20, background: '#f0f9ff', borderRadius: 16, border: '1px solid #bae6fd' }}>
                 <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{lookupResult.productName}</div>
                 <div style={{ fontSize: 12, color: '#15803d', fontWeight: 800, marginBottom: 12 }}>● ĐANG BẢO HÀNH</div>
                 <div style={{ fontSize: 13 }}>Hết hạn: **{formatDateTime(lookupResult.expiresAt)}**</div>
              </div>
            )}

            {lookupError && (
              <div style={{ marginTop: 20, fontSize: 14, color: '#ef4444', fontWeight: 600 }}>{lookupError}</div>
            )}
          </div>

          {/* Member Quick Action */}
          <div className="market-panel" style={{ padding: 32, marginTop: 24, background: '#1e293b', color: '#fff' }}>
             {isAuthenticated ? (
               <>
                 <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Kích hoạt mới</h3>
                 <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 20 }}>Bạn có sản phẩm vừa mua? Kích hoạt bảo hành điện tử ngay để lưu vào hệ thống.</p>
                 {msg.text && <div style={{ fontSize: 14, marginBottom: 12, color: msg.type === 'success' ? '#4ade80' : '#f87171' }}>{msg.text}</div>}
                 
                 {eligibleItems.length > 0 ? (
                    <form onSubmit={handleActivate} style={{ display: 'grid', gap: 12 }}>
                       <select 
                         style={{ height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '0 10px', fontSize: 13 }}
                         value={selectedOrderItemId}
                         onChange={(e) => setSelectedOrderItemId(e.target.value)}
                       >
                          {eligibleItems.map(item => <option key={item.id} value={item.id} style={{color: '#000'}}>{item.productName}</option>)}
                       </select>
                       <button className="market-btn market-btn--primary" style={{ height: 44 }} disabled={submitting}>Kích hoạt</button>
                    </form>
                 ) : (
                    <div style={{ fontSize: 13, opacity: 0.6 }}>Không có linh kiện chờ kích hoạt.</div>
                 )}
               </>
             ) : (
               <>
                 <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Quản lý Bảo hành</h3>
                 <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 20 }}>Đăng nhập để xem danh sách bảo hành tập trung và gửi phiếu sửa chữa online.</p>
                 <Link to="/login" className="market-btn market-btn--primary" style={{ display: 'flex', justifyContent: 'center', height: 44, alignItems: 'center' }}>Đăng nhập ngay</Link>
               </>
             )}
          </div>
        </aside>
      </div>
    </div>
  );
}
