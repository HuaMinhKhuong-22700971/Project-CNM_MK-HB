const express = require("express");

const {
  verifyToken,
  requireRole,
  requirePermission,
  PERMISSIONS,
  ROLES
} = require("../../middlewares/auth.middleware");
const controller = require("./admin.controller");
const {
  validateCreateProduct,
  validateUpdateProduct,
  validateChangeProductStatus,
  validateCreateVariant,
  validateCreateCompatibilityRule,
  validateUpdateCompatibilityRule,
  validateChangeCompatibilityRuleStatus,
  validateChangeUserStatus,
  validateAttribute,
  validateAttributeValue,
  validateSku,
  validateUpdateSku,
  validateAssignSkuAttributes,
  validateSystemSettings
} = require("./admin.validation.middleware");

const router = express.Router();

router.get(
  "/dashboard",
  verifyToken,
  requireRole(ROLES.ADMIN),
  requirePermission(PERMISSIONS.ADMIN_DASHBOARD),
  controller.getDashboardSummary
);

router.get(
  "/system/overview",
  verifyToken,
  requireRole(ROLES.ADMIN),
  requirePermission(PERMISSIONS.MANAGE_SYSTEM_SETTINGS),
  controller.getSystemOverview
);

router.get(
  "/system/settings",
  verifyToken,
  requireRole(ROLES.ADMIN),
  requirePermission(PERMISSIONS.MANAGE_SYSTEM_SETTINGS),
  controller.getSystemSettings
);

router.patch(
  "/system/settings",
  verifyToken,
  requireRole(ROLES.ADMIN),
  requirePermission(PERMISSIONS.MANAGE_SYSTEM_SETTINGS),
  validateSystemSettings,
  controller.updateSystemSettings
);

router.get(
  "/products",
  verifyToken,
  requireRole(ROLES.ADMIN),
  requirePermission(PERMISSIONS.MANAGE_PRODUCTS),
  controller.getProducts
);

router.post(
  "/products",
  verifyToken,
  requireRole(ROLES.ADMIN),
  requirePermission(PERMISSIONS.MANAGE_PRODUCTS),
  validateCreateProduct,
  controller.createProduct
);

router.patch(
  "/products/:productId",
  verifyToken,
  requireRole(ROLES.ADMIN),
  requirePermission(PERMISSIONS.MANAGE_PRODUCTS),
  validateUpdateProduct,
  controller.updateProduct
);

router.patch(
  "/products/:productId/status",
  verifyToken,
  requireRole(ROLES.ADMIN),
  requirePermission(PERMISSIONS.MANAGE_PRODUCTS),
  validateChangeProductStatus,
  controller.changeProductStatus
);

router.post(
  "/products/:productId/variants",
  verifyToken,
  requireRole(ROLES.ADMIN),
  requirePermission(PERMISSIONS.MANAGE_PRODUCTS),
  validateCreateVariant,
  controller.createVariant
);

router.get(
  "/attributes",
  verifyToken,
  requireRole(ROLES.ADMIN),
  requirePermission(PERMISSIONS.MANAGE_PRODUCTS),
  controller.getAttributes
);

router.post(
  "/attributes",
  verifyToken,
  requireRole(ROLES.ADMIN),
  requirePermission(PERMISSIONS.MANAGE_PRODUCTS),
  validateAttribute,
  controller.createAttribute
);

router.patch(
  "/attributes/:attributeId",
  verifyToken,
  requireRole(ROLES.ADMIN),
  requirePermission(PERMISSIONS.MANAGE_PRODUCTS),
  validateAttribute,
  controller.updateAttribute
);

router.delete(
  "/attributes/:attributeId",
  verifyToken,
  requireRole(ROLES.ADMIN),
  requirePermission(PERMISSIONS.MANAGE_PRODUCTS),
  controller.deleteAttribute
);

router.get(
  "/attribute-values",
  verifyToken,
  requireRole(ROLES.ADMIN),
  requirePermission(PERMISSIONS.MANAGE_PRODUCTS),
  controller.getAttributeValues
);

router.post(
  "/attribute-values",
  verifyToken,
  requireRole(ROLES.ADMIN),
  requirePermission(PERMISSIONS.MANAGE_PRODUCTS),
  validateAttributeValue,
  controller.createAttributeValue
);

router.patch(
  "/attribute-values/:attributeValueId",
  verifyToken,
  requireRole(ROLES.ADMIN),
  requirePermission(PERMISSIONS.MANAGE_PRODUCTS),
  validateAttributeValue,
  controller.updateAttributeValue
);

router.delete(
  "/attribute-values/:attributeValueId",
  verifyToken,
  requireRole(ROLES.ADMIN),
  requirePermission(PERMISSIONS.MANAGE_PRODUCTS),
  controller.deleteAttributeValue
);

router.get(
  "/skus",
  verifyToken,
  requireRole(ROLES.ADMIN),
  requirePermission(PERMISSIONS.MANAGE_PRODUCTS),
  controller.getSkus
);

router.get(
  "/skus/:skuId",
  verifyToken,
  requireRole(ROLES.ADMIN),
  requirePermission(PERMISSIONS.MANAGE_PRODUCTS),
  controller.getSkuDetail
);

router.post(
  "/skus",
  verifyToken,
  requireRole(ROLES.ADMIN),
  requirePermission(PERMISSIONS.MANAGE_PRODUCTS),
  validateSku,
  controller.createSku
);

router.patch(
  "/skus/:skuId",
  verifyToken,
  requireRole(ROLES.ADMIN),
  requirePermission(PERMISSIONS.MANAGE_PRODUCTS),
  validateUpdateSku,
  controller.updateSku
);

router.delete(
  "/skus/:skuId",
  verifyToken,
  requireRole(ROLES.ADMIN),
  requirePermission(PERMISSIONS.MANAGE_PRODUCTS),
  controller.deleteSku
);

router.put(
  "/skus/:skuId/attributes",
  verifyToken,
  requireRole(ROLES.ADMIN),
  requirePermission(PERMISSIONS.MANAGE_PRODUCTS),
  validateAssignSkuAttributes,
  controller.assignSkuAttributes
);

router.get(
  "/users",
  verifyToken,
  requireRole(ROLES.ADMIN),
  requirePermission(PERMISSIONS.MANAGE_USERS),
  controller.getUsers
);

router.patch(
  "/users/:userId/status",
  verifyToken,
  requireRole(ROLES.ADMIN),
  requirePermission(PERMISSIONS.MANAGE_USERS),
  validateChangeUserStatus,
  controller.changeUserStatus
);

router.get(
  "/compatibility-rules",
  verifyToken,
  requireRole(ROLES.ADMIN, ROLES.TECH_STAFF),
  requirePermission(PERMISSIONS.MANAGE_COMPATIBILITY_RULES),
  controller.getCompatibilityRules
);

router.post(
  "/compatibility-rules",
  verifyToken,
  requireRole(ROLES.ADMIN, ROLES.TECH_STAFF),
  requirePermission(PERMISSIONS.MANAGE_COMPATIBILITY_RULES),
  validateCreateCompatibilityRule,
  controller.createCompatibilityRule
);

router.patch(
  "/compatibility-rules/:ruleId",
  verifyToken,
  requireRole(ROLES.ADMIN, ROLES.TECH_STAFF),
  requirePermission(PERMISSIONS.MANAGE_COMPATIBILITY_RULES),
  validateUpdateCompatibilityRule,
  controller.updateCompatibilityRule
);

router.patch(
  "/compatibility-rules/:ruleId/status",
  verifyToken,
  requireRole(ROLES.ADMIN, ROLES.TECH_STAFF),
  requirePermission(PERMISSIONS.MANAGE_COMPATIBILITY_RULES),
  validateChangeCompatibilityRuleStatus,
  controller.changeCompatibilityRuleStatus
);

module.exports = router;
