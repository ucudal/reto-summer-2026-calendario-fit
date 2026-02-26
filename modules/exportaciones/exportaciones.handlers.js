import { writeFile } from "node:fs/promises";
import { listarFilasExportacionDesdeDb } from "./exportaciones.repository.js";
import { ipcMain, dialog } from "electron";
import { importarDatosUnicosDesdeExcel, importarModulosDesdeExcel } from "./importaciones.service.js";

let xlsxModulePromise = null;

async function getXlsxModule() {
  if (!xlsxModulePromise) {
    xlsxModulePromise = import("xlsx");
  }
  const mod = await xlsxModulePromise;
  return mod.default || mod;
}

let xlsxModulePromise = null;

async function getXlsxModule() {
  if (!xlsxModulePromise) {
    xlsxModulePromise = import("xlsx");
  }
  const mod = await xlsxModulePromise;
  return mod.default || mod;
}

export function registerExportacionesHandlers() {
  ipcMain.handle("exportaciones:guardarExcel", async (event, payload = {}) => {
    try {
      const XLSX = await getXlsxModule();

      const {
        defaultFileName = "calendario-bd.xlsx",
        sheetName = "Datos",
        filters = {}
      } = payload;

      const safeFileName = defaultFileName.toLowerCase().endsWith(".xlsx")
        ? defaultFileName
        : `${defaultFileName}.xlsx`;

      const win = event.sender.getOwnerBrowserWindow();
      const result = await dialog.showSaveDialog(win, {
        title: "Exportar Excel interno",
        defaultPath: safeFileName,
        filters: [{ name: "Excel", extensions: ["xlsx"] }]
      });

      if (result.canceled || !result.filePath) {
        return { success: false, cancelled: true };
      }

      const exportedAt = new Date().toISOString();
      let dbRows = listarFilasExportacionDesdeDb(filters);
      let filtrosAplicados = { ...filters };
      if (dbRows.length === 0 && filters.plan) {
        filtrosAplicados = { ...filters, plan: "" };
        dbRows = listarFilasExportacionDesdeDb(filtrosAplicados);
      }

      const headers = [
        "fecha_exportacion",
        "grupo_id",
        "grupo_codigo",
        "grupo_color",
        "grupo_idSemestre",
        "grupo_cupo",
        "grupo_horas_semestrales",
        "grupo_es_contrasemestre",
        "materia_id",
        "materia_nombre",
        "materia_tipo",
        "materia_creditos",
        "materia_tiene_contrasemestre",
        "carrera_id",
        "carrera_nombre",
        "plan_nombre",
        "plan_anio",
        "plan_semestre",
        "horarios",
        "docentes",
        "salones",
        "requerimientos"
      ];

      const rows = dbRows.map((row) => ({
        fecha_exportacion: exportedAt,
        grupo_id: row.grupo_id,
        grupo_codigo: row.grupo_codigo,
        grupo_color: row.grupo_color,
        grupo_idSemestre: row.grupo_idSemestre,
        grupo_cupo: row.grupo_cupo,
        grupo_horas_semestrales: row.grupo_horas_semestrales,
        grupo_es_contrasemestre: row.grupo_es_contrasemestre,
        materia_id: row.materia_id,
        materia_nombre: row.materia_nombre,
        materia_tipo: row.materia_tipo,
        materia_creditos: row.materia_creditos,
        materia_tiene_contrasemestre: row.materia_tiene_contrasemestre,
        carrera_id: row.carrera_id,
        carrera_nombre: row.carrera_nombre,
        plan_nombre: row.plan_nombre,
        plan_anio: row.plan_anio,
        plan_semestre: row.plan_semestre,
        horarios: row.horarios || null,
        docentes: row.docentes || null,
        salones: row.salones || null,
        requerimientos: row.requerimientos || null
      }));

      const fuentes = [
        { columna: "grupo_*", fuente_bd: "tabla grupos" },
        { columna: "materia_*", fuente_bd: "tabla materias (join grupos.id_materia = materias.id)" },
        { columna: "carrera_*", fuente_bd: "tablas materia_carrera + carreras" },
        { columna: "plan_*", fuente_bd: "tabla materia_carrera" },
        { columna: "horarios", fuente_bd: "tablas grupo_horario + horarios (GROUP_CONCAT)" },
        { columna: "docentes", fuente_bd: "tablas profesor_grupo + profesores (GROUP_CONCAT)" },
        { columna: "salones", fuente_bd: "tablas salon_grupo + salones (GROUP_CONCAT)" },
        { columna: "requerimientos", fuente_bd: "tabla materias" },
        { columna: "fecha_exportacion", fuente_bd: "timestamp generado al exportar" },
        { columna: "filtros_aplicados", fuente_bd: JSON.stringify(filtrosAplicados) }
      ];

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(rows, {
        header: headers
      });
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      const sourceSheet = XLSX.utils.json_to_sheet(fuentes, {
        header: ["columna", "fuente_bd"]
      });
      XLSX.utils.book_append_sheet(workbook, sourceSheet, "Fuentes");

      const workbookBuffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx"
      });
      await writeFile(result.filePath, workbookBuffer);

      return { success: true, data: { path: result.filePath } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("exportaciones:importarExcelModulos", async (event, payload = {}) => {
    try {
      const win = event.sender.getOwnerBrowserWindow();
      let filePath = payload.filePath;
      if (!filePath) {
        const picker = await dialog.showOpenDialog(win, {
          title: "Seleccionar Excel de modulos",
          properties: ["openFile"],
          filters: [{ name: "Excel", extensions: ["xlsx"] }]
        });
        if (picker.canceled || !picker.filePaths || picker.filePaths.length === 0) {
          return { success: false, cancelled: true };
        }
        filePath = picker.filePaths[0];
      }

      const summary = importarModulosDesdeExcel(filePath, {
        carreraNombre: payload.carreraNombre
      });

      return { success: true, data: summary };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("exportaciones:importarExcelEntidad", async (event, payload = {}) => {
    try {
      const win = event.sender.getOwnerBrowserWindow();
      let filePath = payload.filePath;
      if (!filePath) {
        const picker = await dialog.showOpenDialog(win, {
          title: "Seleccionar Excel de modulos",
          properties: ["openFile"],
          filters: [{ name: "Excel", extensions: ["xlsx"] }]
        });
        if (picker.canceled || !picker.filePaths || picker.filePaths.length === 0) {
          return { success: false, cancelled: true };
        }
        filePath = picker.filePaths[0];
      }

      const summary = importarDatosUnicosDesdeExcel(filePath, {
        entity: payload.entity,
        carreraNombre: payload.carreraNombre,
        color: payload.color
      });

      return { success: true, data: summary };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

}
