const express = require("express");

const controller = require("./products.controller");

const router = express.Router();

router.get("/", controller.getProducts);
router.get("/filter-options", controller.getProductFilterOptions);
router.get("/compare", controller.getCompareProducts);
router.get("/:idOrSlug", controller.getProductDetail);

module.exports = router;
