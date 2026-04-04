import { Router } from "express";
import { suggestBuild } from "./ai-advisor.controller";

export const aiAdvisorRouter = Router();

aiAdvisorRouter.post("/suggest-build", suggestBuild);
