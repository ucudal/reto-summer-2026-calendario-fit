function useExcelActions({ data, selectedCareer, reloadGroupsFromDb }) {
    async function handleExportExcel() {
        try {
            if (!window.exportSchedulesToExcel) return;
            await window.exportSchedulesToExcel(data);
        } catch (error) {
            console.error("Error exportando calendario Excel:", error);
        }
    }

    async function exportInternalExcel() {
        const exportApi = window.api?.exportaciones;
        if (!exportApi?.guardarExcel) {
            window.alert("No se pudo acceder a la API de Electron (preload). Reinicia la app.");
            await window.api?.mensajes?.mostrar?.(
                "No esta disponible la API de exportacion para Excel.",
                "error"
            );
            return;
        }

        const fileName = `calendario-bd-${toExportSafeName(selectedCareer)}-${toExportSafeName("selectedPlan")}.xlsx`;
        const response = await exportApi.guardarExcel({
            defaultFileName: fileName,
            sheetName: "DatosBD",
            filters: {
                carrera: selectedCareer
            }
        });

        if (response?.success) {
            await window.api?.mensajes?.mostrar?.(`Excel exportado en:\n${response.data.path}`, "info");
            return;
        }

        if (!response?.cancelled) {
            await window.api?.mensajes?.mostrar?.(
                `No se pudo exportar Excel: ${response?.error || "error desconocido"}`,
                "error"
            );
        }
    }

    async function importModulosExcel() {
        const exportApi = window.api?.exportaciones;
        if (!exportApi?.importarExcelModulos) {
            window.alert("No se pudo acceder a la API de importacion.");
            return;
        }

        const response = await exportApi.importarExcelModulos({
            carreraNombre: selectedCareer
        });

        if (response?.success) {
            const summary = response.data || {};
            const ins = summary.inserted || {};
            const linked = summary.linked || {};
            const skipped = summary.skipped || {};
            const message = [
                "Importacion finalizada.",
                `Filas procesadas: ${summary.totalRows || 0}`,
                `Insertados -> carreras:${ins.carreras || 0}, materias:${ins.materias || 0}, grupos:${ins.grupos || 0}, profesores:${ins.profesores || 0}, requerimientos:${ins.requerimientos || 0}, horarios:${ins.horarios || 0}`,
                `Vinculos -> materia_carrera:${linked.materiaCarrera || 0}, profesor_grupo:${linked.profesorGrupo || 0}, grupo_req:${linked.grupoReq || 0}, grupo_horario:${linked.grupoHorario || 0}`,
                `Omitidos -> sin ID clase:${skipped.rowsWithoutClassId || 0}, sin horario encontrado:${skipped.horariosNotFound || 0}, sin docente:${skipped.docentesSinNombre || 0}`
            ].join("\n");

            await window.api?.mensajes?.mostrar?.(message, "info");
            await loadCareersFromDb();
            return;
        }

        if (!response?.cancelled) {
            await window.api?.mensajes?.mostrar?.(
                `No se pudo importar Excel: ${response?.error || "error desconocido"}`,
                "error"
            );
        }
    }

    function toExportSafeName(value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-_]/g, "")
            .slice(0, 40) || "sin-filtro";
    }

    return {
        handleExportExcel,
        exportInternalExcel,
        importModulosExcel
    };
}

window.useExcelActions = useExcelActions;