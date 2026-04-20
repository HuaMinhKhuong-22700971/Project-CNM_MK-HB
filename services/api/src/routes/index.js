const express = require("express");

const healthRoutes = require("../modules/health/health.route");
const authRoutes = require("../modules/auth/auth.route");
const userRoutes = require("../modules/users/users.route");
const productRoutes = require("../modules/products/products.route");
const categoryRoutes = require("../modules/categories/categories.route");
const brandRoutes = require("../modules/brands/brands.route");
const cartRoutes = require("../modules/cart/cart.route");
const orderRoutes = require("../modules/orders/orders.route");
const paymentRoutes = require("../modules/payments/payments.route");
const pcBuilderRoutes = require("../modules/pc-builder/pc-builder.route");
const compatibilityRoutes = require("../modules/compatibility/compatibility.route");
const ticketRoutes = require("../modules/tickets/tickets.route");
const staffRoutes = require("../modules/staff/staff.route");
const adminRoutes = require("../modules/admin/admin.route");
const warrantyRoutes = require("../modules/warranties/warranties.route");
const shipmentRoutes = require("../modules/shipments/shipments.route");
const aiRoutes = require("../modules/ai/ai.route");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/brands", brandRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/pc-builder", pcBuilderRoutes);
router.use("/compatibility", compatibilityRoutes);
router.use("/tickets", ticketRoutes);
router.use("/staff", staffRoutes);
router.use("/admin", adminRoutes);
router.use("/warranties", warrantyRoutes);
router.use("/shipments", shipmentRoutes);
router.use("/ai", aiRoutes);

module.exports = router;
