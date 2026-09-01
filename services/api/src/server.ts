import { createServer } from "http";
import { createApp } from "./app";
import { env } from "./config/env";
import { initSocketIO } from "./socket/socket.service";
import { verifyEmailConnection } from "./services/email.service";
import pcBuilderService from "./modules/pc-builder/pc-builder.service";

const app = createApp();
const httpServer = createServer(app);

// Initialize Socket.io on the same HTTP server as Express
initSocketIO(httpServer, env.frontendUrl);

httpServer.listen(env.port, () => {
  console.log(`API running at http://localhost:${env.port}`);
  console.log(`Socket.io ready at ws://localhost:${env.port}`);
  
  if (env.geminiApiKey || env.openaiApiKey) {
    console.log(`[AI Advisor] LLM API Engine active (${env.geminiApiKey ? "Google Gemini 1.5 Flash" : "OpenAI GPT-4o-mini"})`);
  } else {
    console.log(`[AI Advisor] Notice: GEMINI_API_KEY & OPENAI_API_KEY are empty. AI Advisor will fallback to PC Mall Rule-Based Knowledge Engine.`);
  }

  // Ensure DB columns once on startup (non-blocking)
  pcBuilderService.ensurePcBuildColumns().catch((err) => {
    console.warn("[PC Builder] Startup column check notice:", err.message);
  });

  // Verify email config on startup (non-blocking)
  verifyEmailConnection();
});

