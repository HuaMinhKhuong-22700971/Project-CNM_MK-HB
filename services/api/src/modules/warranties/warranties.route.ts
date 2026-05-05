import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { activateWarranty, getEligibleWarrantyItems, getMyWarranties, lookupWarranty } from "./warranties.controller";

export const warrantiesRouter = Router();

// Public routes
warrantiesRouter.get("/lookup/:code", lookupWarranty);

// Private routes
warrantiesRouter.use(authenticate);
warrantiesRouter.get("/eligible", getEligibleWarrantyItems);
warrantiesRouter.get("/my", getMyWarranties);
warrantiesRouter.post("/activate", activateWarranty);
