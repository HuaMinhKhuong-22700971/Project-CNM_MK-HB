const { sendSuccess } = require("../../utils/api-response");
const asyncHandler = require("../../utils/async-handler");
const ordersService = require("./orders.service");
const { recordAuditLog } = require("../../services/audit-log.service");

const createOrderFromCart = asyncHandler(async (req, res) => {
  const result = await ordersService.createOrderFromCart(req.user.id, req.body || {});
  await recordAuditLog({
    actorUserId: req.user?.id,
    actorRole: req.user?.role,
    action: "ORDER_CREATED",
    entityType: "ORDER",
    entityId: result?.id,
    description: `Customer created order #${result?.id}`,
    metadata: {
      paymentMethod: result?.paymentMethod,
      paymentStatus: result?.paymentStatus,
      finalAmount: result?.finalAmount
    }
  });
  return sendSuccess(res, "Order created successfully", result, 201);
});

const getMyOrders = asyncHandler(async (req, res) => {
  const result = await ordersService.getMyOrders(req.user.id);
  return sendSuccess(res, "Orders fetched successfully", result);
});

const getAllOrders = asyncHandler(async (_req, res) => {
  const result = await ordersService.getAllOrders();
  return sendSuccess(res, "All orders fetched successfully", result);
});

const getOrderDetail = asyncHandler(async (req, res) => {
  const result = await ordersService.getOrderDetail(req.user, req.params.orderId);
  return sendSuccess(res, "Order detail fetched successfully", result);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const result = await ordersService.updateOrderStatus(req.user, req.params.orderId, req.body?.status);
  await recordAuditLog({
    actorUserId: req.user?.id,
    actorRole: req.user?.role,
    action: "ORDER_STATUS_UPDATED",
    entityType: "ORDER",
    entityId: req.params.orderId,
    description: `Updated order #${req.params.orderId} to ${req.body?.status}`,
    metadata: { status: req.body?.status }
  });
  return sendSuccess(res, "Order status updated successfully", result);
});

const markOrderPaid = asyncHandler(async (req, res) => {
  const result = await ordersService.markOrderPaid(req.user, req.params.orderId);
  await recordAuditLog({
    actorUserId: req.user?.id,
    actorRole: req.user?.role,
    action: "ORDER_PAID_CONFIRMED",
    entityType: "ORDER",
    entityId: req.params.orderId,
    description: `Confirmed payment for order #${req.params.orderId}`
  });
  return sendSuccess(res, "Order payment confirmed successfully", result);
});

const cancelOrder = asyncHandler(async (req, res) => {
  const result = await ordersService.cancelOrder(req.user.id, req.params.orderId);
  await recordAuditLog({
    actorUserId: req.user?.id,
    actorRole: req.user?.role,
    action: "ORDER_CANCELED",
    entityType: "ORDER",
    entityId: req.params.orderId,
    description: `Customer canceled order #${req.params.orderId}`
  });
  return sendSuccess(res, "Order canceled successfully", result);
});

module.exports = {
  createOrderFromCart,
  getMyOrders,
  getAllOrders,
  getOrderDetail,
  updateOrderStatus,
  markOrderPaid,
  cancelOrder
};
