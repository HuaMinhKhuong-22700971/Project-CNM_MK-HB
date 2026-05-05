export function BuildComponentSection({
  title,
  componentType,
  products,
  selectedProductId,
  selectedVariantId,
  variantOptions,
  selectedItem,
  loading,
  disabled,
  onProductChange,
  onVariantChange,
  onApply,
  onRemove
}) {
  const isReady = Boolean(selectedVariantId);

  // Map icons for each component type
  const getIcon = (type) => {
    switch(type) {
      case 'cpu': return '🔳';
      case 'mainboard': return '📟';
      case 'ram': return '📏';
      case 'gpu': return '🎮';
      case 'storage': return '💾';
      case 'psu': return '🔌';
      case 'case': return '🖥️';
      default: return '📦';
    }
  };

  return (
    <section className="market-panel" style={{ 
      padding: 32, borderRadius: 32, 
      border: selectedItem ? '2px solid #3b82f6' : '1px solid #e2e8f0',
      transition: 'all 0.3s ease',
      background: '#fff',
      boxShadow: selectedItem ? '0 20px 25px -5px rgba(59, 130, 246, 0.1)' : '0 10px 15px -3px rgba(0,0,0,0.02)'
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
           <div style={{ 
             width: 52, height: 52, background: selectedItem ? '#3b82f6' : '#f1f5f9', 
             borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
             color: selectedItem ? '#fff' : '#475569'
           }}>
             {getIcon(componentType)}
           </div>
           <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{componentType}</div>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#0f172a' }}>{title}</h3>
           </div>
        </div>
        <div style={{ textAlign: 'right' }}>
           <span style={{ 
             padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 800, 
             background: selectedItem ? '#dcfce7' : '#f1f5f9', 
             color: selectedItem ? '#15803d' : '#64748b'
           }}>
             {selectedItem ? "ĐÃ LẮP" : "CHƯA CHỌN"}
           </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div style={{ display: 'grid', gap: 8 }}>
           <label style={{ fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Sản phẩm</label>
           <select
            className="market-select"
            value={selectedProductId}
            onChange={(event) => onProductChange(componentType, event.target.value)}
            disabled={disabled || loading}
            style={{ 
              height: 52, borderRadius: 14, border: '1px solid #e2e8f0', background: '#f8fafc',
              fontSize: 15, padding: '0 12px', fontWeight: 600
            }}
          >
            <option value="">-- Chọn linh kiện --</option>
            {products.map((product) => (
              <option key={`${componentType}-${product.product_id || product.id}`} value={product.product_id || product.id}>
                {product.product_name || product.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
           <label style={{ fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Phiên bản / SKU</label>
           <div style={{ position: 'relative' }}>
             <select
              className="market-select"
              value={selectedVariantId}
              onChange={(event) => onVariantChange(componentType, event.target.value)}
              disabled={disabled || loading || variantOptions.length === 0}
              style={{ 
                height: 52, width: '100%', borderRadius: 14, border: '1px solid #e2e8f0', background: '#f8fafc',
                fontSize: 15, padding: '0 12px', fontWeight: 600
              }}
            >
              {loading ? (
                <option>Đang xử lý API...</option>
              ) : (
                <>
                  <option value="">{variantOptions.length > 0 ? "-- Chọn phiên bản --" : "Sản phẩm không có SKU"}</option>
                  {variantOptions.map((variant) => (
                    <option key={`${componentType}-variant-${variant.variant_id}`} value={variant.variant_id}>
                      {variant.sku} - {Number(variant.price || 0).toLocaleString("vi-VN")}đ
                    </option>
                  ))}
                </>
              )}
            </select>
            {loading && (
              <div style={{ 
                position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)',
                width: 18, height: 18, border: '3px solid rgba(59,130,246,0.1)', borderTopColor: '#3b82f6',
                borderRadius: '50%', animation: 'spin 0.6s linear infinite'
              }} />
            )}
           </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button 
          className="market-btn market-btn--primary" 
          type="button" 
          onClick={() => onApply(componentType)} 
          disabled={disabled || !isReady || loading}
          style={{ 
            flex: 1, height: 52, borderRadius: 16, fontSize: 14, fontWeight: 900, 
            textTransform: 'uppercase', letterSpacing: '0.05em' 
          }}
        >
          {loading ? "ĐANG XỬ LÝ..." : selectedItem ? "Cập nhật lựa chọn" : "Xác nhận vào cấu hình"}
        </button>
        {selectedItem && (
          <button 
            className="market-btn market-btn--ghost" 
            type="button" 
            onClick={() => onRemove(componentType)} 
            disabled={disabled || loading}
            style={{ 
              width: 52, height: 52, borderRadius: 16, border: '1px solid #ef4444', color: '#ef4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
            }}
            title="Xóa linh kiện này"
          >
            🗑
          </button>
        )}
      </div>

      {selectedItem && (
        <div style={{ 
          marginTop: 20, padding: '16px 20px', background: '#f0f9ff', borderRadius: 20, 
          borderLeft: '5px solid #3b82f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
        }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e40af' }}>{selectedItem.product?.name}</div>
              <span style={{ fontSize: 11, color: '#7dd3fc', fontWeight: 800 }}>({selectedItem.variant?.sku})</span>
           </div>
           <div style={{ fontSize: 16, fontWeight: 900, color: '#0369a1' }}>
             {Number(selectedItem.variant?.price || 0).toLocaleString("vi-VN")}đ
           </div>
        </div>
      )}
    </section>
  );
}
