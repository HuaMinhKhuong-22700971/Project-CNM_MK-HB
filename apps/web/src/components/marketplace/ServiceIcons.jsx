const services = [
  ["🚚", "Giao nhanh toàn quốc", "Nội thành trong ngày, theo dõi vận đơn rõ ràng"],
  ["🛠️", "Build PC theo nhu cầu", "Tư vấn linh kiện cho gaming, đồ họa và văn phòng"],
  ["🛡️", "Bảo hành điện tử", "Kích hoạt và tra cứu bảo hành ngay trong tài khoản"],
  ["💸", "Giá tốt mỗi ngày", "Flash sale, voucher và ưu đãi theo từng danh mục"],
  ["🤖", "Trợ lý AI", "Hỏi nhanh về cấu hình, hiệu năng và khả năng nâng cấp"]
];

export function ServiceIcons() {
  return (
    <section className="market-service-strip">
      {services.map(([icon, title, caption]) => (
        <div key={title} className="market-service-item">
          <div className="market-service-item__icon">{icon}</div>
          <div>
            <div style={{ fontWeight: 700, color: "var(--market-text)" }}>{title}</div>
            <div style={{ marginTop: 4, fontSize: 13, color: "var(--market-muted)", lineHeight: 1.5 }}>{caption}</div>
          </div>
        </div>
      ))}
    </section>
  );
}
