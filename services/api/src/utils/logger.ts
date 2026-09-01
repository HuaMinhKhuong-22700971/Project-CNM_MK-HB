import { env } from "../config/env";

export const logger = {
  error(err: Error | any, context: Record<string, any> = {}) {
    const payload = {
      level: "ERROR",
      timestamp: new Date().toISOString(),
      name: err?.name || "UnhandledError",
      message: err?.message || String(err),
      stack: err?.stack || null,
      ...context
    };

    console.error("[BACKEND ERROR TRACKER]:", JSON.stringify(payload));

    // Optional Sentry integration when SENTRY_DSN environment variable is present
    if (process.env.SENTRY_DSN) {
      try {
        const Sentry = require("@sentry/node");
        Sentry.captureException(err, { extra: context });
      } catch (_e) {
        // Sentry package optional
      }
    }
  },

  warn(message: string, context: Record<string, any> = {}) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, context);
  },

  info(message: string, context: Record<string, any> = {}) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, context);
  }
};
