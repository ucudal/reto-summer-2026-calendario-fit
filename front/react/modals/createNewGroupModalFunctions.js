/*
  Archivo: createNewGroupModalFunctions.js
  Que guarda:
  - Funciones de logica para manejar el flujo del modal CreateNewGroupModal.
  - No renderiza UI.
*/

function createInitialGroupForm(params) {
  const {
    DAYS,
    TIME_BLOCKS,
    selectedCareer
  } = params;

  return {
    subject: "",
    days: [DAYS[0]],
    year: "1",
    fromTime: TIME_BLOCKS[0].start,
    toTime: TIME_BLOCKS[0].end,
    careers: [selectedCareer]
  };
}

function createNewGroupModalHandlers(params) {
  const {
    DAYS,
    TIME_BLOCKS,
    selectedCareer,
    setGroupForm,
    setModalError,
    setIsCreateNewGroupOpen,
    createGroupModalFns,
    groupForm,
    data,
    hourOptionsFrom,
    hourOptionsTo,
    timeToMinutes,
    yearLabel,
    findCalendarForYear,
    addGroupToCalendar,
    setData
  } = params;

  function openCreateGroupModal() {
    setGroupForm(
      createInitialGroupForm({
        DAYS,
        TIME_BLOCKS,
        selectedCareer
      })
    );
    setModalError("");
    setIsCreateNewGroupOpen(true);
  }

  function openCreateNewGroupModal() {
    openCreateGroupModal();
  }

  function closeCreateNewGroupModal() {
    setModalError("");
    setIsCreateNewGroupOpen(false);
  }

  function updateGroupForm(field, value) {
    setGroupForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleGroupFormList(field, value, checked) {
    setGroupForm((prev) => {
      const current = Array.isArray(prev[field]) ? prev[field] : [];
      const next = checked
        ? [...new Set([...current, value])]
        : current.filter((item) => item !== value);

      return { ...prev, [field]: next };
    });
  }

  function confirmCreateGroup() {
    createGroupModalFns.confirmCreateGroup({
      groupForm,
      data,
      hourOptionsFrom,
      hourOptionsTo,
      timeToMinutes,
      setModalError,
      yearLabel,
      findCalendarForYear,
      addGroupToCalendar,
      setData,
      closeCreateGroupModal: closeCreateNewGroupModal
    });
  }

  return {
    openCreateGroupModal,
    openCreateNewGroupModal,
    closeCreateNewGroupModal,
    updateGroupForm,
    toggleGroupFormList,
    confirmCreateGroup
  };
}

window.CreateNewGroupModalFunctions = {
  createInitialGroupForm,
  createNewGroupModalHandlers
};
