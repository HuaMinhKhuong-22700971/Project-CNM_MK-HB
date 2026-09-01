/**
 * Template Email hoàn tất bảo hành
 * Gửi khi kỹ thuật viên chuyển trạng thái sang COMPLETED / RETURNED
 */
import { formatDateTime } from "../services/email.service";
import { env } from "../config/env";

export interface WarrantyDoneEmailData {
  customerName: string;
  customerEmail: string;
  warrantyCode: string;
  productName: string;
  serialNumber?: string;
  status: "COMPLETED" | "RETURNED" | string;
  diagnosis?: string;
  resolution?: string;
  technicianName?: string;
  completedAt?: Date | string;
  notes?: string;
}

function getStatusLabel(status: string): { label: string; color: string; bg: string; icon: string } {
  const s = String(status || "").toUpperCase();
  if (s === "COMPLETED") {
    return { label: "Đã sửa chữa thành công", color: "#15803d", bg: "#ecfdf5", icon: "✅" };
  }
  if (s === "RETURNED") {
    return { label: "Đã trả linh kiện", color: "#1d4ed8", bg: "#eff6ff", icon: "📦" };
  }
  if (s === "DIAGNOSED") {
    return { label: "Đã chẩn đoán", color: "#d97706", bg: "#fffbeb", icon: "🔍" };
  }
  return { label: status, color: "#475569", bg: "#f1f5f9", icon: "🔧" };
}

export function buildWarrantyDoneEmail(data: WarrantyDoneEmailData): { subject: string; html: string } {
  const statusMeta = getStatusLabel(data.status);
  const isCompleted = ["COMPLETED", "RETURNED"].includes(String(data.status).toUpperCase());

  const subject = `${statusMeta.icon} [PC Mall] Cập nhật bảo hành: ${data.productName} - Mã BH ${data.warrantyCode}`;

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
            <td style="background: linear-gradient(135deg, #0f172a 0%, #7c3aed 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800;">🖥️ PC Mall</h1>
              <p style="margin: 6px 0 0; color: rgba(221,214,254,0.9); font-size: 13px;">Trung tâm Bảo hành & Kỹ thuật</p>
            </td>
          </tr>

          <!-- STATUS BADGE -->
          <tr>
            <td style="padding: 32px 40px 0; text-align: center;">
              <div style="display: inline-block; background: ${statusMeta.bg}; border: 2px solid ${statusMeta.color}30; border-radius: 50px; padding: 12px 24px; margin-bottom: 20px;">
                <span style="color: ${statusMeta.color}; font-weight: 800; font-size: 17px;">${statusMeta.icon} ${statusMeta.label}</span>
              </div>
              <h2 style="margin: 0 0 12px; font-size: 20px; color: #0f172a; font-weight: 800;">Xin chào ${data.customerName}!</h2>
              <p style="margin: 0; color: #64748b; font-size: 15px; line-height: 1.6;">
                Yêu cầu bảo hành của bạn cho linh kiện <strong style="color: #7c3aed;">${data.productName}</strong> đã được cập nhật trạng thái mới.
              </p>
            </td>
          </tr>

          <!-- WARRANTY INFO -->
          <tr>
            <td style="padding: 24px 40px 0;">
              <h3 style="margin: 0 0 12px; font-size: 15px; color: #0f172a; font-weight: 800;">🔧 Thông tin bảo hành</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; border-radius: 16px; padding: 20px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">📋 Mã bảo hành</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 800; color: #7c3aed;">${data.warrantyCode}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">🖥️ Linh kiện</td>
                  <td style="padding: 8px 0; border-top: 1px solid #e2e8f0; text-align: right; font-weight: 600; color: #0f172a;">${data.productName}</td>
                </tr>
                ${
                  data.serialNumber
                    ? `<tr>
                  <td style="padding: 8px 0; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">🔢 Số serial</td>
                  <td style="padding: 8px 0; border-top: 1px solid #e2e8f0; text-align: right; color: #0f172a;">${data.serialNumber}</td>
                </tr>`
                    : ""
                }
                <tr>
                  <td style="padding: 8px 0; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">📊 Trạng thái</td>
                  <td style="padding: 8px 0; border-top: 1px solid #e2e8f0; text-align: right;">
                    <span style="background: ${statusMeta.bg}; color: ${statusMeta.color}; padding: 4px 12px; border-radius: 99px; font-weight: 700; font-size: 13px;">
                      ${statusMeta.icon} ${statusMeta.label}
                    </span>
                  </td>
                </tr>
                ${
                  data.technicianName
                    ? `<tr>
                  <td style="padding: 8px 0; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">👨‍🔧 Kỹ thuật viên</td>
                  <td style="padding: 8px 0; border-top: 1px solid #e2e8f0; text-align: right; color: #0f172a;">${data.technicianName}</td>
                </tr>`
                    : ""
                }
                ${
                  data.completedAt
                    ? `<tr>
                  <td style="padding: 8px 0; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">🕐 Thời gian hoàn thành</td>
                  <td style="padding: 8px 0; border-top: 1px solid #e2e8f0; text-align: right; color: #0f172a;">${formatDateTime(data.completedAt)}</td>
                </tr>`
                    : ""
                }
              </table>
            </td>
          </tr>

          ${
            data.diagnosis
              ? `<!-- DIAGNOSIS -->
          <tr>
            <td style="padding: 20px 40px 0;">
              <h4 style="margin: 0 0 10px; font-size: 15px; color: #0f172a; font-weight: 800;">🔍 Kết quả chẩn đoán</h4>
              <div style="background: #fafafa; border-left: 4px solid #7c3aed; border-radius: 8px; padding: 16px;">
                <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.7;">${data.diagnosis}</p>
              </div>
            </td>
          </tr>`
              : ""
          }

          ${
            data.resolution
              ? `<!-- RESOLUTION -->
          <tr>
            <td style="padding: 20px 40px 0;">
              <h4 style="margin: 0 0 10px; font-size: 15px; color: #0f172a; font-weight: 800;">🛠️ Hướng xử lý</h4>
              <div style="background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 8px; padding: 16px;">
                <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.7;">${data.resolution}</p>
              </div>
            </td>
          </tr>`
              : ""
          }

          ${
            isCompleted
              ? `<!-- SUCCESS MESSAGE -->
          <tr>
            <td style="padding: 24px 40px 0;">
              <div style="background: #ecfdf5; border: 1px solid #bbf7d0; border-radius: 16px; padding: 20px; text-align: center;">
                <p style="margin: 0; color: #166534; font-size: 15px; font-weight: 600; line-height: 1.6;">
                  🎉 Linh kiện của bạn đã được xử lý xong.<br/>
                  Vui lòng liên hệ PC Mall để nhận lại linh kiện hoặc chờ bộ phận vận chuyển giao tới.
                </p>
              </div>
            </td>
          </tr>`
              : ""
          }

          <!-- CTA -->
          <tr>
            <td style="padding: 32px 40px; text-align: center;">
              <a href="${env.frontendUrl || "http://localhost:5173"}/warranties" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 14px; font-weight: 800; font-size: 15px; box-shadow: 0 8px 20px rgba(124,58,237,0.3);">
                Theo dõi bảo hành →
              </a>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 20px 40px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.6;">
                Cần hỗ trợ? <a href="${env.frontendUrl || "http://localhost:5173"}/tickets" style="color: #7c3aed;">Tạo ticket hỗ trợ</a><br/>
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
