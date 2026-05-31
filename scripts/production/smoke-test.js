const fs = require("fs");
const path = require("path");

const envFile = process.env.ENV_FILE || ".env";
const envPath = path.resolve(process.cwd(), envFile);
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS || 10000);

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

function joinUrl(base, suffix) {
  return `${base.replace(/\/+$/, "")}/${suffix.replace(/^\/+/, "")}`;
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function assertHttpOk(label, url, validate) {
  let response;

  try {
    response = await fetchWithTimeout(url);
  } catch (error) {
    throw new Error(`${label} failed to connect: ${url} (${error.message || error})`);
  }

  if (!response.ok) {
    throw new Error(`${label} failed: ${response.status} ${response.statusText} (${url})`);
  }

  if (validate) {
    await validate(response);
  }

  console.log(`${label} ok: ${url}`);
}

if (!fs.existsSync(envPath)) {
  console.error(`Missing ${envFile}. Run npm run prod:check-env first.`);
  process.exit(1);
}

const env = parseEnv(fs.readFileSync(envPath, "utf8"));
const frontendUrl = env.FRONTEND_URL;
const apiBaseUrl = env.API_BASE_URL;

if (!frontendUrl || !apiBaseUrl) {
  console.error("FRONTEND_URL and API_BASE_URL are required for smoke test.");
  process.exit(1);
}

(async () => {
  await assertHttpOk("Frontend", frontendUrl);
  await assertHttpOk("API health", joinUrl(apiBaseUrl, "health"), async (response) => {
    const data = await response.json();

    if (data.status !== "ok") {
      throw new Error(`API health is not ok: ${JSON.stringify(data)}`);
    }
  });

  console.log("Production smoke test passed.");
})().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
