(function () {
    function useTeacherManagement() {
        const createTeacherModalFns = window.CreateTeacherModalFunctions;

        const [isTeachersListOpen, setIsTeachersListOpen] = React.useState(false);
        const [isCreateTeacherOpen, setIsCreateTeacherOpen] = React.useState(false);
        const [teacherModalError, setTeacherModalError] = React.useState("");
        const [teacherForm, setTeacherForm] = React.useState({
            nombre: "",
            apellido: "",
            correo: ""
        });
        const [teacherEditMode, setTeacherEditMode] = React.useState(null);
        const [teacherOpenedFromList, setTeacherOpenedFromList] = React.useState(false);
        const [teachers, setTeachers] = React.useState([]);

        function openTeachersListModal() {
            loadTeachersFromDb();
            setIsTeachersListOpen(true);
        }

        function closeTeachersListModal() {
            setIsTeachersListOpen(false);
        }

        function openCreateTeacherModal() {
            setTeacherForm({ nombre: "", apellido: "", correo: "" });
            setTeacherModalError("");
            setIsCreateTeacherOpen(true);
        }

        function openCreateTeacherFromList() {
            setTeacherForm({ nombre: "", apellido: "", correo: "" });
            setTeacherModalError("");
            setTeacherEditMode(null);
            setTeacherOpenedFromList(true);
            setIsTeachersListOpen(false);
            setIsCreateTeacherOpen(true);
        }

        function closeCreateTeacherModal() {
            setTeacherModalError("");
            setIsCreateTeacherOpen(false);
            setTeacherEditMode(null);
            setTeacherOpenedFromList(false);
        }

        function backToTeachersListFromModal() {
            closeCreateTeacherModal();
            setIsTeachersListOpen(true);
        }

        function selectTeacherToManage(teacher) {
            setTeacherForm({
                nombre: teacher.nombre || "",
                apellido: teacher.apellido || "",
                correo: teacher.correo || ""
            });
            setTeacherModalError("");
            setTeacherEditMode(teacher);
            setTeacherOpenedFromList(true);
            setIsTeachersListOpen(false);
            setIsCreateTeacherOpen(true);
        }

        function updateTeacherForm(field, value) {
            setTeacherForm(prev => ({ ...prev, [field]: value }));
        }

        async function confirmCreateTeacher() {
            await createTeacherModalFns.confirmCreateTeacher({
                teacherForm,
                setTeacherModalError,
                closeCreateTeacherModal
            });

            if (teacherOpenedFromList) {
                await loadTeachersFromDb();
            }
        }

        async function loadTeachersFromDb() {
            try {
                if (!window.api?.docentes?.listar) return;
                const response = await window.api.docentes.listar();
                if (!response?.success || !Array.isArray(response.data)) return;
                setTeachers(response.data);
            } catch (error) {
                console.error("Error cargando docentes:", error);
            }
        }

        return {
            teachers,
            isTeachersListOpen,
            isCreateTeacherOpen,
            teacherModalError,
            teacherForm,
            teacherEditMode,
            teacherOpenedFromList,
            openTeachersListModal,
            closeTeachersListModal,
            openCreateTeacherModal,
            openCreateTeacherFromList,
            closeCreateTeacherModal,
            backToTeachersListFromModal,
            selectTeacherToManage,
            updateTeacherForm,
            confirmCreateTeacher
        };
    }

    window.useTeacherManagement = useTeacherManagement;
})();