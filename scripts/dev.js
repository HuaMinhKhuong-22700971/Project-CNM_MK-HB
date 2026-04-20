const { spawn } = require("node:child_process");

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
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
    shell: true
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
