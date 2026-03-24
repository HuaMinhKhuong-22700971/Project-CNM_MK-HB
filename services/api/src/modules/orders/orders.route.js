const express = require("express");

const { verifyToken, requireRole, ROLES } = require("../../middlewares/auth.middleware");
const controller = require("./orders.controller");

const router = express.Router();

router.post("/checkout", verifyToken, controller.createOrderFromCart);
router.get("/my", verifyToken, controller.getMyOrders);
router.get("/", verifyToken, requireRole(ROLES.ADMIN, ROLES.SALES_STAFF), controller.getAllOrders);
router.get("/:orderId", verifyToken, controller.getOrderDetail);
router.patch("/:orderId/status", verifyToken, requireRole(ROLES.ADMIN, ROLES.SALES_STAFF), controller.updateOrderStatus);
router.post("/:orderId/pay", verifyToken, requireRole(ROLES.ADMIN, ROLES.SALES_STAFF), controller.markOrderPaid);
router.patch("/:orderId/cancel", verifyToken, controller.cancelOrder);

module.exports = router;
