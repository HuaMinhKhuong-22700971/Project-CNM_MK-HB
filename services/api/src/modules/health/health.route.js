const express = require("express");

const controller = require("./health.controller");

const router = express.Router();

router.get("/", controller.getApiHealth);
router.get("/db", controller.getDatabaseHealth);

module.exports = router;
