import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { PageCard } from "../../components/common/PageCard";
import { useAuth } from "../../hooks/useAuth";
import {
  changePassword,
  createMyAddress,
  deleteMyAddress,
  getCurrentProfile,
  updateCurrentProfile,
  updateMyAddress
} from "../../services/auth.service";

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }

  return error.message || fallbackMessage;
}

const inputStyle = {
  padding: "13px 15px",
  borderRadius: 14,
  border: "1px solid var(--border)",
  background: "rgba(255,255,255,0.94)",
  width: "100%"
};

function normalizeProfile(response) {
  return response?.data || response;
}

function createAddressFormState(address) {
  return {
    id: address?.id || null,
    fullName: address?.fullName || "",
    phone: address?.phone || "",
    addressLine: address?.addressLine || "",
    ward: address?.ward || "",
    district: address?.district || "",
    province: address?.province || ""
  };
}

export function ProfilePage() {
  const { authState, isAuthenticated, refreshProfile } = useAuth();
  const [profile, setProfile] = useState(authState.user || null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [profileForm, setProfileForm] = useState({ fullName: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [addressForm, setAddressForm] = useState(createAddressFormState());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function loadProfile() {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await getCurrentProfile();
        const data = normalizeProfile(response);
        setProfile(data);
        setProfileForm({
          fullName: data?.fullName || "",
          phone: data?.phone || ""
        });
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Không thể tải tài khoản hiện tại."));
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [isAuthenticated]);

  async function handleProfileSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");
      const response = await updateCurrentProfile({
        full_name: profileForm.fullName,
        phone: profileForm.phone
      });
      const data = normalizeProfile(response);
      setProfile(data);
      await refreshProfile();
      setSuccessMessage("Thông tin cá nhân đã được cập nhật.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể cập nhật thông tin cá nhân."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");
      await changePassword(passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setSuccessMessage("Mật khẩu đã được đổi thành công.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể đổi mật khẩu."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddressSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");
      const response = addressForm.id
        ? await updateMyAddress(addressForm.id, addressForm)
        : await createMyAddress(addressForm);
      const addresses = normalizeProfile(response);
      setProfile((prevState) => ({ ...(prevState || {}), addresses }));
      setAddressForm(createAddressFormState());
      setSuccessMessage(addressForm.id ? "Địa chỉ đã được cập nhật." : "Đã thêm địa chỉ mới.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể lưu địa chỉ."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteAddress(addressId) {
    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");
      await deleteMyAddress(addressId);
      setProfile((prevState) => ({
        ...(prevState || {}),
        addresses: Array.isArray(prevState?.addresses) ? prevState.addresses.filter((item) => item.id !== addressId) : []
      }));
      if (addressForm.id === addressId) {
        setAddressForm(createAddressFormState());
      }
      setSuccessMessage("Địa chỉ đã được xóa.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể xóa địa chỉ."));
    } finally {
      setSubmitting(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <PageCard title="Tài khoản của tôi" description="Đăng nhập để cập nhật thông tin cá nhân, đổi mật khẩu và quản lý địa chỉ giao hàng.">
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ color: "var(--muted)" }}>Bạn cần đăng nhập để xem khu vực này.</div>
          <div><Link to="/login" style={{ color: "var(--color-accent)", fontWeight: 800 }}>Đi đến trang đăng nhập</Link></div>
        </div>
      </PageCard>
    );
  }

  if (loading) {
    return <div style={{ padding: 24, borderRadius: 24, background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>Đang tải thông tin tài khoản...</div>;
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section style={{ padding: "26px 28px", borderRadius: 28, border: "1px solid var(--border)", background: "linear-gradient(135deg, rgba(255,250,242,0.98), rgba(223,236,229,0.92))", boxShadow: "var(--shadow)" }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 44, letterSpacing: "-0.06em" }}>Tài khoản của tôi</h1>
        <div style={{ color: "var(--muted)", lineHeight: 1.7 }}>Quản lý thông tin cá nhân, mật khẩu và địa chỉ giao hàng ở một nơi duy nhất.</div>
      </section>

      {errorMessage ? <div style={{ padding: 16, borderRadius: 16, background: "rgba(255,240,236,0.94)", color: "var(--danger)", border: "1px solid rgba(182,64,44,0.18)" }}>{errorMessage}</div> : null}
      {successMessage ? <div style={{ padding: 16, borderRadius: 16, background: "rgba(228,248,239,0.94)", color: "var(--primary)", border: "1px solid rgba(15,76,63,0.16)" }}>{successMessage}</div> : null}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 24 }}>
        <PageCard title="Thông tin cá nhân" description="Cập nhật tên và số điện thoại hiện tại của bạn.">
          <form onSubmit={handleProfileSubmit} style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <label htmlFor="profile-full-name" style={{ fontWeight: 700 }}>Họ và tên</label>
              <input id="profile-full-name" value={profileForm.fullName} onChange={(event) => setProfileForm((prev) => ({ ...prev, fullName: event.target.value }))} style={inputStyle} />
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              <label htmlFor="profile-email" style={{ fontWeight: 700 }}>Email</label>
              <input id="profile-email" value={profile?.email || ""} disabled style={{ ...inputStyle, opacity: 0.7 }} />
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              <label htmlFor="profile-phone" style={{ fontWeight: 700 }}>Số điện thoại</label>
              <input id="profile-phone" value={profileForm.phone} onChange={(event) => setProfileForm((prev) => ({ ...prev, phone: event.target.value }))} style={inputStyle} />
            </div>
            <button type="submit" disabled={submitting} style={{ padding: 14, borderRadius: 16, border: "none", background: "var(--color-accent)", color: "#fff", fontWeight: 800 }}>Lưu thông tin</button>
          </form>
        </PageCard>

        <PageCard title="Đổi mật khẩu" description="Mật khẩu mới nên dài hơn 6 ký tự và khác mật khẩu hiện tại.">
          <form onSubmit={handlePasswordSubmit} style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <label htmlFor="current-password" style={{ fontWeight: 700 }}>Mật khẩu hiện tại</label>
              <input id="current-password" type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))} style={inputStyle} />
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              <label htmlFor="new-password" style={{ fontWeight: 700 }}>Mật khẩu mới</label>
              <input id="new-password" type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))} style={inputStyle} />
            </div>
            <button type="submit" disabled={submitting} style={{ padding: 14, borderRadius: 16, border: "none", background: "var(--primary)", color: "#fff", fontWeight: 800 }}>Cập nhật mật khẩu</button>
          </form>
        </PageCard>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, 0.9fr)", gap: 24 }}>
        <PageCard title="Địa chỉ của tôi" description="Hệ thống sẽ ưu tiên địa chỉ đã lưu khi bạn checkout và tạo đơn hàng.">
          <div style={{ display: "grid", gap: 14 }}>
            {Array.isArray(profile?.addresses) && profile.addresses.length > 0 ? profile.addresses.map((address) => (
              <article key={address.id} style={{ display: "grid", gap: 8, padding: 16, borderRadius: 18, border: "1px solid var(--border)", background: "rgba(255,255,255,0.88)" }}>
                <div style={{ fontWeight: 800 }}>{address.fullName || profile?.fullName || "Người nhận"}</div>
                <div style={{ color: "var(--muted)" }}>{[address.addressLine, address.ward, address.district, address.province].filter(Boolean).join(", ") || "Chưa có địa chỉ đầy đủ"}</div>
                <div style={{ color: "var(--muted)", fontSize: 14 }}>{address.phone || "Chưa có số điện thoại"}</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button type="button" onClick={() => setAddressForm(createAddressFormState(address))} style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid var(--border)", background: "#fff" }}>Chỉnh sửa</button>
                  <button type="button" onClick={() => handleDeleteAddress(address.id)} style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(182,64,44,0.18)", background: "rgba(255,240,236,0.92)", color: "var(--danger)" }}>Xóa</button>
                </div>
              </article>
            )) : <div style={{ color: "var(--muted)" }}>Bạn chưa có địa chỉ nào được lưu.</div>}
          </div>
        </PageCard>

        <PageCard title={addressForm.id ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ"} description="Cập nhật nhanh địa chỉ giao hàng để checkout thuận tiện hơn.">
          <form onSubmit={handleAddressSubmit} style={{ display: "grid", gap: 12 }}>
            <input value={addressForm.fullName} onChange={(event) => setAddressForm((prev) => ({ ...prev, fullName: event.target.value }))} placeholder="Họ và tên người nhận" style={inputStyle} />
            <input value={addressForm.phone} onChange={(event) => setAddressForm((prev) => ({ ...prev, phone: event.target.value }))} placeholder="Số điện thoại" style={inputStyle} />
            <input value={addressForm.addressLine} onChange={(event) => setAddressForm((prev) => ({ ...prev, addressLine: event.target.value }))} placeholder="Số nhà, đường, tòa nhà..." style={inputStyle} />
            <input value={addressForm.ward} onChange={(event) => setAddressForm((prev) => ({ ...prev, ward: event.target.value }))} placeholder="Phường / Xã" style={inputStyle} />
            <input value={addressForm.district} onChange={(event) => setAddressForm((prev) => ({ ...prev, district: event.target.value }))} placeholder="Quận / Huyện" style={inputStyle} />
            <input value={addressForm.province} onChange={(event) => setAddressForm((prev) => ({ ...prev, province: event.target.value }))} placeholder="Tỉnh / Thành phố" style={inputStyle} />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="submit" disabled={submitting} style={{ padding: "12px 16px", borderRadius: 14, border: "none", background: "var(--color-accent)", color: "#fff", fontWeight: 800 }}>
                {addressForm.id ? "Lưu địa chỉ" : "Thêm địa chỉ"}
              </button>
              {addressForm.id ? (
                <button type="button" onClick={() => setAddressForm(createAddressFormState())} style={{ padding: "12px 16px", borderRadius: 14, border: "1px solid var(--border)", background: "#fff" }}>
                  Hủy sửa
                </button>
              ) : null}
            </div>
          </form>
        </PageCard>
      </div>
    </div>
  );
}
