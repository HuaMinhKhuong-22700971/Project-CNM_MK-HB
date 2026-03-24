const express = require("express");

const controller = require("./categories.controller");

const router = express.Router();

router.get("/", controller.getAllCategories);
router.get("/tree", controller.getCategoryTree);

module.exports = router;
