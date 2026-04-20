import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
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
      const data = response?.data || response;
      setResult(data);
      
      // Save current IDs to session to keep track for "Add more" feature
      if (Array.isArray(data?.items)) {
        const currentIds = data.items.map(item => item.product_id).join(",");
        sessionStorage.setItem("comparing_product_ids", currentIds);
      }
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
        <section style={{ display: "grid", gap: 24 }}>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
            justifyContent: "center"
          }}>
            {comparedItems.map((item) => {
              const variant = item.primaryVariant || item.variants?.[0] || null;
              const productImg = item.image_url || variant?.image_url;

              return (
                <article key={item.product_id} style={{ flex: "1 1 300px", maxWidth: 340, display: "flex", flexDirection: "column", gap: 16, padding: 24, borderRadius: 32, border: "1px solid var(--border)", background: "var(--surface)", boxShadow: "var(--shadow)", position: "relative", overflow: "hidden" }}>
                  <div style={{
                    aspectRatio: "1/1",
                    borderRadius: 24,
                    background: productImg ? `#ffffff center / contain no-repeat url(${productImg})` : "linear-gradient(135deg, #f7ead8, #deece5)",
                    border: "1px solid rgba(214, 208, 196, 0.4)",
                    display: "grid",
                    placeItems: "center",
                    padding: 16
                  }}>
                    {!productImg ? (
                      <div style={{ color: "var(--primary)", fontWeight: 800, textAlign: "center", fontSize: 13 }}>{item.product_name}</div>
                    ) : null}
                  </div>
                  <div style={{ display: "grid", gap: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--primary)" }}>{item.brand?.name || "Brand"}</div>
                    <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.03em" }}>{item.product_name}</h3>
                  </div>
                  <div style={{ marginTop: "auto", display: "grid", gap: 4 }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: "var(--color-accent)", letterSpacing: "-0.04em" }}>{formatCurrency(variant?.price)}đ</div>
                    <div style={{ color: "var(--muted)", fontSize: 14, fontWeight: 600 }}>Tồn kho: {Number(variant?.stock_quantity || 0)}</div>
                  </div>
                </article>
              );
            })}
            
            {comparedItems.length < 4 && (
              <Link 
                to={comparedItems.length > 0 
                  ? `/products?category_id=${comparedItems[0].category?.id}&mode=compare` 
                  : "/products?mode=compare"
                }
                style={{ flex: "1 1 300px", maxWidth: 340, border: "2px dashed var(--border)", borderRadius: 32, display: "grid", placeItems: "center", padding: 40, textAlign: "center", minHeight: 300, textDecoration: "none", color: "inherit", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--color-accent)"; e.currentTarget.style.background = "rgba(198,124,49,0.04)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ display: "grid", gap: 12 }}>
                  <div style={{ fontSize: 44 }}>➕</div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>Thêm sản phẩm để so sánh</div>
                  <div style={{ color: "var(--muted)", fontSize: 14 }}>Bấm vào đây để quay lại cửa hàng tìm sản phẩm khác.</div>
                </div>
              </Link>
            )}
          </div>

          <section style={{ padding: 32, borderRadius: 32, border: "1px solid var(--border)", background: "var(--surface)", boxShadow: "var(--shadow)" }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 32, letterSpacing: "-0.05em" }}>Bảng so sánh chi tiết</h2>
              <div style={{ color: "var(--muted)", marginTop: 4 }}>Thông tin được tổng hợp từ SKU chính của từng sản phẩm.</div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "var(--muted)", textTransform: "uppercase", fontSize: 12, letterSpacing: "0.1em" }}>
                    <th style={{ padding: "16px 12px", borderBottom: "2px solid var(--border)" }}>Tiêu chí</th>
                    {comparedItems.map((item) => (
                      <th key={item.product_id} style={{ padding: "16px 12px", borderBottom: "2px solid var(--border)" }}>{item.product_name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid rgba(214, 208, 196, 0.4)" }}>
                    <td style={{ padding: "20px 12px", fontWeight: 800, color: "var(--primary)" }}>Giá hiện tại</td>
                    {comparedItems.map((item) => (
                      <td key={`${item.product_id}-price`} style={{ padding: "20px 12px", fontSize: 18, fontWeight: 900, color: "var(--color-accent)" }}>{formatCurrency(item.primaryVariant?.price)} VND</td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(214, 208, 196, 0.4)" }}>
                    <td style={{ padding: "20px 12px", fontWeight: 800 }}>Tồn kho</td>
                    {comparedItems.map((item) => (
                      <td key={`${item.product_id}-stock`} style={{ padding: "20px 12px" }}>{Number(item.primaryVariant?.stock_quantity || 0)}</td>
                    ))}
                  </tr>
                  {attributeNames.map((attribute) => (
                    <tr key={attribute} style={{ borderBottom: "1px solid rgba(214, 208, 196, 0.4)" }}>
                      <td style={{ padding: "20px 12px", fontWeight: 800 }}>{attribute}</td>
                      {comparedItems.map((item) => (
                        <td key={`${item.product_id}-${attribute}`} style={{ padding: "20px 12px", lineHeight: 1.5 }}>{item.compareSpecs?.[attribute] || "-"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      ) : null}
    </div>
  );
}
