const express = require("express");

const { verifyToken } = require("../../middlewares/auth.middleware");
const controller = require("./ai.controller");

const router = express.Router();

router.post("/chat", controller.chat);
router.post("/builds/:buildId/advice", verifyToken, controller.getBuildAdvice);

module.exports = router;
