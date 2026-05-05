import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env";
import { AppError } from "../errors/app-error";
import type { AuthTokenPayload } from "../types/auth";
import type { Role } from "../constants/roles";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // Public route exemptions
  if (req.path.includes("/warranties/lookup/") || req.path.includes("/ai-advisor/")) {
    return next();
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Unauthorized", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as AuthTokenPayload;
    req.user = payload;
    return next();
  } catch (_error) {
    return next(new AppError("Invalid or expired token", 401));
  }
}

export function authorize(allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      return next(new AppError("Forbidden", 403));
    }

    return next();
  };
}
