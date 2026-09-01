/**
 * Global Frontend Error Tracker & Reporting Utility (Sentry Ready)
 */
export const errorLogger = {
  captureError(error, context = {}) {
    const errorData = {
      message: error?.message || String(error),
      stack: error?.stack || null,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      ...context
    };

    console.error("[FRONTEND ERROR TRACKER]:", errorData);

    // Optional Sentry integration when window.Sentry is loaded
    if (typeof window !== "undefined" && window.Sentry && typeof window.Sentry.captureException === "function") {
      window.Sentry.captureException(error, { extra: context });
    }

    // Persist last 10 runtime errors in sessionStorage for user support trace
    try {
      const logs = JSON.parse(sessionStorage.getItem("pcmall_error_logs") || "[]");
      logs.unshift(errorData);
      sessionStorage.setItem("pcmall_error_logs", JSON.stringify(logs.slice(0, 10)));
    } catch (_e) {
      // Ignore storage errors
    }
  }
};
