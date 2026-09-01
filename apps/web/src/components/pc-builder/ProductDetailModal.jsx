import React, { useEffect, useMemo, useState } from "react";
import { getProductDetail } from "../../services/catalog.service";
import { resolveProductImage } from "../../utils/productImage";

const formatCurrency = (v) => Number(v || 0).toLocaleString("vi-VN");

function getWhyNotReasons(product, activeComponent, selectedItems) {
  if (!product || !selectedItems) return [];
  const reasons = [];

  const getSpec = (key) => {
    const specs = product.technicalSpecs || product.compareSpecs || {};
    if (specs[key]) return String(specs[key]);
    const attrs = Array.isArray(product.attributes) ? product.attributes : [];
    const found = attrs.find(a => (a.key || a.name || a.attribute_name || "").toLowerCase().includes(key.toLowerCase()));
    return found ? String(found.value || found.attribute_value) : "";
  };

  const pName = (product.product_name || product.name || "").toLowerCase();

  // 1. SOCKET CHECK (CPU vs Mainboard)
  if (activeComponent === "cpu" && selectedItems.mainboard) {
    const mbSpec = selectedItems.mainboard.product?.specs || selectedItems.mainboard.specs || {};
    const mbSocket = (mbSpec.socket || mbSpec.socket_support || "").toUpperCase();
    const cpuSocket = (getSpec("socket") || getSpec("socket_support") || (pName.includes("lga1700") ? "LGA1700" : pName.includes("am5") ? "AM5" : pName.includes("am4") ? "AM4" : "")).toUpperCase();
    if (mbSocket && cpuSocket && !mbSocket.includes(cpuSocket) && !cpuSocket.includes(mbSocket)) {
      reasons.push({
        severity: "BLOCKER",
        title: "❌ Xung đột Socket CPU",
        text: `Socket CPU này (${cpuSocket}) không khớp với khe cắm trên Mainboard đã chọn (${mbSocket}).`
      });
    }
  }

  if (activeComponent === "mainboard" && selectedItems.cpu) {
    const cpuSpec = selectedItems.cpu.product?.specs || selectedItems.cpu.specs || {};
    const cpuSocket = (cpuSpec.socket || cpuSpec.socket_support || "").toUpperCase();
    const mbSocket = (getSpec("socket") || getSpec("socket_support") || (pName.includes("lga1700") ? "LGA1700" : pName.includes("am5") ? "AM5" : pName.includes("am4") ? "AM4" : "")).toUpperCase();
    if (mbSocket && cpuSocket && !mbSocket.includes(cpuSocket) && !cpuSocket.includes(mbSocket)) {
      reasons.push({
        severity: "BLOCKER",
        title: "❌ Xung đột Socket Mainboard",
        text: `Socket Mainboard này (${mbSocket}) không hỗ trợ CPU đã chọn (${cpuSocket}).`
      });
    }
  }

  // 2. RAM TYPE CHECK (RAM vs Mainboard)
  if (activeComponent === "ram" && selectedItems.mainboard) {
    const mbSpec = selectedItems.mainboard.product?.specs || selectedItems.mainboard.specs || {};
    const mbRamType = (mbSpec.ram_type || "").toUpperCase();
    const ramType = (getSpec("ram_type") || (pName.includes("ddr5") ? "DDR5" : pName.includes("ddr4") ? "DDR4" : "")).toUpperCase();
    if (mbRamType && ramType && mbRamType !== ramType) {
      reasons.push({
        severity: "BLOCKER",
        title: "❌ Chuẩn RAM không khớp",
        text: `RAM chuẩn ${ramType} không tương thích khe cắm ${mbRamType} trên Mainboard.`
      });
    }
  }

  // 3. COOLING CAPACITY CHECK
  if (activeComponent === "cooling" && selectedItems.cpu) {
    const cpuSpec = selectedItems.cpu.product?.specs || selectedItems.cpu.specs || {};
    const cpuTdp = Number(cpuSpec.tdp || 65);
    const coolCap = Number(getSpec("cooling_capacity") || getSpec("tdp") || (pName.includes("240") ? 220 : pName.includes("360") ? 300 : 150));
    if (coolCap < cpuTdp) {
      reasons.push({
        severity: "WARNING",
        title: "⚠️ Công suất tản nhiệt chưa đủ cao",
        text: `Khả năng tản nhiệt (${coolCap}W) thấp hơn TDP tỏa nhiệt tối đa của CPU (${cpuTdp}W).`
      });
    }
  }

  // 4. PSU WATTAGE CHECK
  if (activeComponent === "psu" && (selectedItems.cpu || selectedItems.gpu)) {
    const cpuTdp = Number(selectedItems.cpu?.product?.specs?.tdp || 65);
    const gpuTdp = Number(selectedItems.gpu?.product?.specs?.tdp || 160);
    const reqWatt = Math.round((cpuTdp + gpuTdp + 50) * 1.2);
    const psuWatt = Number(getSpec("psu_wattage") || (pName.match(/(\d{3,4})w/) ? pName.match(/(\d{3,4})w/)[1] : 500));
    if (psuWatt < reqWatt) {
      reasons.push({
        severity: "BLOCKER",
        title: "❌ Công suất Nguồn (PSU) quá thấp",
        text: `Bộ nguồn ${psuWatt}W không đủ cho cấu hình hiện tại (cần tối thiểu ${reqWatt}W).`
      });
    }
  }

  // 5. IF NO CONFLICT FOUND -> POSITIVE CONFIRMATION
  if (reasons.length === 0) {
    reasons.push({
      severity: "INFO",
      title: "✅ Phù hợp hoàn hảo với Build hiện tại",
      text: "Linh kiện này hoàn toàn tương thích và khớp thông số kỹ thuật với các linh kiện đã chọn."
    });
  }

  return reasons;
}

export function ProductDetailModal({ isOpen, onClose, product, activeComponent, isSelected, onSelectProduct, selectedItems, catalogOptions = [] }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!isOpen || !product) {
      setDetail(null);
      setImageError(false);
      return;
    }

    let mounted = true;
    async function loadDetail() {
      const productId = product?.product_id || product?.id;
      if (!productId) {
        setDetail(product);
        return;
      }

      setLoading(true);
      try {
        const res = await getProductDetail(productId);
        const data = res?.data || res;
        if (mounted) {
          setDetail({ ...product, ...data });
        }
      } catch (_err) {
        if (mounted) {
          setDetail(product);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDetail();
    return () => { mounted = false; };
  }, [isOpen, product]);

  // ✅ ALL hooks must be called BEFORE any early return (Rules of Hooks)
  const currentProduct = detail || product || {};
  const name = currentProduct?.product_name || currentProduct?.name || "Chi tiết sản phẩm";
  const brand = currentProduct?.brand_name || currentProduct?.brand?.name || "PC Mall";
  const category = currentProduct?.category_name || currentProduct?.category?.name || activeComponent?.toUpperCase() || "Linh kiện";
  const price = Number(currentProduct?.price || 0);
  const stock = Number(currentProduct?.stock_quantity ?? currentProduct?.stock ?? 15);
  const rating = Number(currentProduct?.rating || 4.8).toFixed(1);

  // Image source resolved before early return
  const imageSrc = resolveProductImage(currentProduct);

  // Technical specs map
  const techSpecs = currentProduct?.technicalSpecs || currentProduct?.compareSpecs || {};
  const attributes = Array.isArray(currentProduct?.attributes) ? currentProduct.attributes : [];

  const specList = Object.keys(techSpecs).length > 0
    ? Object.entries(techSpecs).map(([key, value]) => ({ key, value }))
    : attributes.length > 0
      ? attributes.map((a) => ({ key: a.key || a.name || a.attribute_name, value: a.value || a.attribute_value }))
      : [
          { key: "Danh mục", value: category },
          { key: "Thương hiệu", value: brand },
          { key: "Bảo hành", value: "36 Tháng chính hãng" },
          { key: "Tình trạng", value: "Mới 100% nguyên seal" }
        ];

  const whyNotReasons = getWhyNotReasons(currentProduct, activeComponent, selectedItems);

  // ✅ useMemo BEFORE early return to satisfy Rules of Hooks
  const alternativeProduct = useMemo(() => {
    if (!currentProduct || !catalogOptions || catalogOptions.length < 2) return null;
    const currentPrice = Number(currentProduct.price || price || 0);
    if (currentPrice <= 0) return null;

    const curId = currentProduct.product_id || currentProduct.id;

    // Filter items in same catalog lower by 10% to 30%
    const candidates = catalogOptions.filter((p) => {
      const pId = p.product_id || p.id;
      if (String(pId) === String(curId)) return false;
      const pPrice = Number(p.price || 0);
      return pPrice > 0 && pPrice >= currentPrice * 0.70 && pPrice <= currentPrice * 0.90;
    });

    if (candidates.length === 0) return null;

    const bestAlt = [...candidates].sort((a, b) => {
      const priceA = Number(a.price || 0);
      const priceB = Number(b.price || 0);
      const target = currentPrice * 0.85;
      return Math.abs(priceA - target) - Math.abs(priceB - target);
    })[0];

    const altPrice = Number(bestAlt.price || 0);
    const savings = currentPrice - altPrice;

    return {
      product: bestAlt,
      name: bestAlt.product_name || bestAlt.name || "Sản phẩm cùng phân khúc",
      price: altPrice,
      savings
    };
  }, [currentProduct, catalogOptions, price]);

  // ✅ Early return AFTER all hooks
  if (!isOpen || !product) return null;

  function handleSelectAndClose() {
    onSelectProduct(activeComponent, product);
    onClose();
  }

  return (
    <div className="product-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-product-title">
      <div className="product-modal-card" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <header className="product-modal-header">
          <div>
            <span className="product-modal-category">{category} • {brand}</span>
            <h3 className="product-modal-title" id="modal-product-title">{name}</h3>
          </div>
          <button type="button" className="product-modal-close" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </header>

        {/* Body */}
        <div className="product-modal-body">
          {/* Left Column: Image */}
          <div className="product-modal-media">
            <div className="product-modal-img-wrap">
              {!imageError && imageSrc ? (
                <img
                  src={imageSrc}
                  alt={name}
                  className="product-modal-img"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="product-modal-no-img">
                  <span style={{ fontSize: "42px" }}>📦</span>
                  <span>{name}</span>
                </div>
              )}
            </div>

            <div className="product-modal-badges">
              <span className="modal-badge modal-badge--stock">✓ Sẵn hàng ({stock} sp)</span>
              <span className="modal-badge modal-badge--rating">★ {rating} / 5.0</span>
            </div>
          </div>

          {/* Right Column: Specs & Info */}
          <div className="product-modal-info">
            {/* Price Box */}
            <div className="product-modal-price-box">
              <span className="product-modal-price">{formatCurrency(price)}</span>
              <span className="product-modal-price-unit">đ</span>
              <span className="product-modal-vat">Đã bao gồm VAT</span>
            </div>

            {/* WHY NOT / REALTIME COMPATIBILITY ANALYSIS SECTION */}
            <div className="product-modal-whynot-section" style={{
              marginTop: "14px",
              marginBottom: "14px",
              padding: "12px 16px",
              borderRadius: "12px",
              backgroundColor: isSelected ? "#f0fdf4" : "#f8fafc",
              border: `1px solid ${isSelected ? "#bbf7d0" : "#e2e8f0"}`
            }}>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "13.5px", fontWeight: "700", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>🧠</span>
                <span>Phân Tích Tương Thích Với Build (Why / Why Not?):</span>
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {whyNotReasons.map((reason, idx) => (
                  <div key={idx} style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    backgroundColor: reason.severity === "BLOCKER" ? "#fff1f2" : reason.severity === "WARNING" ? "#fff7ed" : "#ffffff",
                    border: `1px solid ${reason.severity === "BLOCKER" ? "#fecdd3" : reason.severity === "WARNING" ? "#ffedd5" : "#e2e8f0"}`
                  }}>
                    <div style={{
                      fontWeight: "700",
                      fontSize: "12.5px",
                      color: reason.severity === "BLOCKER" ? "#be123c" : reason.severity === "WARNING" ? "#c2410c" : "#15803d"
                    }}>
                      {reason.title}
                    </div>
                    <p style={{ margin: "3px 0 0 0", fontSize: "12px", color: "#334155", lineHeight: "1.45" }}>
                      {reason.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ALTERNATIVE RECOMMENDATION SECTION */}
            {alternativeProduct && (
              <div style={{
                marginTop: "12px",
                marginBottom: "14px",
                padding: "12px 16px",
                borderRadius: "12px",
                backgroundColor: "#f0f9ff",
                border: "1px solid #bae6fd",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "13px", color: "#0369a1", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>💡 Gợi ý thay thế tiết kiệm:</span>
                  </div>
                  <div style={{ fontSize: "12.5px", color: "#0c4a6e", fontWeight: "700", marginTop: "2px" }}>
                    {alternativeProduct.name}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#0284c7", marginTop: "1px" }}>
                    Rẻ hơn <strong>{formatCurrency(alternativeProduct.savings)}đ</strong> ({formatCurrency(alternativeProduct.price)}đ) • Cùng phân khúc & hiệu năng tương đương
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectProduct(activeComponent, alternativeProduct.product);
                    onClose();
                  }}
                  style={{
                    backgroundColor: "#0284c7",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    flexShrink: 0,
                    marginLeft: "10px"
                  }}
                >
                  Chuyển Sang Mua SP Này
                </button>
              </div>
            )}

            {/* Description */}
            {currentProduct?.description && (
              <div className="product-modal-desc">
                <strong>Mô tả sản phẩm:</strong>
                <p>{currentProduct.description}</p>
              </div>
            )}

            {/* Technical Specifications */}
            <div className="product-modal-specs-section">
              <h4 className="product-modal-specs-title">⚙️ Thông số kỹ thuật chi tiết</h4>
              {loading ? (
                <div className="product-modal-loading">Đang tải thông số kỹ thuật...</div>
              ) : (
                <div className="product-modal-specs-table">
                  {specList.map((item, idx) => (
                    <div key={idx} className="modal-spec-row">
                      <span className="modal-spec-key">{item.key}</span>
                      <span className="modal-spec-val">{String(item.value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <footer className="product-modal-footer">
          <button
            type="button"
            className="btn-modal-secondary"
            onClick={() => window.open(`/products/${currentProduct?.slug || currentProduct?.product_id || currentProduct?.id}`, "_blank")}
          >
            Mở trang cửa hàng ↗
          </button>

          <button
            type="button"
            className={`btn-modal-primary${isSelected ? " is-selected" : ""}`}
            onClick={handleSelectAndClose}
          >
            {isSelected ? "✓ Đã chọn vào Cấu Hình" : "+ Chọn Linh Kiện Này"}
          </button>
        </footer>

      </div>
    </div>
  );
}
