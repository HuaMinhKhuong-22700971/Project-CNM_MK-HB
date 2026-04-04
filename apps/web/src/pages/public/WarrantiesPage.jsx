import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { PageCard } from "../../components/common/PageCard";
import { useAuth } from "../../hooks/useAuth";
import { activateWarranty, getEligibleWarrantyItems, getMyWarranties } from "../../services/warranty.service";

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }

  return error.message || fallbackMessage;
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString("vi-VN") : "-";
}

const inputStyle = {
  padding: "13px 15px",
  borderRadius: 14,
  border: "1px solid var(--border)",
  background: "rgba(255,255,255,0.94)",
  width: "100%"
};

export function WarrantiesPage() {
  const { isAuthenticated } = useAuth();
  const [eligibleItems, setEligibleItems] = useState([]);
  const [warranties, setWarranties] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [selectedOrderItemId, setSelectedOrderItemId] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const filteredWarranties = useMemo(() => {
    const normalizedKeyword = String(keyword || "").trim().toLowerCase();

    if (!normalizedKeyword) {
      return warranties;
    }

    return warranties.filter((item) => {
      const haystack = [item.warrantyCode, item.item?.productName, item.item?.sku].join(" ").toLowerCase();
      return haystack.includes(normalizedKeyword);
    });
  }, [keyword, warranties]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        setErrorMessage("");
        const [eligibleResponse, warrantyResponse] = await Promise.all([
          getEligibleWarrantyItems(),
          getMyWarranties()
        ]);
        const nextEligible = eligibleResponse?.data || eligibleResponse || [];
        const nextWarranties = warrantyResponse?.data || warrantyResponse || [];
        setEligibleItems(Array.isArray(nextEligible) ? nextEligible : []);
        setWarranties(Array.isArray(nextWarranties) ? nextWarranties : []);
        if (Array.isArray(nextEligible) && nextEligible.length > 0) {
          setSelectedOrderItemId(String(nextEligible[0].id));
        }
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Không thể tải thông tin bảo hành."));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isAuthenticated]);

  async function handleActivate(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");
      const response = await activateWarranty({ orderItemId: Number(selectedOrderItemId), note });
      const createdWarranty = response?.data || response;
      setWarranties((prev) => [createdWarranty, ...prev]);
      setEligibleItems((prev) => prev.filter((item) => String(item.id) !== String(selectedOrderItemId)));
      setSuccessMessage(`Đã kích hoạt bảo hành thành công. Mã bảo hành: ${createdWarranty?.warrantyCode}`);
      setNote("");
      setSelectedOrderItemId("");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể kích hoạt bảo hành."));
    } finally {
      setSubmitting(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <PageCard title="Bảo hành điện tử" description="Đăng nhập để kích hoạt và theo dõi bảo hành cho các sản phẩm bạn đã mua.">
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ color: "var(--muted)" }}>Bạn cần đăng nhập để sử dụng khu vực bảo hành điện tử.</div>
          <div><Link to="/login" style={{ color: "var(--color-accent)", fontWeight: 800 }}>Đi đến trang đăng nhập</Link></div>
        </div>
      </PageCard>
    );
  }

  if (loading) {
    return <div style={{ padding: 24, borderRadius: 24, border: "1px solid var(--border)", background: "var(--surface)", boxShadow: "var(--shadow)" }}>Đang tải thông tin bảo hành...</div>;
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section style={{ padding: "36px 32px", borderRadius: 24, border: "1px solid #e2e8f0", background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 44, letterSpacing: "-0.06em" }}>Bảo hành điện tử</h1>
        <div style={{ color: "var(--muted)", lineHeight: 1.7 }}>Kích hoạt bảo hành cho sản phẩm đã mua, lấy mã bảo hành và theo dõi hạn sử dụng ngay trên hệ thống.</div>
      </section>

      {errorMessage ? <div style={{ padding: 16, borderRadius: 16, background: "rgba(255,240,236,0.94)", color: "var(--danger)", border: "1px solid rgba(182,64,44,0.18)" }}>{errorMessage}</div> : null}
      {successMessage ? <div style={{ padding: 16, borderRadius: 16, background: "rgba(228,248,239,0.94)", color: "var(--primary)", border: "1px solid rgba(15,76,63,0.16)" }}>{successMessage}</div> : null}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.1fr)", gap: 24 }}>
        <PageCard title="Kích hoạt bảo hành" description="Chọn một sản phẩm trong đơn hàng đã mua, hệ thống sẽ sinh mã bảo hành điện tử tự động.">
          {eligibleItems.length === 0 ? (
            <div style={{ color: "var(--muted)" }}>Hiện không có sản phẩm nào cho phép kích hoạt bảo hành mới.</div>
          ) : (
            <form onSubmit={handleActivate} style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <label htmlFor="warranty-item" style={{ fontWeight: 700 }}>Sản phẩm cần kích hoạt</label>
                <select id="warranty-item" value={selectedOrderItemId} onChange={(event) => setSelectedOrderItemId(event.target.value)} style={inputStyle}>
                  {eligibleItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      #{item.orderId} - {item.productName} - {item.sku}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <label htmlFor="warranty-note" style={{ fontWeight: 700 }}>Ghi chú</label>
                <textarea id="warranty-note" value={note} onChange={(event) => setNote(event.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical" }} placeholder="Ghi chú thêm nếu cần, ví dụ serial bên ngoài hộp..." />
              </div>
              <button type="submit" disabled={submitting || !selectedOrderItemId} style={{ padding: 14, borderRadius: 16, border: "none", background: "var(--color-accent)", color: "#fff", fontWeight: 800 }}>
                {submitting ? "Đang kích hoạt..." : "Kích hoạt bảo hành"}
              </button>
            </form>
          )}
        </PageCard>

        <PageCard title="Danh sách bảo hành" description="Tìm nhanh theo mã bảo hành, SKU hoặc tên sản phẩm đã được kích hoạt.">
          <div style={{ display: "grid", gap: 14 }}>
            <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm theo mã bảo hành, tên sản phẩm hoặc SKU" style={inputStyle} />
            {filteredWarranties.length === 0 ? (
              <div style={{ color: "var(--muted)" }}>Chưa có bảo hành nào được kích hoạt.</div>
            ) : filteredWarranties.map((warranty) => (
              <article key={warranty.id} style={{ display: "grid", gap: 8, padding: 16, borderRadius: 18, border: "1px solid var(--border)", background: "rgba(255,255,255,0.88)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 800 }}>{warranty.item?.productName || "Sản phẩm"}</div>
                  <span style={{ display: "inline-flex", padding: "6px 10px", borderRadius: 999, background: "rgba(15,76,63,0.12)", color: "var(--primary)", fontSize: 12, fontWeight: 800 }}>
                    {warranty.status}
                  </span>
                </div>
                <div style={{ color: "var(--muted)", fontSize: 14 }}>Mã bảo hành: <strong style={{ color: "var(--text)" }}>{warranty.warrantyCode}</strong></div>
                <div style={{ color: "var(--muted)", fontSize: 14 }}>SKU: {warranty.item?.sku || "-"}</div>
                <div style={{ color: "var(--muted)", fontSize: 14 }}>Giá trị đơn hàng: {formatCurrency(warranty.item?.unitPrice)} VND · SL: {warranty.item?.quantity || 0}</div>
                <div style={{ color: "var(--muted)", fontSize: 14 }}>Kích hoạt: {formatDateTime(warranty.activatedAt)} · Hết hạn: {formatDateTime(warranty.expiresAt)}</div>
                {warranty.note ? <div style={{ color: "var(--muted)", fontSize: 14 }}>Ghi chú: {warranty.note}</div> : null}
              </article>
            ))}
          </div>
        </PageCard>
      </div>
    </div>
  );
}
