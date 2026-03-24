import { Request, Response, NextFunction } from "express";

import { AppError } from "../errors/app-error";

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new AppError("Route not found", 404));
}
