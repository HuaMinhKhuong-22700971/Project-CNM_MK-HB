import { Link } from "react-router-dom";

export function HeroBanner() {
  return (
    <section className="market-hero">
      <article className="market-hero__banner">
        <div>
          <div className="market-hero__label">Siêu sale công nghệ hôm nay</div>
          <h1 className="market-hero__title">Mua linh kiện PC đúng chuẩn, giá cạnh tranh, giao nhanh toàn quốc.</h1>
          <p className="market-hero__desc">
            Từ CPU, GPU, RAM, SSD cho tới case, tản nhiệt và màn hình gaming. Tất cả được trình bày theo phong cách
            sàn thương mại điện tử hiện đại, tập trung vào trải nghiệm mua sắm công nghệ rõ ràng và đáng tin cậy.
          </p>
        </div>
        <div className="market-hero__actions">
          <Link className="market-btn market-btn--primary" to="/products">
            Mua ngay
          </Link>
          <Link className="market-btn market-btn--ghost" to="/pc-builder">
            Lắp ráp PC
          </Link>
        </div>
      </article>

      <div className="market-hero__stack">
        <article className="market-hero__mini market-hero__mini--builder">
          <div className="market-hero__label">Nhà lắp ráp PC</div>
          <h3>Chọn linh kiện theo ngân sách, kiểm tra tương thích theo thời gian thực.</h3>
        </article>
        <article className="market-hero__mini market-hero__mini--ai">
          <div className="market-hero__label">Trợ lý AI</div>
          <h3>Hỏi nhanh về hiệu năng, cấu hình phù hợp và khả năng nâng cấp.</h3>
        </article>
      </div>
    </section>
  );
}
