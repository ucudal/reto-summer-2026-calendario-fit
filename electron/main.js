import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { initializeDatabase } from "../db/init.js";
import { runMigrations } from "../db/runMigrations.js";


//import { runMigrations } from "./db/migrations.js";
import { registerAllHandlers } from "../modules/registerHandlers.js";

// recrear __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1820,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const fallbackFile = path.join(__dirname, "..", "front", "index.html");
  const devUrl = process.env.ELECTRON_RENDERER_URL || "http://localhost:5173";
  let triedFallback = false;

  // Si falla el URL (por ejemplo Vite apagado), carga front/index.html.
  win.webContents.on("did-fail-load", () => {
    if (triedFallback) return;
    triedFallback = true;
    win.loadFile(fallbackFile).catch((error) => {
      console.error("No se pudo cargar el fallback front/index.html:", error);
    });
  });

  win
    .loadURL(devUrl)
    .catch(() => {
      if (triedFallback) return;
      triedFallback = true;
      return win.loadFile(fallbackFile);
    });
}

app.whenReady().then(async () => {
  try {
    runMigrations();
    await initializeDatabase();
    registerAllHandlers();
    createWindow();
  } catch (error) {
    console.error("Error al iniciar la app:", error);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
