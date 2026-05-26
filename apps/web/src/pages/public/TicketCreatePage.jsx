import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

import { createTicket } from "../../services/ticket.service";
import { useAuth } from "../../hooks/useAuth";
import { routeConfig } from "../../routes/routeConfig";

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Thấp", desc: "Cần tư vấn hoặc hỗ trợ không gấp" },
  { value: "MEDIUM", label: "Trung bình", desc: "Ảnh hưởng trải nghiệm sử dụng" },
  { value: "HIGH", label: "Cao", desc: "Ảnh hưởng đơn hàng hoặc linh kiện" },
  { value: "URGENT", label: "Khẩn cấp", desc: "Không thể sử dụng hoặc cần xử lý ngay" }
];

const CATEGORY_OPTIONS = ["Kỹ thuật", "Bảo hành", "Thanh toán", "Đơn hàng", "Build PC"];
const ALLOWED_ATTACHMENTS = ["image/jpeg", "image/png", "image/gif", "video/mp4", "video/webm", "video/quicktime", "application/pdf"];
const MAX_ATTACHMENT_SIZE = 20 * 1024 * 1024;

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }

  return error.message || fallbackMessage;
}

function formatFileSize(size) {
  if (!size) return "0 KB";
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.ceil(size / 1024)} KB`;
}

function validateAttachments(files) {
  const accepted = [];
  const errors = [];

  files.forEach((file) => {
    if (!ALLOWED_ATTACHMENTS.includes(file.type)) {
      errors.push(`${file.name}: chỉ hỗ trợ JPG, PNG, GIF, MP4, WEBM, MOV hoặc PDF.`);
      return;
    }
    if (file.size > MAX_ATTACHMENT_SIZE) {
      errors.push(`${file.name}: dung lượng tối đa 20MB.`);
      return;
    }
    accepted.push(file);
  });

  return { accepted, errors };
}

export function TicketCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const defaultCategory = useMemo(() => {
    const category = searchParams.get("category");
    return CATEGORY_OPTIONS.includes(category) ? category : "Kỹ thuật";
  }, [searchParams]);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(defaultCategory);
  const [priority, setPriority] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isAuthenticated) {
    return <Navigate to={routeConfig.public.login} replace />;
  }

  function handleAttachmentChange(event) {
    const files = Array.from(event.target.files || []);
    const { accepted, errors } = validateAttachments(files);
    setAttachments(accepted);
    setErrorMessage(errors.join(" "));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim() || title.trim().length < 3) {
      setErrorMessage("Vui lòng nhập tiêu đề ticket ít nhất 3 ký tự.");
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setErrorMessage("Vui lòng mô tả vấn đề ít nhất 10 ký tự.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      const attachmentNote = attachments.length
        ? `\n\n[Tệp đính kèm khách đã chọn: ${attachments.map((file) => `${file.name} (${formatFileSize(file.size)})`).join(", ")}]`
        : "";
      const response = await createTicket({
        title: `[${category}] ${title.trim()}`,
        priority,
        description: `${description.trim()}${attachmentNote}`
      });
      const ticket = response?.data;
      navigate(routeConfig.public.ticketDetail.replace(":ticketId", String(ticket.id)));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể tạo ticket."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="ticket-create">
      <style>{ticketCreateStyles}</style>

      <Link to={routeConfig.public.tickets} className="ticket-back">← Quay lại Support Center</Link>

      <section className="ticket-create__hero">
        <div>
          <span>PC Mall Support</span>
          <h1>Tạo ticket hỗ trợ mới</h1>
          <p>Mô tả rõ sự cố, chọn đúng nhóm hỗ trợ và gửi kèm ảnh/video/hóa đơn để kỹ thuật viên xử lý nhanh hơn.</p>
        </div>
        <div className="ticket-create__tips">
          <strong>Gợi ý nội dung</strong>
          <ul>
            <li>Mã đơn hàng hoặc serial nếu có</li>
            <li>Cấu hình PC đang sử dụng</li>
            <li>Ảnh/video lỗi và bước đã thử</li>
          </ul>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="ticket-create__form">
        {errorMessage ? <div className="ticket-alert">{errorMessage}</div> : null}

        <div className="ticket-form-grid">
          <label className="ticket-field">
            <span>Tiêu đề ticket</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ví dụ: Mainboard không nhận RAM DDR5" />
          </label>

          <label className="ticket-field">
            <span>Danh mục hỗ trợ</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {CATEGORY_OPTIONS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="ticket-priority" aria-label="Chọn mức ưu tiên">
          {PRIORITY_OPTIONS.map((item) => (
            <button
              type="button"
              key={item.value}
              className={priority === item.value ? "is-active" : ""}
              onClick={() => setPriority(item.value)}
            >
              <strong>{item.label}</strong>
              <span>{item.desc}</span>
            </button>
          ))}
        </div>

        <label className="ticket-field">
          <span>Mô tả vấn đề</span>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={8} placeholder="Mô tả chi tiết sự cố, thời điểm xảy ra, cấu hình đang dùng, bước đã thử và ảnh hưởng hiện tại..." />
        </label>

        <div className="ticket-upload">
          <div>
            <strong>Tệp đính kèm</strong>
            <p>Hỗ trợ ảnh lỗi, video, hóa đơn: JPG, PNG, GIF, MP4, WEBM, MOV, PDF. Tối đa 20MB/tệp.</p>
          </div>
          <label>
            <input type="file" multiple accept=".jpg,.jpeg,.png,.gif,.mp4,.webm,.mov,.pdf,image/*,video/*,application/pdf" onChange={handleAttachmentChange} />
            <span>Chọn tệp</span>
          </label>
        </div>

        {attachments.length > 0 ? (
          <div className="ticket-files">
            {attachments.map((file) => (
              <div key={`${file.name}-${file.size}`}>
                <span>{file.type.startsWith("video/") ? "🎬" : file.type === "application/pdf" ? "🧾" : "🖼️"}</span>
                <strong>{file.name}</strong>
                <small>{formatFileSize(file.size)}</small>
              </div>
            ))}
          </div>
        ) : null}

        <div className="ticket-create__actions">
          <button type="submit" disabled={submitting}>{submitting ? "Đang gửi ticket..." : "Gửi ticket"}</button>
          <Link to={routeConfig.public.tickets}>Hủy</Link>
        </div>
      </form>
    </div>
  );
}

const ticketCreateStyles = `
.ticket-create {
  display: grid;
  gap: 20px;
}

.ticket-back {
  color: #2563eb;
  font-weight: 800;
  text-decoration: none;
}

.ticket-create__hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  padding: 30px;
  border-radius: 28px;
  color: #fff;
  background:
    radial-gradient(circle at top right, rgba(96, 165, 250, 0.36), transparent 36%),
    linear-gradient(135deg, #0f172a 0%, #1e3a8a 58%, #2563eb 100%);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
}

.ticket-create__hero span {
  color: #bfdbfe;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.ticket-create__hero h1 {
  margin: 8px 0 10px;
  font-size: clamp(32px, 5vw, 48px);
  line-height: 1.05;
}

.ticket-create__hero p,
.ticket-create__tips li {
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.7;
}

.ticket-create__hero p {
  margin: 0;
}

.ticket-create__tips {
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.34);
}

.ticket-create__tips ul {
  display: grid;
  gap: 8px;
  margin: 10px 0 0;
  padding-left: 20px;
}

.ticket-create__form {
  display: grid;
  gap: 18px;
  padding: 22px;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}

.ticket-alert {
  padding: 14px 16px;
  border: 1px solid #fecaca;
  border-radius: 16px;
  color: #b91c1c;
  background: #fef2f2;
  font-weight: 800;
}

.ticket-form-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 14px;
}

.ticket-field {
  display: grid;
  gap: 8px;
}

.ticket-field span,
.ticket-upload strong {
  color: #0f172a;
  font-weight: 900;
}

.ticket-field input,
.ticket-field select,
.ticket-field textarea {
  width: 100%;
  border: 1px solid #dbe4f0;
  border-radius: 14px;
  color: #0f172a;
  background: #f8fafc;
  font: inherit;
}

.ticket-field input,
.ticket-field select {
  min-height: 48px;
  padding: 0 14px;
}

.ticket-field textarea {
  padding: 14px;
  resize: vertical;
}

.ticket-priority {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.ticket-priority button {
  display: grid;
  gap: 6px;
  padding: 14px;
  border: 1px solid #dbe4f0;
  border-radius: 16px;
  background: #fff;
  text-align: left;
  cursor: pointer;
}

.ticket-priority button.is-active {
  color: #fff;
  border-color: transparent;
  background: linear-gradient(135deg, #0f172a, #2563eb);
}

.ticket-priority span {
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

.ticket-priority button.is-active span {
  color: rgba(255, 255, 255, 0.78);
}

.ticket-upload {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px dashed #93c5fd;
  border-radius: 18px;
  background: #eff6ff;
}

.ticket-upload p {
  margin: 5px 0 0;
  color: #64748b;
}

.ticket-upload input {
  display: none;
}

.ticket-upload label span,
.ticket-create__actions button,
.ticket-create__actions a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 12px;
  font-weight: 900;
  text-decoration: none;
  cursor: pointer;
}

.ticket-upload label span,
.ticket-create__actions button {
  color: #fff;
  border: 0;
  background: linear-gradient(135deg, #0f172a, #2563eb);
}

.ticket-create__actions button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.ticket-files {
  display: grid;
  gap: 8px;
}

.ticket-files div {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #f8fafc;
}

.ticket-files strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ticket-files small {
  color: #64748b;
}

.ticket-create__actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.ticket-create__actions a {
  color: #0f172a;
  border: 1px solid #dbe4f0;
  background: #fff;
}

@media (max-width: 900px) {
  .ticket-create__hero,
  .ticket-form-grid,
  .ticket-priority {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .ticket-create__hero {
    padding: 24px;
  }

  .ticket-upload,
  .ticket-create__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .ticket-upload label span,
  .ticket-create__actions button,
  .ticket-create__actions a {
    width: 100%;
  }
}
`;
