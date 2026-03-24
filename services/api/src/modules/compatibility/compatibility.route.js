const express = require("express");

const { verifyToken } = require("../../middlewares/auth.middleware");
const controller = require("./compatibility.controller");

const router = express.Router();

router.get("/builds/:buildId", verifyToken, controller.checkBuildCompatibility);

module.exports = router;
