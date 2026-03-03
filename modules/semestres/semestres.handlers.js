import { ipcMain } from "electron";
import {
  crearSemestreLectivoService,
  listarSemestresLectivosService
} from "./semestres.service.js";

export function registerSemestresHandlers() {
  ipcMain.handle("semestres:listarLectivos", async () => {
    try {
      const semestres = await listarSemestresLectivosService();
      return { success: true, data: semestres };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("semestres:crearLectivo", async (_, payload) => {
    try {
      const created = await crearSemestreLectivoService(payload);
      return { success: true, data: created };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}
