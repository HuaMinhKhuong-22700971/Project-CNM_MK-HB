const path = require("path");
const dotenv = require("dotenv");

const envFilePath = path.resolve(__dirname, "../../.env");

dotenv.config({ path: envFilePath });

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  dbHost: process.env.DB_HOST || "127.0.0.1",
  dbPort: Number(process.env.DB_PORT || 3306),
  dbUser: process.env.DB_USER || "root",
  dbPassword: process.env.DB_PASSWORD || "",
  dbName: process.env.DB_NAME || "cnm_mk_hb",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "change_me_access",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "change_me_refresh",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-5.2"
};

module.exports = { env };
