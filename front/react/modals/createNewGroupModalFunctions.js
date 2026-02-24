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
    selectedCareer,
    selectedPlan,
    plansByCareer
  } = params;

  return {
    subject: "",
    days: [DAYS[0]],
    year: "1",
    fromTime: TIME_BLOCKS[0].start,
    toTime: TIME_BLOCKS[0].end,
    careers: [selectedCareer],
    plans: (plansByCareer[selectedCareer] || [selectedPlan]).slice(0, 1)
  };
}

function createNewGroupModalHandlers(params) {
  const {
    DAYS,
    TIME_BLOCKS,
    selectedCareer,
    selectedPlan,
    plansByCareer,
    setGroupForm,
    setModalError,
    setIsCreateNewGroupOpen,
    createGroupModalFns,
    groupForm,
    data,
    availablePlansForGroup,
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
        selectedCareer,
        selectedPlan,
        plansByCareer
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

      if (field === "careers") {
        const validPlans = [...new Set(next.flatMap((career) => plansByCareer[career] || []))];
        const filteredPlans = (prev.plans || []).filter((plan) => validPlans.includes(plan));
        const plansToKeep = filteredPlans.length > 0 ? filteredPlans : validPlans.slice(0, 1);
        return { ...prev, careers: next, plans: plansToKeep };
      }

      return { ...prev, [field]: next };
    });
  }

  function confirmCreateGroup() {
    createGroupModalFns.confirmCreateGroup({
      groupForm,
      data,
      availablePlansForGroup,
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
