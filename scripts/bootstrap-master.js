const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("============================================================");
console.log(" 🚀 PC MALL SMART PC BUILDER — MASTER 1-CLICK BOOTSTRAP");
console.log("============================================================");

// 1. Verify .env
const rootEnv = path.join(__dirname, "../.env");
const exampleEnv = path.join(__dirname, "../.env.example");
const apiEnv = path.join(__dirname, "../services/api/.env");

if (!fs.existsSync(rootEnv) && fs.existsSync(exampleEnv)) {
  console.log("--> Creating .env file from .env.example...");
  fs.copyFileSync(exampleEnv, rootEnv);
}

if (!fs.existsSync(apiEnv) && fs.existsSync(rootEnv)) {
  fs.copyFileSync(rootEnv, apiEnv);
}

// Helper to run commands
function run(cmd, cwd = path.join(__dirname, "..")) {
  console.log(`--> Running: ${cmd}`);
  const shellOption = process.platform === "win32" ? "cmd.exe" : true;
  execSync(cmd, { stdio: "inherit", cwd, shell: shellOption });
}

try {
  // 2. Install workspace dependencies
  console.log("--> Installing dependencies...");
  run("npm install");

  // 3. Generate Prisma Client
  console.log("--> Generating Prisma Client...");
  try {
    run("npm run prisma:generate -w services/api");
  } catch (_e) {
    console.log("--> Note: Prisma generate skipped (client already present or file locked).");
  }

  // 4. Ensure Stock
  console.log("--> Ensuring hardware stock...");
  try {
    run("npm run stock:ensure -w services/api");
  } catch (_e) {
    console.log("--> Note: Stock ensure skipped or DB offline.");
  }

  console.log("============================================================");
  console.log(" ✅ BOOTSTRAP COMPLETE! Launching application servers...");
  console.log("============================================================");

  // 5. Start dev server
  const devProcess = spawn("node", ["scripts/dev.js"], {
    stdio: "inherit",
    shell: process.platform === "win32" ? "cmd.exe" : true,
    cwd: path.join(__dirname, "..")
  });
  
  devProcess.on("exit", (code) => {
    process.exit(code || 0);
  });
} catch (err) {
  console.error("❌ Bootstrap failed:", err.message);
  process.exit(1);
}
