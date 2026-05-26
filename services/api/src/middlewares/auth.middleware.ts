import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env";
import { AppError } from "../errors/app-error";
import type { AuthTokenPayload } from "../types/auth";
import { ROLES, type Role } from "../constants/roles";

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

const ROLE_ALIASES: Record<string, Role> = {
  TECHNICIAN: ROLES.TECH_STAFF,
  TECH_STAFF: ROLES.TECH_STAFF,
  SALES: ROLES.SALES_STAFF,
  SALES_STAFF: ROLES.SALES_STAFF
};

function normalizeAuthRole(role?: string): Role | string {
  const normalized = String(role || "")
    .trim()
    .toUpperCase();
  return ROLE_ALIASES[normalized] || normalized;
}

function isRoleAllowed(userRole: string | undefined, allowedRoles: Role[]) {
  const normalizedUserRole = normalizeAuthRole(userRole);
  return allowedRoles.some((allowed) => normalizeAuthRole(allowed) === normalizedUserRole);
}

export function authorize(allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    if (!isRoleAllowed(req.user.role, allowedRoles)) {
      return next(new AppError("Forbidden", 403));
    }

    return next();
  };
}

export const verifyToken = authenticate;
export const requireAuth = authenticate;

export function requireRole(...allowedRoles: Role[]) {
  return authorize(allowedRoles);
}

export { ROLES };
