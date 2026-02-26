function useExcelActions({ data, selectedCareer, reloadGroupsFromDb }) {
    async function handleExportExcel() {
        try {
            if (!window.exportSchedulesToExcel) return;
            await window.exportSchedulesToExcel(data);
        } catch (error) {
            console.error("Error exportando calendario Excel:", error);
        }
    }

    async function handleExportExcelDatos() {
        const exportApi = window.api?.exportaciones;
        if (!exportApi?.guardarExcel) {
            window.alert("No se pudo acceder a la API de Electron (preload). Reinicia la app.");
            await window.api?.mensajes?.mostrar?.(
                "No esta disponible la API de exportacion para Excel.",
                "error"
            );
            return;
        }

        const response = await exportApi.guardarExcel({
            defaultFileName: "calendario-bd.xlsx",
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

    async function handleImportExcel() {
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
                `Insertados -> carreras:${ins.carreras || 0}, materias:${ins.materias || 0}, grupos:${ins.grupos || 0}, profesores:${ins.profesores || 0}, salones:${ins.salones || 0}, horarios:${ins.horarios || 0}`,
                `Vinculos -> materia_carrera:${linked.materiaCarrera || 0}, profesor_grupo:${linked.profesorGrupo || 0}, grupo_horario:${linked.grupoHorario || 0}, grupo_salon:${linked.grupoSalon || 0}`,
                `Omitidos -> sin ID clase:${skipped.rowsWithoutClassId || 0}, sin horario encontrado:${skipped.horariosNotFound || 0}, sin docente:${skipped.docentesSinNombre || 0}`
            ].join("\n");

            await window.api?.mensajes?.mostrar?.(message, "info");
            await reloadGroupsFromDb?.();
            return;
        }

        if (!response?.cancelled) {
            await window.api?.mensajes?.mostrar?.(
                `No se pudo importar Excel: ${response?.error || "error desconocido"}`,
                "error"
            );
        }
    }

    async function importUniqueExcelData(entityInput) {
        const exportApi = window.api?.exportaciones;
        if (!exportApi?.importarExcelEntidad) {
            window.alert("No se pudo acceder a la API de importacion por entidad.");
            return;
        }

        const availableEntities = [
            "carreras",
            "materias",
            "grupos",
            "profesores",
            "salones",
            "semestres",
            "horarios"
        ];
        const aliases = {
            carrera: "carreras",
            carreras: "carreras",
            materia: "materias",
            materias: "materias",
            grupo: "grupos",
            grupos: "grupos",
            profesor: "profesores",
            profesores: "profesores",
            docente: "profesores",
            docentes: "profesores",
            salon: "salones",
            salones: "salones",
            semestre: "semestres",
            semestres: "semestres",
            horario: "horarios",
            horarios: "horarios"
        };

        const rawEntity = String(entityInput || "").trim().toLowerCase();
        const entity = aliases[rawEntity] || rawEntity;
        if (!availableEntities.includes(entity)) {
            await window.api?.mensajes?.mostrar?.(
                `Entidad invalida. Usa una de: ${availableEntities.join(", ")}.`,
                "warning"
            );
            return;
        }

        const response = await exportApi.importarExcelEntidad({
            entity,
            carreraNombre: selectedCareer
        });

        if (response?.success) {
            const summary = response.data || {};
            const ins = summary.inserted || {};
            const upd = summary.updated || {};
            const skipped = summary.skipped || {};
            const message = [
                `Importacion parcial finalizada (${entity}).`,
                `Filas procesadas: ${summary.totalRows || 0}`,
                `Insertados -> carreras:${ins.carreras || 0}, semestres:${ins.semestres || 0}, materias:${ins.materias || 0}, grupos:${ins.grupos || 0}, profesores:${ins.profesores || 0}, salones:${ins.salones || 0}, horarios:${ins.horarios || 0}`,
                `Actualizados -> materias:${upd.materias || 0}, grupos:${upd.grupos || 0}`,
                `Omitidos -> sin curso:${skipped.rowsWithoutCourse || 0}, sin ID clase:${skipped.rowsWithoutClassId || 0}, sin semestre:${skipped.rowsWithoutSemestre || 0}`
            ].join("\n");

            await window.api?.mensajes?.mostrar?.(message, "info");
            await reloadGroupsFromDb?.();
            return;
        }

        if (!response?.cancelled) {
            await window.api?.mensajes?.mostrar?.(
                `No se pudo importar Excel por entidad: ${response?.error || "error desconocido"}`,
                "error"
            );
        }
    }

    return {
        handleExportExcel,
        handleExportExcelDatos,
        handleImportExcel,
        importUniqueExcelData
    };
}

window.useExcelActions = useExcelActions;