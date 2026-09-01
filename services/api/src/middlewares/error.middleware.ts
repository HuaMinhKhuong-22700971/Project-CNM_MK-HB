import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { AppError } from "../errors/app-error";
import { logger } from "../utils/logger";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    const firstIssue = err.issues[0];
    const firstField = firstIssue?.path?.join(".");
    const firstMessage = firstIssue
      ? `${firstField ? `${firstField}: ` : ""}${firstIssue.message}`
      : "Dữ liệu không hợp lệ";

    return res.status(400).json({
      success: false,
      message: firstMessage,
      errors: err.flatten()
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Resource already exists"
      });
    }

    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Resource not found"
      });
    }
  }

  const statusCode = err instanceof AppError ? err.statusCode : ((err as any).statusCode || 500);

  if (statusCode === 500) {
    logger.error(err, {
      url: req.originalUrl || req.url,
      method: req.method,
      userId: (req as any).user?.userId || (req as any).user?.id || null,
      ip: req.ip
    });
  }

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error"
  });
}
