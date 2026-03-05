import { ipcMain } from "electron";
import {
  crearSemestreLectivoService,
  listarSemestresLectivosService,
  replicarSemestreService
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

  ipcMain.handle("semestres:replicar", async (_, payload) => {
    try {
      const result = await replicarSemestreService(payload);
      return { success: true, data: result };
    } catch (error) {
      console.error("Error en semestres:replicar \u2192", error);
      return { success: false, error: error.message };
    }
  });
}
