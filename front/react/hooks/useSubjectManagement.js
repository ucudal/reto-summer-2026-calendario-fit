(function () {
  function createEmptySubjectForm() {
    return {
      id: null,
      nombre: "",
      tipo: "",
      creditos: "",
      carreras: [],
      carrerasSemestre: {},
      requerimientosSalon: ""
    };
  }

  function formatSemesterLabel(semestre, anio) {
    const sem = Number(semestre) === 2 ? "2do s" : "1er s";
    const year = Number(anio) >= 1 && Number(anio) <= 5 ? Number(anio) : 1;
    const yearLabel = year === 1 ? "1er" : year === 2 ? "2do" : year === 3 ? "3er" : year === 4 ? "4to" : "5to";
    return `${sem} ${yearLabel} ano`;
  }

  function useSubjectManagement() {
    const createSubjectModalFns = window.CreateSubjectModalFunctions;

    const [subjects, setSubjects] = React.useState([]);
    const [isSubjectsListOpen, setIsSubjectsListOpen] = React.useState(false);
    const [isCreateSubjectOpen, setIsCreateSubjectOpen] = React.useState(false);
    const [subjectModalError, setSubjectModalError] = React.useState("");
    const [subjectForm, setSubjectForm] = React.useState(createEmptySubjectForm());
    const [subjectEditMode, setSubjectEditMode] = React.useState(null);
    const [subjectOpenedFromList, setSubjectOpenedFromList] = React.useState(false);

    const reloadSubjectsFromDb = React.useCallback(async () => {
      if (!window.api?.materias?.listar) return;

      const response = await window.api.materias.listar();
      if (!response?.success || !Array.isArray(response.data)) {
        return;
      }

      const materias = response.data;

      // Para cada materia pedimos sus carreras/semestres desde materia_carrera.
      const mapped = await Promise.all(
        materias.map(async (materia) => {
          const base = {
            id: materia.id,
            nombre: materia.nombre || "",
            tipo: materia.tipo || "",
            creditos: Number(materia.creditos || 0),
            carreras: [],
            carrerasSemestre: {},
            requerimientosSalon: materia.requerimientosSalon || ""
          };

          if (!window.api?.materias?.listarCarrerasPlanes || !base.nombre) {
            return base;
          }

          const careersResponse = await window.api.materias.listarCarrerasPlanes(base.nombre);
          if (!careersResponse?.success || !Array.isArray(careersResponse.data)) {
            return base;
          }

          const carreras = [];
          const carrerasSemestre = {};

          careersResponse.data.forEach((row) => {
            const careerName = String(row?.carreraNombre || "").trim();
            if (!careerName) return;

            if (!carreras.includes(careerName)) {
              carreras.push(careerName);
            }

            carrerasSemestre[careerName] = formatSemesterLabel(row?.semestre, row?.anio);
          });

          return {
            ...base,
            carreras,
            carrerasSemestre
          };
        })
      );

      setSubjects(mapped);
    }, []);

    React.useEffect(() => {
      reloadSubjectsFromDb();
    }, [reloadSubjectsFromDb]);

    function openSubjectsListModal() {
      setIsSubjectsListOpen(true);
    }

    function closeSubjectsListModal() {
      setIsSubjectsListOpen(false);
    }

    function openCreateSubjectFromList() {
      setSubjectForm(createEmptySubjectForm());
      setSubjectModalError("");
      setSubjectEditMode(null);
      setSubjectOpenedFromList(true);
      setIsSubjectsListOpen(false);
      setIsCreateSubjectOpen(true);
    }

    function closeCreateSubjectModal() {
      setSubjectModalError("");
      setIsCreateSubjectOpen(false);
      setSubjectEditMode(null);
      setSubjectOpenedFromList(false);
    }

    function backToSubjectsListFromModal() {
      closeCreateSubjectModal();
      setIsSubjectsListOpen(true);
    }

    function updateSubjectForm(field, value) {
      setSubjectForm((prev) => ({ ...prev, [field]: value }));
    }

    function toggleSubjectCareer(career) {
      setSubjectForm((prev) => {
        const current = Array.isArray(prev.carreras) ? prev.carreras : [];
        const nextCareers = current.includes(career)
          ? current.filter((item) => item !== career)
          : [...current, career];

        const nextCarrerasSemestre = { ...(prev.carrerasSemestre || {}) };
        if (!nextCareers.includes(career)) {
          delete nextCarrerasSemestre[career];
        } else if (!nextCarrerasSemestre[career]) {
          nextCarrerasSemestre[career] = "1er s 1er ano";
        }

        return {
          ...prev,
          carreras: nextCareers,
          carrerasSemestre: nextCarrerasSemestre
        };
      });
    }

    function changeSubjectCareerSemester(career, semesterValue) {
      setSubjectForm((prev) => ({
        ...prev,
        carrerasSemestre: {
          ...(prev.carrerasSemestre || {}),
          [career]: semesterValue
        }
      }));
    }

    function selectSubjectToManage(subject) {
      setSubjectForm({
        id: subject.id,
        nombre: subject.nombre || "",
        tipo: subject.tipo || "",
        creditos: subject.creditos || "",
        carreras: Array.isArray(subject.carreras) ? [...subject.carreras] : [],
        carrerasSemestre: { ...(subject.carrerasSemestre || {}) },
        requerimientosSalon: subject.requerimientosSalon || ""
      });

      setSubjectModalError("");
      setSubjectEditMode(subject);
      setSubjectOpenedFromList(true);
      setIsSubjectsListOpen(false);
      setIsCreateSubjectOpen(true);
    }

    async function confirmCreateSubject() {
      if (!createSubjectModalFns) return;

      if (subjectEditMode) {
        await createSubjectModalFns.confirmEditSubject({
          subjectForm,
          subjects,
          originalSubject: subjectEditMode,
          setSubjectModalError,
          reloadSubjectsFromDb,
          closeCreateSubjectModal
        });
        return;
      }

      await createSubjectModalFns.confirmCreateSubject({
        subjectForm,
        subjects,
        setSubjectModalError,
        reloadSubjectsFromDb,
        closeCreateSubjectModal
      });
    }

    async function deleteSubject() {
      if (!createSubjectModalFns || !subjectEditMode) return;

      await createSubjectModalFns.confirmDeleteSubject({
        subjectForm,
        setSubjectModalError,
        reloadSubjectsFromDb,
        closeCreateSubjectModal
      });
    }

    return {
      subjects,
      isSubjectsListOpen,
      isCreateSubjectOpen,
      subjectModalError,
      subjectForm,
      subjectEditMode,
      subjectOpenedFromList,
      openSubjectsListModal,
      closeSubjectsListModal,
      openCreateSubjectFromList,
      closeCreateSubjectModal,
      backToSubjectsListFromModal,
      updateSubjectForm,
      toggleSubjectCareer,
      changeSubjectCareerSemester,
      selectSubjectToManage,
      confirmCreateSubject,
      deleteSubject,
      reloadSubjectsFromDb
    };
  }

  window.useSubjectManagement = useSubjectManagement;
})();
