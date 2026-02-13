// docentes.renderer.js

const tablaDocentes = document.getElementById("tabla-docentes");
const btnGuardar = document.getElementById("btn-guardar-docente");
const btnAtras = document.getElementById("btn-atras");
const inputNombre = document.getElementById("docente-nombre");
const inputApellido = document.getElementById("docente-apellido");
const inputEmail = document.getElementById("docente-email");
const inputId = document.getElementById("docente-id");
const form = document.getElementById("docente-form");

// ==============================
// LISTAR
// ==============================

async function listarDocentes() {
    try {
        const response = await window.api.docentes.listar();

        if (!response.success) {
            throw new Error(response.error);
        }

        const docentes = response.data;

        tablaDocentes.innerHTML = "";

        docentes.forEach(docente => {
            const fila = document.createElement("tr");

            fila.innerHTML = `
        <td>${docente.id}</td>
        <td>${docente.nombre}</td>
        <td>${docente.apellido}</td>
        <td>${docente.correo}</td>
        <td>
          <button class="btn-editar" data-id="${docente.id}">Editar</button>
          <button class="btn-eliminar" data-id="${docente.id}">Eliminar</button>
        </td>
      `;

            tablaDocentes.appendChild(fila);
        });

    } catch (error) {
        console.error("Error al listar docentes:", error);
    }
}

// ==============================
// GUARDAR (CREAR O EDITAR)
// ==============================

async function guardarDocente() {
    const id = inputId.value;

    const data = {
        nombre: inputNombre.value.trim(),
        apellido: inputApellido.value.trim(),
        correo: inputEmail.value.trim()
    };

    if (id) data.id = Number(id);

    if (!data.nombre || !data.apellido || !data.correo) {
        alert("Todos los campos son obligatorios");
        return;
    }

    try {
        let response;

        if (id) {
            response = await window.api.docentes.actualizar(data);
        } else {
            response = await window.api.docentes.crear(data);
        }

        if (!response.success) {
            throw new Error(response.error);
        }

        // Limpiar el formulario de manera nativa y recargar la lista
        form.reset();
        await listarDocentes();

    } catch (error) {
        console.error("Error al guardar docente:", error);
        alert(error.message);
    }
}


// ==============================
// EDITAR / ELIMINAR (delegación)
// ==============================

// Delegación en tbody (`tablaDocentes`) para manejar botones creados dinámicamente.
tablaDocentes.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const idAttr = btn.dataset.id;
    const id = idAttr ? Number(idAttr) : null;

    // ELIMINAR
    if (btn.classList.contains('btn-eliminar')) {
        const confirmar = confirm("¿Seguro que querés eliminar este docente?");
        if (!confirmar) return;

        try {
            const response = await window.api.docentes.eliminar(id);
            if (!response || !response.success) {
                throw new Error((response && response.error) || 'Error al eliminar');
            }
            // Limpiar formulario tras eliminación exitosa
            form.reset();
            await listarDocentes();
        } catch (error) {
            console.error('Error al eliminar docente:', error);
            alert(error.message || error);
        }

        return;
    }

    // EDITAR
    if (btn.classList.contains('btn-editar')) {
        try {
            const response = await window.api.docentes.obtener(id);
            if (!response || !response.success) {
                throw new Error((response && response.error) || 'Error al obtener docente');
            }
            const docente = response.data;

            inputId.value = docente.id;
            inputNombre.value = docente.nombre;
            inputApellido.value = docente.apellido;
            inputEmail.value = docente.correo;
            inputNombre.focus();
        } catch (error) {
            console.error('Error al obtener docente:', error);
            alert(error.message || error);
        }
    }
});

// ==============================
// LIMPIAR FORMULARIO
// ==============================

function limpiarFormulario() {
    inputId.value = "";
    inputNombre.value = "";
    inputApellido.value = "";
    inputEmail.value = "";
}

btnGuardar.addEventListener("click", guardarDocente);
btnAtras.addEventListener("click", () => {
    window.location.href = "./../index.html";
});

// ==============================
// INICIALIZAR
// ==============================

document.addEventListener("DOMContentLoaded", () => {
    listarDocentes();
});
