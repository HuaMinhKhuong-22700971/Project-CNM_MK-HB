const express = require("express");

const controller = require("./payments.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");
const { validateCreatePayment, validateConfirmPayment } = require("./payments.validation.middleware");

const router = express.Router();

router.post("/", verifyToken, validateCreatePayment, controller.createPayment);
router.get("/:paymentId", verifyToken, controller.getPaymentStatus);
router.post("/:paymentId/confirm", verifyToken, validateConfirmPayment, controller.confirmPayment);
router.get("/:paymentId/callback", controller.handleMockCallback);

module.exports = router;
