import { useEffect, useState } from "react";

import {
  AdminAlerts,
  AdminLinkBtn,
  AdminPage,
  AdminPageHead,
  AdminTable,
  AdminTableCell,
  AdminTableRow,
  AdminBadge
} from "../../components/admin/AdminUi";
import { approvePaymentProof } from "../../services/order.service";
import { httpClient } from "../../services/http";
import { getAdminErrorMessage } from "../../utils/adminUi";

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api").replace(/\/api\/?$/, "");

function resolveUploadUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

function isAwaitingApproval(order) {
  const status = String(order?.payment_status || order?.paymentStatus || "").toUpperCase();
  return status === "AWAITING_ADMIN_CONFIRMATION" || status === "PENDING_VERIFICATION";
}

function getPaymentStatusLabel(order) {
  const status = String(order?.payment_status || order?.paymentStatus || "").toUpperCase();
  if (status === "PAID") return "Đã thanh toán";
  if (status === "REJECTED") return "Đã từ chối";
  if (isAwaitingApproval(order)) return "Chờ admin xác nhận";
  if (status === "PENDING_GATEWAY") return "Chờ tải minh chứng";
  return status || "Chưa cập nhật";
}

function getPaymentStatusVariant(order) {
  const status = String(order?.payment_status || order?.paymentStatus || "").toUpperCase();
  if (status === "PAID") return "success";
  if (status === "REJECTED") return "error";
  if (isAwaitingApproval(order)) return "warning";
  return "neutral";
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("vi-VN");
}

export function AdminPaymentApprovalPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadPendingPayments();
  }, []);

  async function loadPendingPayments() {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await httpClient.get("/orders");
      const allOrders = response.data?.data || response.data || [];
      
      // Filter orders with BANK_TRANSFER payment method
      const bankTransferOrders = allOrders.filter(order => 
        order.payment_method === "BANK_TRANSFER" || order.paymentMethod === "BANK_TRANSFER"
      );
      
      setOrders(bankTransferOrders);
    } catch (error) {
      setErrorMessage(getAdminErrorMessage(error, "Không thể tải danh sách thanh toán."));
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(orderId, approved) {
    if (!confirm(approved ? "Duyệt thanh toán này?" : "Từ chối thanh toán này?")) return;
    
    try {
      setActionLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      
      await approvePaymentProof(orderId, {
        approved,
        rejectionReason: approved ? null : "Không hợp lệ"
      });
      
      setSuccessMessage(approved ? "Đã duyệt thanh toán thành công!" : "Đã từ chối thanh toán!");
      await loadPendingPayments();
      setSelectedOrder(null);
    } catch (error) {
      setErrorMessage(getAdminErrorMessage(error, "Không thể xử lý thanh toán."));
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <AdminPage>
      <AdminPageHead
        eyebrow="Quản trị thanh toán"
        title="Duyệt thanh toán chuyển khoản"
        description="Xem và duyệt các bằng chứng thanh toán chuyển khoản từ khách hàng."
        actions={
          <AdminLinkBtn onClick={loadPendingPayments} variant="secondary">
            🔄 Tải lại
          </AdminLinkBtn>
        }
      />

      <AdminAlerts errorMessage={errorMessage} successMessage={successMessage} />

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
          Đang tải danh sách thanh toán...
        </div>
      ) : orders.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: 12, border: "1px dashed #cbd5e1" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💳</div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Không có thanh toán nào cần duyệt</div>
          <div style={{ fontSize: 14 }}>Tất cả các đơn hàng chuyển khoản đã được xử lý</div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 24 }}>
          <AdminTable
            headers={[
              "Mã đơn",
              "Khách hàng",
              "Số tiền",
              "Trạng thái thanh toán",
              "Ngày tạo",
              "Hành động"
            ]}
          >
            {orders.map((order) => (
              <AdminTableRow key={order.id}>
                <AdminTableCell>
                  <strong>#{order.id}</strong>
                </AdminTableCell>
                <AdminTableCell>
                  {order.customer?.fullName || order.user?.fullName || order.user?.full_name || "—"}
                </AdminTableCell>
                <AdminTableCell>
                  <strong>{formatCurrency(order.final_amount || order.finalAmount)} đ</strong>
                </AdminTableCell>
                <AdminTableCell>
                  <AdminBadge variant={getPaymentStatusVariant(order)}>
                    {getPaymentStatusLabel(order)}
                  </AdminBadge>
                </AdminTableCell>
                <AdminTableCell>
                  {formatDateTime(order.created_at || order.createdAt)}
                </AdminTableCell>
                <AdminTableCell>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    disabled={actionLoading}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      background: "#fff",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 13
                    }}
                  >
                    Xem chi tiết
                  </button>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTable>
        </div>
      )}

      {/* Payment Proof Modal */}
      {selectedOrder && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "grid",
          placeItems: "center",
          zIndex: 9999
        }} onClick={() => setSelectedOrder(null)}>
          <div style={{
            background: "#fff",
            borderRadius: 16,
            padding: 32,
            maxWidth: 600,
            width: "90%",
            maxHeight: "90vh",
            overflow: "auto"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Chi tiết thanh toán</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer" }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gap: 16, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: 12, background: "#f8fafc", borderRadius: 8 }}>
                <span style={{ color: "#64748b" }}>Mã đơn hàng:</span>
                <strong>#{selectedOrder.id}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: 12, background: "#f8fafc", borderRadius: 8 }}>
                <span style={{ color: "#64748b" }}>Khách hàng:</span>
                <strong>{selectedOrder.customer?.fullName || selectedOrder.user?.fullName || selectedOrder.user?.full_name || "—"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: 12, background: "#f8fafc", borderRadius: 8 }}>
                <span style={{ color: "#64748b" }}>Số tiền:</span>
                <strong style={{ color: "#2563eb" }}>{formatCurrency(selectedOrder.final_amount || selectedOrder.finalAmount)} đ</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: 12, background: "#f8fafc", borderRadius: 8 }}>
                <span style={{ color: "#64748b" }}>Trạng thái:</span>
                <AdminBadge
                  variant={getPaymentStatusVariant(selectedOrder)}
                >
                  {getPaymentStatusLabel(selectedOrder)}
                </AdminBadge>
              </div>
            </div>

            {selectedOrder.payment_proof || selectedOrder.paymentProof ? (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ margin: "0 0 12", fontSize: 16, fontWeight: 700 }}>Bằng chứng thanh toán</h3>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
                  <img
                    src={resolveUploadUrl(selectedOrder.payment_proof || selectedOrder.paymentProof)}
                    alt="Bằng chứng thanh toán"
                    style={{ width: "100%", height: "auto" }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ padding: 20, background: "#fef3c7", borderRadius: 12, border: "1px solid #fcd34d", marginBottom: 24 }}>
                <strong>⚠️ Chưa có bằng chứng thanh toán</strong>
                <p style={{ margin: "8px 0 0", color: "#92400e" }}>
                  Khách hàng chưa tải lên bằng chứng chuyển khoản
                </p>
              </div>
            )}

            {isAwaitingApproval(selectedOrder) && (
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => handleApprove(selectedOrder.id, true)}
                  disabled={actionLoading}
                  style={{
                    flex: 1,
                    padding: "12px 24px",
                    borderRadius: 12,
                    border: "none",
                    background: "#22c55e",
                    color: "#fff",
                    fontWeight: 800,
                    cursor: "pointer",
                    fontSize: 14
                  }}
                >
                  {actionLoading ? "Đang xử lý..." : "✅ Duyệt thanh toán"}
                </button>
                <button
                  onClick={() => handleApprove(selectedOrder.id, false)}
                  disabled={actionLoading}
                  style={{
                    flex: 1,
                    padding: "12px 24px",
                    borderRadius: 12,
                    border: "1px solid #fecaca",
                    background: "#fff",
                    color: "#b91c1c",
                    fontWeight: 800,
                    cursor: "pointer",
                    fontSize: 14
                  }}
                >
                  {actionLoading ? "Đang xử lý..." : "❌ Từ chối"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminPage>
  );
}
