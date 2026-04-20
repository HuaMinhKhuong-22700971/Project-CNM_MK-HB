import { Link } from "react-router-dom";

import { ProductCard } from "../common/ProductCard";

export function ProductSection({ title, subtitle, products }) {
  return (
    <section className="market-panel">
      <div className="market-panel__head">
        <div>
          <div className="market-panel__title">{title}</div>
          {subtitle ? <div className="market-panel__subtitle">{subtitle}</div> : null}
        </div>
        <Link className="market-topbar__link" style={{ color: "var(--market-primary)", fontWeight: 700 }} to="/products">
          Xem tất cả
        </Link>
      </div>
      <div className="market-product-grid">
        {products.map((product) => (
          <ProductCard key={`${product.product_id || product.id}-${product.slug || product.name}`} product={product} />
        ))}
      </div>
    </section>
  );
}
