import { Link } from "react-router-dom";

const STAR_TEXT = "★★★★★";

export function ProductCard({ product }) {
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

  return (
    <Link className="market-product-card" to={`/products/${productSlug}`}>
      <div className="market-product-card__media">
        {imageUrl ? <img src={imageUrl} alt={productName} /> : <span>{brandName}</span>}
        <span className="market-product-card__discount">Giảm {discountPercent}%</span>
        {isMall ? <span className="market-product-card__mall">Mall</span> : null}
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
