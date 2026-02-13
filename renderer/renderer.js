const monthSelect = document.getElementById("monthSelect");
const yearSelect = document.getElementById("yearSelect");
const addBtn = document.getElementById("addBtn");
const totalLabel = document.getElementById("totalLabel");
const expensesTbody = document.getElementById("expensesTbody");

const backdrop = document.getElementById("modalBackdrop");
const form = document.getElementById("expenseForm");
const cancelBtn = document.getElementById("cancelBtn");

const amountInput = document.getElementById("amountInput");
const categoryInput = document.getElementById("categoryInput"); // ahora select
const dateInput = document.getElementById("dateInput");
const descriptionInput = document.getElementById("descriptionInput");

function money(n) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(n || 0));
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}

function fillSelectors() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  monthNames.forEach((name, i) => {
    const opt = document.createElement("option");
    opt.value = String(i + 1);
    opt.textContent = name;
    if (i + 1 === currentMonth) opt.selected = true;
    monthSelect.appendChild(opt);
  });

  for (let y = currentYear - 5; y <= currentYear + 1; y++) {
    const opt = document.createElement("option");
    opt.value = String(y);
    opt.textContent = String(y);
    if (y === currentYear) opt.selected = true;
    yearSelect.appendChild(opt);
  }

  dateInput.value = now.toISOString().slice(0, 10);
}

async function loadCategories() {
  const categories = await window.api.listCategories();

  categoryInput.innerHTML = `<option value="">Seleccionar...</option>`;
  for (const cat of categories) {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryInput.appendChild(opt);
  }
}

async function refresh() {
  const year = Number(yearSelect.value);
  const month = Number(monthSelect.value);

  const { rows, total } = await window.api.listExpensesByMonth({ year, month });

  totalLabel.textContent = money(total);
  expensesTbody.innerHTML = "";

  if (!rows.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="4">No hay gastos en este mes.</td>`;
    expensesTbody.appendChild(tr);
    return;
  }

  for (const r of rows) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.date}</td>
      <td>${escapeHtml(r.category)}</td>
      <td>${money(r.amount)}</td>
      <td>${r.description ? escapeHtml(r.description) : ""}</td>
    `;
    expensesTbody.appendChild(tr);
  }
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

addBtn.addEventListener("click", openModal);
cancelBtn.addEventListener("click", closeModal);
backdrop.addEventListener("click", (e) => { if (e.target === backdrop) closeModal(); });

monthSelect.addEventListener("change", refresh);
yearSelect.addEventListener("change", refresh);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const amount = Number(amountInput.value);
  const category = categoryInput.value; // del select
  const date = dateInput.value;
  const description = descriptionInput.value.trim();

  if (!Number.isFinite(amount) || amount <= 0) {
    alert("Monto inválido.");
    return;
  }
  if (!category) {
    alert("Categoría requerida.");
    return;
  }
  if (!date) {
    alert("Fecha requerida.");
    return;
  }

  await window.api.createExpense({ amount, category, date, description });

  closeModal();
  await refresh();
});

// init
fillSelectors();
loadCategories();
refresh();
