import { ipcMain } from "electron";

import{
    altaGrupo,
    actualizarGrupo,
    bajaGrupo,
    obtenerGrupo,
    listarGruposService
} from './grupos.service.js';

export function registerGruposHandlers() {

    // Crear
    ipcMain.handle('grupos:crear', async (event, data) => {
        try {
            const result = altaGrupo(data);
            return { success: true, data: result };
        } catch (error) {
            console.error("Error en grupos:crear →", error);
            return { success: false, error: error.message };
        }
    });

    // Actualizar
    ipcMain.handle('grupos:actualizar', async (event, data) => {
        try {
            const result = actualizarGrupo(data);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Eliminar
    ipcMain.handle('grupos:eliminar', async (event, id) => {
        try {
            const result = bajaGrupo(id);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Obtener uno
    ipcMain.handle('grupos:obtener', async (event, id) => {
        try {
            const grupo = await obtenerGrupo(id);
            return { success: true, data: grupo };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Listar todos
    ipcMain.handle('grupos:listar', async () => {
        try {
            const grupos = await listarGruposService();
            return { success: true, data: grupos };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });
}