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

  return (
    <section className="market-build-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--market-muted)" }}>
            Nhóm linh kiện
          </div>
          <h3 style={{ margin: "6px 0 0", fontSize: 24 }}>{title}</h3>
        </div>
        <span className={`market-build-card__status${selectedItem ? " market-build-card__status--active" : ""}`}>
          {selectedItem ? "Đã chọn" : "Chưa chọn"}
        </span>
      </div>

      {selectedItem ? (
        <div className="market-build-card__selected">
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--market-muted)" }}>
            Linh kiện đang dùng
          </div>
          <strong style={{ fontSize: 17 }}>{selectedItem.product?.name}</strong>
          <span style={{ color: "var(--market-muted)" }}>SKU: {selectedItem.variant?.sku || "-"}</span>
          <span style={{ fontWeight: 700 }}>{Number(selectedItem.variant?.price || 0).toLocaleString("vi-VN")}đ</span>
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 12 }}>
        <select
          className="market-select"
          value={selectedProductId}
          onChange={(event) => onProductChange(componentType, event.target.value)}
          disabled={disabled}
        >
          <option value="">Chọn sản phẩm</option>
          {products.map((product) => (
            <option key={`${componentType}-${product.product_id || product.id}-${product.slug || "item"}`} value={product.product_id || product.id}>
              {product.product_name || product.name}
            </option>
          ))}
        </select>

        <select
          className="market-select"
          value={selectedVariantId}
          onChange={(event) => onVariantChange(componentType, event.target.value)}
          disabled={disabled || variantOptions.length === 0}
        >
          <option value="">Chọn phiên bản / SKU</option>
          {variantOptions.map((variant) => (
            <option key={`${componentType}-variant-${variant.variant_id}`} value={variant.variant_id}>
              {variant.sku} - {Number(variant.price || 0).toLocaleString("vi-VN")}đ
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="market-btn market-btn--primary" type="button" onClick={() => onApply(componentType)} disabled={disabled || !isReady || loading}>
          {loading ? "Đang xử lý..." : selectedItem ? "Thay linh kiện" : "Thêm vào cấu hình"}
        </button>
        <button className="market-btn market-btn--ghost" type="button" onClick={() => onRemove(componentType)} disabled={disabled || !selectedItem || loading}>
          Xóa khỏi cấu hình
        </button>
      </div>
    </section>
  );
}
