const { spawn } = require("child_process");
const path = require("path");

delete process.env.ELECTRON_RUN_AS_NODE;

const electronBinary = require("electron");
const entryArg = process.argv[2] || ".";
const resolvedEntry = entryArg === "." ? "." : path.resolve(entryArg);

const child = spawn(electronBinary, [resolvedEntry], {
  stdio: "inherit",
  env: process.env
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error("No se pudo iniciar Electron:", error);
  process.exit(1);
});
