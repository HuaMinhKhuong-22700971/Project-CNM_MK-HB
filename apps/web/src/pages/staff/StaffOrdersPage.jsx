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

const STORAGE_KEY = "pcmall_staff_selected_order";

const STATUS_META = {
  PENDING: { label: "Chờ xử lý", tone: "warning" },
  PROCESSING: { label: "Đang xử lý", tone: "info" },
  SHIPPED: { label: "Đang giao", tone: "shipping" },
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
  "Đã gọi xác nhận đơn với khách, khách đồng ý giao trong 2-3 ngày.",
  "Khách yêu cầu giao cuối tuần, ưu tiên khung giờ 9h-12h.",
  "Đã tư vấn nâng cấp linh kiện, khách giữ nguyên cấu hình hiện tại.",
  "Đơn thanh toán online, đã xác nhận giao dịch trước khi xuất kho."
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

function formatShortDate(value) {
  if (!value) return "Không rõ";
  return new Date(value).toLocaleDateString("vi-VN", {
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

function getPaymentTone(paymentStatus) {
  const normalized = String(paymentStatus || "").toUpperCase();
  if (normalized === "PAID") return "success";
  if (normalized === "PENDING") return "warning";
  return "neutral";
}

function getPaymentLabel(paymentStatus) {
  const normalized = String(paymentStatus || "").toUpperCase();
  if (normalized === "PAID") return "Paid";
  if (normalized === "PENDING") return "Pending";
  return "Unpaid";
}

function getTodayTotalValue(orders) {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();
  return orders.reduce((sum, order) => {
    if (!order?.createdAt) return sum;
    const createdAt = new Date(order.createdAt);
    if (createdAt.getFullYear() === y && createdAt.getMonth() === m && createdAt.getDate() === d) {
      return sum + getOrderAmount(order);
    }
    return sum;
  }, 0);
}

function OrderListSkeleton() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          style={{
            height: 112,
            borderRadius: 18,
            border: "1px solid #e2e8f0",
            background: "linear-gradient(90deg, #f8fafc 25%, #eef2ff 50%, #f8fafc 75%)",
            backgroundSize: "200% 100%",
            animation: "staffOrderPulse 1.5s ease-in-out infinite"
          }}
        />
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          style={{
            height: index === 0 ? 180 : 140,
            borderRadius: 24,
            border: "1px solid #e2e8f0",
            background: "linear-gradient(90deg, #f8fafc 25%, #eef2ff 50%, #f8fafc 75%)",
            backgroundSize: "200% 100%",
            animation: "staffOrderPulse 1.5s ease-in-out infinite"
          }}
        />
      ))}
    </div>
  );
}

export function StaffOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statsOrders, setStatsOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [keyword, setKeyword] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? Number(stored) : null;
  });
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
  const [trackingError, setTrackingError] = useState("");

  useEffect(() => {
    loadOrders();
    loadStatsOrders();
  }, [statusFilter]);

  useEffect(() => {
    if (!selectedOrderId) {
      setSelectedOrder(null);
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, String(selectedOrderId));
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
        order.paymentMethod,
        order.shipment?.trackingCode
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [keyword, orders]);

  const stats = useMemo(() => {
    const source = statsOrders.length ? statsOrders : orders;
    return {
      pending: source.filter((order) => order.status === "PENDING").length,
      processing: source.filter((order) => order.status === "PROCESSING").length,
      shipped: source.filter((order) => order.status === "SHIPPED").length,
      todayValue: getTodayTotalValue(source)
    };
  }, [orders, statsOrders]);

  async function loadStatsOrders() {
    try {
      const response = await getStaffOrders();
      const list = getEnvelopeData(response, []);
      setStatsOrders(Array.isArray(list) ? list : []);
    } catch {
      setStatsOrders([]);
    }
  }

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
      setTrackingError("");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể tải chi tiết đơn hàng."));
    } finally {
      setDetailLoading(false);
    }
  }

  function applyOrderUpdate(order) {
    setSelectedOrder(order);
    setOrders((prev) => prev.map((item) => (item.id === order.id ? { ...item, ...order } : item)));
    setStatsOrders((prev) => prev.map((item) => (item.id === order.id ? { ...item, ...order } : item)));
    setTrackingCode(order?.shipment?.trackingCode || "");
    setConsultationNote(order?.note || "");
    setTrackingError("");
  }

  async function refreshCurrentOrder() {
    if (!selectedOrderId) return;
    await Promise.all([loadOrderDetail(selectedOrderId), loadOrders(), loadStatsOrders()]);
  }

  async function handleMoveToProcessing() {
    if (!selectedOrder) return;

    try {
      setActionLoading("processing");
      setErrorMessage("");
      const response = await updateStaffOrderStatus(selectedOrder.id, "PROCESSING");
      const order = getEnvelopeData(response, null);
      applyOrderUpdate(order);
      setSuccessMessage(`Đơn #${selectedOrder.id} đã chuyển sang Đang xử lý.`);
      await Promise.all([loadOrders("PROCESSING"), loadStatsOrders()]);
      setStatusFilter("PROCESSING");
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
      setTrackingError("Vui lòng nhập mã vận đơn trước khi chuyển sang Đang giao.");
      return;
    }

    try {
      setActionLoading("ship");
      setErrorMessage("");
      setTrackingError("");
      await createStaffShipment(selectedOrder.id, {
        trackingCode: normalizedTracking,
        carrier: shippingCarrier,
        status: "IN_TRANSIT"
      });
      const response = await updateStaffOrderStatus(selectedOrder.id, "SHIPPED");
      const order = getEnvelopeData(response, null);
      applyOrderUpdate(order);
      setSuccessMessage(`Đơn #${selectedOrder.id} đã chuyển sang Đang giao.`);
      await Promise.all([loadOrders("SHIPPED"), loadStatsOrders()]);
      setStatusFilter("SHIPPED");
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
      setTrackingError("Đơn chưa có mã vận đơn để xác nhận hoàn tất.");
      return;
    }

    try {
      setActionLoading("delivered");
      setErrorMessage("");
      setTrackingError("");
      await createStaffShipment(selectedOrder.id, {
        trackingCode: normalizedTracking,
        carrier: shippingCarrier,
        status: "DELIVERED"
      });
      const response = await updateStaffOrderStatus(selectedOrder.id, "DELIVERED");
      const order = getEnvelopeData(response, null);
      applyOrderUpdate(order);
      setSuccessMessage(`Đơn #${selectedOrder.id} đã hoàn thành.`);
      await Promise.all([loadOrders("DELIVERED"), loadStatsOrders()]);
      setStatusFilter("DELIVERED");
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
      setSuccessMessage(`Đơn #${selectedOrder.id} đã được hủy.`);
      setShowCancelDialog(false);
      setCancelReason("");
      await Promise.all([loadOrders("CANCELED"), loadStatsOrders()]);
      setStatusFilter("CANCELED");
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

  const actionHelp = {
    processing: canMoveToProcessing ? "Xác nhận đơn và chuyển sang bước xử lý." : "Chỉ đơn chờ xử lý mới có thể xác nhận.",
    ship: canShip ? "Nhập mã vận đơn và chuyển đơn sang đang giao." : "Đơn phải ở trạng thái Đang xử lý trước khi giao hàng.",
    delivered: canComplete ? "Xác nhận giao thành công để hoàn tất đơn và kích hoạt bảo hành." : "Đơn phải ở trạng thái Đang giao trước khi hoàn tất.",
    cancel: canCancel ? "Hủy đơn khi đơn vẫn còn ở trạng thái chờ xử lý." : "Chỉ đơn chờ xử lý mới được hủy."
  };

  function handleGenerateTracking() {
    if (!selectedOrder?.id) return;
    setTrackingCode(buildMockTrackingCode(selectedOrder.id, shippingCarrier));
    setTrackingError("");
    setSuccessMessage("Đã tạo mã vận đơn demo.");
  }

  function applyNoteTemplate(text) {
    setConsultationNote((prev) => (prev.trim() ? `${prev.trim()}\n${text}` : text));
  }

  function renderActionButton({ key, enabled, label, loadingLabel, onClick, className, title }) {
    return (
      <button
        key={key}
        type="button"
        className={className}
        onClick={onClick}
        disabled={!enabled || Boolean(actionLoading)}
        title={title}
      >
        {actionLoading === key ? loadingLabel : label}
      </button>
    );
  }

  const orderTimeline = ORDER_FLOW.map((status, index) => {
    const isDone = currentFlowIndex >= index;
    const timestamp =
      index === 0
        ? selectedOrder?.createdAt
        : isDone
          ? selectedOrder?.updatedAt || selectedOrder?.shipment?.updatedAt || null
          : null;

    return {
      status,
      meta: getStatusMeta(status),
      isDone,
      timestamp
    };
  });

  return (
    <div className="staff-orders-dashboard">
      <style>{`
        @keyframes staffOrderPulse { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .staff-orders-dashboard { width: min(1440px, calc(100% - 48px)); margin: 0 auto; display: grid; gap: 24px; padding: 28px 0 40px; }
        .staff-orders-hero { display: flex; justify-content: space-between; gap: 24px; align-items: center; padding: 28px 30px; border-radius: 28px; background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%); color: #fff; box-shadow: 0 22px 44px rgba(15, 23, 42, 0.16); }
        .staff-orders-hero__copy { max-width: 760px; }
        .staff-orders-hero__copy p { margin: 10px 0 0; color: #cbd5e1; line-height: 1.7; }
        .staff-orders-hero__actions { display: flex; flex-wrap: wrap; gap: 12px; justify-content: flex-end; }
        .staff-orders-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; }
        .staff-orders-stat { padding: 20px; border-radius: 22px; border: 1px solid #dbe4ef; background: #fff; box-shadow: 0 16px 36px rgba(15, 23, 42, 0.06); display: grid; gap: 8px; }
        .staff-orders-stat__top { display: flex; justify-content: space-between; align-items: center; gap: 12px; color: #64748b; font-size: 13px; font-weight: 800; }
        .staff-orders-stat strong { font-size: 34px; color: #0f172a; line-height: 1; }
        .staff-orders-stat small { color: #64748b; }
        .staff-orders-layout { display: grid; grid-template-columns: 360px minmax(0, 1fr); gap: 24px; align-items: start; }
        .staff-orders-panel, .staff-orders-detail { border-radius: 24px; border: 1px solid #dbe4ef; background: rgba(255,255,255,0.94); box-shadow: 0 18px 42px rgba(15, 23, 42, 0.06); overflow: hidden; }
        .staff-orders-panel__body, .staff-orders-detail__body { padding: 22px; display: grid; gap: 18px; }
        .staff-orders-panel__head, .staff-orders-section__head { display: flex; justify-content: space-between; gap: 16px; align-items: start; }
        .staff-orders-panel__head h2, .staff-orders-section__head h2, .staff-orders-section__head h3 { margin: 0; color: #0f172a; }
        .staff-orders-panel__head p, .staff-orders-section__head p { margin: 6px 0 0; color: #64748b; line-height: 1.6; }
        .staff-orders-toolbar { display: grid; gap: 12px; }
        .staff-orders-toolbar input, .staff-orders-toolbar select, .staff-orders-field, .staff-orders-textarea { width: 100%; box-sizing: border-box; border: 1px solid #dbe4ef; border-radius: 14px; background: #f8fafc; color: #0f172a; }
        .staff-orders-toolbar input, .staff-orders-toolbar select, .staff-orders-field { min-height: 46px; padding: 0 14px; font-weight: 650; }
        .staff-orders-tabs { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; }
        .staff-orders-tabs button { border: 1px solid #dbe4ef; background: #fff; color: #475569; border-radius: 999px; min-height: 38px; padding: 0 14px; font-weight: 800; cursor: pointer; white-space: nowrap; }
        .staff-orders-tabs button.is-active { color: #1d4ed8; border-color: #93c5fd; background: #eff6ff; }
        .staff-orders-list { display: grid; gap: 12px; max-height: 980px; overflow-y: auto; padding-right: 4px; }
        .staff-order-card { width: 100%; text-align: left; border: 1px solid #e2e8f0; border-radius: 18px; background: #fff; padding: 16px; display: grid; gap: 10px; cursor: pointer; transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
        .staff-order-card:hover { transform: translateY(-1px); box-shadow: 0 14px 28px rgba(37, 99, 235, 0.10); }
        .staff-order-card--active { border-color: #60a5fa; box-shadow: 0 18px 30px rgba(37, 99, 235, 0.12); background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%); }
        .staff-order-card__row { display: flex; justify-content: space-between; gap: 12px; align-items: center; flex-wrap: wrap; }
        .staff-order-card__title { font-size: 16px; font-weight: 900; color: #0f172a; }
        .staff-order-card__meta { color: #64748b; font-size: 13px; }
        .staff-order-card__amount { color: #1d4ed8; font-size: 18px; font-weight: 900; }
        .staff-badge { display: inline-flex; align-items: center; justify-content: center; min-height: 28px; padding: 0 10px; border-radius: 999px; font-size: 12px; font-weight: 900; }
        .staff-badge--warning { color: #b45309; background: #fff7ed; }
        .staff-badge--info { color: #1d4ed8; background: #eff6ff; }
        .staff-badge--shipping { color: #155e75; background: #ecfeff; }
        .staff-badge--success { color: #047857; background: #ecfdf5; }
        .staff-badge--danger { color: #b91c1c; background: #fef2f2; }
        .staff-badge--neutral { color: #475569; background: #f8fafc; }
        .staff-orders-empty { padding: 32px 20px; border-radius: 18px; background: #f8fafc; text-align: center; color: #64748b; }
        .staff-orders-alert { padding: 14px 16px; border-radius: 16px; font-weight: 800; }
        .staff-orders-alert--error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
        .staff-orders-alert--success { background: #ecfdf5; color: #047857; border: 1px solid #bbf7d0; }
        .staff-detail-header { display: grid; gap: 18px; padding: 24px; border-bottom: 1px solid #e2e8f0; background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%); }
        .staff-detail-header__top { display: flex; justify-content: space-between; gap: 18px; align-items: start; flex-wrap: wrap; }
        .staff-detail-header__top h2 { margin: 8px 0 0; font-size: 30px; color: #0f172a; }
        .staff-detail-header__top p { margin: 8px 0 0; color: #64748b; }
        .staff-detail-header__actions { display: flex; gap: 10px; flex-wrap: wrap; }
        .staff-btn { min-height: 44px; border-radius: 14px; border: 1px solid transparent; cursor: pointer; padding: 0 16px; font-weight: 900; transition: transform .18s ease, box-shadow .18s ease, opacity .18s ease; }
        .staff-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .staff-btn:disabled { cursor: not-allowed; opacity: .55; }
        .staff-btn--primary { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff; box-shadow: 0 14px 26px rgba(37, 99, 235, 0.18); }
        .staff-btn--secondary { background: #fff; color: #0f172a; border-color: #dbe4ef; }
        .staff-btn--shipping { background: #0f766e; color: #fff; }
        .staff-btn--success { background: #059669; color: #fff; }
        .staff-btn--danger { background: #fff; color: #b91c1c; border-color: #fecaca; }
        .staff-btn--danger-fill { background: #dc2626; color: #fff; }
        .staff-btn--dark { background: #0f172a; color: #fff; }
        .staff-detail-grid { padding: 24px; display: grid; gap: 18px; }
        .staff-detail-main-grid { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 18px; align-items: start; }
        .staff-card { border: 1px solid #e2e8f0; border-radius: 22px; background: #fff; padding: 20px; display: grid; gap: 16px; }
        .staff-section-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .staff-info-card { border-radius: 16px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; display: grid; gap: 6px; }
        .staff-info-card span { color: #64748b; font-size: 12px; font-weight: 800; }
        .staff-info-card strong { color: #0f172a; }
        .staff-order-items { display: grid; gap: 12px; }
        .staff-order-item { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 14px; align-items: center; padding: 14px; border-radius: 16px; background: #f8fafc; border: 1px solid #e2e8f0; }
        .staff-order-item strong { display: block; color: #0f172a; }
        .staff-order-item span { display: block; margin-top: 4px; color: #64748b; font-size: 13px; }
        .staff-stepper { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
        .staff-step { padding: 14px; border-radius: 16px; border: 1px solid #e2e8f0; background: #fff; display: grid; gap: 8px; }
        .staff-step--done { background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%); border-color: #bfdbfe; }
        .staff-step__index { width: 34px; height: 34px; border-radius: 999px; display: grid; place-items: center; font-weight: 900; background: #e2e8f0; color: #0f172a; }
        .staff-step--done .staff-step__index { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff; }
        .staff-step strong { color: #0f172a; }
        .staff-step small { color: #64748b; line-height: 1.5; }
        .staff-orders-textarea { width: 100%; box-sizing: border-box; min-height: 120px; padding: 14px; border-radius: 14px; border: 1px solid #dbe4ef; background: #f8fafc; resize: vertical; font: inherit; }
        .staff-note-templates { display: flex; gap: 8px; flex-wrap: wrap; }
        .staff-note-templates button { min-height: 34px; padding: 0 12px; border-radius: 999px; border: 1px solid #dbe4ef; background: #fff; color: #475569; cursor: pointer; font-weight: 700; }
        .staff-modal { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.44); display: grid; place-items: center; z-index: 70; padding: 20px; }
        .staff-modal__panel { width: min(560px, 100%); border-radius: 24px; background: #fff; padding: 24px; border: 1px solid #e2e8f0; box-shadow: 0 26px 60px rgba(15, 23, 42, 0.24); display: grid; gap: 16px; }
        .staff-modal__panel h2 { margin: 0; color: #0f172a; }
        .staff-modal__panel p { margin: 0; color: #64748b; line-height: 1.6; }
        .staff-modal__actions { display: flex; gap: 12px; justify-content: flex-end; flex-wrap: wrap; }
        @media (max-width: 1180px) {
          .staff-orders-layout, .staff-detail-main-grid, .staff-orders-stats, .staff-stepper { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 920px) {
          .staff-orders-dashboard { width: min(100%, calc(100% - 24px)); }
          .staff-orders-hero, .staff-detail-header__top { grid-template-columns: 1fr; display: grid; }
          .staff-orders-layout, .staff-detail-main-grid, .staff-orders-stats, .staff-stepper, .staff-section-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="staff-orders-hero">
        <div className="staff-orders-hero__copy">
          <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em", color: "#93c5fd", fontWeight: 900 }}>Sales OMS</div>
          <h1 style={{ margin: "10px 0 0", fontSize: 34, lineHeight: 1.08 }}>Trung tâm vận hành đơn hàng</h1>
          <p>Theo dõi đơn chờ xử lý, cập nhật giao vận, xác nhận hoàn tất và lưu ghi chú tư vấn trong một dashboard vận hành gọn, rõ tầng thông tin.</p>
        </div>
        <div className="staff-orders-hero__actions">
          <Link to="/staff/chat" className="staff-btn staff-btn--secondary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            Ticket tư vấn
          </Link>
          <button type="button" className="staff-btn staff-btn--secondary" onClick={refreshCurrentOrder} disabled={Boolean(actionLoading)}>
            Làm mới dữ liệu
          </button>
        </div>
      </div>

      <section className="staff-orders-stats" aria-label="Tổng quan OMS">
        <article className="staff-orders-stat">
          <div className="staff-orders-stat__top"><span>Đơn chờ xử lý</span><span>⏳</span></div>
          <strong>{stats.pending}</strong>
          <small>Cần xác nhận và phân luồng xử lý.</small>
        </article>
        <article className="staff-orders-stat">
          <div className="staff-orders-stat__top"><span>Đang xử lý</span><span>🧾</span></div>
          <strong>{stats.processing}</strong>
          <small>Đơn đã xác nhận, đang chuẩn bị giao.</small>
        </article>
        <article className="staff-orders-stat">
          <div className="staff-orders-stat__top"><span>Đang giao</span><span>🚚</span></div>
          <strong>{stats.shipped}</strong>
          <small>Đơn đã có vận đơn và đang trên đường.</small>
        </article>
        <article className="staff-orders-stat">
          <div className="staff-orders-stat__top"><span>Tổng giá trị hôm nay</span><span>₫</span></div>
          <strong>{formatCurrency(stats.todayValue)}</strong>
          <small>Tổng giá trị đơn tạo trong ngày hiện tại.</small>
        </article>
      </section>

      {errorMessage ? <div className="staff-orders-alert staff-orders-alert--error">{errorMessage}</div> : null}
      {successMessage ? <div className="staff-orders-alert staff-orders-alert--success">{successMessage}</div> : null}

      <div className="staff-orders-layout">
        <aside className="staff-orders-panel">
          <div className="staff-orders-panel__body">
            <div className="staff-orders-panel__head">
              <div>
                <h2>Danh sách đơn hàng</h2>
                <p>Tìm kiếm, lọc trạng thái và chọn đơn để thao tác.</p>
              </div>
            </div>

            <div className="staff-orders-toolbar">
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm mã đơn, khách hàng, email, vận đơn..."
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

            <div className="staff-orders-tabs">
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

            <div className="staff-orders-list">
              {loading ? (
                <OrderListSkeleton />
              ) : filteredOrders.length === 0 ? (
                <div className="staff-orders-empty">
                  <strong style={{ display: "block", marginBottom: 8, color: "#0f172a" }}>Chưa có đơn phù hợp</strong>
                  Thử đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm.
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const isActive = order.id === selectedOrderId;
                  const statusMeta = getStatusMeta(order.status);
                  return (
                    <button
                      key={order.id}
                      type="button"
                      className={`staff-order-card${isActive ? " staff-order-card--active" : ""}`}
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <div className="staff-order-card__row">
                        <span className={`staff-badge staff-badge--${statusMeta.tone}`}>{statusMeta.label}</span>
                        <span className={`staff-badge staff-badge--${getPaymentTone(order.paymentStatus)}`}>{getPaymentLabel(order.paymentStatus)}</span>
                      </div>
                      <div className="staff-order-card__title">Đơn #{order.id}</div>
                      <div style={{ color: "#0f172a", fontWeight: 800 }}>{order.customer?.fullName || "Khách hàng"}</div>
                      <div className="staff-order-card__meta">{order.paymentMethod || "COD"} · {formatShortDate(order.createdAt)}</div>
                      <div className="staff-order-card__row">
                        <span className="staff-order-card__meta">{order.customer?.email || "Không có email"}</span>
                        <span className="staff-order-card__amount">{formatCurrency(getOrderAmount(order))} đ</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        <main className="staff-orders-detail">
          {detailLoading ? (
            <div className="staff-orders-detail__body">
              <DetailSkeleton />
            </div>
          ) : !selectedOrder ? (
            <div className="staff-orders-detail__body">
              <div className="staff-orders-empty">
                <strong style={{ display: "block", marginBottom: 8, color: "#0f172a" }}>Chưa chọn đơn hàng</strong>
                Chọn một đơn ở cột bên trái để xem chi tiết và thao tác.
              </div>
            </div>
          ) : (
            <>
              <header className="staff-detail-header">
                <div className="staff-detail-header__top">
                  <div>
                    <span className={`staff-badge staff-badge--${selectedStatusMeta.tone}`}>{selectedStatusMeta.label}</span>
                    <h2>Đơn hàng #{selectedOrder.id}</h2>
                    <p>Tạo lúc {formatDate(selectedOrder.createdAt)} · Khách {customer.fullName || "Không rõ"}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#64748b", fontSize: 13, fontWeight: 800 }}>Tổng thanh toán</div>
                    <div style={{ marginTop: 6, color: "#1d4ed8", fontSize: 30, fontWeight: 900 }}>{formatCurrency(getOrderAmount(selectedOrder))} đ</div>
                  </div>
                </div>
                <div className="staff-detail-header__actions">
                  {renderActionButton({
                    key: "processing",
                    enabled: canMoveToProcessing,
                    label: "Xác nhận xử lý",
                    loadingLabel: "Đang cập nhật...",
                    onClick: handleMoveToProcessing,
                    className: "staff-btn staff-btn--primary",
                    title: actionHelp.processing
                  })}
                  {renderActionButton({
                    key: "ship",
                    enabled: canShip,
                    label: "Chuyển sang giao hàng",
                    loadingLabel: "Đang cập nhật...",
                    onClick: handleShipOrder,
                    className: "staff-btn staff-btn--shipping",
                    title: actionHelp.ship
                  })}
                  {renderActionButton({
                    key: "delivered",
                    enabled: canComplete,
                    label: "Hoàn tất đơn",
                    loadingLabel: "Đang cập nhật...",
                    onClick: handleCompleteOrder,
                    className: "staff-btn staff-btn--success",
                    title: actionHelp.delivered
                  })}
                  {renderActionButton({
                    key: "cancel",
                    enabled: canCancel,
                    label: "Hủy đơn",
                    loadingLabel: "Đang xử lý...",
                    onClick: () => setShowCancelDialog(true),
                    className: "staff-btn staff-btn--danger",
                    title: actionHelp.cancel
                  })}
                </div>
              </header>

              <div className="staff-detail-grid">
                <section className="staff-card">
                  <div className="staff-orders-section__head">
                    <div>
                      <h3>Lịch sử xử lý</h3>
                      <p>Trạng thái đơn theo quy trình vận hành nội bộ.</p>
                    </div>
                  </div>
                  <div className="staff-stepper">
                    {orderTimeline.map((step, index) => (
                      <article key={step.status} className={`staff-step${step.isDone ? " staff-step--done" : ""}`}>
                        <div className="staff-step__index">{index + 1}</div>
                        <strong>{step.meta.label}</strong>
                        <small>{step.timestamp ? formatDate(step.timestamp) : "Đang chờ cập nhật"}</small>
                      </article>
                    ))}
                  </div>
                </section>

                <div className="staff-detail-main-grid">
                  <div style={{ display: "grid", gap: 18 }}>
                    <section className="staff-card">
                      <div className="staff-orders-section__head">
                        <div>
                          <h3>Tổng quan đơn hàng</h3>
                          <p>Thông tin nhận diện nhanh để xử lý đúng luồng.</p>
                        </div>
                      </div>
                      <div className="staff-section-grid">
                        <article className="staff-info-card"><span>Mã đơn</span><strong>#{selectedOrder.id}</strong></article>
                        <article className="staff-info-card"><span>Ngày đặt</span><strong>{formatDate(selectedOrder.createdAt)}</strong></article>
                        <article className="staff-info-card"><span>Trạng thái đơn</span><strong>{selectedStatusMeta.label}</strong></article>
                        <article className="staff-info-card"><span>Ghi chú hiện tại</span><strong>{selectedOrder.note || "Chưa có ghi chú"}</strong></article>
                      </div>
                    </section>

                    <section className="staff-card">
                      <div className="staff-orders-section__head">
                        <div>
                          <h3>Thông tin khách hàng</h3>
                          <p>Thông tin liên hệ và địa chỉ giao hàng.</p>
                        </div>
                      </div>
                      <div className="staff-section-grid">
                        <article className="staff-info-card"><span>Tên khách</span><strong>{customer.fullName || "Không rõ"}</strong></article>
                        <article className="staff-info-card"><span>Email</span><strong>{customer.email || "Không rõ"}</strong></article>
                        <article className="staff-info-card"><span>Số điện thoại</span><strong>{customer.phone || "Không rõ"}</strong></article>
                        <article className="staff-info-card"><span>Địa chỉ giao hàng</span><strong>{selectedOrder.shippingAddress || "Chưa có địa chỉ giao hàng"}</strong></article>
                      </div>
                    </section>

                    <section className="staff-card">
                      <div className="staff-orders-section__head">
                        <div>
                          <h3>Danh sách sản phẩm</h3>
                          <p>Kiểm tra lại cấu hình và số lượng trước khi giao.</p>
                        </div>
                      </div>
                      <div className="staff-order-items">
                        {(selectedOrder.items || []).length === 0 ? (
                          <div className="staff-orders-empty">Đơn hàng chưa có dòng sản phẩm.</div>
                        ) : (
                          (selectedOrder.items || []).map((item) => (
                            <article key={item.id || `${item.productName}-${item.sku}`} className="staff-order-item">
                              <div>
                                <strong>{item.productName || "Sản phẩm"}</strong>
                                <span>SKU: {item.sku || "Không rõ"} · Số lượng: {item.quantity || 0}</span>
                              </div>
                              <b style={{ color: "#0f172a" }}>{formatCurrency(getLineAmount(item))} đ</b>
                            </article>
                          ))
                        )}
                      </div>
                    </section>
                  </div>

                  <div style={{ display: "grid", gap: 18 }}>
                    <section className="staff-card">
                      <div className="staff-orders-section__head">
                        <div>
                          <h3>Thanh toán</h3>
                          <p>Trạng thái chi phí và giao dịch.</p>
                        </div>
                      </div>
                      <div className="staff-section-grid" style={{ gridTemplateColumns: "1fr" }}>
                        <article className="staff-info-card"><span>Phương thức</span><strong>{selectedOrder.paymentMethod || "COD"}</strong></article>
                        <article className="staff-info-card"><span>Trạng thái thanh toán</span><strong><span className={`staff-badge staff-badge--${getPaymentTone(selectedOrder.paymentStatus)}`}>{getPaymentLabel(selectedOrder.paymentStatus)}</span></strong></article>
                        <article className="staff-info-card"><span>Phí vận chuyển</span><strong>{formatCurrency(selectedOrder.shippingFee)} đ</strong></article>
                        <article className="staff-info-card"><span>Tổng tiền</span><strong>{formatCurrency(getOrderAmount(selectedOrder))} đ</strong></article>
                        <article className="staff-info-card"><span>Mã giao dịch</span><strong>{selectedOrder.transactionCode || selectedOrder.paymentTransactionId || "—"}</strong></article>
                      </div>
                    </section>

                    <section className="staff-card">
                      <div className="staff-orders-section__head">
                        <div>
                          <h3>Vận đơn</h3>
                          <p>Nhập mã vận đơn và cập nhật giao hàng đúng bước.</p>
                        </div>
                      </div>
                      <div className="staff-section-grid" style={{ gridTemplateColumns: "1fr" }}>
                        <article className="staff-info-card"><span>Trạng thái vận đơn</span><strong>{selectedOrder.shipment?.status || "Chưa tạo vận đơn"}</strong></article>
                        <article className="staff-info-card"><span>Mã vận đơn hiện tại</span><strong>{selectedOrder.shipment?.trackingCode || "Chưa có"}</strong></article>
                      </div>
                      <label htmlFor="staff-carrier" style={{ fontSize: 13, fontWeight: 800, color: "#475569" }}>Đơn vị vận chuyển</label>
                      <select id="staff-carrier" className="staff-orders-field" value={shippingCarrier} onChange={(event) => setShippingCarrier(event.target.value)}>
                        {SHIPPING_CARRIERS.map((item) => (
                          <option key={item.id} value={item.id}>{item.label}</option>
                        ))}
                      </select>
                      <input
                        className="staff-orders-field"
                        value={trackingCode}
                        onChange={(event) => setTrackingCode(event.target.value)}
                        placeholder="Nhập mã vận đơn"
                      />
                      {trackingError ? <div className="staff-orders-alert staff-orders-alert--error">{trackingError}</div> : null}
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button type="button" className="staff-btn staff-btn--secondary" onClick={handleGenerateTracking}>
                          Tạo mã demo
                        </button>
                      </div>
                    </section>

                    <section className="staff-card">
                      <div className="staff-orders-section__head">
                        <div>
                          <h3>Lịch sử xử lý nội bộ</h3>
                          <p>Ghi chú tư vấn, hẹn giao, lưu ý đặc biệt.</p>
                        </div>
                      </div>
                      <div className="staff-note-templates">
                        {NOTE_TEMPLATES.map((text) => (
                          <button key={text} type="button" onClick={() => applyNoteTemplate(text)}>
                            {text}
                          </button>
                        ))}
                      </div>
                      <textarea
                        className="staff-orders-textarea"
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
              className="staff-orders-textarea"
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
