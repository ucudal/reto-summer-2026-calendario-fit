// grupos.renderer.js

const tablaGrupos = document.getElementById('tabla-grupos');
const btnAdd = document.getElementById('btn-add-grupo');
const btnAtras = document.getElementById('btn-atras');

const modalBackdrop = document.getElementById('modalBackdrop');
const form = document.getElementById('grupo-form');
const btnCancel = document.getElementById('btn-cancel');
const btnSave = document.getElementById('btn-save');

const inputId = document.getElementById('grupo-id');
const inputCodigo = document.getElementById('grupo-codigo');
const selectMateria = document.getElementById('grupo-materia');
const inputHoras = document.getElementById('grupo-horas');
const inputContra = document.getElementById('grupo-contra');
const inputCupo = document.getElementById('grupo-cupo');
const inputSemestre = document.getElementById('grupo-semestre');
const inputAnio = document.getElementById('grupo-anio');

let materiasMap = new Map();

async function loadMaterias() {
  try {
    const res = await window.api.materias.listar();
    const materias = (res && res.data) ? res.data : [];
    materiasMap = new Map();
    selectMateria.innerHTML = '';

    materias.forEach(m => {
      materiasMap.set(Number(m.id), m);
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.nombre;
      selectMateria.appendChild(opt);
    });

    if (!materias.length) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'No hay materias';
      selectMateria.appendChild(opt);
    }
  } catch (err) {
    console.error('Error cargando materias', err);
  }
}

async function listarGrupos() {
  try {
    const res = await window.api.grupos.listar();
    const grupos = (res && res.data) ? res.data : [];

    tablaGrupos.innerHTML = '';

    grupos.forEach(g => {
      const fila = document.createElement('tr');

      const mat = materiasMap.get(Number(g.idMateria));
      const nombreMateria = mat ? mat.nombre : ('id:' + g.idMateria);
      const tipoMateria = mat ? mat.tipo : '';

      fila.innerHTML = `
        <td>${escapeHtml(g.codigo)}</td>
        <td>${escapeHtml(nombreMateria)}</td>
        <td>${escapeHtml(tipoMateria)}</td>
        <td>${escapeHtml(String(g.cupo))}</td>
        <td>
          <button class="btn-editar" data-id="${g.id}">Editar</button>
          <button class="btn-eliminar" data-id="${g.id}">Eliminar</button>
        </td>
      `;

      tablaGrupos.appendChild(fila);
    });

  } catch (err) {
    console.error('Error al listar grupos', err);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]+/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
}

function openModal() {
  modalBackdrop.classList.remove('hidden');
  inputCodigo.focus();
}

function closeModal() {
  modalBackdrop.classList.add('hidden');
}

function limpiarFormulario() {
  inputId.value = '';
  inputCodigo.value = '';
  selectMateria.value = '';
  inputHoras.value = '';
  inputContra.checked = false;
  inputCupo.value = '';
  inputSemestre.value = '';
  inputAnio.value = '';
}

btnAdd.addEventListener('click', async () => {
  await loadMaterias();
  limpiarFormulario();
  openModal();
});

btnCancel.addEventListener('click', () => {
  closeModal();
});

modalBackdrop.addEventListener('click', (e) => {
  if (e.target === modalBackdrop) closeModal();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    codigo: inputCodigo.value.trim(),
    idMateria: Number(selectMateria.value) || null,
    horasSemestrales: Number(inputHoras.value) || 0,
    esContrasemestre: !!inputContra.checked,
    cupo: Number(inputCupo.value) || 0,
    semestre: Number(inputSemestre.value) || 0,
    anio: Number(inputAnio.value) || 0
  };

  if (!data.codigo || !data.idMateria || !data.cupo) {
    await window.api.mensajes.mostrar('Código, materia y cupo son obligatorios');
    return;
  }

  try {
    let res;
    if (inputId.value) {
      data.id = Number(inputId.value);
      res = await window.api.grupos.actualizar(data);
    } else {
      res = await window.api.grupos.crear(data);
    }

    if (!res || !res.success) throw new Error((res && res.error) || 'Error guardando');

    closeModal();
    limpiarFormulario();
    await loadMaterias();
    await listarGrupos();

  } catch (err) {
    console.error('Error al guardar grupo', err);
    await window.api.mensajes.mostrar(err.message || err);
  }
});

// Delegación de eventos en tabla
tablaGrupos.addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = Number(btn.dataset.id);

  if (btn.classList.contains('btn-eliminar')) {
    const confirmar = await window.api.mensajes.confirmar('¿Seguro que querés eliminar este grupo?');
    if (!confirmar) return;
    try {
      const res = await window.api.grupos.eliminar(id);
      if (!res || !res.success) throw new Error((res && res.error) || 'Error al eliminar');
      await listarGrupos();
    } catch (err) {
      console.error('Error al eliminar grupo', err);
      await window.api.mensajes.mostrar(err.message || err);
    }
    return;
  }

  if (btn.classList.contains('btn-editar')) {
    try {
      const res = await window.api.grupos.obtener(id);
      if (!res || !res.success) throw new Error((res && res.error) || 'Error al obtener');
      const g = res.data;

      await loadMaterias();

      inputId.value = g.id;
      inputCodigo.value = g.codigo || '';
      selectMateria.value = g.idMateria || '';
      inputHoras.value = g.horasSemestrales || '';
      inputContra.checked = !!g.esContrasemestre;
      inputCupo.value = g.cupo || '';
      inputSemestre.value = g.semestre || '';
      inputAnio.value = g.anio || '';

      openModal();
    } catch (err) {
      console.error('Error al editar grupo', err);
      await window.api.mensajes.mostrar(err.message || err);
    }
  }
});

btnAtras.addEventListener('click', () => {
  window.location.href = './../index.html';
});

document.addEventListener('DOMContentLoaded', async () => {
  await loadMaterias();
  await listarGrupos();
});
