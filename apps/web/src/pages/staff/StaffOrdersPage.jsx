import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import {
  createStaffShipment,
  getStaffOrderDetail,
  getStaffOrders,
  updateStaffConsultationNote,
  updateStaffOrderStatus
} from "../../services/staff.service";

const STATUS_META = {
  PENDING: { label: "Chờ xử lý", tone: "warning" },
  PROCESSING: { label: "Đang xử lý", tone: "info" },
  SHIPPED: { label: "Đã giao vận", tone: "shipping" },
  DELIVERED: { label: "Hoàn thành", tone: "success" },
  CANCELED: { label: "Đã hủy", tone: "danger" }
};

const ORDER_STATUS_OPTIONS = ["", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"];
const ORDER_FLOW = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

const SHIPPING_CARRIERS = [
  { id: "GHTK", label: "GHTK" },
  { id: "VNPOST", label: "VNPost" },
  { id: "JT", label: "J&T Express" }
];

const NOTE_TEMPLATES = [
  "Đã gọi xác nhận đơn với khách — khách đồng ý giao trong 2–3 ngày.",
  "Khách yêu cầu giao cuối tuần, ưu tiên khung giờ 9h–12h.",
  "Đã tư vấn nâng cấp linh kiện, khách giữ nguyên cấu hình đơn hiện tại.",
  "Đơn thanh toán VNPay — đã xác nhận giao dịch thành công trước khi xuất kho."
];

function buildMockTrackingCode(orderId, carrier = "GHTK") {
  const prefix = String(carrier || "GHTK")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
  const stamp = Date.now().toString().slice(-6);
  return `${prefix}-MOCK-${orderId}-${stamp}`;
}

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
  if (!value) return "Không rõ";
  return new Date(value).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function getStatusMeta(status) {
  return STATUS_META[status] || { label: status || "Không rõ", tone: "neutral" };
}

function getOrderAmount(order) {
  return Number(order?.finalAmount || order?.totalAmount || 0);
}

function getLineAmount(item) {
  return Number(item?.lineTotal || item?.totalPrice || item?.price || 0);
}

export function StaffOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [keyword, setKeyword] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingCode, setTrackingCode] = useState("");
  const [shippingCarrier, setShippingCarrier] = useState("GHTK");
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
    if (!successMessage) return undefined;

    const timer = window.setTimeout(() => setSuccessMessage(""), 3500);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const filteredOrders = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    if (!query) return orders;

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

  const visibleTotal = useMemo(
    () => filteredOrders.reduce((sum, order) => sum + getOrderAmount(order), 0),
    [filteredOrders]
  );

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
      setErrorMessage(getErrorMessage(error, "Không thể tải danh sách đơn hàng."));
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
      setErrorMessage(getErrorMessage(error, "Không thể tải chi tiết đơn hàng."));
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
    if (!selectedOrderId) return;

    await loadOrderDetail(selectedOrderId);
    await loadOrders();
  }

  async function handleMoveToProcessing() {
    if (!selectedOrder) return;

    try {
      setActionLoading("processing");
      setErrorMessage("");
      const response = await updateStaffOrderStatus(selectedOrder.id, "PROCESSING");
      const order = getEnvelopeData(response, null);
      applyOrderUpdate(order);
      setStatusFilter("PROCESSING");
      setSuccessMessage(`Đơn #${selectedOrder.id} đã chuyển sang Đang xử lý.`);
      await loadOrders("PROCESSING");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể chuyển đơn sang Đang xử lý."));
    } finally {
      setActionLoading("");
    }
  }

  async function handleShipOrder() {
    if (!selectedOrder) return;

    const normalizedTracking = trackingCode.trim();
    if (!normalizedTracking) {
      setErrorMessage("Cần nhập mã vận đơn trước khi chuyển sang Đã giao vận.");
      return;
    }

    try {
      setActionLoading("ship");
      setErrorMessage("");
      await createStaffShipment(selectedOrder.id, {
        trackingCode: normalizedTracking,
        carrier: shippingCarrier,
        status: "IN_TRANSIT"
      });
      const response = await updateStaffOrderStatus(selectedOrder.id, "SHIPPED");
      const order = getEnvelopeData(response, null);
      applyOrderUpdate(order);
      setStatusFilter("SHIPPED");
      setSuccessMessage(`Đơn #${selectedOrder.id} đã giao vận với mã ${normalizedTracking}.`);
      await loadOrders("SHIPPED");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể cập nhật vận đơn."));
    } finally {
      setActionLoading("");
    }
  }

  async function handleCompleteOrder() {
    if (!selectedOrder) return;

    const normalizedTracking = (selectedOrder.shipment?.trackingCode || trackingCode || "").trim();
    if (!normalizedTracking) {
      setErrorMessage("Đơn chưa có mã vận đơn để xác nhận giao thành công.");
      return;
    }

    try {
      setActionLoading("delivered");
      setErrorMessage("");
      await createStaffShipment(selectedOrder.id, {
        trackingCode: normalizedTracking,
        carrier: shippingCarrier,
        status: "DELIVERED"
      });
      const response = await updateStaffOrderStatus(selectedOrder.id, "DELIVERED");
      const order = getEnvelopeData(response, null);
      applyOrderUpdate(order);
      setStatusFilter("DELIVERED");
      setSuccessMessage(`Đơn #${selectedOrder.id} đã hoàn thành.`);
      await loadOrders("DELIVERED");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể chuyển đơn sang Hoàn thành."));
    } finally {
      setActionLoading("");
    }
  }

  async function handleSaveNote() {
    if (!selectedOrder) return;

    try {
      setActionLoading("note");
      setErrorMessage("");
      const response = await updateStaffConsultationNote(selectedOrder.id, consultationNote);
      const order = getEnvelopeData(response, null);
      applyOrderUpdate(order);
      setSuccessMessage("Đã lưu ghi chú xử lý.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể lưu ghi chú."));
    } finally {
      setActionLoading("");
    }
  }

  async function handleCancelOrder() {
    if (!selectedOrder) return;

    const normalizedReason = cancelReason.trim();
    if (!normalizedReason) {
      setErrorMessage("Cần nhập lý do hủy đơn.");
      return;
    }

    try {
      setActionLoading("cancel");
      setErrorMessage("");
      const response = await updateStaffOrderStatus(selectedOrder.id, "CANCELED", { reason: normalizedReason });
      const order = getEnvelopeData(response, null);
      applyOrderUpdate(order);
      setStatusFilter("CANCELED");
      setSuccessMessage(`Đơn #${selectedOrder.id} đã được hủy.`);
      setShowCancelDialog(false);
      setCancelReason("");
      await loadOrders("CANCELED");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể hủy đơn."));
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

  function handleGenerateTracking() {
    if (!selectedOrder?.id) return;
    setTrackingCode(buildMockTrackingCode(selectedOrder.id, shippingCarrier));
    setSuccessMessage("Đã tạo mã vận đơn demo.");
  }

  function applyNoteTemplate(text) {
    setConsultationNote((prev) => (prev.trim() ? `${prev.trim()}\n${text}` : text));
  }

  return (
    <div className="staff-orders">
      <section className="staff-page-head">
        <div>
          <p className="staff-eyebrow">Nhân viên kinh doanh</p>
          <h1>Xử lý đơn hàng</h1>
          <p>Tiếp nhận đơn mới, cập nhật trạng thái giao vận và theo dõi thông tin khách hàng tại một màn hình.</p>
        </div>
        <div className="staff-head-actions">
          <Link to="/staff/chat" className="staff-btn staff-btn--secondary">
            Tư vấn chat
          </Link>
          <button type="button" className="staff-btn staff-btn--secondary" onClick={refreshCurrentOrder} disabled={Boolean(actionLoading)}>
            Làm mới
          </button>
        </div>
      </section>

      <section className="staff-metrics" aria-label="Tổng quan đơn hàng">
        <div className="staff-metric">
          <span>Đang hiển thị</span>
          <strong>{filteredOrders.length}</strong>
          <small>{statusFilter ? getStatusMeta(statusFilter).label : "Tất cả trạng thái"}</small>
        </div>
        <div className="staff-metric">
          <span>Tổng giá trị</span>
          <strong>{formatCurrency(visibleTotal)} đ</strong>
          <small>Tính theo danh sách đang lọc</small>
        </div>
        <div className="staff-metric">
          <span>Đơn đang chọn</span>
          <strong>{selectedOrder ? `#${selectedOrder.id}` : "--"}</strong>
          <small>{selectedOrder ? selectedStatusMeta.label : "Chưa chọn đơn"}</small>
        </div>
      </section>

      {errorMessage ? <div className="staff-alert staff-alert--error">{errorMessage}</div> : null}
      {successMessage ? <div className="staff-alert staff-alert--success">{successMessage}</div> : null}

      <div className="staff-workspace">
        <aside className="staff-orders-panel">
          <div className="staff-panel-head">
            <div>
              <h2>Danh sách đơn hàng</h2>
              <p>Chọn đơn để xem chi tiết và thao tác.</p>
            </div>
          </div>

          <div className="staff-filters">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm mã đơn, khách hàng, email, mã vận đơn"
              aria-label="Tìm đơn hàng"
            />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Lọc trạng thái đơn hàng">
              {ORDER_STATUS_OPTIONS.map((status) => (
                <option key={status || "all"} value={status}>
                  {status ? getStatusMeta(status).label : "Tất cả trạng thái"}
                </option>
              ))}
            </select>
          </div>

          <div className="staff-status-tabs">
            {ORDER_STATUS_OPTIONS.map((status) => (
              <button
                key={status || "all"}
                type="button"
                className={statusFilter === status ? "is-active" : ""}
                onClick={() => setStatusFilter(status)}
              >
                {status ? getStatusMeta(status).label : "Tất cả"}
              </button>
            ))}
          </div>

          <div className="staff-order-list">
            {loading ? (
              <div className="staff-empty">Đang tải danh sách đơn hàng...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="staff-empty">Không tìm thấy đơn hàng phù hợp.</div>
            ) : (
              filteredOrders.map((order) => {
                const isActive = order.id === selectedOrderId;
                const statusMeta = getStatusMeta(order.status);

                return (
                  <button
                    key={order.id}
                    type="button"
                    className={`staff-order-row${isActive ? " staff-order-row--active" : ""}`}
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <span className={`staff-status staff-status--${statusMeta.tone}`}>{statusMeta.label}</span>
                    <span className="staff-order-row__title">Đơn #{order.id}</span>
                    <span className="staff-order-row__customer">{order.customer?.fullName || "Khách hàng"}</span>
                    <span className="staff-order-row__meta">{order.customer?.email || "Không có email"}</span>
                    <span className="staff-order-row__date">{formatDate(order.createdAt)}</span>
                    <span className="staff-order-row__amount">{formatCurrency(getOrderAmount(order))} đ</span>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <main className="staff-detail">
          {detailLoading ? (
            <section className="staff-card staff-empty">Đang tải chi tiết đơn hàng...</section>
          ) : !selectedOrder ? (
            <section className="staff-card staff-empty">Chọn một đơn hàng để xem chi tiết.</section>
          ) : (
            <>
              <section className="staff-order-summary staff-card">
                <div className="staff-order-summary__main">
                  <span className={`staff-status staff-status--${selectedStatusMeta.tone}`}>{selectedStatusMeta.label}</span>
                  <p>Đơn hàng #{selectedOrder.id} · {formatDate(selectedOrder.createdAt)}</p>
                  <h2>Thông tin xử lý đơn hàng</h2>
                  <div className="staff-address">{selectedOrder.shippingAddress || "Chưa có địa chỉ giao hàng"}</div>
                </div>
                <div className="staff-order-summary__side">
                  <span>Tổng thanh toán</span>
                  <strong>{formatCurrency(getOrderAmount(selectedOrder))} đ</strong>
                </div>
                <div className="staff-action-row">
                  {canMoveToProcessing ? (
                    <button type="button" className="staff-btn staff-btn--primary" onClick={handleMoveToProcessing} disabled={Boolean(actionLoading)}>
                      {actionLoading === "processing" ? "Đang cập nhật..." : "Xử lý đơn"}
                    </button>
                  ) : null}

                  {canShip ? (
                    <button type="button" className="staff-btn staff-btn--shipping" onClick={handleShipOrder} disabled={Boolean(actionLoading)}>
                      {actionLoading === "ship" ? "Đang cập nhật..." : "Giao vận"}
                    </button>
                  ) : null}

                  {canComplete ? (
                    <button type="button" className="staff-btn staff-btn--success" onClick={handleCompleteOrder} disabled={Boolean(actionLoading)}>
                      {actionLoading === "delivered" ? "Đang cập nhật..." : "Hoàn thành"}
                    </button>
                  ) : null}

                  {canCancel ? (
                    <button type="button" className="staff-btn staff-btn--danger" onClick={() => setShowCancelDialog(true)} disabled={Boolean(actionLoading)}>
                      Hủy đơn
                    </button>
                  ) : null}
                </div>
              </section>

              <section className="staff-progress staff-card" aria-label="Tiến trình xử lý">
                {ORDER_FLOW.map((status, index) => {
                  const meta = getStatusMeta(status);
                  const isDone = currentFlowIndex >= index;

                  return (
                    <div key={status} className={`staff-progress__step${isDone ? " staff-progress__step--done" : ""}`}>
                      <span>{index + 1}</span>
                      <strong>{meta.label}</strong>
                    </div>
                  );
                })}
              </section>

              <div className="staff-detail-grid">
                <section className="staff-card">
                  <div className="staff-section-title">
                    <h3>Khách hàng và sản phẩm</h3>
                    <p>Thông tin người nhận, thanh toán và các dòng sản phẩm trong đơn.</p>
                  </div>

                  <div className="staff-info-grid">
                    <div>
                      <span>Tên khách</span>
                      <strong>{customer.fullName || "Không rõ"}</strong>
                    </div>
                    <div>
                      <span>Email</span>
                      <strong>{customer.email || "Không rõ"}</strong>
                    </div>
                    <div>
                      <span>Số điện thoại</span>
                      <strong>{customer.phone || "Không rõ"}</strong>
                    </div>
                    <div>
                      <span>Thanh toán</span>
                      <strong>{selectedOrder.paymentMethod || "COD"} / {selectedOrder.paymentStatus || "UNPAID"}</strong>
                    </div>
                  </div>

                  <div className="staff-product-list">
                    {(selectedOrder.items || []).length === 0 ? (
                      <div className="staff-empty staff-empty--compact">Đơn hàng chưa có dòng sản phẩm.</div>
                    ) : (
                      (selectedOrder.items || []).map((item) => (
                        <div key={item.id || `${item.productName}-${item.sku}`} className="staff-product-row">
                          <div>
                            <strong>{item.productName || "Sản phẩm"}</strong>
                            <span>SKU: {item.sku || "Không rõ"} · SL: {item.quantity || 0}</span>
                          </div>
                          <b>{formatCurrency(getLineAmount(item))} đ</b>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <div className="staff-side-stack">
                  <section className="staff-card">
                    <div className="staff-section-title">
                      <h3>Vận đơn</h3>
                      <p>Nhập mã vận đơn trước khi chuyển đơn sang Đã giao vận.</p>
                    </div>
                    <div className="staff-shipment-box">
                      <span>Trạng thái vận đơn</span>
                      <strong>{selectedOrder.shipment?.status || "Chưa tạo vận đơn"}</strong>
                    </div>
                    <label className="staff-field-label" htmlFor="staff-carrier">
                      Đơn vị vận chuyển (demo)
                    </label>
                    <select
                      id="staff-carrier"
                      className="staff-field"
                      value={shippingCarrier}
                      onChange={(event) => setShippingCarrier(event.target.value)}
                    >
                      {SHIPPING_CARRIERS.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <input
                      className="staff-field"
                      value={trackingCode}
                      onChange={(event) => setTrackingCode(event.target.value)}
                      placeholder="Nhập hoặc tạo mã vận đơn"
                    />
                    <div className="staff-action-row staff-action-row--compact">
                      <button type="button" className="staff-btn staff-btn--secondary" onClick={handleGenerateTracking}>
                        Tạo mã demo
                      </button>
                    </div>
                    <p className="staff-help">
                      Mã hiện tại: {selectedOrder.shipment?.trackingCode || "Chưa có"}
                      {selectedOrder.shipment?.provider ? ` · ${selectedOrder.shipment.provider}` : ""}
                    </p>
                  </section>

                  <section className="staff-card">
                    <div className="staff-section-title">
                      <h3>Ghi chú xử lý</h3>
                      <p>Lưu thông tin tư vấn hoặc ghi chú giao dịch cho nội bộ.</p>
                    </div>
                    <div className="staff-note-templates">
                      {NOTE_TEMPLATES.map((text) => (
                        <button key={text} type="button" className="staff-note-template-btn" onClick={() => applyNoteTemplate(text)}>
                          {text.slice(0, 42)}…
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="staff-textarea"
                      value={consultationNote}
                      onChange={(event) => setConsultationNote(event.target.value)}
                      rows={5}
                      placeholder="Nhập ghi chú xử lý đơn hàng"
                    />
                    <button type="button" className="staff-btn staff-btn--dark" onClick={handleSaveNote} disabled={Boolean(actionLoading)}>
                      {actionLoading === "note" ? "Đang lưu..." : "Lưu ghi chú"}
                    </button>
                  </section>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {showCancelDialog ? (
        <div className="staff-modal">
          <div className="staff-modal__panel">
            <h2>Hủy đơn #{selectedOrder?.id}</h2>
            <p>Nhập lý do hủy đơn. Hành động này chỉ áp dụng cho đơn đang chờ xử lý.</p>
            <textarea
              className="staff-textarea"
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              rows={4}
              placeholder="Lý do hủy đơn"
            />
            <div className="staff-modal__actions">
              <button type="button" className="staff-btn staff-btn--danger-fill" onClick={handleCancelOrder} disabled={Boolean(actionLoading)}>
                {actionLoading === "cancel" ? "Đang xử lý..." : "Xác nhận hủy"}
              </button>
              <button
                type="button"
                className="staff-btn staff-btn--secondary"
                onClick={() => {
                  setShowCancelDialog(false);
                  setCancelReason("");
                }}
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
