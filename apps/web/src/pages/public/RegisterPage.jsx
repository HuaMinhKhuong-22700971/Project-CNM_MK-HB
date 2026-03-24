import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { PageCard } from "../../components/common/PageCard";
import { register } from "../../services/auth.service";

const inputStyle = {
  padding: "14px 16px",
  borderRadius: 16,
  border: "1px solid rgba(122, 92, 48, 0.18)",
  outline: "none",
  width: "100%",
  background: "rgba(255,255,255,0.88)",
  color: "var(--text)"
};

function validateForm(values) {
  const errors = {};

  if (!String(values.full_name || "").trim()) {
    errors.full_name = "Vui lòng nhập họ và tên";
  }

  if (!String(values.email || "").trim()) {
    errors.email = "Vui lòng nhập email";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(values.email).trim())) {
    errors.email = "Email không hợp lệ";
  }

  if (!String(values.phone || "").trim()) {
    errors.phone = "Vui lòng nhập số điện thoại";
  }

  if (!String(values.password || "").trim()) {
    errors.password = "Vui lòng nhập mật khẩu";
  } else if (String(values.password).length < 6) {
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
  }

  if (!String(values.confirm_password || "").trim()) {
    errors.confirm_password = "Vui lòng nhập lại mật khẩu";
  } else if (String(values.confirm_password) !== String(values.password)) {
    errors.confirm_password = "Mật khẩu nhập lại không khớp";
  }

  return errors;
}

function mapBackendValidationErrors(errorList = []) {
  return errorList.reduce((accumulator, item) => {
    if (item?.field && item?.message) {
      accumulator[item.field] = item.message;
    }

    return accumulator;
  }, {});
}

export function RegisterPage() {
  const [formValues, setFormValues] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: ""
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDisabled = useMemo(() => isSubmitting, [isSubmitting]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormValues((prevState) => ({
      ...prevState,
      [name]: value
    }));

    setErrors((prevState) => ({
      ...prevState,
      [name]: ""
    }));

    setServerError("");
    setSuccessMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateForm(formValues);
    setErrors(nextErrors);
    setServerError("");
    setSuccessMessage("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await register({
        full_name: formValues.full_name.trim(),
        email: formValues.email.trim(),
        phone: formValues.phone.trim(),
        password: formValues.password
      });

      setSuccessMessage(response?.message || "Tạo tài khoản thành công");
      setFormValues({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        confirm_password: ""
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;

        if (Array.isArray(responseData?.errors)) {
          setErrors(mapBackendValidationErrors(responseData.errors));
        }

        setServerError(responseData?.message || "Tạo tài khoản thất bại");
      } else {
        setServerError(error.message || "Tạo tài khoản thất bại");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 620, margin: "36px auto" }}>
      <PageCard title="Tạo tài khoản" description="Đăng ký để theo dõi đơn hàng, lưu cấu hình PC và sử dụng đầy đủ các tính năng của hệ thống.">
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <label htmlFor="full_name" style={{ fontWeight: 700 }}>Họ và tên</label>
            <input id="full_name" name="full_name" value={formValues.full_name} onChange={handleChange} placeholder="Nguyễn Văn A" style={inputStyle} />
            {errors.full_name ? <span style={{ color: "var(--danger)", fontSize: 14 }}>{errors.full_name}</span> : null}
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label htmlFor="email" style={{ fontWeight: 700 }}>Email</label>
            <input id="email" name="email" type="email" value={formValues.email} onChange={handleChange} placeholder="you@example.com" style={inputStyle} />
            {errors.email ? <span style={{ color: "var(--danger)", fontSize: 14 }}>{errors.email}</span> : null}
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label htmlFor="phone" style={{ fontWeight: 700 }}>Số điện thoại</label>
            <input id="phone" name="phone" value={formValues.phone} onChange={handleChange} placeholder="0987654321" style={inputStyle} />
            {errors.phone ? <span style={{ color: "var(--danger)", fontSize: 14 }}>{errors.phone}</span> : null}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <label htmlFor="password" style={{ fontWeight: 700 }}>Mật khẩu</label>
              <input id="password" name="password" type="password" value={formValues.password} onChange={handleChange} placeholder="Ít nhất 6 ký tự" style={inputStyle} />
              {errors.password ? <span style={{ color: "var(--danger)", fontSize: 14 }}>{errors.password}</span> : null}
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label htmlFor="confirm_password" style={{ fontWeight: 700 }}>Nhập lại mật khẩu</label>
              <input id="confirm_password" name="confirm_password" type="password" value={formValues.confirm_password} onChange={handleChange} placeholder="Nhập lại mật khẩu" style={inputStyle} />
              {errors.confirm_password ? <span style={{ color: "var(--danger)", fontSize: 14 }}>{errors.confirm_password}</span> : null}
            </div>
          </div>

          {serverError ? (
            <div style={{ padding: 14, borderRadius: 16, background: "rgba(255, 240, 236, 0.92)", color: "var(--danger)", border: "1px solid rgba(182, 64, 44, 0.22)" }}>
              {serverError}
            </div>
          ) : null}

          {successMessage ? (
            <div style={{ padding: 14, borderRadius: 16, background: "rgba(228, 248, 239, 0.92)", color: "var(--primary)", border: "1px solid rgba(31, 76, 63, 0.18)" }}>
              {successMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isDisabled}
            style={{
              padding: 14,
              borderRadius: 16,
              border: "none",
              background: isDisabled ? "#93c5fd" : "linear-gradient(135deg, var(--accent), #d08a43)",
              color: "#ffffff",
              fontWeight: 800,
              cursor: isDisabled ? "not-allowed" : "pointer"
            }}
          >
            {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </button>

          <div style={{ fontSize: 15, color: "var(--muted)" }}>
            Đã có tài khoản? <Link to="/login" style={{ color: "var(--primary)", fontWeight: 700 }}>Đăng nhập ngay</Link>
          </div>
        </form>
      </PageCard>
    </div>
  );
}
