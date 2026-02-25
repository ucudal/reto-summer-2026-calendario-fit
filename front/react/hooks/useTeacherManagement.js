(function () {
    function useTeacherManagement() {
        const createTeacherModalFns = window.CreateTeacherModalFunctions;

        const [isCreateTeacherOpen, setIsCreateTeacherOpen] = React.useState(false);
        const [teacherModalError, setTeacherModalError] = React.useState("");
        const [teacherForm, setTeacherForm] = React.useState({
            nombre: "",
            apellido: "",
            correo: ""
        });

        function openCreateTeacherModal() {
            setTeacherForm({ nombre: "", apellido: "", correo: "" });
            setTeacherModalError("");
            setIsCreateTeacherOpen(true);
        }

        function closeCreateTeacherModal() {
            setTeacherModalError("");
            setIsCreateTeacherOpen(false);
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
        }

        return {
            isCreateTeacherOpen,
            teacherModalError,
            teacherForm,
            openCreateTeacherModal,
            closeCreateTeacherModal,
            updateTeacherForm,
            confirmCreateTeacher
        };
    }

    window.useTeacherManagement = useTeacherManagement;
})();