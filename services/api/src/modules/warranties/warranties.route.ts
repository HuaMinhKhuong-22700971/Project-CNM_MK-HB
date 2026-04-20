import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { activateWarranty, getEligibleWarrantyItems, getMyWarranties } from "./warranties.controller";

export const warrantiesRouter = Router();

warrantiesRouter.use(authenticate);
warrantiesRouter.get("/eligible", getEligibleWarrantyItems);
warrantiesRouter.get("/my", getMyWarranties);
warrantiesRouter.post("/activate", activateWarranty);
