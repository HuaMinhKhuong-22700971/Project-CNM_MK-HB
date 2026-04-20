const express = require("express");

const controller = require("./brands.controller");

const router = express.Router();

router.get("/", controller.getAllBrands);

module.exports = router;
