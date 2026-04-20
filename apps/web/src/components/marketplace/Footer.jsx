const columns = [
  {
    title: "Chăm sóc khách hàng",
    items: ["Trung tâm trợ giúp", "Hướng dẫn đặt hàng", "Chính sách đổi trả", "Kích hoạt bảo hành"]
  },
  {
    title: "Về PC Mall",
    items: ["Giới thiệu", "Tuyển dụng", "Chính sách bảo mật", "Điều khoản sử dụng"]
  },
  {
    title: "Thanh toán & vận chuyển",
    items: ["COD", "Thanh toán online", "Vận chuyển toàn quốc", "Theo dõi vận đơn"]
  },
  {
    title: "Kênh hỗ trợ",
    items: ["Hotline 1900 6868", "support@pcmall.vn", "Tư vấn build PC", "Hỗ trợ AI 24/7"]
  }
];

export function Footer() {
  return (
    <footer className="market-footer">
      <div className="market-container market-footer__top">
        {columns.map((column) => (
          <div key={column.title}>
            <div className="market-footer__title">{column.title}</div>
            <div className="market-footer__list">
              {column.items.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="market-container market-footer__bottom">
        © 2026 PC Mall. Giao diện lấy cảm hứng từ thói quen mua sắm trên các sàn thương mại điện tử Việt Nam,
        nhưng không sao chép thương hiệu hay nội dung gốc.
      </div>
    </footer>
  );
}
