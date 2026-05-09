import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  createStaffShipment,
  getStaffOrderDetail,
  getStaffOrders,
  updateStaffConsultationNote,
  updateStaffOrderStatus
} from "../../services/staff.service";

const STATUS_META = {
  PENDING: { label: "Chờ xử lý", color: "#b45309", background: "#fef3c7" },
  PROCESSING: { label: "Đang xử lý", color: "#1d4ed8", background: "#dbeafe" },
  SHIPPED: { label: "Đã giao vận", color: "#0f766e", background: "#ccfbf1" },
  DELIVERED: { label: "Hoàn thành", color: "#166534", background: "#dcfce7" },
  CANCELED: { label: "Đã hủy", color: "#b91c1c", background: "#fee2e2" }
};

const ORDER_STATUS_OPTIONS = ["", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"];
const ORDER_FLOW = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

function getErrorMessage(error, fallback) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }

  return error?.message || fallback;
}

function getEnvelopeData(response, fallbackValue) {
  if (response && typeof response === "object" && "data" in response) {
    return response.data ?? fallbackValue;
  }

  return response ?? fallbackValue;
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

function formatDate(value) {
  if (!value) {
    return "Khong ro";
  }

  return new Date(value).toLocaleString("vi-VN");
}

function getStatusMeta(status) {
  return STATUS_META[status] || { label: status || "Khong ro", color: "#475569", background: "#e2e8f0" };
}

export function StaffOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [keyword, setKeyword] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingCode, setTrackingCode] = useState("");
  const [consultationNote, setConsultationNote] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  useEffect(() => {
    if (!selectedOrderId) {
      setSelectedOrder(null);
      return;
    }

    loadOrderDetail(selectedOrderId);
  }, [selectedOrderId]);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => setSuccessMessage(""), 3500);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const filteredOrders = useMemo(() => {
    const query = keyword.trim().toLowerCase();

    if (!query) {
      return orders;
    }

    return orders.filter((order) => {
      const customer = order.customer || {};
      const searchable = [
        order.id,
        order.status,
        order.shippingAddress,
        customer.fullName,
        customer.email,
        customer.phone,
        order.shipment?.trackingCode
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [keyword, orders]);

  async function loadOrders(nextStatusFilter = statusFilter) {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await getStaffOrders(nextStatusFilter ? { status: nextStatusFilter } : {});
      const list = getEnvelopeData(response, []);
      const normalizedList = Array.isArray(list) ? list : [];
      setOrders(normalizedList);

      if (normalizedList.length === 0) {
        setSelectedOrderId(null);
        setSelectedOrder(null);
        return;
      }

      if (!normalizedList.some((item) => item.id === selectedOrderId)) {
        setSelectedOrderId(normalizedList[0].id);
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Khong the tai danh sach don hang."));
    } finally {
      setLoading(false);
    }
  }

  async function loadOrderDetail(orderId) {
    try {
      setDetailLoading(true);
      setErrorMessage("");
      const response = await getStaffOrderDetail(orderId);
      const order = getEnvelopeData(response, null);
      setSelectedOrder(order);
      setTrackingCode(order?.shipment?.trackingCode || "");
      setConsultationNote(order?.note || "");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Khong the tai chi tiet don hang."));
    } finally {
      setDetailLoading(false);
    }
  }

  function applyOrderUpdate(order) {
    setSelectedOrder(order);
    setOrders((prev) => prev.map((item) => (item.id === order.id ? { ...item, ...order } : item)));
    setTrackingCode(order?.shipment?.trackingCode || "");
    setConsultationNote(order?.note || "");
  }

  async function refreshCurrentOrder() {
    if (!selectedOrderId) {
      return;
    }

    await loadOrderDetail(selectedOrderId);
    await loadOrders();
  }

  async function handleMoveToProcessing() {
    if (!selectedOrder) {
      return;
    }

    try {
      setActionLoading("processing");
      setErrorMessage("");
      const response = await updateStaffOrderStatus(selectedOrder.id, "PROCESSING");
      const order = getEnvelopeData(response, null);
      applyOrderUpdate(order);
      setStatusFilter("PROCESSING");
      setSuccessMessage(`Don #${selectedOrder.id} da chuyen sang PROCESSING.`);
      await loadOrders("PROCESSING");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Khong the chuyen don sang PROCESSING."));
    } finally {
      setActionLoading("");
    }
  }

  async function handleShipOrder() {
    if (!selectedOrder) {
      return;
    }

    const normalizedTracking = trackingCode.trim();

    if (!normalizedTracking) {
      setErrorMessage("Can nhap ma tracking truoc khi chuyen don sang SHIPPED.");
      return;
    }

    try {
      setActionLoading("ship");
      setErrorMessage("");
      await createStaffShipment(selectedOrder.id, {
        trackingCode: normalizedTracking,
        status: "IN_TRANSIT"
      });
      const response = await updateStaffOrderStatus(selectedOrder.id, "SHIPPED");
      const order = getEnvelopeData(response, null);
      applyOrderUpdate(order);
      setStatusFilter("SHIPPED");
      setSuccessMessage(`Don #${selectedOrder.id} da giao van voi ma ${normalizedTracking}.`);
      await loadOrders("SHIPPED");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Khong the cap nhat van don."));
    } finally {
      setActionLoading("");
    }
  }

  async function handleCompleteOrder() {
    if (!selectedOrder) {
      return;
    }

    const normalizedTracking = (selectedOrder.shipment?.trackingCode || trackingCode || "").trim();

    if (!normalizedTracking) {
      setErrorMessage("Don chua co ma tracking de xac nhan giao thanh cong.");
      return;
    }

    try {
      setActionLoading("delivered");
      setErrorMessage("");
      await createStaffShipment(selectedOrder.id, {
        trackingCode: normalizedTracking,
        status: "DELIVERED"
      });
      const response = await updateStaffOrderStatus(selectedOrder.id, "DELIVERED");
      const order = getEnvelopeData(response, null);
      applyOrderUpdate(order);
      setStatusFilter("DELIVERED");
      setSuccessMessage(`Don #${selectedOrder.id} da hoan thanh.`);
      await loadOrders("DELIVERED");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Khong the chuyen don sang DELIVERED."));
    } finally {
      setActionLoading("");
    }
  }

  async function handleSaveNote() {
    if (!selectedOrder) {
      return;
    }

    try {
      setActionLoading("note");
      setErrorMessage("");
      const response = await updateStaffConsultationNote(selectedOrder.id, consultationNote);
      const order = getEnvelopeData(response, null);
      applyOrderUpdate(order);
      setSuccessMessage("Da luu ghi chu tu van.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Khong the luu ghi chu."));
    } finally {
      setActionLoading("");
    }
  }

  async function handleCancelOrder() {
    if (!selectedOrder) {
      return;
    }

    const normalizedReason = cancelReason.trim();

    if (!normalizedReason) {
      setErrorMessage("Can nhap ly do huy don.");
      return;
    }

    try {
      setActionLoading("cancel");
      setErrorMessage("");
      const response = await updateStaffOrderStatus(selectedOrder.id, "CANCELED", { reason: normalizedReason });
      const order = getEnvelopeData(response, null);
      applyOrderUpdate(order);
      setStatusFilter("CANCELED");
      setSuccessMessage(`Don #${selectedOrder.id} da duoc huy.`);
      setShowCancelDialog(false);
      setCancelReason("");
      await loadOrders("CANCELED");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Khong the huy don."));
    } finally {
      setActionLoading("");
    }
  }

  const selectedStatusMeta = getStatusMeta(selectedOrder?.status);
  const customer = selectedOrder?.customer || {};
  const canMoveToProcessing = selectedOrder?.status === "PENDING";
  const canShip = selectedOrder?.status === "PROCESSING";
  const canComplete = selectedOrder?.status === "SHIPPED";
  const canCancel = selectedOrder?.status === "PENDING";
  const currentFlowIndex = ORDER_FLOW.indexOf(selectedOrder?.status);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", paddingBottom: 40 }}>
      <div style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", color: "#fff", padding: "36px 24px 56px" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", fontWeight: 800, marginBottom: 8 }}>
            Sales Staff Workspace
          </div>
          <h1 style={{ margin: 0, fontSize: 34, fontWeight: 900 }}>Xu ly don hang /staff/orders</h1>
          <p style={{ margin: "8px 0 0", color: "#cbd5e1", maxWidth: 760 }}>
            Theo doi don moi, cap nhat quy trinh xu ly, nhap ma tracking va xac nhan giao thanh cong cho khach hang.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1320, margin: "-22px auto 0", padding: "0 24px", position: "relative", zIndex: 1 }}>
        {errorMessage ? (
          <div style={{ marginBottom: 16, padding: "14px 18px", borderRadius: 16, background: "#fee2e2", border: "1px solid #fecaca", color: "#b91c1c", fontWeight: 700 }}>
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div style={{ marginBottom: 16, padding: "14px 18px", borderRadius: 16, background: "#dcfce7", border: "1px solid #bbf7d0", color: "#166534", fontWeight: 700 }}>
            {successMessage}
          </div>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: "360px minmax(0, 1fr)", gap: 24, alignItems: "start" }}>
          <aside style={{ background: "#fff", borderRadius: 22, border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)", overflow: "hidden" }}>
            <div style={{ padding: 18, borderBottom: "1px solid #e2e8f0", display: "grid", gap: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>Danh sach don hang</div>
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tim theo ma don, ten khach, email, tracking"
                style={{ height: 42, borderRadius: 12, border: "1px solid #cbd5e1", padding: "0 14px", fontSize: 14 }}
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                style={{ height: 42, borderRadius: 12, border: "1px solid #cbd5e1", padding: "0 14px", fontSize: 14 }}
              >
                {ORDER_STATUS_OPTIONS.map((status) => (
                  <option key={status || "all"} value={status}>
                    {status ? getStatusMeta(status).label : "Tat ca trang thai"}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ maxHeight: "calc(100vh - 280px)", overflowY: "auto" }}>
              {loading ? (
                <div style={{ padding: 22, color: "#64748b" }}>Dang tai danh sach don hang...</div>
              ) : filteredOrders.length === 0 ? (
                <div style={{ padding: 22, color: "#64748b" }}>Khong tim thay don hang phu hop.</div>
              ) : (
                filteredOrders.map((order) => {
                  const isActive = order.id === selectedOrderId;
                  const statusMeta = getStatusMeta(order.status);
                  return (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => setSelectedOrderId(order.id)}
                      style={{
                        width: "100%",
                        border: "none",
                        borderBottom: "1px solid #e2e8f0",
                        background: isActive ? "#eff6ff" : "#fff",
                        borderLeft: isActive ? "4px solid #2563eb" : "4px solid transparent",
                        padding: "16px 18px",
                        cursor: "pointer",
                        textAlign: "left"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 15 }}>Don #{order.id}</div>
                          <div style={{ color: "#0f172a", marginTop: 4, fontWeight: 600 }}>{order.customer?.fullName || "Khach hang"}</div>
                          <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>{order.customer?.email || "Khong co email"}</div>
                        </div>
                        <span style={{ padding: "6px 10px", borderRadius: 999, background: statusMeta.background, color: statusMeta.color, fontWeight: 800, fontSize: 12 }}>
                          {statusMeta.label}
                        </span>
                      </div>
                      <div style={{ marginTop: 10, color: "#475569", fontSize: 13 }}>{formatDate(order.createdAt)}</div>
                      <div style={{ marginTop: 6, fontWeight: 800, fontSize: 18 }}>{formatCurrency(order.finalAmount)} VND</div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <main>
            {detailLoading ? (
              <div style={{ background: "#fff", borderRadius: 22, border: "1px solid #e2e8f0", padding: 24, color: "#64748b" }}>
                Dang tai chi tiet don hang...
              </div>
            ) : !selectedOrder ? (
              <div style={{ background: "#fff", borderRadius: 22, border: "1px solid #e2e8f0", padding: 24, color: "#64748b" }}>
                Chon mot don hang de xem chi tiet.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 20 }}>
                <section style={{ background: "#fff", borderRadius: 22, border: "1px solid #e2e8f0", padding: 26, boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "start" }}>
                    <div style={{ display: "grid", gap: 8 }}>
                      <div style={{ color: "#64748b", fontSize: 13 }}>Don hang #{selectedOrder.id} • {formatDate(selectedOrder.createdAt)}</div>
                      <h2 style={{ margin: 0, fontSize: 30, fontWeight: 900 }}>Thong tin xu ly don hang</h2>
                      <div style={{ color: "#475569" }}>{selectedOrder.shippingAddress || "Chua co dia chi giao hang"}</div>
                    </div>
                    <div style={{ textAlign: "right", display: "grid", gap: 8 }}>
                      <span style={{ justifySelf: "end", padding: "6px 12px", borderRadius: 999, background: selectedStatusMeta.background, color: selectedStatusMeta.color, fontWeight: 800, fontSize: 12 }}>
                        {selectedStatusMeta.label}
                      </span>
                      <div style={{ fontWeight: 900, fontSize: 28 }}>{formatCurrency(selectedOrder.finalAmount || selectedOrder.totalAmount)} VND</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
                    {canMoveToProcessing ? (
                      <button
                        type="button"
                        onClick={handleMoveToProcessing}
                        disabled={Boolean(actionLoading)}
                        style={{ height: 44, padding: "0 18px", borderRadius: 12, border: "none", background: "#2563eb", color: "#fff", fontWeight: 800, cursor: "pointer" }}
                      >
                        {actionLoading === "processing" ? "Dang cap nhat..." : "Xu ly"}
                      </button>
                    ) : null}

                    {canShip ? (
                      <button
                        type="button"
                        onClick={handleShipOrder}
                        disabled={Boolean(actionLoading)}
                        style={{ height: 44, padding: "0 18px", borderRadius: 12, border: "none", background: "#0f766e", color: "#fff", fontWeight: 800, cursor: "pointer" }}
                      >
                        {actionLoading === "ship" ? "Dang cap nhat..." : "Da giao van"}
                      </button>
                    ) : null}

                    {canComplete ? (
                      <button
                        type="button"
                        onClick={handleCompleteOrder}
                        disabled={Boolean(actionLoading)}
                        style={{ height: 44, padding: "0 18px", borderRadius: 12, border: "none", background: "#166534", color: "#fff", fontWeight: 800, cursor: "pointer" }}
                      >
                        {actionLoading === "delivered" ? "Dang cap nhat..." : "Hoan thanh"}
                      </button>
                    ) : null}

                    {canCancel ? (
                      <button
                        type="button"
                        onClick={() => setShowCancelDialog(true)}
                        disabled={Boolean(actionLoading)}
                        style={{ height: 44, padding: "0 18px", borderRadius: 12, border: "1px solid #fca5a5", background: "#fff", color: "#b91c1c", fontWeight: 800, cursor: "pointer" }}
                      >
                        Huy don
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={refreshCurrentOrder}
                      disabled={Boolean(actionLoading)}
                      style={{ height: 44, padding: "0 18px", borderRadius: 12, border: "1px solid #cbd5e1", background: "#fff", color: "#334155", fontWeight: 700, cursor: "pointer" }}
                    >
                      Lam moi
                    </button>
                  </div>
                </section>

                <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, 0.9fr)", gap: 20 }}>
                  <section style={{ background: "#fff", borderRadius: 22, border: "1px solid #e2e8f0", padding: 24 }}>
                    <div style={{ display: "grid", gap: 6, marginBottom: 18 }}>
                      <div style={{ fontWeight: 800, fontSize: 18 }}>Khach hang va san pham</div>
                      <div style={{ color: "#64748b", fontSize: 14 }}>Xem nhanh thong tin khach, san pham va tong tien cua don.</div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 18 }}>
                      {ORDER_FLOW.map((status, index) => {
                        const meta = getStatusMeta(status);
                        const isDone = currentFlowIndex >= index;
                        return (
                          <div
                            key={status}
                            style={{
                              padding: 12,
                              borderRadius: 16,
                              border: isDone ? `1px solid ${meta.color}33` : "1px solid #e2e8f0",
                              background: isDone ? meta.background : "#f8fafc",
                              color: isDone ? meta.color : "#64748b",
                              fontWeight: 800,
                              fontSize: 13,
                              textAlign: "center"
                            }}
                          >
                            {meta.label}
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 18 }}>
                      <div style={{ padding: 14, borderRadius: 16, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <div style={{ color: "#64748b", fontSize: 12, textTransform: "uppercase", marginBottom: 6 }}>Ten khach</div>
                        <div style={{ fontWeight: 700 }}>{customer.fullName || "Khong ro"}</div>
                      </div>
                      <div style={{ padding: 14, borderRadius: 16, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <div style={{ color: "#64748b", fontSize: 12, textTransform: "uppercase", marginBottom: 6 }}>Email</div>
                        <div style={{ fontWeight: 700 }}>{customer.email || "Khong ro"}</div>
                      </div>
                      <div style={{ padding: 14, borderRadius: 16, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <div style={{ color: "#64748b", fontSize: 12, textTransform: "uppercase", marginBottom: 6 }}>So dien thoai</div>
                        <div style={{ fontWeight: 700 }}>{customer.phone || "Khong ro"}</div>
                      </div>
                      <div style={{ padding: 14, borderRadius: 16, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <div style={{ color: "#64748b", fontSize: 12, textTransform: "uppercase", marginBottom: 6 }}>Thanh toan</div>
                        <div style={{ fontWeight: 700 }}>{selectedOrder.paymentMethod || "COD"} / {selectedOrder.paymentStatus || "UNPAID"}</div>
                      </div>
                    </div>

                    <div style={{ display: "grid", gap: 12 }}>
                      {(selectedOrder.items || []).map((item) => (
                        <div key={item.id} style={{ padding: 16, borderRadius: 16, border: "1px solid #e2e8f0", background: "#fff" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                            <div>
                              <div style={{ fontWeight: 800 }}>{item.productName || "San pham"}</div>
                              <div style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>SKU: {item.sku || "Khong ro"} • SL: {item.quantity || 0}</div>
                            </div>
                            <div style={{ fontWeight: 800, fontSize: 18 }}>{formatCurrency(item.lineTotal)} VND</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div style={{ display: "grid", gap: 20 }}>
                    <section style={{ background: "#fff", borderRadius: 22, border: "1px solid #e2e8f0", padding: 24 }}>
                      <div style={{ display: "grid", gap: 6, marginBottom: 16 }}>
                        <div style={{ fontWeight: 800, fontSize: 18 }}>Van don</div>
                        <div style={{ color: "#64748b", fontSize: 14 }}>Nhap ma tracking khi giao van va theo doi trang thai shipment.</div>
                      </div>

                      <div style={{ display: "grid", gap: 12 }}>
                        <div style={{ padding: 14, borderRadius: 16, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                          <div style={{ color: "#64748b", fontSize: 12, textTransform: "uppercase", marginBottom: 6 }}>Trang thai shipment</div>
                          <div style={{ fontWeight: 700 }}>{selectedOrder.shipment?.status || "Chua tao van don"}</div>
                        </div>
                        <input
                          value={trackingCode}
                          onChange={(event) => setTrackingCode(event.target.value)}
                          placeholder="Nhap ma tracking"
                          style={{ height: 44, borderRadius: 12, border: "1px solid #cbd5e1", padding: "0 14px", fontSize: 14 }}
                        />
                        <div style={{ color: "#475569", fontSize: 13 }}>
                          Tracking hien tai: {selectedOrder.shipment?.trackingCode || "Chua co"}
                        </div>
                      </div>
                    </section>

                    <section style={{ background: "#fff", borderRadius: 22, border: "1px solid #e2e8f0", padding: 24 }}>
                      <div style={{ display: "grid", gap: 6, marginBottom: 16 }}>
                        <div style={{ fontWeight: 800, fontSize: 18 }}>Ghi chu xu ly</div>
                        <div style={{ color: "#64748b", fontSize: 14 }}>Luu lai thong tin tu van hoac ghi chu giao dich cho team.</div>
                      </div>

                      <textarea
                        value={consultationNote}
                        onChange={(event) => setConsultationNote(event.target.value)}
                        rows={5}
                        placeholder="Nhap ghi chu xu ly don hang"
                        style={{ width: "100%", borderRadius: 14, border: "1px solid #cbd5e1", padding: 14, fontSize: 14, resize: "vertical", boxSizing: "border-box" }}
                      />
                      <button
                        type="button"
                        onClick={handleSaveNote}
                        disabled={Boolean(actionLoading)}
                        style={{ marginTop: 12, height: 42, padding: "0 16px", borderRadius: 12, border: "none", background: "#0f172a", color: "#fff", fontWeight: 800, cursor: "pointer" }}
                      >
                        {actionLoading === "note" ? "Dang luu..." : "Luu ghi chu"}
                      </button>
                    </section>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {showCancelDialog ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.5)", display: "grid", placeItems: "center", padding: 24, zIndex: 20 }}>
          <div style={{ width: "100%", maxWidth: 460, background: "#fff", borderRadius: 22, padding: 24, border: "1px solid #e2e8f0", boxShadow: "0 25px 50px rgba(15, 23, 42, 0.2)" }}>
            <div style={{ fontWeight: 900, fontSize: 22, marginBottom: 8 }}>Huy don #{selectedOrder?.id}</div>
            <div style={{ color: "#64748b", marginBottom: 16 }}>Nhap ly do huy don. Hanh dong nay chi ap dung cho don dang PENDING.</div>
            <textarea
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              rows={4}
              placeholder="Ly do huy don"
              style={{ width: "100%", borderRadius: 14, border: "1px solid #cbd5e1", padding: 14, fontSize: 14, resize: "vertical", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={Boolean(actionLoading)}
                style={{ flex: 1, height: 44, borderRadius: 12, border: "none", background: "#dc2626", color: "#fff", fontWeight: 800, cursor: "pointer" }}
              >
                {actionLoading === "cancel" ? "Dang xu ly..." : "Xac nhan huy"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCancelDialog(false);
                  setCancelReason("");
                }}
                style={{ flex: 1, height: 44, borderRadius: 12, border: "1px solid #cbd5e1", background: "#fff", color: "#334155", fontWeight: 700, cursor: "pointer" }}
              >
                Quay lai
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
