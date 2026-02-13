import { ipcMain } from 'electron';

import {
  altaDocente,
  actualizarDocente,
  bajaDocente,
  obtenerDocente,
  obtenerDocentes
} from './docentes.service.js';


export function registerDocentesHandlers() {

  // Crear
  ipcMain.handle('docentes:crear', async (event, data) => {
    try {
      const result = altaDocente(data);
      return { success: true, data: result };
    } catch (error) {
        console.error("Error en docentes:crear →", error);
      return { success: false, error: error.message };
    }
  });


  // Actualizar
  ipcMain.handle('docentes:actualizar', async (event, data) => {
    try {
      const result = actualizarDocente(data);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });


  // Eliminar
  ipcMain.handle('docentes:eliminar', async (event, id) => {
    try {
      const result = bajaDocente(id);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });


  // Obtener uno
  ipcMain.handle('docentes:obtener', async (event, id) => {
    try {
      const docente = await obtenerDocente(id);
      return { success: true, data: docente };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });


  // Listar todos
  ipcMain.handle('docentes:listar', async () => {
  try {
    const docentes = await obtenerDocentes();
    return { success: true, data: docentes };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

}
