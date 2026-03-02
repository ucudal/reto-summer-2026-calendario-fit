(function () {
    function useCareerManagement({ careers, setCareers, careersData, setCareersData, setSelectedCareer, reloadGroupsFromDb }) {
        const createCareerModalFns = window.CreateCareerModalFunctions;

        const [isCareersListOpen, setIsCareersListOpen] = React.useState(false);
        const [isCreateCareerOpen, setIsCreateCareerOpen] = React.useState(false);
        const [careerModalError, setCareerModalError] = React.useState("");
        const [careerForm, setCareerForm] = React.useState({ nombre: "" });
        const [careerEditMode, setCareerEditMode] = React.useState(null);
        const [careerOpenedFromList, setCareerOpenedFromList] = React.useState(false);

        function openCareersListModal() {
            setIsCareersListOpen(true);
        }

        function closeCareersListModal() {
            setIsCareersListOpen(false);
        }

        function openCreateCareerModal() {
            setCareerForm({ nombre: "" });
            setCareerModalError("");
            setCareerEditMode(null);
            setCareerOpenedFromList(false);
            setIsCreateCareerOpen(true);
        }

        function openCreateCareerFromList() {
            setCareerForm({ nombre: "" });
            setCareerModalError("");
            setCareerEditMode(null);
            setCareerOpenedFromList(true);
            setIsCareersListOpen(false);
            setIsCreateCareerOpen(true);
        }

        function closeCreateCareerModal() {
            setCareerModalError("");
            setIsCreateCareerOpen(false);
            setCareerEditMode(null);
            setCareerOpenedFromList(false);
        }

        function backToCareersListFromModal() {
            closeCreateCareerModal();
            setIsCareersListOpen(true);
        }

        function selectCareerToManage(careerName) {
            const found = careersData.find(c => c.nombre === careerName);
            setCareerForm({ nombre: careerName });
            setCareerModalError("");
            setCareerEditMode(found || careerName);
            setCareerOpenedFromList(true);
            setIsCareersListOpen(false);
            setIsCreateCareerOpen(true);
        }

        function updateCareerForm(field, value) {
            setCareerForm(prev => ({ ...prev, [field]: value }));
        }

        async function confirmCreateCareer() {
            await createCareerModalFns.confirmCreateCareer({
                careerForm,
                careers,
                careersData,
                careerEditMode,
                setCareerModalError,
                setCareers,
                setCareersData,
                setSelectedCareer,
                closeCreateCareerModal,
                reloadGroupsFromDb
            });
        }

        async function deleteCareer() {
            const wasOpenedFromList = careerOpenedFromList;
            await createCareerModalFns.deleteCareer({
                careerEditMode,
                careers,
                careersData,
                setCareers,
                setCareersData,
                setSelectedCareer,
                setCareerModalError,
                closeCreateCareerModal,
                reloadGroupsFromDb
            });
            // Reabrir la lista de carreras si se abrió desde allí
            if (wasOpenedFromList) {
                setIsCareersListOpen(true);
            }
        }

        return {
            isCareersListOpen,
            isCreateCareerOpen,
            careerModalError,
            careerForm,
            careerEditMode,
            careerOpenedFromList,
            openCareersListModal,
            closeCareersListModal,
            openCreateCareerModal,
            openCreateCareerFromList,
            closeCreateCareerModal,
            backToCareersListFromModal,
            selectCareerToManage,
            updateCareerForm,
            confirmCreateCareer,
            deleteCareer
        };
    }

    window.useCareerManagement = useCareerManagement;
})();