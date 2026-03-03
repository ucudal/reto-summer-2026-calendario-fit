/*
  Hook: useExcelActions
  - Export visual calendario (plan fijo 2026)
  - Export datos BD (Electron)
  - Import completo
  - Import por entidad
*/

function useExcelActions(params) {
    const {
        data,
        selectedCareer,
        selectedLectiveTerm, // 👈 viene del dropdown
        reloadGroupsFromDb,
        reloadCareersFromDb
    } = params;

    /*
      -----------------------------------------
      Helpers
      -----------------------------------------
    */

    const getFallbackSelectedCareer = React.useCallback(function () {
        if (selectedCareer) return selectedCareer;

        const careers = data?.careers || [];
        if (careers.length > 0) {
            const first = careers[0];

            if (typeof first === "string") return first;
            if (typeof first === "object") return first.name || first.id || "";
        }

        return "";
    }, [data, selectedCareer]);

    /*
      -----------------------------------------
      1️⃣ Export visual (Excel calendario)
      -----------------------------------------
    */

    const handleExportExcel = React.useCallback(async function () {
        try {
            if (!window.exportSchedulesToExcel) {
                console.error("No existe window.exportSchedulesToExcel");
                return;
            }

            const career = getFallbackSelectedCareer();

            if (!career) {
                throw new Error("Payload inválido: falta selectedCareer");
            }

            const currentLectiveTerm =
                selectedLectiveTerm ||
                data?.calendars?.find(c => c?.visible)?.lectiveTerm ||
                data?.calendars?.[0]?.lectiveTerm ||
                "";

            if (!currentLectiveTerm) {
                throw new Error("No se pudo determinar el semestre lectivo activo.");
            }

            await window.exportSchedulesToExcel({
                calendars: data?.calendars || [],
                selectedCareer: career,
                currentLectiveTerm: currentLectiveTerm, // ✅ usar la variable calculada
                selectedPlan: "2026"
            });

        } catch (error) {
            console.error("Error exportando calendario Excel:", error);
        }
    }, [data, getFallbackSelectedCareer, selectedLectiveTerm]);

    /*
      -----------------------------------------
      2️⃣ Export datos BD (Electron)
      -----------------------------------------
    */

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
                carrera: getFallbackSelectedCareer()
            }
        });

        if (response?.success) {
            await window.api?.mensajes?.mostrar?.(
                `Excel exportado en:\n${response.data.path}`,
                "info"
            );
            return;
        }

        if (!response?.cancelled) {
            await window.api?.mensajes?.mostrar?.(
                `No se pudo exportar Excel: ${response?.error || "error desconocido"}`,
                "error"
            );
        }
    }

    /*
      -----------------------------------------
      3️⃣ Import completo
      -----------------------------------------
    */

    async function handleImportExcel() {
        const exportApi = window.api?.exportaciones;

        if (!exportApi?.importarExcelModulos) {
            window.alert("No se pudo acceder a la API de importacion.");
            return;
        }

        const response = await exportApi.importarExcelModulos({
            carreraNombre: getFallbackSelectedCareer()
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
            await reloadCareersFromDb?.();
            return;
        }

        if (!response?.cancelled) {
            await window.api?.mensajes?.mostrar?.(
                `No se pudo importar Excel: ${response?.error || "error desconocido"}`,
                "error"
            );
        }
    }

    /*
      -----------------------------------------
      4️⃣ Import por entidad
      -----------------------------------------
    */

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
            materia: "materias",
            grupo: "grupos",
            profesor: "profesores",
            docente: "profesores",
            salon: "salones",
            semestre: "semestres",
            horario: "horarios"
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
            carreraNombre: getFallbackSelectedCareer()
        });

        if (response?.success) {
            await window.api?.mensajes?.mostrar?.(
                `Importacion parcial finalizada (${entity}).`,
                "info"
            );
            await reloadGroupsFromDb?.();
            await reloadCareersFromDb?.();
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