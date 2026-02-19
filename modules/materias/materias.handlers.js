import { ipcMain } from 'electron';

import {
    altaMateria,
    obtenerMaterias
} from './materias.service.js';

export function registrarMateriasHandlers() {
// --- IPC: Crear materia ---
ipcMain.handle("materias:crear", async (event, data) => {
    try {
        const result = altaMateria(data);
        return { success: true, data: result};
    } catch (error) {
        console.error("Error en materias:crear ->", error);
        return { success: false, error: error.message };
    }
    });

// --- IPC: Listar materias ---
ipcMain.handle("materias:listar", async () => {

  try {
        const materias = await obtenerMaterias();
        return { success: true, data: materias};
    } catch (error) {
        console.error("Error en materias:listar ->", error);
        return { success: false, error: error.message };
    }
    });
}