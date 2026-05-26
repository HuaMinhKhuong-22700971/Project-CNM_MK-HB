import { NextFunction, Request, Response, Router } from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";

import { env } from "../../config/env";
import { AppError } from "../../errors/app-error";
import { authenticate, authorize, ROLES } from "../../middlewares/auth.middleware";
import {
  activateWarranty,
  getAdminWarrantyRequests,
  getEligibleWarrantyItems,
  getMyWarrantyNotifications,
  getMyWarrantyRequests,
  getMyWarranties,
  lookupWarranty,
  submitWarrantyRequest,
  updateAdminWarrantyRequest
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
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: (_req: Request, file: { mimetype: string }, cb: (error: Error | null, acceptFile?: boolean) => void) => {
    if (/^(image|video)\//.test(file.mimetype) || file.mimetype === "application/pdf") {
      cb(null, true);
      return;
    }
    cb(new AppError("Chỉ chấp nhận ảnh, video hoặc PDF minh chứng", 400));
  }
});

const uploadWarrantyMediaMiddleware = uploadWarrantyMediaFile.array("media", 5);
const memoryRateLimits = new Map<string, number[]>();

function getClientKey(req: Request) {
  const forwarded = String(req.headers["x-forwarded-for"] || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)[0];
  return forwarded || req.ip || req.socket.remoteAddress || "unknown";
}

function createGuestRateLimit(prefix: string, max: number, windowMs: number) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.user?.userId) {
      next();
      return;
    }

    const key = `${prefix}:${getClientKey(req)}`;
    const now = Date.now();
    const windowStart = now - windowMs;
    const hits = (memoryRateLimits.get(key) || []).filter((timestamp) => timestamp > windowStart);

    if (hits.length >= max) {
      next(new AppError("Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.", 429));
      return;
    }

    hits.push(now);
    memoryRateLimits.set(key, hits);
    next();
  };
}

function basicAntiSpam(req: Request, _res: Response, next: NextFunction) {
  const honeypot = String(req.body?.website || "").trim();
  if (honeypot) {
    next(new AppError("Không thể xử lý yêu cầu này", 400));
    return;
  }

  const startedAt = Number(req.body?.startedAt || 0);
  if (startedAt && Date.now() - startedAt < 1500) {
    next(new AppError("Biểu mẫu được gửi quá nhanh. Vui lòng thử lại.", 400));
    return;
  }

  next();
}

function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    next();
    return;
  }

  try {
    req.user = jwt.verify(authHeader.split(" ")[1], env.jwtAccessSecret) as any;
  } catch {
    // Keep guest lookup/request available even with stale token.
  }
  next();
}

function handleWarrantyUpload(req: Request, res: Response, next: NextFunction) {
  uploadWarrantyMediaMiddleware(req, res, (error: any) => {
    if (!error) {
      next();
      return;
    }
    if (error?.code === "LIMIT_FILE_SIZE") {
      next(new AppError("Mỗi tệp minh chứng phải nhỏ hơn hoặc bằng 10MB", 400));
      return;
    }
    next(error);
  });
}

warrantiesRouter.get("/lookup/:code", optionalAuthenticate, createGuestRateLimit("guest-warranty-lookup", 20, 60 * 1000), lookupWarranty);
warrantiesRouter.get("/lookup", optionalAuthenticate, createGuestRateLimit("guest-warranty-lookup", 20, 60 * 1000), lookupWarranty);
warrantiesRouter.post(
  "/request",
  optionalAuthenticate,
  handleWarrantyUpload,
  createGuestRateLimit("guest-warranty-request", 5, 15 * 60 * 1000),
  basicAntiSpam,
  submitWarrantyRequest
);

warrantiesRouter.use(authenticate);
warrantiesRouter.get("/eligible", getEligibleWarrantyItems);
warrantiesRouter.get("/my", getMyWarranties);
warrantiesRouter.get("/requests/my", getMyWarrantyRequests);
warrantiesRouter.get("/notifications/my", getMyWarrantyNotifications);
warrantiesRouter.post("/activate", activateWarranty);
warrantiesRouter.get("/admin/requests", authorize([ROLES.ADMIN, ROLES.TECH_STAFF, ROLES.SALES_STAFF]), getAdminWarrantyRequests);
warrantiesRouter.patch(
  "/admin/requests/:requestId",
  authorize([ROLES.ADMIN, ROLES.TECH_STAFF, ROLES.SALES_STAFF]),
  handleWarrantyUpload,
  updateAdminWarrantyRequest
);
