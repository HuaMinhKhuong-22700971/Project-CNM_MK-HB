import React from "react";
import { resolveProductImage } from "../../utils/productImage";

function extractBuildPreviewData(build) {
  const rawComps = build?.components || build?.items || {};
  let itemsList = [];

  if (Array.isArray(rawComps)) {
    itemsList = rawComps.map((c) => ({
      type: (c.type || c.componentType || "").toLowerCase(),
      product: c.product || c
    }));
  } else if (rawComps && typeof rawComps === "object") {
    itemsList = Object.entries(rawComps).map(([type, val]) => ({
      type: type.toLowerCase(),
      product: val?.product || val
    }));
  }

  const validItems = itemsList.filter((item) => item.product && (item.product.name || item.product.product_name || item.product.id));

  // Extract up to 4 key component items for thumbnail row (priority: gpu > cpu > mainboard > case > others)
  const priorityTypes = ["gpu", "cpu", "mainboard", "case", "ram", "storage", "psu", "cooling"];
  const sortedItems = [...validItems].sort((a, b) => {
    const idxA = priorityTypes.indexOf(a.type);
    const idxB = priorityTypes.indexOf(b.type);
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });

  const thumbnails = sortedItems.slice(0, 4).map((item) => ({
    type: item.type.toUpperCase(),
    name: item.product.product_name || item.product.name || item.type,
    img: resolveProductImage(item.product)
  }));

  const extraCount = Math.max(0, validItems.length - 4);
  const price = Number(build?.totalPrice || build?.total_price || 0);

  return {
    count: validItems.length,
    thumbnails,
    extraCount,
    price
  };
}

export function GuestBuildsAndHistory({
  isAuthenticated,
  guestBuildList = [],
  userBuildsHistory = [],
  isHistoryLoading = false,
  onLoadGuestBuild,
  onCreateGuestBuild,
  onApplyUserBuild,
  formatCurrency
}) {
  return (
    <>
      {!isAuthenticated && guestBuildList.length > 0 && (
        <>
          <div className="sidebar-divider" />
          <div className="sidebar-section-header">
            <span className="sidebar-section-title">Build đã lưu (Khách)</span>
          </div>
          <div className="sidebar-guest-builds" style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
            {guestBuildList.slice(0, 4).map((slot) => {
              const preview = extractBuildPreviewData(slot);
              return (
                <div
                  key={slot.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "12px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <strong style={{ fontSize: "12.5px", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "150px" }}>
                      📋 {slot.name}
                    </strong>
                    <span style={{ fontSize: "11.5px", fontWeight: "800", color: "#2563eb" }}>
                      {formatCurrency(preview.price || slot.totalPrice)}đ
                    </span>
                  </div>

                  {/* Component Thumbnail Strip */}
                  {preview.thumbnails.length > 0 ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "6px 0" }}>
                      {preview.thumbnails.map((t, i) => (
                        <img
                          key={i}
                          src={t.img}
                          alt={t.name}
                          title={`${t.type}: ${t.name}`}
                          style={{
                            width: "26px",
                            height: "26px",
                            objectFit: "contain",
                            borderRadius: "6px",
                            border: "1px solid #cbd5e1",
                            backgroundColor: "#ffffff",
                            padding: "2px"
                          }}
                        />
                      ))}
                      {preview.extraCount > 0 && (
                        <span style={{
                          fontSize: "10px",
                          fontWeight: "700",
                          color: "#64748b",
                          backgroundColor: "#e2e8f0",
                          padding: "2px 5px",
                          borderRadius: "5px"
                        }}>
                          +{preview.extraCount}
                        </span>
                      )}
                      <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "auto" }}>
                        ({preview.count} món)
                      </span>
                    </div>
                  ) : (
                    <div style={{ fontSize: "11px", color: "#94a3b8", fontStyle: "italic", margin: "4px 0" }}>
                      Chưa chọn linh kiện
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => onLoadGuestBuild(slot.id)}
                    style={{
                      width: "100%",
                      padding: "6px",
                      borderRadius: "8px",
                      border: "1px solid #bfdbfe",
                      backgroundColor: "#eff6ff",
                      fontSize: "11.5px",
                      fontWeight: "700",
                      color: "#1d4ed8",
                      cursor: "pointer",
                      marginTop: "4px"
                    }}
                  >
                    📂 Mở & Tải Cấu Hình Này
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              className="btn-new-build"
              onClick={onCreateGuestBuild}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "10px",
                border: "1px dashed #3b82f6",
                backgroundColor: "#f0f9ff",
                color: "#0284c7",
                fontWeight: "700",
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              + Tạo Slot Build Mới
            </button>
          </div>
        </>
      )}

      {isAuthenticated && (
        <>
          <div className="sidebar-divider" />
          <div className="sidebar-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="sidebar-section-title">📂 Lịch Sử Cấu Hình</span>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700" }}>({userBuildsHistory.length})</span>
          </div>

          {isHistoryLoading ? (
            <div style={{ padding: "10px", fontSize: "12px", color: "#64748b" }}>Đang tải lịch sử...</div>
          ) : userBuildsHistory.length === 0 ? (
            <div style={{ padding: "10px", fontSize: "11.5px", color: "#94a3b8", fontStyle: "italic" }}>
              Chưa có cấu hình nào được lưu trong tài khoản.
            </div>
          ) : (
            <div className="sidebar-user-builds" style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
              {userBuildsHistory.slice(0, 4).map((b) => {
                const preview = extractBuildPreviewData(b);
                return (
                  <div
                    key={b.id || b.build_id}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "12px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: "12.5px", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "150px" }}>
                        {b.name || b.title || `Build #${b.id}`}
                      </strong>
                      <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", backgroundColor: "#e2e8f0", fontWeight: "700", color: "#475569" }}>
                        {b.status || "SAVED"}
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>
                        {b.createdAt ? new Date(b.createdAt).toLocaleDateString("vi-VN") : "Gần đây"}
                      </span>
                      <strong style={{ color: "#2563eb", fontSize: "12px" }}>
                        {formatCurrency(preview.price || b.totalPrice || b.total_price || 0)}đ
                      </strong>
                    </div>

                    {/* Component Thumbnail Strip */}
                    {preview.thumbnails.length > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "6px 0" }}>
                        {preview.thumbnails.map((t, i) => (
                          <img
                            key={i}
                            src={t.img}
                            alt={t.name}
                            title={`${t.type}: ${t.name}`}
                            style={{
                              width: "26px",
                              height: "26px",
                              objectFit: "contain",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              backgroundColor: "#ffffff",
                              padding: "2px"
                            }}
                          />
                        ))}
                        {preview.extraCount > 0 && (
                          <span style={{
                            fontSize: "10px",
                            fontWeight: "700",
                            color: "#64748b",
                            backgroundColor: "#e2e8f0",
                            padding: "2px 5px",
                            borderRadius: "5px"
                          }}>
                            +{preview.extraCount}
                          </span>
                        )}
                        <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "auto" }}>
                          ({preview.count} món)
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => onApplyUserBuild(b)}
                      style={{
                        marginTop: "4px",
                        width: "100%",
                        padding: "6px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#ffffff",
                        fontSize: "11.5px",
                        fontWeight: "700",
                        color: "#1e40af",
                        cursor: "pointer"
                      }}
                    >
                      ↺ Nạp Lại Cấu Hình Này
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </>
  );
}
