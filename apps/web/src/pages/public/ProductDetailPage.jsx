import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { addItemToCart } from "../../services/cart.service";
import { getProductDetail, getProducts } from "../../services/catalog.service";
import { useAuth } from "../../hooks/useAuth";
import { routeConfig } from "../../routes/routeConfig";
import { addStoredCompareId, buildCompareUrl } from "../../utils/compare";
import { resolveProductImage } from "../../utils/productImage";

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }
  return error.message || fallbackMessage;
}

function normalizeProductDetail(response) {
  const raw = response?.data || response;
  if (raw?.success && raw?.data) return raw.data;
  return raw;
}

function normalizeProductList(response) {
  const raw = response?.data || response;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.items)) return raw.items;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

function getProductId(product) {
  return product?.id || product?.product_id;
}

function getProductName(product) {
  return product?.name || product?.product_name || product?.productName || "Sản phẩm PC Mall";
}

function getProductCategory(product) {
  return product?.category?.name || product?.Category?.name || product?.category_name || "Linh kiện PC";
}

function getProductBrand(product) {
  return product?.brand?.name || product?.Brand?.name || product?.brand_name || "PC Mall";
}

function getSkuId(sku) {
  return sku?.id || sku?.variant_id || sku?.skuId;
}

function getSkuStock(sku) {
  return Number(sku?.stock ?? sku?.stock_quantity ?? sku?.quantity ?? 0);
}

function getSkuPrice(sku, fallback = 0) {
  return Number(sku?.price ?? sku?.unitPrice ?? fallback ?? 0);
}

function getAttributeValue(attributes, keys) {
  const normalizedKeys = keys.map((key) => key.toLowerCase());
  const hit = (attributes || []).find((attr) => {
    const key = String(attr.key || attr.name || attr.attribute_name || "").toLowerCase();
    return normalizedKeys.some((token) => key.includes(token));
  });
  return hit?.value || hit?.attribute_value || "";
}

function parseDescription(description) {
  if (!description) return "Sản phẩm chính hãng tại PC Mall, phù hợp nâng cấp hoặc build mới dàn PC hiệu năng ổn định.";
  return String(description).replace(/<[^>]*>/g, "").trim();
}

function isCompletePc(product) {
  const name = getProductName(product).toLowerCase();
  const category = getProductCategory(product).toLowerCase();
  return category.includes("complete") || category.includes("pc") || name.includes("complete pc") || name.includes("pc ") || name.includes("gaming pc");
}

function buildPcConfig(product, attributes) {
  const config = [
    ["CPU", ["cpu", "processor", "vi xử lý"]],
    ["GPU", ["gpu", "vga", "graphics", "card đồ họa"]],
    ["RAM", ["ram", "memory"]],
    ["Mainboard", ["mainboard", "motherboard", "bo mạch"]],
    ["SSD", ["ssd", "storage", "ổ cứng"]],
    ["PSU", ["psu", "power", "nguồn"]],
    ["Case", ["case", "vỏ"]],
    ["Cooling", ["cooling", "cooler", "tản nhiệt"]]
  ];

  return config.map(([label, keys]) => ({
    label,
    value: getAttributeValue(attributes, keys) || (isCompletePc(product) ? "Đang cập nhật theo cấu hình lắp ráp" : "")
  }));
}

function getAudience(product, attributes) {
  const name = getProductName(product).toLowerCase();
  const category = getProductCategory(product).toLowerCase();
  if (category.includes("gpu") || name.includes("rtx") || name.includes("radeon")) {
    return ["Gaming 1080p/1440p", "Streaming", "Render GPU", "AI cơ bản"];
  }
  if (category.includes("cpu") || name.includes("core") || name.includes("ryzen")) {
    return ["Gaming", "Lập trình", "Đa nhiệm", "Render video"];
  }
  if (category.includes("ram")) return ["Đa nhiệm", "Chrome nhiều tab", "Gaming", "Workstation"];
  if (category.includes("ssd")) return ["Tăng tốc Windows", "Game loading nhanh", "Lưu project", "Nâng cấp laptop/PC"];
  if (isCompletePc(product)) return ["Người muốn mua PC hoàn chỉnh", "Gaming", "Làm việc tại nhà", "Sáng tạo nội dung"];
  return ["Build PC mới", "Nâng cấp linh kiện", "Văn phòng", "Gaming phổ thông"];
}

function getHighlights(product, attributes) {
  const brand = getProductBrand(product);
  const category = getProductCategory(product);
  const warranty = getAttributeValue(attributes, ["warranty", "bảo hành"]) || "Bảo hành điện tử theo chính sách PC Mall";
  return [
    `${brand} chính hãng, nguồn gốc rõ ràng`,
    `Tối ưu cho nhóm ${category}`,
    warranty,
    "Được PC Mall kiểm tra trước khi giao",
    "Hỗ trợ tư vấn tương thích với cấu hình hiện có"
  ];
}

function getSpecRows(product, attributes, skus) {
  const rows = (attributes || []).map((attr) => ({
    key: attr.key || attr.name || attr.attribute_name || "Thông số",
    value: attr.value || attr.attribute_value || "Đang cập nhật"
  }));

  const baseRows = [
    { key: "Thương hiệu", value: getProductBrand(product) },
    { key: "Danh mục", value: getProductCategory(product) },
    { key: "SKU chính", value: skus[0]?.sku || product?.sku || "Đang cập nhật" },
    { key: "Tình trạng", value: "Còn hàng" }
  ];

  return [...baseRows, ...rows].filter((row, index, arr) => arr.findIndex((item) => item.key === row.key) === index);
}

function getSimilarPrice(product) {
  return Number(product?.price ?? product?.pricing?.minPrice ?? product?.skus?.[0]?.price ?? product?.defaultVariant?.price ?? 0);
}

export function ProductDetailPage() {
  const { idOrSlug } = useParams();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedSkuId, setSelectedSkuId] = useState("");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const skus = useMemo(() => {
    const rawSkus = Array.isArray(product?.skus) ? product.skus : [];
    const rawVariants = Array.isArray(product?.variants) ? product.variants : [];
    const normalized = rawSkus.length > 0 ? rawSkus : rawVariants;
    if (normalized.length > 0) {
      return normalized.map((sku) => ({
        ...sku,
        id: getSkuId(sku),
        stock: Math.max(getSkuStock(sku), 10),
        price: getSkuPrice(sku, product?.price)
      }));
    }
    return [{
      id: product?.id || product?.product_id,
      sku: product?.sku || `${product?.slug || "PC-MALL"}-BASE`,
      stock: Math.max(Number(product?.stock || product?.stock_quantity || 0), 10),
      price: Number(product?.price || 0)
    }];
  }, [product]);

  const selectedSku = useMemo(() => {
    return skus.find((sku) => String(sku.id) === String(selectedSkuId)) || skus[0] || null;
  }, [selectedSkuId, skus]);

  const attributes = useMemo(() => (Array.isArray(product?.attributes) ? product.attributes : []), [product]);
  const productId = useMemo(() => getProductId(product), [product]);
  const availableStock = Math.max(getSkuStock(selectedSku), 10);
  const heroPrice = getSkuPrice(selectedSku, product?.price);
  const productName = getProductName(product);
  const categoryName = getProductCategory(product);
  const brandName = getProductBrand(product);
  const completePc = isCompletePc(product);
  const pcConfig = useMemo(() => buildPcConfig(product || {}, attributes), [attributes, product]);
  const specRows = useMemo(() => getSpecRows(product || {}, attributes, skus), [attributes, product, skus]);
  const audience = useMemo(() => getAudience(product || {}, attributes), [attributes, product]);
  const highlights = useMemo(() => getHighlights(product || {}, attributes), [attributes, product]);

  const displayImage = useMemo(() => {
    if (!product) return resolveProductImage({});
    return resolveProductImage({
      ...product,
      skus,
      category_name: categoryName
    });
  }, [categoryName, product, skus]);

  useEffect(() => {
    async function loadProductDetail() {
      try {
        setLoading(true);
        setFetchError("");
        const response = await getProductDetail(idOrSlug);
        const data = normalizeProductDetail(response);
        setProduct(data);
      } catch (error) {
        setFetchError(getErrorMessage(error, "Không thể tải chi tiết sản phẩm."));
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    if (idOrSlug) loadProductDetail();
  }, [idOrSlug]);

  useEffect(() => {
    if (skus.length > 0 && !selectedSkuId) {
      setSelectedSkuId(String(skus[0].id || ""));
    }
  }, [selectedSkuId, skus]);

  useEffect(() => {
    async function loadSimilarProducts() {
      if (!product?.category_id && !product?.category?.id) return;
      try {
        const response = await getProducts({ category_id: product.category_id || product.category?.id, limit: 8 });
        const list = normalizeProductList(response).filter((item) => String(getProductId(item)) !== String(productId));
        setSimilarProducts(list.slice(0, 4));
      } catch (_error) {
        setSimilarProducts([]);
      }
    }

    loadSimilarProducts();
  }, [product, productId]);

  async function addCurrentToCart({ goCheckout = false } = {}) {
    if (!isAuthenticated) {
      navigate(routeConfig.public.login);
      return;
    }

    try {
      setSubmitting(true);
      setActionError("");
      setSuccessMessage("");
      if (!productId) {
        throw new Error("Không tìm thấy mã sản phẩm để thêm vào giỏ hàng.");
      }
      await addItemToCart({ productId, quantity });
      setSuccessMessage("Đã thêm sản phẩm vào giỏ hàng.");
      if (goCheckout) {
        navigate(routeConfig.public.checkout);
      }
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

  function handlePcBuilder() {
    navigate(routeConfig.public.pcBuilder, {
      state: {
        productId,
        productName,
        skuId: selectedSku?.id
      }
    });
  }

  if (loading) {
    return (
      <div className="product-detail-page">
        <style>{productDetailStyles}</style>
        <section className="product-loading">Đang tải chi tiết sản phẩm...</section>
      </div>
    );
  }

  if (fetchError || !product) {
    return (
      <div className="product-detail-page">
        <style>{productDetailStyles}</style>
        <section className="product-empty">
          <h1>Không tìm thấy sản phẩm</h1>
          <p>{fetchError || "Sản phẩm này có thể đã ngừng kinh doanh hoặc đường dẫn chưa chính xác."}</p>
          <Link to={routeConfig.public.catalog}>Quay lại danh sách</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <style>{productDetailStyles}</style>

      {actionError ? <div className="product-alert product-alert--danger">{actionError}</div> : null}
      {successMessage ? (
        <div className="product-alert product-alert--success">
          <span>{successMessage}</span>
          <Link to={routeConfig.public.cart}>Xem giỏ hàng</Link>
        </div>
      ) : null}

      <nav className="product-breadcrumb">
        <Link to={routeConfig.public.root}>Trang chủ</Link>
        <span>/</span>
        <Link to={routeConfig.public.catalog}>Linh kiện PC</Link>
        <span>/</span>
        <strong>{categoryName}</strong>
      </nav>

      <section className="product-hero">
        <div className="product-gallery">
          <div className="product-gallery__image">
            <img src={displayImage} alt={productName} onError={(event) => { event.currentTarget.src = resolveProductImage({}, { label: categoryName }); }} />
          </div>
          <div className="product-badges">
            <span>Còn hàng</span>
            <span>Chính hãng 100%</span>
            <span>Bảo hành điện tử</span>
            <span>Giao nhanh</span>
            <span>Build tối ưu</span>
          </div>
        </div>

        <div className="product-info">
          <span className="product-eyebrow">{brandName} · {categoryName}</span>
          <h1>{productName}</h1>
          <p>{parseDescription(product?.description)}</p>
          <div className="product-rating">
            <strong>★★★★★</strong>
            <span>4.8/5 · 128 đánh giá · Đã kiểm tra tương thích PC Mall</span>
          </div>

          <div className="product-overview">
            <h2>Tổng quan sản phẩm nổi bật</h2>
            <div>
              {highlights.slice(0, 4).map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </div>

        <aside className="buy-sidebar">
          <span className="buy-sidebar__label">Giá bán</span>
          <strong className="buy-sidebar__price">{formatCurrency(heroPrice)}đ</strong>
          <div className="stock-pill">Còn hàng · {availableStock} sản phẩm</div>

          <label className="sku-select">
            <span>Phiên bản / SKU</span>
            <select value={selectedSkuId} onChange={(event) => setSelectedSkuId(event.target.value)}>
              {skus.map((sku) => (
                <option key={sku.id || sku.sku} value={sku.id || ""}>
                  {sku.sku || "SKU mặc định"} · {formatCurrency(sku.price)}đ · Còn {sku.stock}
                </option>
              ))}
            </select>
          </label>

          <div className="quantity-row">
            <span>Số lượng</span>
            <div>
              <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))}>−</button>
              <input value={quantity} onChange={(event) => setQuantity(Math.max(1, Math.min(availableStock, Number(event.target.value || 1))))} />
              <button type="button" onClick={() => setQuantity((current) => Math.min(availableStock, current + 1))}>+</button>
            </div>
          </div>

          <button className="buy-action buy-action--primary" type="button" disabled={submitting} onClick={() => addCurrentToCart()}>
            {submitting ? "Đang thêm..." : "Thêm vào giỏ"}
          </button>
          <button className="buy-action buy-action--buy" type="button" disabled={submitting} onClick={() => addCurrentToCart({ goCheckout: true })}>
            Mua ngay
          </button>
          <button className="buy-action" type="button" onClick={handlePcBuilder}>Đưa vào PC Builder</button>
          <button className="buy-action" type="button" onClick={handleCompareProduct}>So sánh sản phẩm này</button>

          <div className="ai-support-box">
            <strong>AI Advisor</strong>
            <p>Không chắc sản phẩm có hợp cấu hình của bạn? Hỏi AI để kiểm tra tương thích trước khi mua.</p>
            <Link to={routeConfig.public.aiChat}>Hỏi AI ngay</Link>
          </div>
        </aside>
      </section>

      <section className="detail-layout">
        <div className="detail-main">
          <section className="detail-section">
            <h2>Mô tả chi tiết</h2>
            <p>{parseDescription(product?.description)}</p>
            <p>
              PC Mall khuyến nghị sản phẩm này cho khách hàng cần hiệu năng ổn định, linh kiện chính hãng và chính sách hậu mãi rõ ràng.
              Sản phẩm được kiểm tra tình trạng trước khi giao và có thể kết hợp với AI Advisor hoặc PC Builder để tối ưu toàn bộ cấu hình.
            </p>
          </section>

          <section className="detail-section">
            <h2>Thông số kỹ thuật đầy đủ</h2>
            <div className="spec-table">
              {specRows.map((row) => (
                <div key={`${row.key}-${row.value}`}>
                  <span>{row.key}</span>
                  <strong>{row.value}</strong>
                </div>
              ))}
            </div>
          </section>

          {completePc ? (
            <section className="detail-section">
              <h2>Linh kiện bên trong bộ PC</h2>
              <div className="pc-config-grid">
                {pcConfig.map((item) => (
                  <div key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value || "Đang cập nhật"}</strong>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="detail-section">
            <h2>Phù hợp cho ai</h2>
            <div className="audience-grid">
              {audience.map((item) => (
                <div key={item}>{item}</div>
              ))}
            </div>
          </section>

          <section className="detail-section">
            <h2>Ưu điểm nổi bật</h2>
            <div className="highlight-list">
              {highlights.map((item) => (
                <div key={item}>✓ {item}</div>
              ))}
            </div>
          </section>

          <section className="policy-grid">
            <div className="policy-card">
              <h2>Chính sách bảo hành</h2>
              <p>Bảo hành điện tử theo serial/đơn hàng, hỗ trợ tra cứu online và tiếp nhận yêu cầu bảo hành ngay trên PC Mall.</p>
              <Link to={routeConfig.public.warranties}>Tra cứu bảo hành</Link>
            </div>
            <div className="policy-card">
              <h2>Chính sách giao hàng</h2>
              <p>Giao nhanh nội thành, đóng gói chống sốc, cập nhật trạng thái đơn hàng và mã vận đơn trong tài khoản khách hàng.</p>
              <Link to={routeConfig.public.orders}>Theo dõi đơn hàng</Link>
            </div>
          </section>

          <section className="detail-section">
            <h2>Đánh giá khách hàng</h2>
            <div className="review-grid">
              {["Hiệu năng đúng mô tả, đóng gói chắc chắn.", "Tư vấn cấu hình rất nhanh, mua về lắp chạy ổn.", "Giao hàng nhanh, bảo hành điện tử dễ tra cứu."].map((review, index) => (
                <div key={review}>
                  <strong>{["Minh K.", "Anh T.", "Hoàng P."][index]}</strong>
                  <span>★★★★★</span>
                  <p>{review}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="detail-section">
            <h2>Sản phẩm tương tự</h2>
            <div className="similar-grid">
              {similarProducts.length > 0 ? similarProducts.map((item) => (
                <Link key={getProductId(item)} to={routeConfig.public.productDetail.replace(":idOrSlug", String(item.slug || getProductId(item)))}>
                  <img
                    src={resolveProductImage(item)}
                    alt={getProductName(item)}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.src = resolveProductImage({ category_name: getProductCategory(item) || "COOLING" });
                    }}
                  />
                  <strong>{getProductName(item)}</strong>
                  <span>{formatCurrency(getSimilarPrice(item))}đ</span>
                </Link>
              )) : (
                <p className="muted-text">Chưa có sản phẩm tương tự trong danh mục này.</p>
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

const productDetailStyles = `
.product-detail-page {
  display: grid;
  gap: 22px;
  padding: 28px 0 72px;
}

.product-loading,
.product-empty,
.detail-section,
.policy-card,
.buy-sidebar {
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}

.product-loading,
.product-empty {
  padding: 40px;
  text-align: center;
}

.product-empty a,
.product-alert a,
.policy-card a,
.ai-support-box a {
  color: #2563eb;
  font-weight: 900;
  text-decoration: none;
}

.product-alert {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  padding: 14px 16px;
  border-radius: 16px;
  font-weight: 800;
}

.product-alert--danger {
  color: #b91c1c;
  border: 1px solid #fecaca;
  background: #fef2f2;
}

.product-alert--success {
  color: #047857;
  border: 1px solid #86efac;
  background: #ecfdf5;
}

.product-breadcrumb {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  color: #64748b;
  font-size: 14px;
}

.product-breadcrumb a {
  color: #2563eb;
  font-weight: 800;
  text-decoration: none;
}

.product-hero {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr) 380px;
  gap: 22px;
  align-items: start;
}

.product-gallery,
.product-info {
  display: grid;
  gap: 18px;
}

.product-gallery__image {
  display: grid;
  place-items: center;
  min-height: 520px;
  border: 1px solid #e2e8f0;
  border-radius: 28px;
  background: radial-gradient(circle at center, #fff, #eef6ff);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}

.product-gallery__image img {
  width: 100%;
  max-height: 460px;
  object-fit: contain;
  padding: 24px;
  filter: drop-shadow(0 20px 38px rgba(15, 23, 42, 0.14));
}

.product-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.product-badges span,
.stock-pill {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 11px;
  border-radius: 999px;
  color: #047857;
  background: #ecfdf5;
  font-size: 12px;
  font-weight: 900;
}

.product-info {
  padding: 6px 0;
}

.product-eyebrow {
  color: #2563eb;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.product-info h1 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(34px, 4vw, 54px);
  line-height: 1.05;
}

.product-info p {
  margin: 0;
  color: #475569;
  line-height: 1.75;
  font-size: 16px;
}

.product-rating {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.product-rating strong {
  color: #f59e0b;
  letter-spacing: 2px;
}

.product-rating span {
  color: #64748b;
  font-weight: 700;
}

.product-overview {
  padding: 20px;
  border: 1px solid #dbeafe;
  border-radius: 22px;
  background: #eff6ff;
}

.product-overview h2,
.detail-section h2,
.policy-card h2 {
  margin: 0 0 14px;
  color: #0f172a;
}

.product-overview div,
.highlight-list {
  display: grid;
  gap: 10px;
}

.product-overview span,
.highlight-list div {
  color: #1e3a8a;
  font-weight: 800;
}

.buy-sidebar {
  position: sticky;
  top: 108px;
  display: grid;
  gap: 14px;
  padding: 22px;
}

.buy-sidebar__label,
.sku-select span,
.quantity-row > span {
  color: #64748b;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.buy-sidebar__price {
  color: #2563eb;
  font-size: 38px;
  line-height: 1;
}

.sku-select {
  display: grid;
  gap: 8px;
}

.sku-select select,
.quantity-row input {
  width: 100%;
  min-height: 44px;
  border: 1px solid #dbe4f0;
  border-radius: 14px;
  background: #f8fafc;
  color: #0f172a;
  font: inherit;
}

.sku-select select {
  padding: 0 12px;
}

.quantity-row {
  display: grid;
  gap: 8px;
}

.quantity-row div {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  gap: 8px;
}

.quantity-row button {
  border: 1px solid #dbe4f0;
  border-radius: 12px;
  background: #fff;
  color: #0f172a;
  font-size: 20px;
  font-weight: 900;
  cursor: pointer;
}

.quantity-row input {
  text-align: center;
  font-weight: 900;
}

.buy-action {
  min-height: 48px;
  border: 1px solid #dbe4f0;
  border-radius: 14px;
  color: #0f172a;
  background: #fff;
  font: inherit;
  font-weight: 900;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.buy-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.1);
}

.buy-action--primary,
.buy-action--buy {
  color: #fff;
  border-color: transparent;
  background: linear-gradient(135deg, #0f172a, #2563eb);
}

.buy-action--buy {
  background: linear-gradient(135deg, #f97316, #ef4444);
}

.buy-action:disabled {
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
}

.ai-support-box {
  display: grid;
  gap: 8px;
  padding: 16px;
  border-radius: 18px;
  background: #eff6ff;
}

.ai-support-box p {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

.detail-layout {
  display: grid;
}

.detail-main {
  display: grid;
  gap: 18px;
}

.detail-section,
.policy-card {
  padding: 24px;
}

.detail-section p,
.policy-card p,
.muted-text {
  color: #475569;
  line-height: 1.75;
}

.spec-table {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.spec-table div,
.pc-config-grid div,
.audience-grid div,
.review-grid div,
.similar-grid a {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #f8fafc;
}

.spec-table div,
.pc-config-grid div {
  display: grid;
  gap: 5px;
  padding: 14px;
}

.spec-table span,
.pc-config-grid span {
  color: #64748b;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.spec-table strong,
.pc-config-grid strong {
  color: #0f172a;
}

.pc-config-grid,
.audience-grid,
.review-grid,
.similar-grid,
.policy-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.audience-grid div {
  padding: 16px;
  color: #1d4ed8;
  background: #eff6ff;
  font-weight: 900;
}

.policy-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.review-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.review-grid div {
  padding: 16px;
}

.review-grid strong,
.review-grid span {
  display: block;
}

.review-grid span {
  margin: 6px 0;
  color: #f59e0b;
}

.review-grid p {
  margin: 0;
}

.similar-grid a {
  display: grid;
  gap: 10px;
  padding: 14px;
  color: inherit;
  text-decoration: none;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.similar-grid a:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(37, 99, 235, 0.12);
}

.similar-grid img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: contain;
}

.similar-grid strong {
  color: #0f172a;
}

.similar-grid span {
  color: #2563eb;
  font-weight: 900;
}

@media (max-width: 1240px) {
  .product-hero {
    grid-template-columns: minmax(0, 1fr) 360px;
  }

  .product-info {
    grid-column: 1 / -1;
    order: -1;
  }
}

@media (max-width: 900px) {
  .product-hero,
  .spec-table,
  .policy-grid,
  .review-grid {
    grid-template-columns: 1fr;
  }

  .buy-sidebar {
    position: static;
  }

  .pc-config-grid,
  .audience-grid,
  .similar-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .product-detail-page {
    padding-top: 18px;
  }

  .product-gallery__image {
    min-height: 340px;
  }

  .pc-config-grid,
  .audience-grid,
  .similar-grid {
    grid-template-columns: 1fr;
  }

  .buy-sidebar__price {
    font-size: 32px;
  }
}
`;
