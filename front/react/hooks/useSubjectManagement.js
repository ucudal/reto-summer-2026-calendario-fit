(function () {
    function useSubjectManagement({ careers }) {
        const createSubjectModalFns = window.CreateSubjectModalFunctions;

        const [subjects, setSubjects] = React.useState([
            {
                id: 1,
                nombre: "Programación 1",
                tipo: "A",
                creditos: 8,
                carreras: ["Ingenieria en Sistemas 2021"],
                carrerasSemestre: { "Ingenieria en Sistemas 2021": "1er s 1er año" },
                requerimientosSalon: "Laboratorio con 30 computadoras"
            },
            {
                id: 2,
                nombre: "Matemática Discreta",
                tipo: "B",
                creditos: 6,
                carreras: ["Ingenieria en Sistemas 2021", "Ingenieria Electrica 2021"],
                carrerasSemestre: {
                    "Ingenieria en Sistemas 2021": "1er s 1er año",
                    "Ingenieria Electrica 2021": "1er s 1er año"
                },
                requerimientosSalon: ""
            }
        ]);

        const [isSubjectsListOpen, setIsSubjectsListOpen] = React.useState(false);
        const [isCreateSubjectOpen, setIsCreateSubjectOpen] = React.useState(false);
        const [subjectModalError, setSubjectModalError] = React.useState("");
        const [subjectForm, setSubjectForm] = React.useState({
            id: null,
            nombre: "",
            tipo: "",
            creditos: "",
            carreras: [],
            carrerasSemestre: {},
            requerimientosSalon: ""
        });
        const [subjectEditMode, setSubjectEditMode] = React.useState(null);
        const [subjectOpenedFromList, setSubjectOpenedFromList] = React.useState(false);

        function openSubjectsListModal() {
            setIsSubjectsListOpen(true);
        }

        function closeSubjectsListModal() {
            setIsSubjectsListOpen(false);
        }

        function openCreateSubjectFromList() {
            setSubjectForm({
                id: null,
                nombre: "",
                tipo: "",
                creditos: "",
                carreras: [],
                carrerasSemestre: {},
                requerimientosSalon: ""
            });
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
                    nextCarrerasSemestre[career] = "1er s 1er año";
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

        function confirmCreateSubject() {
            if (!createSubjectModalFns) return;

            if (subjectEditMode) {
                createSubjectModalFns.confirmEditSubject({
                    subjectForm,
                    subjects,
                    originalSubject: subjectEditMode,
                    setSubjectModalError,
                    setSubjects,
                    closeCreateSubjectModal
                });
                return;
            }

            createSubjectModalFns.confirmCreateSubject({
                subjectForm,
                subjects,
                setSubjectModalError,
                setSubjects,
                closeCreateSubjectModal
            });
        }

        function deleteSubject() {
            if (!createSubjectModalFns || !subjectEditMode) return;
            createSubjectModalFns.confirmDeleteSubject({
                subjectForm,
                subjects,
                setSubjects,
                closeCreateSubjectModal
            });
        }

        return {
            // State
            subjects,
            isSubjectsListOpen,
            isCreateSubjectOpen,
            subjectModalError,
            subjectForm,
            subjectEditMode,
            subjectOpenedFromList,

            // Actions
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
            deleteSubject
        };
    }

    window.useSubjectManagement = useSubjectManagement;
})();
