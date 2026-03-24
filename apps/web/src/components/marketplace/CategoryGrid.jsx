import { Link } from "react-router-dom";

const ICONS = {
  CPU: "🧠",
  GPU: "🎮",
  RAM: "💾",
  SSD: "⚡",
  STORAGE: "🗂️",
  MAINBOARD: "🧩",
  PSU: "🔌",
  CASE: "🖥️"
};

export function CategoryGrid({ categories }) {
  const items = categories.slice(0, 10);

  return (
    <section className="market-panel">
      <div className="market-panel__head">
        <div>
          <div className="market-panel__title">Danh mục nổi bật</div>
          <div className="market-panel__subtitle">Nhóm sản phẩm được khách hàng công nghệ tìm kiếm nhiều nhất.</div>
        </div>
      </div>

      <div className="market-category-grid">
        {items.map((category) => {
          const icon = ICONS[String(category.name || "").toUpperCase()] || "🛍️";
          return (
            <Link key={category.id} className="market-category-card" to={`/products?category_id=${category.id}`}>
              <div className="market-category-card__icon">{icon}</div>
              <div className="market-category-card__name">{category.name}</div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
