import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { addStoredCompareId, buildCompareUrl } from "../../utils/compare";
import { resolveProductImage } from "../../utils/productImage";

const STAR_TEXT = "★★★★★";

function getProductName(product) {
  return product?.product_name || product?.name || "Sản phẩm đang cập nhật";
}

function getBrandName(product) {
  return product?.brand_name || product?.brand?.name || "Thương hiệu";
}

function getProductCategory(product) {
  return String(product?.category_name || product?.category?.name || "");
}

function getProductPrice(product) {
  return Number(product?.price ?? product?.pricing?.minPrice ?? product?.defaultVariant?.price ?? product?.skus?.[0]?.price ?? 0);
}

function getProductStock(product) {
  return Number(product?.stock ?? product?.stock_quantity ?? product?.defaultVariant?.stock ?? product?.skus?.[0]?.stock ?? 0);
}

function getCoolingType(product) {
  const rawValues = [
    product?.coolingType,
    product?.cooling_type,
    ...(Array.isArray(product?.attributes)
      ? product.attributes.map((attribute) => ({
          key: attribute?.key || attribute?.name || attribute?.attribute_name,
          value: attribute?.value || attribute?.attribute_value
        }))
      : [])
  ];

  for (const item of rawValues) {
    if (!item) continue;
    if (typeof item === "string") {
      const normalized = item.toLowerCase();
      if (normalized.includes("air")) return "AIR COOLER";
      if (normalized.includes("aio") || normalized.includes("liquid")) return "AIO";
      if (normalized.includes("fan")) return "CASE FAN";
    } else {
      const key = String(item.key || "").toLowerCase();
      const value = String(item.value || "").toLowerCase();
      if (key.includes("cooling") || key.includes("radiator") || key.includes("fan")) {
        if (value.includes("air")) return "AIR COOLER";
        if (value.includes("aio") || value.includes("liquid")) return "AIO";
        if (value.includes("fan")) return "CASE FAN";
      }
    }
  }

  const category = getProductCategory(product).toLowerCase();
  if (category.includes("cooling") || category.includes("cooler")) return "AIR COOLER";
  return "";
}

function getStockMeta(stock) {
  if (stock <= 0) return { label: "Hết hàng", tone: "danger" };
  if (stock <= 5) return { label: "Sắp hết", tone: "warning" };
  return { label: "Còn hàng", tone: "success" };
}

export function ProductCard({ product }) {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(() => resolveProductImage(product));

  const productId = product?.product_id || product?.id;
  const productName = getProductName(product);
  const productSlug = product?.slug || productId;
  const brandName = getBrandName(product);
  const categoryName = getProductCategory(product);
  const price = getProductPrice(product);
  const oldPrice = Number(product?.oldPrice || Math.round(price * 1.14));
  const discountPercent = Number(product?.discountPercent || 12);
  const rating = Number(product?.rating || 4.8).toFixed(1);
  const soldCount = Number(product?.soldCount || 120);
  const stock = getProductStock(product);
  const stockMeta = getStockMeta(stock);
  const isMall = Boolean(product?.isMall);
  const isFreeShip = Boolean(product?.isFreeShip);
  const coolingType = useMemo(() => getCoolingType(product), [product]);

  function handleCompareClick() {
    if (!productId) return;
    const compareIds = addStoredCompareId(productId);
    navigate(buildCompareUrl(compareIds));
  }

  function handleImageError() {
    setImageLoaded(true);
    setImageSrc(resolveProductImage(product, { fallbackUrl: resolveProductImage({ category_name: categoryName || "cooling" }, { label: brandName }) }));
  }

  return (
    <article className="market-product-card">
      <Link className="market-product-card__link" to={`/products/${productSlug}`}>
        <div className={`market-product-card__media ${imageLoaded ? "is-loaded" : "is-loading"}`}>
          {!imageLoaded ? <div className="market-product-card__skeleton" /> : null}
          <img
            src={imageSrc}
            alt={productName}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />
          <div className="market-product-card__badges">
            <span className="market-product-card__discount">Giảm {discountPercent}%</span>
            {coolingType ? <span className="market-product-card__type">{coolingType}</span> : null}
          </div>
          <div className="market-product-card__flags">
            {isMall ? <span className="market-product-card__mall">Mall</span> : null}
            <span className={`market-product-card__status market-product-card__status--${stockMeta.tone}`}>{stockMeta.label}</span>
          </div>
        </div>

        <div className="market-product-card__body">
          <div className="market-product-card__brand-row">
            <span className="market-product-card__brand">{brandName}</span>
            <span className="market-product-card__category">{categoryName || "PC Mall"}</span>
          </div>

          <div className="market-product-card__name">{productName}</div>

          <div className="market-product-card__price">
            <span className="market-product-card__price-current">{price.toLocaleString("vi-VN")}đ</span>
            <span className="market-product-card__price-old">{oldPrice.toLocaleString("vi-VN")}đ</span>
          </div>

          <div className="market-product-card__meta">
            <span className="market-product-card__rating">
              <span className="market-product-card__stars">{STAR_TEXT}</span>
              <span>{rating}</span>
            </span>
            <span>Đã bán {soldCount}</span>
          </div>

          <div className="market-product-card__bottom">
            <span className="market-product-card__tag">{isFreeShip ? "Freeship" : "Giao nhanh"}</span>
            <span className="market-product-card__tag market-product-card__tag--muted">Tồn kho {Math.max(stock, 0)}</span>
          </div>
        </div>
      </Link>

      <div className="market-product-card__actions">
        <button className="market-product-card__compare" type="button" onClick={handleCompareClick}>
          So sánh
        </button>
        <Link className="market-product-card__detail" to={`/products/${productSlug}`}>
          Chi tiết
        </Link>
      </div>
    </article>
  );
}
