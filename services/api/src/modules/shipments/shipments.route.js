const express = require("express");

const controller = require("./shipments.controller");
const { verifyToken, requireRole, ROLES } = require("../../middlewares/auth.middleware");
const { validateCreateShipment, validateUpdateShipmentStatus } = require("./shipments.validation.middleware");

const router = express.Router();

router.get("/order/:orderId", verifyToken, controller.getShipmentByOrder);
router.post("/", verifyToken, requireRole(ROLES.ADMIN, ROLES.SALES_STAFF), validateCreateShipment, controller.createShipment);
router.patch("/:shipmentId/status", verifyToken, requireRole(ROLES.ADMIN, ROLES.SALES_STAFF), validateUpdateShipmentStatus, controller.updateShipmentStatus);

module.exports = router;
