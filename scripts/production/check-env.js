const fs = require("fs");
const path = require("path");

const envFile = process.env.ENV_FILE || ".env";
const envPath = path.resolve(process.cwd(), envFile);

const requiredKeys = [
  "MYSQL_ROOT_PASSWORD",
  "MYSQL_DATABASE",
  "MYSQL_USER",
  "MYSQL_PASSWORD",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "FRONTEND_URL",
  "API_BASE_URL"
];

const strongKeys = [
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "MYSQL_ROOT_PASSWORD",
  "MYSQL_PASSWORD"
];

function parseEnv(content) {
  return content.split(/\r?\n/).reduce((result, line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      return result;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      return result;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
    return result;
  }, {});
}

function isPlaceholder(value) {
  return /^(your_|replace_|change_me)/i.test(value);
}

function assertUrl(key, value) {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("invalid protocol");
    }
  } catch (_error) {
    throw new Error(`${key} must be a valid http(s) URL`);
  }
}

if (!fs.existsSync(envPath)) {
  console.error(`Missing ${envFile}. Copy env.production.example to .env and fill production values.`);
  process.exit(1);
}

const values = parseEnv(fs.readFileSync(envPath, "utf8"));

for (const key of requiredKeys) {
  const value = values[key];

  if (!value) {
    console.error(`Missing or empty required value in ${envFile}: ${key}`);
    process.exit(1);
  }

  if (isPlaceholder(value)) {
    console.error(`Placeholder value still present in ${envFile}: ${key}`);
    process.exit(1);
  }
}

for (const key of strongKeys) {
  if (values[key].length < 24) {
    console.error(`${key} should be at least 24 characters long`);
    process.exit(1);
  }
}

assertUrl("FRONTEND_URL", values.FRONTEND_URL);
assertUrl("API_BASE_URL", values.API_BASE_URL);

console.log("Production environment check passed.");
