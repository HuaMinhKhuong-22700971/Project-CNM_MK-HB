import { Link, useNavigate } from "react-router-dom";

const STAR_TEXT = "★★★★★";

export function ProductCard({ product, isCompareMode }) {
  const navigate = useNavigate();
  const productId = product?.product_id || product?.id;
  const productName = product?.product_name || product?.name || "Sản phẩm đang cập nhật";
  const productSlug = product?.slug || productId;
  const brandName = product?.brand_name || product?.brand?.name || "Thương hiệu";
  const price = Number(product?.price ?? product?.pricing?.minPrice ?? 0);
  const oldPrice = Number(product?.oldPrice || Math.round(price * 1.14));
  const discountPercent = Number(product?.discountPercent || 12);
  const rating = Number(product?.rating || 4.8).toFixed(1);
  const soldCount = Number(product?.soldCount || 120);
  const imageUrl = product?.image_url || product?.defaultVariant?.imageUrl || "";
  const isMall = Boolean(product?.isMall);
  const isFreeShip = Boolean(product?.isFreeShip);

  function handleCardClick(e) {
    if (isCompareMode) {
      e.preventDefault();
      
      const currentIdsStr = sessionStorage.getItem("comparing_product_ids") || "";
      const currentIds = currentIdsStr ? currentIdsStr.split(",") : [];
      
      if (!currentIds.includes(String(productId))) {
        currentIds.push(productId);
      }
      
      const newIdsParam = currentIds.join(",");
      sessionStorage.setItem("comparing_product_ids", newIdsParam);
      navigate(`/compare?ids=${newIdsParam}`);
    }
  }

  return (
    <Link 
      className={`market-product-card ${isCompareMode ? "market-product-card--compare" : ""}`} 
      to={isCompareMode ? "#" : `/products/${productSlug}`}
      onClick={handleCardClick}
      style={isCompareMode ? { position: "relative", border: "2px solid rgba(198,124,49,0.4)" } : {}}
    >
      <div className="market-product-card__media">
        {imageUrl ? <img src={imageUrl} alt={productName} /> : <span>{brandName}</span>}
        <span className="market-product-card__discount">Giảm {discountPercent}%</span>
        {isMall ? <span className="market-product-card__mall">Mall</span> : null}
        
        {isCompareMode && (
          <div style={{
            position: "absolute",
            inset: 0,
            background: "rgba(31, 76, 63, 0.4)",
            display: "grid",
            placeItems: "center",
            opacity: 0,
            transition: "opacity 0.2s",
            color: "#fff",
            zIndex: 10
          }}
          className="market-product-card__compare-overlay"
          onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = 0; }}
          >
            <div style={{ padding: "10px 20px", borderRadius: 99, background: "var(--color-accent)", fontWeight: 800 }}>
              Thêm vào so sánh
            </div>
          </div>
        )}
      </div>

      <div className="market-product-card__body">
        <div className="market-product-card__name">{productName}</div>

        <div className="market-product-card__price">
          <span className="market-product-card__price-current">{price.toLocaleString("vi-VN")}đ</span>
          <span className="market-product-card__price-old">{oldPrice.toLocaleString("vi-VN")}đ</span>
        </div>

        <div className="market-product-card__meta">
          <span className="market-product-card__stars">{STAR_TEXT}</span>
          <span>{rating}</span>
          <span>Đã bán {soldCount}</span>
        </div>

        <div className="market-product-card__bottom">
          <span className="market-product-card__tag">{brandName}</span>
          <span className="market-product-card__tag">{isFreeShip ? "Freeship" : "Giao nhanh"}</span>
        </div>
      </div>
    </Link>
  );
}
