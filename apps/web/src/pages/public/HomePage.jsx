import { useEffect, useMemo, useState } from "react";

import { CategoryGrid } from "../../components/marketplace/CategoryGrid";
import { HeroBanner } from "../../components/marketplace/HeroBanner";
import { ProductSection } from "../../components/marketplace/ProductSection";
import { getCategories, getProducts } from "../../services/catalog.service";

function normalizeProductsResponse(data) {
  const payload = data?.data || data;

  if (Array.isArray(payload)) {
    return payload;
  }

  return Array.isArray(payload?.items) ? payload.items : [];
}

function enrichProducts(products) {
  return products.map((product, index) => {
    const basePrice = Number(product?.price || 0);
    const discount = [10, 15, 8, 18, 12][index % 5];
    const oldPrice = Math.round(basePrice * (100 / (100 - discount)));

    return {
      ...product,
      oldPrice,
      discountPercent: discount,
      rating: 4.6 + ((index % 3) * 0.1),
      soldCount: 120 + index * 37,
      isMall: index % 2 === 0,
      isFreeShip: index % 3 !== 1
    };
  });
}

export function HomePage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const featuredProducts = useMemo(() => enrichProducts(products.slice(0, 10)), [products]);
  const flashSaleProducts = useMemo(() => enrichProducts(products.slice(2, 12)), [products]);
  const recommendedProducts = useMemo(() => enrichProducts([...products].reverse().slice(0, 10)), [products]);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [categoryResponse, productResponse] = await Promise.all([
          getCategories(),
          getProducts({ page: 1, limit: 20 })
        ]);

        setCategories(Array.isArray(categoryResponse?.data) ? categoryResponse.data : []);
        setProducts(normalizeProductsResponse(productResponse));
      } catch (_error) {
        setCategories([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  return (
    <div className="market-home" style={{ padding: "0" }}>
      <HeroBanner />
      
      <div className="market-container">
        <CategoryGrid categories={categories} />

      {loading ? (
        <div className="market-panel">
          <div className="market-empty">Đang tải dữ liệu trang chủ...</div>
        </div>
      ) : null}

      {!loading && featuredProducts.length > 0 ? (
        <ProductSection
          title="Sản phẩm nổi bật"
          subtitle="Những linh kiện, phụ kiện và cấu hình bán chạy nhất cho game thủ và người dùng chuyên nghiệp."
          products={featuredProducts}
        />
      ) : null}

      {!loading && flashSaleProducts.length > 0 ? (
        <ProductSection
          title="Flash sale công nghệ"
          subtitle="Giá giảm theo khung giờ, hiển thị dày thông tin như một sàn thương mại điện tử thật."
          products={flashSaleProducts}
        />
      ) : null}

      {!loading && recommendedProducts.length > 0 ? (
        <ProductSection
          title="Dành riêng cho bạn"
          subtitle="Gợi ý sản phẩm mới, phù hợp với xu hướng build PC, nâng cấp góc chiến game và làm việc."
          products={recommendedProducts}
        />
      ) : null}
      </div>
    </div>
  );
}
