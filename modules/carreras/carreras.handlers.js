import { ipcMain } from 'electron';

import {
  altaCarrera,
  actualizarCarrera,
  bajaCarrera,
  obtenerCarrera,
  obtenerCarreras
} from './carreras.service.js';

export function registerCarrerasHandlers() {
  ipcMain.handle('carreras:crear', async (event, data) => {
    try {
      const result = altaCarrera(data);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error en carreras:crear ->', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('carreras:actualizar', async (event, data) => {
    try {
      const result = actualizarCarrera(data);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('carreras:eliminar', async (event, id) => {
    try {
      const result = bajaCarrera(id);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('carreras:obtener', async (event, id) => {
    try {
      const carrera = await obtenerCarrera(id);
      return { success: true, data: carrera };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('carreras:listar', async () => {
    try {
      const carreras = await obtenerCarreras();
      return { success: true, data: carreras };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}
