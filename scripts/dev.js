const { spawn, execSync } = require("node:child_process");
const path = require("node:path");

console.log("\n=======================================================");
console.log("🚀 ĐANG KHỞI ĐỘNG DỰ ÁN PC MALL (BACKEND & FRONTEND)");
console.log("   ➜ Backend API:  http://localhost:4000");
console.log("   ➜ Frontend Web: http://localhost:5173");
console.log("=======================================================\n");

// Ensure Prisma Client is generated
try {
  const rootDir = path.resolve(__dirname, "..");
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  execSync(`${npmCmd} run prisma:generate -w services/api`, { cwd: rootDir, stdio: "ignore" });
} catch (e) {
  // Ignore error if offline
}

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const shellOption = process.platform === "win32" ? "cmd.exe" : true;

const processes = [
  {
    command: npmCommand,
    args: ["run", "dev", "-w", "services/api"]
  },
  {
    command: npmCommand,
    args: ["run", "dev", "-w", "apps/web"]
  }
];

const children = processes.map((processConfig) =>
  spawn(processConfig.command, processConfig.args, {
    stdio: "inherit",
    shell: shellOption
  })
);

function shutdown(signal) {
  for (const child of children) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
}

for (const child of children) {
  child.on("exit", (code) => {
    if (code && code !== 0) {
      process.exitCode = code;
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
