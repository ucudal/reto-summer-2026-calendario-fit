import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";


//import { runMigrations } from "./db/migrations.js";
import { registerAllHandlers } from "../modules/registerHandlers.js";

// recrear __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  //win.loadFile(path.join(__dirname, "renderer(old)", "index.html"));
  win.loadURL("http://localhost:5173");
  //Para production 
  //mainWindow.loadFile("renderer/dist/index.html");
}

app.whenReady().then(() => {
  //runMigrations();
  registerAllHandlers();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
