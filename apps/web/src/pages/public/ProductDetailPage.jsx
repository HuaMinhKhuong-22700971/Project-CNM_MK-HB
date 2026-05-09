import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { getProductDetail } from "../../services/catalog.service";
import { addItemToCart } from "../../services/cart.service";
import { useAuth } from "../../hooks/useAuth";
import { addStoredCompareId, buildCompareUrl } from "../../utils/compare";

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }
  return error.message || fallbackMessage;
}

function normalizeProductDetail(response) {
  return response?.data || response;
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

const SECTION_STYLE = {
  padding: "40px",
  background: "rgba(255, 255, 255, 0.7)",
  backdropFilter: "blur(20px)",
  borderRadius: "32px",
  border: "1px solid rgba(255, 255, 255, 0.8)",
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.04)"
};

export function ProductDetailPage() {
  const { idOrSlug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const skus = useMemo(() => (Array.isArray(product?.skus) ? product.skus : []), [product]);
  const variants = useMemo(() => (Array.isArray(product?.variants) ? product.variants : []), [product]);
  const attributes = useMemo(() => (Array.isArray(product?.attributes) ? product.attributes : []), [product]);
  const productId = product?.id || product?.product_id;

  // Image fallback logic: Product -> First SKU -> First Variant -> Placeholder
  const displayImage = useMemo(() => {
    if (product?.image_url) return product.image_url;
    if (skus.length > 0 && skus[0].image_url) return skus[0].image_url;
    if (variants.length > 0 && variants[0].image_url) return variants[0].image_url;
    return null;
  }, [product, skus, variants]);

  const heroPrice = useMemo(() => {
    if (skus.length > 0) return Number(skus[0]?.price || 0);
    if (variants.length > 0) return Number(variants[0]?.price || 0);
    return Number(product?.price || 0);
  }, [product, skus, variants]);

  const availableStock = useMemo(() => {
    if (skus.length > 0) return Number(skus[0]?.stock || 0);
    if (variants.length > 0) return Number(variants[0]?.stock || variants[0]?.stock_quantity || 0);
    return Number(product?.stock || product?.stock_quantity || 0);
  }, [product, skus, variants]);

  const isProductActive = product?.isActive ?? product?.is_active ?? product?.status !== "INACTIVE";

  useEffect(() => {
    async function loadProductDetail() {
      try {
        setLoading(true);
        setFetchError("");
        const response = await getProductDetail(idOrSlug);
        setProduct(normalizeProductDetail(response));
      } catch (error) {
        setFetchError(getErrorMessage(error, "Không thể tải chi tiết sản phẩm."));
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    if (idOrSlug) loadProductDetail();
  }, [idOrSlug]);

  async function handleAddToCart() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      setSubmitting(true);
      setActionError("");
      setSuccessMessage("");
      if (!productId) {
        throw new Error("Không tìm thấy mã sản phẩm để thêm vào giỏ hàng.");
      }
      await addItemToCart({ productId, quantity: 1 });
      setSuccessMessage("Đã thêm sản phẩm vào giỏ hàng thành công!");
    } catch (error) {
      setActionError(getErrorMessage(error, "Không thể thêm vào giỏ hàng."));
    } finally {
      setSubmitting(false);
    }
  }

  function handleCompareProduct() {
    if (!productId) return;
    const compareIds = addStoredCompareId(productId);
    navigate(buildCompareUrl(compareIds));
  }

  if (loading) {
    return (
      <div className="market-container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <div className="market-empty">Đang chuẩn bị dữ liệu sản phẩm cao cấp...</div>
      </div>
    );
  }

  if (fetchError || !product) {
    return (
      <div className="market-container" style={{ padding: '100px 0' }}>
         <div className="market-panel" style={{ padding: 40, textAlign: 'center' }}>
            <h1 style={{ marginBottom: 20 }}>Rất tiếc, không tìm thấy linh kiện</h1>
            <p style={{ color: 'var(--market-muted)', marginBottom: 30 }}>{fetchError || "Sản phẩm này có thể đã ngừng kinh doanh hoặc đường dẫn chưa chính xác."}</p>
            <Link to="/products" className="market-btn market-btn--primary">Quay lại danh sách</Link>
         </div>
      </div>
    );
  }

  return (
    <div className="market-container" style={{ padding: "40px 0 80px" }}>
      {actionError && (
        <div style={{ 
          marginBottom: 24, 
          padding: '16px 24px', 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.2)', 
          color: '#b91c1c', 
          borderRadius: 16,
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>{actionError}</span>
            {actionError.includes("token") && (
              <button 
                onClick={() => navigate("/login")} 
                style={{ 
                  background: '#b91c1c', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '6px 14px', 
                  borderRadius: 8, 
                  fontSize: 12, 
                  cursor: 'pointer',
                  fontWeight: 800
                }}
              >
                Đăng nhập lại
              </button>
            )}
          </div>
          <button onClick={() => setActionError("")} style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontWeight: 800, fontSize: 18 }}>✕</button>
        </div>
      )}
      {successMessage ? (
        <div style={{ 
          marginBottom: 24, 
          padding: '16px 24px', 
          background: 'rgba(34, 197, 94, 0.1)', 
          border: '1px solid rgba(34, 197, 94, 0.2)', 
          color: '#15803d', 
          borderRadius: 16,
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>✅ {successMessage}</span>
            <Link 
              to="/cart" 
              style={{ 
                background: '#15803d', 
                color: '#fff', 
                border: 'none', 
                padding: '6px 14px', 
                borderRadius: 8, 
                fontSize: 12, 
                cursor: 'pointer',
                fontWeight: 800,
                textDecoration: 'none'
              }}
            >
              Xem giỏ hàng
            </Link>
          </div>
          <button onClick={() => setSuccessMessage("")} style={{ background: 'none', border: 'none', color: '#15803d', cursor: 'pointer', fontWeight: 800, fontSize: 18 }}>✕</button>
        </div>
      ) : null}
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .product-hero-image:hover { transform: scale(1.02); }
        .spec-card:hover { background: #fff !important; transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.06); }
        .market-btn--primary:hover { filter: brightness(1.1); transform: scale(1.01); }
      `}</style>

      {/* Breadcrumb Header */}
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--market-muted)', animation: 'fadeIn 0.5s ease-out' }}>
        <Link to="/" style={{ color: 'var(--market-primary)', textDecoration: 'none', fontWeight: 600 }}>Trang chủ</Link>
        <span style={{ opacity: 0.3 }}>/</span>
        <Link to="/products" style={{ color: 'var(--market-primary)', textDecoration: 'none', fontWeight: 600 }}>Linh kiện PC</Link>
        <span style={{ opacity: 0.3 }}>/</span>
        <span style={{ opacity: 0.7, fontWeight: 700 }}>{product?.category?.name || "Chi tiết"}</span>
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 400px", 
        gap: 40, 
        alignItems: "start" 
      }}>
        {/* Left Side: Product Showcase */}
        <div style={{ display: "grid", gap: 32, animation: 'fadeIn 0.6s ease-out' }}>
          <section style={{ 
            ...SECTION_STYLE,
            display: "grid",
            placeItems: "center",
            minHeight: 560,
            position: 'relative',
            background: 'radial-gradient(circle at center, #fff 0%, #f9fafb 100%)',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'var(--market-primary)', opacity: 0.05, filter: 'blur(100px)', zIndex: 0 }}></div>
            
            {displayImage ? (
              <img 
                src={displayImage} 
                alt={product.name} 
                className="product-hero-image"
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: 480, 
                  objectFit: 'contain', 
                  borderRadius: 24, 
                  zIndex: 1, 
                  transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.12))'
                }}
              />
            ) : (
               <div style={{ textAlign: 'center', opacity: 0.3, zIndex: 1 }}>
                  <div style={{ fontSize: 120, marginBottom: 20 }}>📦</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>Hình ảnh bản quyền đang được cập nhật</div>
               </div>
            )}
          </section>

          {/* Detailed Info Tabs */}
          <div style={{ ...SECTION_STYLE, padding: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
              <div style={{ width: 4, height: 32, background: 'var(--market-primary)', borderRadius: 4 }}></div>
              <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em' }}>Mô tả sản phẩm</h2>
            </div>
            
            <div 
              style={{ lineHeight: 1.8, color: '#4b5563', fontSize: 17, marginBottom: 56 }}
              dangerouslySetInnerHTML={{ __html: product.description || "Chưa có nội dung mô tả chi tiết cho sản phẩm này." }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
              <div style={{ width: 4, height: 32, background: 'var(--market-primary)', borderRadius: 4 }}></div>
              <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em' }}>Thông số kỹ thuật</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
               {attributes.length > 0 ? attributes.map(attr => (
                 <div key={attr.key} className="spec-card" style={{ 
                   padding: '24px', 
                   background: 'rgba(248, 250, 252, 0.6)', 
                   borderRadius: 20,
                   border: '1px solid rgba(0,0,0,0.03)',
                   display: 'grid',
                   gap: 8,
                   transition: 'all 0.3s ease'
                 }}>
                   <span style={{ fontWeight: 800, color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{attr.key}</span>
                   <span style={{ fontWeight: 800, color: '#1e293b', fontSize: 18 }}>{attr.value}</span>
                 </div>
               )) : (
                 <div style={{ gridColumn: '1/-1', padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: 20, color: '#94a3b8', fontStyle: 'italic' }}>
                   Thông số kỹ thuật linh kiện đang được chuyên gia cập nhật...
                 </div>
               )}
            </div>
          </div>
          
          {/* Variants Table */}
          <div style={{ ...SECTION_STYLE, padding: '48px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
               <div style={{ width: 4, height: 32, background: 'var(--market-primary)', borderRadius: 4 }}></div>
               <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em' }}>Tất cả phiên bản SKU</h2>
             </div>
             
             <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                   <thead>
                      <tr style={{ textAlign: 'left', color: '#94a3b8', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                         <th style={{ padding: '0 24px' }}>Mã linh kiện</th>
                         <th style={{ padding: '0 24px' }}>Đơn giá</th>
                         <th style={{ padding: '0 24px', textAlign: 'center' }}>Kho</th>
                         <th style={{ padding: '0 24px', textAlign: 'right' }}>Trạng thái</th>
                      </tr>
                   </thead>
                   <tbody>
                      {(skus.length > 0 ? skus : (variants.length > 0 ? variants : [{ sku: product.sku, price: product.price, stock: product.stock }])).map((v, i) => (
                        <tr key={i} style={{ background: 'rgba(255,255,255,0.4)', borderRadius: 16, transition: 'background 0.2s' }}>
                           <td style={{ padding: '24px', fontWeight: 800, color: '#1e293b', borderTopLeftRadius: 16, borderBottomLeftRadius: 16 }}>{v.sku}</td>
                           <td style={{ padding: '24px', color: 'var(--market-primary)', fontWeight: 900, fontSize: 18 }}>{formatCurrency(v.price)} <span style={{ fontSize: 12 }}>đ</span></td>
                           <td style={{ padding: '24px', textAlign: 'center', fontWeight: 700 }}>{v.stock || 0}</td>
                           <td style={{ padding: '24px', textAlign: 'right', borderTopRightRadius: 16, borderBottomRightRadius: 16 }}>
                              <span style={{ 
                                padding: '8px 16px', 
                                borderRadius: 10, 
                                fontSize: 11, 
                                fontWeight: 900,
                                background: (v.stock > 0) ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: (v.stock > 0) ? '#15803d' : '#b91c1c'
                              }}>
                                {(v.stock > 0) ? '● CÒN HÀNG' : '○ TẠM HẾT'}
                              </span>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>

        {/* Right Side: Sticky Checkout / Configurator */}
        <div style={{ position: "sticky", top: 100, display: "grid", gap: 24, animation: 'fadeIn 0.7s ease-out' }}>
          <section style={{ 
            ...SECTION_STYLE, 
            padding: 40,
            background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)",
          }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
               <span style={{ padding: '6px 12px', background: 'var(--market-primary)', color: '#fff', borderRadius: 8, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{product?.category?.name || "Linh kiện"}</span>
               <span style={{ padding: '6px 12px', background: 'rgba(51, 65, 85, 0.1)', color: '#334155', borderRadius: 8, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Chính hãng 100%</span>
            </div>

            <h1 style={{ fontSize: 34, fontWeight: 900, marginBottom: 20, lineHeight: 1.1, letterSpacing: '-0.04em', color: '#1e293b' }}>{product.name}</h1>
            
            <div style={{ marginBottom: 40, padding: '24px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: 24, border: '1px solid rgba(59, 130, 246, 0.1)' }}>
               <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.08em' }}>Giá ưu đãi độc quyền</div>
               <div style={{ fontSize: 42, fontWeight: 950, color: 'var(--market-primary)', display: 'flex', alignItems: 'baseline', gap: 8 }}>
                 {formatCurrency(heroPrice)} 
                 <span style={{ fontSize: 20, fontWeight: 700, opacity: 0.8 }}>đ</span>
               </div>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              <button 
                className="market-btn--primary" 
                style={{ 
                  height: 64, 
                  fontSize: 16, 
                  fontWeight: 900, 
                  borderRadius: 18, 
                  border: 'none',
                  color: '#fff',
                  background: 'linear-gradient(135deg, var(--market-primary), #2b6b58)',
                  boxShadow: '0 10px 20px rgba(15, 76, 63, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onClick={handleAddToCart}
                disabled={submitting || !isProductActive || availableStock <= 0}
              >
                 {submitting ? "ĐANG XỬ LÝ..." : "MUA NGAY - THÊM VÀO GIỎ"}
              </button>
              
              <Link to="/pc-builder" className="market-btn--outline" style={{ 
                height: 60, 
                fontSize: 15, 
                fontWeight: 800,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                background: '#fff', 
                borderRadius: 18,
                border: '2px solid rgba(15, 76, 63, 0.15)',
                color: 'var(--market-primary)',
                textDecoration: 'none',
                transition: 'all 0.3s'
              }}>
                 ĐƯA VÀO PC BUILDER
              </Link>

              <button
                type="button"
                onClick={handleCompareProduct}
                style={{
                  height: 56,
                  fontSize: 15,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(32, 120, 202, 0.08)",
                  borderRadius: 18,
                  border: "2px solid rgba(32, 120, 202, 0.18)",
                  color: "var(--market-primary)",
                  cursor: "pointer"
                }}
              >
                 SO SÁNH SẢN PHẨM NÀY
              </button>
            </div>

            <div style={{ marginTop: 32, padding: '24px', background: 'rgba(241, 245, 249, 0.5)', borderRadius: 24, fontSize: 13, border: '1px solid rgba(0,0,0,0.02)' }}>
                <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Tình trạng:</span>
                  <span style={{ fontWeight: 800, color: '#15803d' }}>Sẵn hàng tại kho</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Đánh giá:</span>
                  <span style={{ fontWeight: 800, color: '#eab308', letterSpacing: '2px' }}>★★★★★</span>
                </div>
            </div>
          </section>

          <div style={{ padding: 24, background: 'rgba(59, 130, 246, 0.03)', border: '1px dashed #3b82f6', borderRadius: 24, textAlign: 'center' }}>
             <p style={{ fontSize: 14, margin: '0 0 12px', fontWeight: 600 }}>Bạn chưa biết cách lắp ráp?</p>
             <Link to="/ai-chat" style={{ color: 'var(--market-primary)', fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>→ Hỏi AI Advisor của PC Mall</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
