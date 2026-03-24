import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  getStaffOrderDetail,
  getStaffOrders,
  updateStaffConsultationNote,
  updateStaffOrderStatus
} from "../../services/staff.service";
import { createShipment, updateShipmentStatus } from "../../services/shipment.service";

const ORDER_STATUS_OPTIONS = ["PENDING", "CONFIRMED", "PACKING", "SHIPPING", "COMPLETED", "CANCELED"];
const SHIPMENT_STATUS_OPTIONS = ["CREATED", "READY_TO_SHIP", "IN_TRANSIT", "DELIVERED", "FAILED", "RETURNED", "CANCELED"];

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }

  return error.message || fallbackMessage;
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

export function StaffOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [consultationNote, setConsultationNote] = useState("");
  const [shipmentTrackingCode, setShipmentTrackingCode] = useState("");
  const [shipmentStatus, setShipmentStatus] = useState("CREATED");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedStatus = useMemo(() => selectedOrder?.status || "PENDING", [selectedOrder]);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await getStaffOrders(statusFilter ? { status: statusFilter } : {});
        const nextOrders = response?.data || [];
        setOrders(nextOrders);

        if (nextOrders.length > 0) {
          const nextSelectedOrderId = selectedOrderId && nextOrders.some((order) => order.id === selectedOrderId)
            ? selectedOrderId
            : nextOrders[0].id;
          setSelectedOrderId(nextSelectedOrderId);
        } else {
          setSelectedOrderId(null);
          setSelectedOrder(null);
        }
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Không thể tải danh sách đơn hàng cần xử lý"));
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [selectedOrderId, statusFilter]);

  useEffect(() => {
    if (!selectedOrderId) {
      setSelectedOrder(null);
      setConsultationNote("");
      setShipmentTrackingCode("");
      setShipmentStatus("CREATED");
      return;
    }

    async function loadOrderDetail() {
      try {
        setDetailLoading(true);
        setErrorMessage("");
        const response = await getStaffOrderDetail(selectedOrderId);
        const order = response?.data || null;
        setSelectedOrder(order);
        setConsultationNote(order?.note || "");
        setShipmentTrackingCode(order?.shipment?.trackingCode || "");
        setShipmentStatus(order?.shipment?.status || "CREATED");
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Không thể tải chi tiết đơn hàng"));
      } finally {
        setDetailLoading(false);
      }
    }

    loadOrderDetail();
  }, [selectedOrderId]);

  function updateOrderInList(updatedOrder) {
    setOrders((prevState) => prevState.map((item) => (item.id === updatedOrder.id ? { ...item, ...updatedOrder } : item)));
    setSelectedOrder(updatedOrder);
  }

  async function handleStatusChange(nextStatus) {
    if (!selectedOrder) {
      return;
    }

    try {
      setActionLoading("status");
      setErrorMessage("");
      setSuccessMessage("");
      const response = await updateStaffOrderStatus(selectedOrder.id, nextStatus);
      const updatedOrder = response?.data || null;
      updateOrderInList(updatedOrder);
      setSuccessMessage("Đã cập nhật trạng thái đơn hàng");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể cập nhật trạng thái đơn hàng"));
    } finally {
      setActionLoading("");
    }
  }

  async function handleShipmentCreateOrUpdate() {
    if (!selectedOrder) {
      return;
    }

    try {
      setActionLoading("shipment");
      setErrorMessage("");
      setSuccessMessage("");

      let shipmentResponse;
      if (selectedOrder.shipment?.id) {
        shipmentResponse = await updateShipmentStatus(selectedOrder.shipment.id, {
          status: shipmentStatus,
          trackingCode: shipmentTrackingCode || undefined,
          note: "Updated from sales workspace"
        });
      } else {
        shipmentResponse = await createShipment({
          orderId: selectedOrder.id,
          trackingCode: shipmentTrackingCode || undefined,
          status: shipmentStatus,
          note: "Created from sales workspace"
        });
      }

      const shipment = shipmentResponse?.data || shipmentResponse;
      const detailResponse = await getStaffOrderDetail(selectedOrder.id);
      const updatedOrder = detailResponse?.data || null;
      updateOrderInList(updatedOrder);
      setShipmentTrackingCode(shipment?.trackingCode || "");
      setShipmentStatus(shipment?.status || shipmentStatus);
      setSuccessMessage(selectedOrder.shipment?.id ? "Đã cập nhật vận đơn mock thành công" : "Đã tạo vận đơn mock thành công");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể xử lý vận đơn"));
    } finally {
      setActionLoading("");
    }
  }

  async function handleConsultationNoteSave() {
    if (!selectedOrder) {
      return;
    }

    try {
      setActionLoading("note");
      setErrorMessage("");
      setSuccessMessage("");
      const response = await updateStaffConsultationNote(selectedOrder.id, consultationNote);
      const updatedOrder = response?.data || null;
      updateOrderInList(updatedOrder);
      setSuccessMessage("Đã lưu ghi chú tư vấn cấu hình");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể lưu ghi chú tư vấn"));
    } finally {
      setActionLoading("");
    }
  }

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <section
        style={{
          padding: 28,
          borderRadius: 28,
          background: "linear-gradient(135deg, rgba(238, 77, 45, 0.1), rgba(255, 237, 213, 0.7))",
          border: "1px solid rgba(238, 77, 45, 0.12)",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
          display: "grid",
          gap: 8
        }}
      >
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.16em", color: "#9a3412" }}>Sales workflow</div>
        <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1 }}>Xử lý đơn hàng và tạo vận đơn</h1>
        <p style={{ margin: 0, maxWidth: 860, color: "#7c2d12", lineHeight: 1.7 }}>
          Khu vực này giúp nhân viên bán hàng xem đơn cần xử lý, cập nhật trạng thái, ghi chú tư vấn cấu hình và tạo vận đơn mock để demo quy trình shipping.
        </p>
      </section>

      {errorMessage ? <div style={{ padding: 14, borderRadius: 16, background: "#fff1f2", border: "1px solid #fecdd3", color: "#be123c" }}>{errorMessage}</div> : null}
      {successMessage ? <div style={{ padding: 14, borderRadius: 16, background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857" }}>{successMessage}</div> : null}

      <div style={{ display: "grid", gridTemplateColumns: "380px minmax(0, 1fr)", gap: 20, alignItems: "start" }}>
        <section style={{ display: "grid", gap: 16 }}>
          <div style={{ padding: 18, borderRadius: 22, background: "#ffffff", border: "1px solid #e5e7eb", boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6b7280" }}>Đơn hàng cần xử lý</div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{orders.length} đơn</div>
              </div>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #d1d5db", background: "#ffffff" }}>
                <option value="">Tất cả trạng thái</option>
                {ORDER_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div style={{ color: "#6b7280" }}>Đang tải danh sách đơn hàng...</div>
            ) : orders.length === 0 ? (
              <div style={{ color: "#6b7280" }}>Không có đơn hàng nào trong nhóm xử lý hiện tại.</div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {orders.map((order) => {
                  const isActive = order.id === selectedOrderId;

                  return (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => setSelectedOrderId(order.id)}
                      style={{
                        textAlign: "left",
                        display: "grid",
                        gap: 8,
                        width: "100%",
                        padding: 16,
                        borderRadius: 18,
                        border: isActive ? "1px solid rgba(238, 77, 45, 0.2)" : "1px solid #e5e7eb",
                        background: isActive ? "#fff7ed" : "#ffffff"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ fontWeight: 800 }}>Đơn #{order.id}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#9a3412" }}>{order.status}</div>
                      </div>
                      <div style={{ color: "#6b7280", fontSize: 14 }}>Thanh toán: {order.paymentMethod || "COD"}</div>
                      <div style={{ fontWeight: 700, color: "#111827" }}>{formatCurrency(order.finalAmount || order.totalAmount)} VND</div>
                      {order.shipment ? <div style={{ fontSize: 13, color: "#047857" }}>Vận đơn: {order.shipment.trackingCode}</div> : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section style={{ padding: 22, borderRadius: 24, background: "#ffffff", border: "1px solid #e5e7eb", boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)", display: "grid", gap: 18 }}>
          {detailLoading ? (
            <div>Đang tải chi tiết đơn hàng...</div>
          ) : !selectedOrder ? (
            <div style={{ color: "#6b7280" }}>Chọn một đơn hàng để xem chi tiết.</div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16, flexWrap: "wrap" }}>
                <div style={{ display: "grid", gap: 6 }}>
                  <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6b7280" }}>Chi tiết đơn hàng</div>
                  <h2 style={{ margin: 0, fontSize: 34 }}>Đơn #{selectedOrder.id}</h2>
                  <div style={{ color: "#6b7280" }}>{selectedOrder.shippingAddress || "Chưa có địa chỉ giao hàng"}</div>
                </div>
                <div style={{ display: "grid", gap: 10, justifyItems: "end" }}>
                  <div style={{ padding: "8px 12px", borderRadius: 999, background: "#fff7ed", color: "#9a3412", fontWeight: 700 }}>{selectedOrder.status}</div>
                  <div style={{ fontSize: 24, fontWeight: 800 }}>{formatCurrency(selectedOrder.finalAmount || selectedOrder.totalAmount)} VND</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18 }}>
                <div style={{ display: "grid", gap: 14 }}>
                  <div style={{ padding: 18, borderRadius: 18, background: "#f9fafb", border: "1px solid #e5e7eb", display: "grid", gap: 12 }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>Danh sách sản phẩm</div>
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} style={{ display: "grid", gap: 4, paddingBottom: 12, borderBottom: "1px solid #e5e7eb" }}>
                        <div style={{ fontWeight: 700 }}>{item.productName}</div>
                        <div style={{ fontSize: 14, color: "#6b7280" }}>SKU: {item.sku}</div>
                        <div style={{ fontSize: 14, color: "#6b7280" }}>Số lượng: {item.quantity}</div>
                        <div style={{ fontWeight: 700 }}>{formatCurrency(item.lineTotal)} VND</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: 18, borderRadius: 18, background: "#f9fafb", border: "1px solid #e5e7eb", display: "grid", gap: 12 }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>Tư vấn cấu hình cho khách</div>
                    <textarea
                      value={consultationNote}
                      onChange={(event) => setConsultationNote(event.target.value)}
                      rows={6}
                      placeholder="Ghi lại ghi chú tư vấn, gợi ý nâng cấp hoặc cấu hình phù hợp cho khách..."
                      style={{ width: "100%", padding: 14, borderRadius: 14, border: "1px solid #d1d5db", resize: "vertical" }}
                    />
                    <div>
                      <button
                        type="button"
                        onClick={handleConsultationNoteSave}
                        disabled={actionLoading === "note"}
                        style={{ padding: "12px 16px", borderRadius: 14, border: "none", background: "#111827", color: "#ffffff", fontWeight: 700 }}
                      >
                        {actionLoading === "note" ? "Đang lưu..." : "Lưu ghi chú tư vấn"}
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 14 }}>
                  <div style={{ padding: 18, borderRadius: 18, background: "#f9fafb", border: "1px solid #e5e7eb", display: "grid", gap: 12 }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>Cập nhật trạng thái đơn</div>
                    <select value={selectedStatus} onChange={(event) => handleStatusChange(event.target.value)} style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #d1d5db", background: "#ffffff" }}>
                      {ORDER_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <div style={{ fontSize: 14, color: "#6b7280" }}>Nhân viên bán hàng có thể xác nhận, đóng gói, chuyển giao vận chuyển hoặc hoàn tất đơn hàng.</div>
                  </div>

                  <div style={{ padding: 18, borderRadius: 18, background: "#f9fafb", border: "1px solid #e5e7eb", display: "grid", gap: 12 }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>Vận đơn / shipping mock</div>
                    <input
                      value={shipmentTrackingCode}
                      onChange={(event) => setShipmentTrackingCode(event.target.value)}
                      placeholder="Nếu bỏ trống sẽ tự sinh mã vận đơn mock"
                      style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #d1d5db", background: "#ffffff" }}
                    />
                    <select value={shipmentStatus} onChange={(event) => setShipmentStatus(event.target.value)} style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #d1d5db", background: "#ffffff" }}>
                      {SHIPMENT_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleShipmentCreateOrUpdate}
                      disabled={actionLoading === "shipment"}
                      style={{ padding: "12px 16px", borderRadius: 14, border: "none", background: "#ee4d2d", color: "#ffffff", fontWeight: 700 }}
                    >
                      {actionLoading === "shipment" ? "Đang xử lý..." : selectedOrder.shipment?.id ? "Cập nhật vận đơn" : "Tạo vận đơn"}
                    </button>
                    {selectedOrder.shipment ? (
                      <div style={{ fontSize: 14, color: "#374151" }}>
                        Vận đơn hiện tại: <strong>{selectedOrder.shipment.trackingCode}</strong> ({selectedOrder.shipment.status})
                      </div>
                    ) : (
                      <div style={{ fontSize: 14, color: "#6b7280" }}>Đơn hàng này chưa có vận đơn.</div>
                    )}
                  </div>

                  <div style={{ padding: 18, borderRadius: 18, background: "#f9fafb", border: "1px solid #e5e7eb", display: "grid", gap: 8 }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>Thông tin thanh toán</div>
                    <div style={{ color: "#6b7280" }}>Phương thức: {selectedOrder.paymentMethod || "COD"}</div>
                    <div style={{ color: "#6b7280" }}>Trạng thái thanh toán: {selectedOrder.paymentStatus || "UNPAID"}</div>
                    <div style={{ color: "#6b7280" }}>Phí giao hàng: {formatCurrency(selectedOrder.shippingFee)} VND</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
