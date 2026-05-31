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

  app.set("etag", false);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: {
        directives: {
          "img-src": ["'self'", "data:", "blob:", "http://localhost:4000", "http://localhost:5173"],
          "media-src": ["'self'", "blob:", "http://localhost:4000", "http://localhost:5173"]
        }
      }
    })
  );
  app.use(cors({ origin: env.frontendUrl, credentials: true }));
  app.use(requestLogger);
  app.use(express.json());

  app.use("/api", (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
  });
  
  // Serve static files from uploads directory
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
  
  app.use("/api", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
