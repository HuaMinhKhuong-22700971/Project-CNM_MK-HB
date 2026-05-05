import { Router } from "express";

import { authenticate, authorize } from "../../middlewares/auth.middleware";
import {
  checkCompatibility,
  getBuilderOptions,
  getCompatibilityRules,
  patchCompatibilityRule,
  pcBuilderManageRoles,
  postCompatibilityRule
} from "./pc-builder.controller";

export const pcBuilderRouter = Router();

pcBuilderRouter.get("/options", getBuilderOptions);
pcBuilderRouter.post("/check-compatibility", checkCompatibility);

pcBuilderRouter.get("/rules", authenticate, authorize(pcBuilderManageRoles), getCompatibilityRules);
pcBuilderRouter.post("/rules", authenticate, authorize(pcBuilderManageRoles), postCompatibilityRule);
pcBuilderRouter.patch("/rules/:ruleId", authenticate, authorize(pcBuilderManageRoles), patchCompatibilityRule);
