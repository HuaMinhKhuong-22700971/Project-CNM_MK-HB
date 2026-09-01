/**
 * Template Email xác nhận đặt hàng thành công
 * Gửi cho khách hàng ngay sau khi đặt hàng thành công
 */
import { formatCurrency, formatDateTime } from "../services/email.service";

export interface OrderConfirmEmailData {
  customerName: string;
  customerEmail: string;
  orderId: number | string;
  orderDate: Date | string;
  items: Array<{
    name: string;
    sku?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  totalAmount: number;
  shippingFee: number;
  finalAmount: number;
  paymentMethod: string;
  shippingAddress?: string;
  note?: string;
}

function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    COD: "💵 Thanh toán khi nhận hàng (COD)",
    BANK_TRANSFER: "🏦 Chuyển khoản ngân hàng",
    VNPAY: "💳 Thanh toán VNPay",
    ONLINE: "💳 Thanh toán online"
  };
  return labels[String(method || "").toUpperCase()] || method;
}

export function buildOrderConfirmEmail(data: OrderConfirmEmailData): { subject: string; html: string } {
  const itemRows = data.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9;">
            <div style="font-weight: 600; color: #0f172a;">${item.name}</div>
            ${item.sku ? `<div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">SKU: ${item.sku}</div>` : ""}
          </td>
          <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9; text-align: center; color: #475569;">
            x${item.quantity}
          </td>
          <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #475569;">
            ${formatCurrency(item.unitPrice)}
          </td>
          <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700; color: #0f172a;">
            ${formatCurrency(item.lineTotal)}
          </td>
        </tr>
      `
    )
    .join("");

  const subject = `✅ [PC Mall] Xác nhận đơn hàng #${data.orderId}`;

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 640px; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 32px rgba(15,23,42,0.10);">
          
          <!-- HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%); padding: 36px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">🖥️ PC Mall</h1>
              <p style="margin: 8px 0 0; color: rgba(191,219,254,0.9); font-size: 14px;">Hệ thống linh kiện & tư vấn PC chuyên nghiệp</p>
            </td>
          </tr>

          <!-- SUCCESS BADGE -->
          <tr>
            <td style="padding: 32px 40px 0; text-align: center;">
              <div style="display: inline-block; background: #ecfdf5; border: 2px solid #bbf7d0; border-radius: 50px; padding: 12px 24px; margin-bottom: 20px;">
                <span style="color: #15803d; font-weight: 800; font-size: 16px;">✅ Đặt hàng thành công!</span>
              </div>
              <h2 style="margin: 0 0 8px; font-size: 22px; color: #0f172a; font-weight: 800;">Xin chào ${data.customerName}!</h2>
              <p style="margin: 0; color: #64748b; font-size: 15px; line-height: 1.6;">
                Cảm ơn bạn đã tin tưởng PC Mall. Đơn hàng <strong style="color: #1d4ed8;">#${data.orderId}</strong> của bạn đã được ghi nhận thành công.
              </p>
            </td>
          </tr>

          <!-- ORDER INFO -->
          <tr>
            <td style="padding: 24px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; border-radius: 16px; padding: 20px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #64748b; font-size: 14px;">📋 Mã đơn hàng</span>
                    <span style="float: right; font-weight: 800; color: #1d4ed8; font-size: 16px;">#${data.orderId}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-top: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 14px;">📅 Ngày đặt</span>
                    <span style="float: right; color: #0f172a; font-weight: 600;">${formatDateTime(data.orderDate)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-top: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 14px;">💳 Thanh toán</span>
                    <span style="float: right; color: #0f172a; font-weight: 600;">${getPaymentMethodLabel(data.paymentMethod)}</span>
                  </td>
                </tr>
                ${
                  data.shippingAddress
                    ? `<tr>
                  <td style="padding: 8px 0; border-top: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 14px;">📍 Địa chỉ nhận</span>
                    <span style="float: right; color: #0f172a; font-weight: 600; text-align: right; max-width: 300px;">${data.shippingAddress}</span>
                  </td>
                </tr>`
                    : ""
                }
              </table>
            </td>
          </tr>

          <!-- ITEMS TABLE -->
          <tr>
            <td style="padding: 24px 40px 0;">
              <h3 style="margin: 0 0 12px; font-size: 16px; color: #0f172a; font-weight: 800;">🛒 Sản phẩm đặt mua</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
                <thead>
                  <tr style="background: #f8fafc;">
                    <th style="padding: 12px 16px; text-align: left; font-size: 13px; color: #64748b; font-weight: 700;">Sản phẩm</th>
                    <th style="padding: 12px 16px; text-align: center; font-size: 13px; color: #64748b; font-weight: 700;">SL</th>
                    <th style="padding: 12px 16px; text-align: right; font-size: 13px; color: #64748b; font-weight: 700;">Đơn giá</th>
                    <th style="padding: 12px 16px; text-align: right; font-size: 13px; color: #64748b; font-weight: 700;">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- TOTALS -->
          <tr>
            <td style="padding: 20px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 2px solid #e2e8f0; padding-top: 16px;">
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Tạm tính</td>
                  <td style="padding: 6px 0; text-align: right; color: #0f172a;">${formatCurrency(data.totalAmount)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Phí vận chuyển</td>
                  <td style="padding: 6px 0; text-align: right; color: #0f172a;">${data.shippingFee > 0 ? formatCurrency(data.shippingFee) : "Miễn phí"}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0 0; font-size: 18px; font-weight: 800; color: #0f172a; border-top: 1px solid #e2e8f0;">Tổng thanh toán</td>
                  <td style="padding: 12px 0 0; text-align: right; font-size: 20px; font-weight: 800; color: #1d4ed8; border-top: 1px solid #e2e8f0;">${formatCurrency(data.finalAmount)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- PAYMENT INSTRUCTION -->
          ${
            data.paymentMethod === "BANK_TRANSFER"
              ? `<tr>
            <td style="padding: 24px 40px 0;">
              <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 16px; padding: 20px;">
                <h4 style="margin: 0 0 10px; color: #c2410c; font-size: 15px;">🏦 Hướng dẫn chuyển khoản</h4>
                <p style="margin: 0; color: #7c2d12; font-size: 14px; line-height: 1.6;">
                  Vui lòng chuyển khoản với nội dung: <strong>PC MALL ${data.orderId}</strong><br/>
                  Sau khi chuyển khoản, tải ảnh hóa đơn lên trang đơn hàng của bạn để Admin xác nhận.
                </p>
              </div>
            </td>
          </tr>`
              : ""
          }

          <!-- CTA BUTTON -->
          <tr>
            <td style="padding: 32px 40px; text-align: center;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/orders" style="display: inline-block; background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 16px; font-weight: 800; font-size: 16px; box-shadow: 0 8px 20px rgba(37,99,235,0.3);">
                Xem chi tiết đơn hàng →
              </a>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 24px 40px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.6;">
                Cần hỗ trợ? Tạo ticket tại <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/tickets" style="color: #1d4ed8;">Trung tâm hỗ trợ</a><br/>
                © 2026 PC Mall. Tất cả quyền được bảo lưu.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}
