function useImportModulosExcel() {
    const exportApi = window.api?.exportaciones;
    if (!exportApi?.importarExcelModulos) {
      window.alert("No se pudo acceder a la API de importacion.");
      return;
    }

    const response = exportApi.importarExcelModulos({
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

      window.api?.mensajes?.mostrar?.(message, "info");
      loadCareersFromDb();
      return;
    }

    if (!response?.cancelled) {
      window.api?.mensajes?.mostrar?.(
        `No se pudo importar Excel: ${response?.error || "error desconocido"}`,
        "error"
      );
    }
  }

  window.importModulosExcel = useImportModulosExcel;