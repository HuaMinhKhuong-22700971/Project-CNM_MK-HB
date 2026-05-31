const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  return argv.reduce((result, arg) => {
    if (arg === "--force") {
      result.force = true;
      return result;
    }

    if (arg === "--http") {
      result.protocol = "http";
      return result;
    }

    if (arg.startsWith("--domain=")) {
      result.domain = arg.slice("--domain=".length).trim();
      return result;
    }

    if (arg.startsWith("--output=")) {
      result.output = arg.slice("--output=".length).trim();
      return result;
    }

    return result;
  }, {
    domain: "",
    output: ".env",
    protocol: "https",
    force: false
  });
}

function randomSecret(bytes = 36) {
  return crypto.randomBytes(bytes).toString("base64url");
}

function normalizeDomain(domain) {
  return domain
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "")
    .trim();
}

const args = parseArgs(process.argv.slice(2));
const domain = normalizeDomain(args.domain);

if (!domain) {
  console.error("Usage: npm run prod:create-env -- --domain=yourdomain.com [--http] [--force]");
  process.exit(1);
}

const rootDir = process.cwd();
const outputPath = path.resolve(rootDir, args.output);
const examplePath = path.resolve(rootDir, "env.production.example");

if (!fs.existsSync(examplePath)) {
  console.error("Missing env.production.example");
  process.exit(1);
}

if (fs.existsSync(outputPath) && !args.force) {
  console.error(`${args.output} already exists. Use --force to overwrite.`);
  process.exit(1);
}

const baseUrl = `${args.protocol}://${domain}`;
const replacements = {
  MYSQL_ROOT_PASSWORD: randomSecret(32),
  MYSQL_DATABASE: "cnm_mk_hb",
  MYSQL_USER: "cnm_user",
  MYSQL_PASSWORD: randomSecret(32),
  JWT_ACCESS_SECRET: randomSecret(48),
  JWT_REFRESH_SECRET: randomSecret(48),
  FRONTEND_URL: baseUrl,
  API_BASE_URL: `${baseUrl}/api`,
  VNPAY_TMN_CODE: "",
  VNPAY_HASH_SECRET: "",
  VNPAY_URL: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  PAYMENT_MOCK_MODE: "false",
  SHIPPING_MOCK_MODE: "false",
  SHIPPING_PROVIDER: "manual",
  OPENAI_API_KEY: "",
  OPENAI_MODEL: "gpt-4o-mini"
};

const nextContent = fs.readFileSync(examplePath, "utf8")
  .split(/\r?\n/)
  .map((line) => {
    const trimmed = line.trim();
    const separatorIndex = trimmed.indexOf("=");

    if (!trimmed || trimmed.startsWith("#") || separatorIndex === -1) {
      return line;
    }

    const key = trimmed.slice(0, separatorIndex).trim();

    if (!Object.prototype.hasOwnProperty.call(replacements, key)) {
      return line;
    }

    return `${key}=${replacements[key]}`;
  })
  .join("\n");

fs.writeFileSync(outputPath, `${nextContent.trimEnd()}\n`, { encoding: "utf8", flag: "w" });

console.log(`Created ${args.output} for ${baseUrl}`);
console.log("Review VNPay/OpenAI values before using real payment or AI services.");
