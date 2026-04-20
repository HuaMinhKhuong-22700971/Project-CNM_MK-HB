const express = require("express");

const { verifyToken } = require("../../middlewares/auth.middleware");
const controller = require("./pc-builder.controller");

const router = express.Router();

router.post("/suggestion", controller.suggestBuild);
router.post("/", verifyToken, controller.createBuild);
router.post("/:buildId/items", verifyToken, controller.addBuildItem);
router.patch("/:buildId/items/:componentType", verifyToken, controller.replaceBuildItem);
router.get("/:buildId", verifyToken, controller.getBuildDetail);
router.delete("/:buildId/items/:componentType", verifyToken, controller.removeBuildItem);
router.patch("/:buildId/save", verifyToken, controller.saveBuild);

module.exports = router;
