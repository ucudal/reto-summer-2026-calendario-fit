import { ipcMain } from 'electron';

import * as materiasService from './materias.service.js';

export function registrarMateriasHandlers() {
    // --- IPC: Crear materia ---
    ipcMain.handle("materias:crear", async (_, data) => {
        try {
            const result = await materiasService.altaMateria(data);
            return { success: true, data: result};
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // --- IPC: Listar materias ---
    ipcMain.handle("materias:listar", async () => {
        try {
            const materias = await materiasService.obtenerMaterias();
            return { success: true, data: materias};
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // --- IPC: Listar carreras-plan de una materia por nombre ---
    ipcMain.handle("materias:listarCarrerasPlanes", async (_, nombreMateria) => {
        try {
            const rows = await materiasService.obtenerCarrerasPlanesPorMateriaNombre(nombreMateria);
            return { success: true, data: rows };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // --- IPC: Obtener materia por ID ---
    ipcMain.handle("materias:obtenerPorId", async (_, id) => {
        try {
            const materia = await materiasService.obtenerMateriaPorId(id);
            return { success: true, data: materia};
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // --- IPC: Actualizar materia ---
    ipcMain.handle("materias:actualizar", async (_, { id, datos }) => {
        try {
            const result = await materiasService.actualizarMateria(id, datos);
            return { success: true, data: result};
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // --- IPC: Eliminar materia ---
    ipcMain.handle("materias:eliminar", async (_, id) => {
        try {
            const result = await materiasService.bajaMateria(id);
            return { success: true, data: result};
        } catch (error) {
            return { success: false, error: error.message };
        }
    });
}
