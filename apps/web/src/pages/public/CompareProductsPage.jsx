import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

import { PageCard } from "../../components/common/PageCard";
import { getCompareProducts } from "../../services/catalog.service";

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }

  return error.message || fallbackMessage;
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

export function CompareProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [idsInput, setIdsInput] = useState(searchParams.get("ids") || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const comparedItems = useMemo(() => (Array.isArray(result?.items) ? result.items : []), [result]);
  const attributeNames = useMemo(() => (Array.isArray(result?.attributes) ? result.attributes : []), [result]);

  async function loadCompare(idsValue) {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await getCompareProducts(idsValue);
      setResult(response?.data || response);
    } catch (error) {
      setResult(null);
      setErrorMessage(getErrorMessage(error, "Không thể so sánh sản phẩm."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const initialIds = searchParams.get("ids") || "";

    if (initialIds) {
      setIdsInput(initialIds);
      loadCompare(initialIds);
    }
  }, [searchParams]);

  async function handleCompare(event) {
    event.preventDefault();
    setSearchParams(idsInput ? { ids: idsInput } : {});

    if (!idsInput) {
      setResult(null);
      setErrorMessage("");
      return;
    }

    await loadCompare(idsInput);
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <PageCard title="So sánh sản phẩm" description="Nhập 2 đến 4 mã sản phẩm để đặt lên cùng một bảng so sánh thông số, giá và tồn kho.">
        <form onSubmit={handleCompare} style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <label htmlFor="compare-ids" style={{ fontWeight: 700 }}>Danh sách ID sản phẩm</label>
            <input
              id="compare-ids"
              value={idsInput}
              onChange={(event) => setIdsInput(event.target.value)}
              placeholder="Ví dụ: 1,2,3"
              style={{ padding: "14px 16px", borderRadius: 16, border: "1px solid var(--border)", background: "rgba(255,255,255,0.92)" }}
            />
            <div style={{ color: "var(--muted)", fontSize: 14 }}>API compare hiện tại dùng ID sản phẩm. Bạn có thể copy ID từ trang danh sách hoặc chi tiết sản phẩm.</div>
          </div>
          <div>
            <button type="submit" disabled={loading} style={{ padding: "14px 18px", borderRadius: 16, border: "none", background: "var(--color-accent)", color: "#fff", fontWeight: 800, cursor: loading ? "wait" : "pointer" }}>
              {loading ? "Đang so sánh..." : "So sánh ngay"}
            </button>
          </div>
        </form>
      </PageCard>

      {errorMessage ? <div style={{ padding: 16, borderRadius: 18, background: "rgba(255, 240, 236, 0.94)", border: "1px solid rgba(182, 64, 44, 0.2)", color: "var(--danger)" }}>{errorMessage}</div> : null}

      {comparedItems.length > 0 ? (
        <section style={{ display: "grid", gap: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${comparedItems.length}, minmax(0, 1fr))`, gap: 16 }}>
            {comparedItems.map((item) => {
              const variant = item.primaryVariant || item.variants?.[0] || null;
              return (
                <article key={item.product_id} style={{ display: "grid", gap: 12, padding: 20, borderRadius: 24, border: "1px solid var(--border)", background: "var(--surface)", boxShadow: "var(--shadow)" }}>
                  <div style={{ minHeight: 180, borderRadius: 18, background: item.image_url || variant?.image_url ? `center / cover no-repeat url(${item.image_url || variant?.image_url})` : "linear-gradient(135deg, #fff1e8, #edf6f2)", display: "grid", placeItems: "center", color: "var(--primary)", fontWeight: 800, textAlign: "center", padding: 16 }}>
                    {!(item.image_url || variant?.image_url) ? item.product_name : null}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.25 }}>{item.product_name}</div>
                  <div style={{ color: "var(--muted)", fontSize: 14 }}>{item.brand?.name || "Chưa gắn thương hiệu"} · {item.category?.name || "Khác"}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "var(--color-accent)" }}>{formatCurrency(variant?.price)} VND</div>
                  <div style={{ color: "var(--muted)", fontSize: 14 }}>Tồn kho: {Number(variant?.stock_quantity || 0)}</div>
                </article>
              );
            })}
          </div>

          <PageCard title="Bảng thông số" description="Thông số được lấy từ SKU đầu tiên của mỗi sản phẩm, phù hợp để demo nhanh chức năng compare.">
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "12px 10px" }}>Tiêu chí</th>
                    {comparedItems.map((item) => (
                      <th key={item.product_id} style={{ padding: "12px 10px" }}>{item.product_name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid rgba(214, 208, 196, 0.7)" }}>
                    <td style={{ padding: "14px 10px", fontWeight: 700 }}>Giá</td>
                    {comparedItems.map((item) => (
                      <td key={`${item.product_id}-price`} style={{ padding: "14px 10px" }}>{formatCurrency(item.primaryVariant?.price)} VND</td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(214, 208, 196, 0.7)" }}>
                    <td style={{ padding: "14px 10px", fontWeight: 700 }}>Tồn kho</td>
                    {comparedItems.map((item) => (
                      <td key={`${item.product_id}-stock`} style={{ padding: "14px 10px" }}>{Number(item.primaryVariant?.stock_quantity || 0)}</td>
                    ))}
                  </tr>
                  {attributeNames.map((attribute) => (
                    <tr key={attribute} style={{ borderBottom: "1px solid rgba(214, 208, 196, 0.7)" }}>
                      <td style={{ padding: "14px 10px", fontWeight: 700 }}>{attribute}</td>
                      {comparedItems.map((item) => (
                        <td key={`${item.product_id}-${attribute}`} style={{ padding: "14px 10px" }}>{item.compareSpecs?.[attribute] || "-"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PageCard>
        </section>
      ) : null}
    </div>
  );
}
