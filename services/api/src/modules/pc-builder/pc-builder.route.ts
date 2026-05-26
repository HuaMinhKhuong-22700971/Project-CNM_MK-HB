import { Router } from "express";
import * as pcBuilderController from "./pc-builder.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

/**
 * Routes for PC Builder module.
 * Organized by accessibility (Public vs Protected).
 */

// -- Public Routes --
router.post("/suggest-build", pcBuilderController.suggestBuild);
router.post("/check-compatibility", pcBuilderController.checkRawCompatibility);

// -- Protected Routes (Require Authentication) --
router.use(authenticate);

router.post("/", pcBuilderController.createBuild);
router.get("/current", pcBuilderController.getCurrentBuild);
router.get("/:buildId", pcBuilderController.getBuildDetail);
router.post("/:buildId/items", pcBuilderController.addBuildItem);
router.delete("/:buildId/items/:componentType", pcBuilderController.removeBuildItem);
router.patch("/:buildId/save", pcBuilderController.saveBuild);

export default router;
