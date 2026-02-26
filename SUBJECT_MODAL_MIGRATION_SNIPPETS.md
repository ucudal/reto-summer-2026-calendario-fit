# Migration Snippets: Código Exacto a Copiar

## 1️⃣ App.jsx - Estados (Pegar después de línea ~85)

```jsx
// ===== SUBJECT MANAGEMENT (Agregar después de teacher states) =====

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
```

---

## 2️⃣ App.jsx - Inicialización (Agregar al inicio de App, línea ~22)

```jsx
// Agregar con los otros function references:
const createSubjectModalFns = window.CreateSubjectModalFunctions;
```

---

## 3️⃣ App.jsx - Funciones de Control (Pegar en lugar apropiado, ~línea 410)

```jsx
// ===== SUBJECT MANAGEMENT FUNCTIONS =====

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

    const nextSemesters = { ...(prev.carrerasSemestre || {}) };
    if (!nextCareers.includes(career)) delete nextSemesters[career];

    return {
      ...prev,
      carreras: nextCareers,
      carrerasSemestre: nextSemesters
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
```

---

## 4️⃣ App.jsx - Prop en Sidebar (Buscar y actualizar)

**Buscar:**
```jsx
<Sidebar onOpenTeacher={openTeachersListModal} />
```

**Cambiar a:**
```jsx
<Sidebar 
  onOpenTeacher={openTeachersListModal}
  onOpenSubjects={openSubjectsListModal}
/>
```

---

## 5️⃣ App.jsx - Renderizado de Modales (Agregar antes de closing tags, ~línea 690)

```jsx
      <SubjectsListModal
        isOpen={isSubjectsListOpen}
        subjects={subjects}
        onClose={closeSubjectsListModal}
        onSelectSubject={selectSubjectToManage}
        onCreateNew={openCreateSubjectFromList}
      />

      <CreateSubjectModal
        isOpen={isCreateSubjectOpen}
        form={subjectForm}
        errorMessage={subjectModalError}
        onClose={closeCreateSubjectModal}
        onBack={subjectOpenedFromList ? backToSubjectsListFromModal : null}
        onChange={updateSubjectForm}
        onCareerToggle={toggleSubjectCareer}
        onCareerSemesterChange={changeSubjectCareerSemester}
        onSubmit={confirmCreateSubject}
        onDelete={subjectEditMode ? deleteSubject : null}
        isEditMode={Boolean(subjectEditMode)}
        availableCareers={careers}
      />
```

---

## 6️⃣ Sidebar.jsx - Botón ASIGNATURAS

**Buscar:**
```jsx
function Sidebar(props) {
  const {
    onOpenTeacher = () => {},
  } = props;
```

**Agregar prop:**
```jsx
function Sidebar(props) {
  const {
    onOpenTeacher = () => {},
    onOpenSubjects = () => {},
  } = props;
```

**Luego agregar el botón (después del botón DOCENTES):**
```jsx
<button className="action-btn" type="button" onClick={onOpenSubjects}>ASIGNATURAS</button>
```

---

## 7️⃣ registerHandlers.js - Importar y registrar

**Agregar al inicio (con otros imports):**
```javascript
import { registrarMateriasHandlers } from "./materias/materias.handlers.js";
```

**Agregar en función registrarTodos (o similar):**
```javascript
registrarMateriasHandlers();
```

---

## 8️⃣ CSS - Clases nuevas en front/style.css

**Agregar al final del archivo:**

```css
/* ===== SUBJECT MODAL STYLES ===== */

.subject-careers-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: start;
}

.subject-careers-dropdown {
  position: relative;
  width: min(260px, 100%);
}

.subject-careers-options-dropdown {
  max-height: 185px;
  overflow-y: auto;
}

.subject-careers-chips {
  display: grid;
  grid-template-columns: 320px minmax(220px, 250px);
  gap: 8px;
  align-items: center;
  min-height: 34px;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 4px;
}

.subject-career-chip-row {
  display: contents;
}

.subject-career-chip-row .teacher-chip {
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  min-width: 0;
  white-space: nowrap;
}

.subject-career-chip-row .teacher-chip-remove-btn {
  margin-left: auto;
}

.subject-career-semester-select {
  width: 100%;
  height: 32px;
  font-size: 12px;
}

.create-subject-modal {
  overflow: visible;
}

@media (max-width: 680px) {
  .subject-careers-chips {
    grid-template-columns: 1fr;
  }

  .subject-career-semester-select {
    margin-top: 4px;
  }
}
```

---

## ✨ Archivos Completos (Sin modificar directamente si ya existen)

Copiar **integralmente** estos archivos:

1. `front/react/modals/CreateSubjectModal.jsx` ← Ver `front/react/modals/CreateSubjectModal.jsx` en tu proyecto actual
2. `front/react/modals/SubjectsListModal.jsx` ← Ver archivo en tu proyecto 
3. `front/react/modals/createSubjectModalFunctions.js` ← Ver archivo en tu proyecto
4. `modules/materias/materias.handlers.js` ← Ver archivo en tu proyecto
5. `modules/materias/materias.service.js` ← Ver archivo en tu proyecto
6. `modules/materias/materias.repository.js` ← Ver archivo en tu proyecto

---

## 🔍 Verificación Post-Migración

### Pruebas manuales:

```javascript
// En consola del navegador:

// 1. Verificar que el widget existe
console.log(window.CreateSubjectModal);               // ✓ debe ser función
console.log(window.CreateSubjectModalFunctions);     // ✓ debe tener métodos
console.log(window.SubjectsListModal);              // ✓ debe ser función

// 2. Verificar que API existe
console.log(window.api.materias);                    // ✓ debe tener métodos

// 3. Prueba básica de API
await window.api.materias.listar();                  // ✓ debe retornar []
```

---

## 📌 Checklist Orden Correcto

1. ✅ Copiar estados en App.jsx
2. ✅ Copiar funciones de control en App.jsx
3. ✅ Actualizar Sidebar con prop y botón
4. ✅ Actualizar App.jsx para pasar prop a Sidebar
5. ✅ Agregar renderizado de modales en App.jsx
6. ✅ Copiar archivos modales (3 archivos)
7. ✅ Copiar archivos backend (3 archivos)
8. ✅ Actualizar registerHandlers.js
9. ✅ Copiar estilos CSS
10. ✅ Reiniciar Electron
11. ✅ Testear botón "ASIGNATURAS"

---

**Nota:** Si algo falla, revisa SUBJECT_MODAL_DEPENDENCIES.md para mayor contexto.
