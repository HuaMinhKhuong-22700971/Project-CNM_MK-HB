import { NextFunction, Request, Response, Router } from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { env } from "../../config/env";
import { authenticate } from "../../middlewares/auth.middleware";
import { AppError } from "../../errors/app-error";
import {
  activateWarranty,
  getEligibleWarrantyItems,
  getMyWarrantyRequests,
  getMyWarranties,
  lookupWarranty,
  submitWarrantyRequest
} from "./warranties.controller";

export const warrantiesRouter = Router();

const warrantyMediaStorage = multer.diskStorage({
  destination: (_req: Request, _file: { originalname: string }, cb: (error: Error | null, destination: string) => void) => {
    const uploadsDir = path.join(__dirname, "../../../uploads/warranty-requests");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (_req: Request, file: { originalname: string }, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `warranty-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const uploadWarrantyMediaFile = multer({
  storage: warrantyMediaStorage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req: Request, file: { mimetype: string }, cb: (error: Error | null, acceptFile?: boolean) => void) => {
    if (/^(image|video)\//.test(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new AppError("Only image or video proof files are allowed", 400));
  }
});

const uploadWarrantyMediaMiddleware = uploadWarrantyMediaFile.single("media");

function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    next();
    return;
  }

  try {
    req.user = jwt.verify(authHeader.split(" ")[1], env.jwtAccessSecret) as any;
  } catch (_error) {
    // Guest warranty requests must remain available even when an old token exists.
  }
  next();
}

// Public routes
warrantiesRouter.get("/lookup/:code", lookupWarranty);
warrantiesRouter.get("/lookup", lookupWarranty);
warrantiesRouter.post("/request", optionalAuthenticate, (req: Request, res: Response, next: NextFunction) => {
  uploadWarrantyMediaMiddleware(req, res, (error: any) => {
    if (!error) {
      next();
      return;
    }
    if (error?.code === "LIMIT_FILE_SIZE") {
      next(new AppError("Warranty proof file must be 25MB or smaller", 400));
      return;
    }
    next(error);
  });
}, submitWarrantyRequest);

// Private routes
warrantiesRouter.use(authenticate);
warrantiesRouter.get("/eligible", getEligibleWarrantyItems);
warrantiesRouter.get("/my", getMyWarranties);
warrantiesRouter.get("/requests/my", getMyWarrantyRequests);
warrantiesRouter.post("/activate", activateWarranty);
