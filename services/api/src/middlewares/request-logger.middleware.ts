import { NextFunction, Request, Response } from "express";

import { env } from "../config/env";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startedAt = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    const entry = {
      level: res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info",
      service: "api",
      env: env.nodeEnv,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs
    };

    console.log(JSON.stringify(entry));
  });

  next();
}
