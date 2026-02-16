
const addBtn = document.getElementById("addBtn");
const btnAtras = document.getElementById("btn-atras");
const addMateriaBtn = document.getElementById("addMateriaBtn");

const materiasContainer = document.getElementById("materiasContainer");

const backdrop = document.getElementById("modalBackdrop");
const form = document.getElementById("expenseForm");
const cancelBtn = document.getElementById("cancelBtn");

const materiaBackdrop = document.getElementById("modalMateriaBackdrop");
const materiaForm = document.getElementById("materiaForm");
const cancelMateriaBtn = document.getElementById("cancelMateriaBtn");
const materiaNameInput = document.getElementById("materiaNameInput");
const materiaDescriptionInput = document.getElementById("materiaDescriptionInput");


function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}



function openModal() {
  backdrop.classList.remove("hidden");
  amountInput.value = "";
  categoryInput.value = ""; // reset
  descriptionInput.value = "";
  amountInput.focus();
}

function closeModal() {
  backdrop.classList.add("hidden");
}


// --- Materias ---
async function loadMaterias() {
  //const materias = await window.api.listMaterias();
  const materias = [{name:"calculo", description: "calculo 1 primer semestre"}, {name: "algebra", description: "algebra 2 contrasemestre"}];
  
  materiasContainer.innerHTML = "";
  
  if (!materias.length) {
    materiasContainer.innerHTML = "<p>No hay materias registradas.</p>";
    return;
  }
  
  for (const materia of materias) {
    const card = document.createElement("div");
    card.className = "materia-card";
    card.innerHTML = `
      <h3>${escapeHtml(materia.name)}</h3>
      ${materia.description ? `<p>${escapeHtml(materia.description)}</p>` : ""}
    `;
    materiasContainer.appendChild(card);
  }
}

function openMateriaModal() {
  materiaBackdrop.classList.remove("hidden");
  materiaNameInput.value = "";
  materiaDescriptionInput.value = "";
  materiaNameInput.focus();
}

function closeMateriaModal() {
  materiaBackdrop.classList.add("hidden");
}

addMateriaBtn.addEventListener("click", openMateriaModal);
cancelMateriaBtn.addEventListener("click", closeMateriaModal);
materiaBackdrop.addEventListener("click", (e) => { 
  if (e.target === materiaBackdrop) closeMateriaModal(); 
});

materiaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const name = materiaNameInput.value.trim();
  const description = materiaDescriptionInput.value.trim();
  
  if (!name) {
    alert("Nombre requerido.");
    return;
  }
  
  await window.api.createMateria({ name, description });
  
  closeMateriaModal();
  await loadMaterias();
});

btnAtras.addEventListener("click", () => {
    window.location.href = "./../index.html";
});

// init
loadMaterias();