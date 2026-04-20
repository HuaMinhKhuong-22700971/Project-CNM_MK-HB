import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { getProductDetail } from "../../services/catalog.service";
import { addItemToCart } from "../../services/cart.service";

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

export function ProductDetailPage() {
  const { idOrSlug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const variants = useMemo(() => (Array.isArray(product?.variants) ? product.variants : []), [product]);
  const heroImage = useMemo(() => {
    if (product?.image_url) return product.image_url;
    if (variants.length > 0 && variants[0].image_url) {
      return variants[0].image_url;
    }
    return null;
  }, [product, variants]);

  const heroPrice = useMemo(() => {
    if (variants.length > 0) {
      return Number(variants[0]?.price || 0);
    }

    return Number(product?.price || 0);
  }, [product, variants]);

  useEffect(() => {
    async function loadProductDetail() {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await getProductDetail(idOrSlug);
        setProduct(normalizeProductDetail(response));
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Không thể tải chi tiết sản phẩm."));
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    if (idOrSlug) {
      loadProductDetail();
    }
  }, [idOrSlug]);

  async function handleAddToCart() {
    // Pick the first variant or the product itself if no variants
    const variantId = variants.length > 0 ? (variants[0].id || variants[0].variant_id) : product.product_id;

    if (!variantId) {
      setErrorMessage("Không lỗi: Không tìm thấy ID phiên bản sản phẩm.");
      return;
    }

    try {
      setAddingToCart(true);
      setErrorMessage("");
      await addItemToCart({
        productVariantId: variantId,
        quantity: 1
      });
      // After adding, we can navigate to cart or show success
      navigate("/cart");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể thêm sản phẩm vào giỏ hàng."));
    } finally {
      setAddingToCart(false);
    }
  }

  if (loading) {
    return <div style={{ padding: 24, borderRadius: 24, border: "1px solid var(--border)", background: "var(--surface)", boxShadow: "var(--shadow)" }}>Đang tải chi tiết sản phẩm...</div>;
  }

  if (errorMessage || !product) {
    return (
      <div style={{ display: "grid", gap: 16, padding: 26, borderRadius: 28, border: "1px solid var(--border)", background: "var(--surface)", boxShadow: "var(--shadow)" }}>
        <div style={{ fontSize: 32, fontWeight: 800 }}>Không tìm thấy sản phẩm</div>
        <div style={{ color: "var(--muted)", lineHeight: 1.8 }}>{errorMessage || "Sản phẩm bạn vừa mở không tồn tại hoặc đã được ẩn khỏi catalog."}</div>
        <div>
          <Link to="/products" style={{ color: "var(--color-accent)", fontWeight: 800, textDecoration: "none" }}>Quay lại trang danh sách</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 0.9fr)",
          gap: 22,
          padding: 28,
          borderRadius: 32,
          border: "1px solid var(--border)",
          background: "linear-gradient(135deg, rgba(255,250,242,0.98), rgba(223,236,229,0.92))",
          boxShadow: "var(--shadow)"
        }}
      >
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[product?.brand?.name || product?.brand_name || "Thương hiệu", product?.category?.name || product?.category_name || "Danh mục"].map((label) => (
              <span key={label} style={{ display: "inline-flex", padding: "7px 12px", borderRadius: 999, background: "rgba(15, 76, 63, 0.08)", color: "var(--primary)", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {label}
              </span>
            ))}
          </div>
          <h1 style={{ margin: 0, fontSize: 54, lineHeight: 0.96, letterSpacing: "-0.07em" }}>{product.name || product.product_name}</h1>
          <div style={{ color: "var(--muted)", lineHeight: 1.8, fontSize: 17 }}>
            {product.description || "Sản phẩm này đang được dùng để demo giao diện chi tiết. Bạn có thể trình bày thông tin cơ bản, SKU và các phiên bản giá ngay trên một trang riêng."}
          </div>
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)" }}>Mức giá hiển thị</div>
            <div style={{ fontSize: 34, fontWeight: 800 }}>{formatCurrency(heroPrice)} VND</div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              style={{
                display: "inline-flex",
                padding: "16px 28px",
                borderRadius: 20,
                background: "linear-gradient(135deg, var(--color-accent), #c25e2d)",
                color: "#ffffff",
                fontWeight: 800,
                border: "none",
                cursor: addingToCart ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(198,124,49,0.3)",
                transition: "transform 0.2s"
              }}
            >
              {addingToCart ? "Đang thêm..." : "Thêm vào giỏ hàng"}
            </button>
            <Link to="/pc-builder" style={{ display: "inline-flex", padding: "16px 24px", borderRadius: 20, border: "1px solid var(--border)", background: "rgba(255,255,255,0.74)", color: "var(--text)", fontWeight: 800, textDecoration: "none" }}>
              Đưa vào PC Builder
            </Link>
            <Link to={`/compare?ids=${product.product_id}`} style={{ display: "inline-flex", padding: "14px 18px", borderRadius: 18, border: "1px solid var(--border)", background: "#ffffff", color: "var(--primary)", fontWeight: 800, textDecoration: "none" }}>
              So sánh sản phẩm
            </Link>
          </div>
        </div>

        <div
          style={{
            minHeight: 380,
            borderRadius: 28,
            border: "1px solid rgba(214, 208, 196, 0.9)",
            background: heroImage ? `#ffffff center / contain no-repeat url(${heroImage})` : "radial-gradient(circle at top, rgba(198,124,49,0.26), transparent 38%), linear-gradient(135deg, #f7ead8, #deece5)",
            display: "grid",
            placeItems: "center",
            color: "var(--primary)",
            fontSize: 26,
            fontWeight: 800
          }}
        >
          {!heroImage ? (product?.category?.name || product?.category_name || "Sản phẩm") : null}
        </div>
      </section>

      <section style={{ display: "grid", gap: 18, padding: 24, borderRadius: 28, border: "1px solid var(--border)", background: "var(--surface)", boxShadow: "var(--shadow)" }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: 34, letterSpacing: "-0.05em" }}>Phiên bản và SKU</h2>
          <div style={{ color: "var(--muted)", lineHeight: 1.7 }}>Nếu backend đã trả variants, bảng dưới đây sẽ giúp bạn demo nhanh giá và tồn kho của từng SKU.</div>
        </div>

        {variants.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border)", color: "var(--muted)", textTransform: "uppercase", fontSize: 12, letterSpacing: "0.08em" }}>
                  <th style={{ padding: "12px 10px" }}>SKU</th>
                  <th style={{ padding: "12px 10px" }}>Giá</th>
                  <th style={{ padding: "12px 10px" }}>Tồn kho</th>
                  <th style={{ padding: "12px 10px" }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant) => {
                  const stock = Number(variant.stock || variant.stock_quantity || 0);

                  return (
                    <tr key={variant.variant_id || variant.id} style={{ borderBottom: "1px solid rgba(214, 208, 196, 0.7)" }}>
                      <td style={{ padding: "16px 10px", fontWeight: 700 }}>{variant.sku || "-"}</td>
                      <td style={{ padding: "16px 10px" }}>{formatCurrency(variant.price)} VND</td>
                      <td style={{ padding: "16px 10px" }}>{stock}</td>
                      <td style={{ padding: "16px 10px" }}>
                        <span style={{ display: "inline-flex", padding: "7px 12px", borderRadius: 999, fontSize: 12, fontWeight: 800, background: stock > 0 ? "rgba(15, 76, 63, 0.12)" : "rgba(185, 28, 28, 0.12)", color: stock > 0 ? "#0f4c3f" : "#991b1b" }}>
                          {stock > 0 ? "Còn hàng" : "Tạm hết"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: 22, borderRadius: 22, background: "rgba(255, 248, 237, 0.82)", color: "var(--muted)" }}>
            Sản phẩm này chưa có danh sách phiên bản được backend trả về.
          </div>
        )}
      </section>
    </div>
  );
}
