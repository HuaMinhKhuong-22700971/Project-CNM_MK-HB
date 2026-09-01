/**
 * Template Email kết quả duyệt thanh toán
 * Gửi khi Admin duyệt hoặc từ chối ảnh bill chuyển khoản
 */
import { formatCurrency, formatDateTime } from "../services/email.service";
import { env } from "../config/env";

export interface PaymentResultEmailData {
  customerName: string;
  customerEmail: string;
  orderId: number | string;
  approved: boolean;
  rejectionReason?: string;
  finalAmount: number;
  reviewedAt?: Date | string;
}

export function buildPaymentResultEmail(data: PaymentResultEmailData): { subject: string; html: string } {
  const isApproved = data.approved;

  const subject = isApproved
    ? `✅ [PC Mall] Thanh toán đơn #${data.orderId} đã được xác nhận`
    : `❌ [PC Mall] Thanh toán đơn #${data.orderId} bị từ chối`;

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
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 32px rgba(15,23,42,0.10);">

          <!-- HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800;">🖥️ PC Mall</h1>
              <p style="margin: 6px 0 0; color: rgba(191,219,254,0.9); font-size: 13px;">Thông báo kết quả thanh toán</p>
            </td>
          </tr>

          <!-- STATUS BADGE -->
          <tr>
            <td style="padding: 32px 40px; text-align: center;">
              ${
                isApproved
                  ? `<div style="display: inline-block; background: #ecfdf5; border: 2px solid #bbf7d0; border-radius: 50px; padding: 14px 28px; margin-bottom: 20px;">
                  <span style="color: #15803d; font-weight: 800; font-size: 18px;">✅ Thanh toán được xác nhận!</span>
                </div>
                <h2 style="margin: 0 0 12px; font-size: 20px; color: #0f172a; font-weight: 800;">Xin chào ${data.customerName}!</h2>
                <p style="margin: 0; color: #64748b; font-size: 15px; line-height: 1.6;">
                  Đơn hàng <strong style="color: #1d4ed8;">#${data.orderId}</strong> của bạn đã được thanh toán thành công.<br/>
                  Chúng tôi sẽ bắt đầu xử lý và giao hàng sớm nhất có thể.
                </p>`
                  : `<div style="display: inline-block; background: #fff1f2; border: 2px solid #fecdd3; border-radius: 50px; padding: 14px 28px; margin-bottom: 20px;">
                  <span style="color: #be123c; font-weight: 800; font-size: 18px;">❌ Thanh toán bị từ chối</span>
                </div>
                <h2 style="margin: 0 0 12px; font-size: 20px; color: #0f172a; font-weight: 800;">Xin chào ${data.customerName}!</h2>
                <p style="margin: 0; color: #64748b; font-size: 15px; line-height: 1.6;">
                  Rất tiếc, ảnh hóa đơn thanh toán cho đơn hàng <strong style="color: #be123c;">#${data.orderId}</strong> không được xác nhận.
                </p>`
              }
            </td>
          </tr>

          <!-- ORDER SUMMARY -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; border-radius: 16px; padding: 20px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">📋 Mã đơn hàng</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 800; color: #1d4ed8;">#${data.orderId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">💰 Số tiền</td>
                  <td style="padding: 8px 0; border-top: 1px solid #e2e8f0; text-align: right; font-weight: 800; color: #0f172a;">${formatCurrency(data.finalAmount)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">🕐 Thời gian duyệt</td>
                  <td style="padding: 8px 0; border-top: 1px solid #e2e8f0; text-align: right; color: #0f172a;">${formatDateTime(data.reviewedAt || new Date())}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">📊 Trạng thái</td>
                  <td style="padding: 8px 0; border-top: 1px solid #e2e8f0; text-align: right;">
                    <span style="background: ${isApproved ? "#ecfdf5" : "#fff1f2"}; color: ${isApproved ? "#15803d" : "#be123c"}; padding: 4px 12px; border-radius: 99px; font-weight: 700; font-size: 13px;">
                      ${isApproved ? "✅ ĐÃ XÁC NHẬN" : "❌ BỊ TỪ CHỐI"}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${
            !isApproved && data.rejectionReason
              ? `<!-- REJECTION REASON -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 16px; padding: 20px;">
                <h4 style="margin: 0 0 8px; color: #c2410c; font-size: 15px;">⚠️ Lý do từ chối</h4>
                <p style="margin: 0; color: #7c2d12; font-size: 14px; line-height: 1.6;">${data.rejectionReason}</p>
              </div>
            </td>
          </tr>`
              : ""
          }

          ${
            !isApproved
              ? `<!-- REUPLOAD INSTRUCTION -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 16px; padding: 20px;">
                <h4 style="margin: 0 0 8px; color: #1d4ed8; font-size: 15px;">🔄 Hướng dẫn tải lại</h4>
                <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                  Vui lòng kiểm tra lại ảnh hóa đơn và tải lên lại trong trang chi tiết đơn hàng.<br/>
                  Đảm bảo ảnh rõ ràng, đủ thông tin chuyển khoản và số tiền đúng.
                </p>
              </div>
            </td>
          </tr>`
              : ""
          }

          <!-- CTA -->
          <tr>
            <td style="padding: 8px 40px 32px; text-align: center;">
              <a href="${env.frontendUrl || "http://localhost:5173"}/orders" style="display: inline-block; background: linear-gradient(135deg, ${isApproved ? "#059669 0%, #10b981" : "#1d4ed8 0%, #2563eb"} 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 14px; font-weight: 800; font-size: 15px;">
                ${isApproved ? "Theo dõi đơn hàng →" : "Tải lại ảnh bill →"}
              </a>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 20px 40px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.6;">
                Cần hỗ trợ? <a href="${env.frontendUrl || "http://localhost:5173"}/tickets" style="color: #1d4ed8;">Tạo ticket hỗ trợ</a><br/>
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
