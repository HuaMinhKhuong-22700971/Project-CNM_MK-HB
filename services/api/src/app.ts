import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";
import { notFoundHandler } from "./middlewares/not-found.middleware";
import { requestLogger } from "./middlewares/request-logger.middleware";
import { apiRouter } from "./routes";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.frontendUrl, credentials: true }));
  app.use(requestLogger);
  app.use(express.json());
  
  // Serve static files from uploads directory
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
  
  app.use("/api", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
