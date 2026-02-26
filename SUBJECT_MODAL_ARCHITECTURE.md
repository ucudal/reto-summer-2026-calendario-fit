# Diagrama de Flujo y Arquitectura: Funcionalidad de Asignaturas

## 📊 Flujo de Interacción Usuario

```
┌─────────────────────────────────────────────────────────────────┐
│ USUARIO FINAL                                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ┌───────────────────────────────────────────┐
        │  Click "ASIGNATURAS" en Sidebar          │
        │  (Sidebar.jsx @ line 25)                 │
        └───────────────┬───────────────────────────┘
                        ↓
        ┌──────────────────────────────────────────────────┐
        │  openSubjectsListModal() [App.jsx]               │
        │  → setIsSubjectsListOpen(true)                   │
        └──────────────┬───────────────────────────────────┘
                       ↓
    ┌─────────────────────────────────────────────────────────┐
    │ SubjectsListModal Renderizado                           │
    │ (Muestra lista de materias existentes)                  │
    │ Prop: subjects[], onSelectSubject, onCreateNew          │
    └─┬──────────────────────────────────────┬────────────────┘
      │                                      │
      │ Click "+ Nueva Asignatura"          │ Click en una asignatura
      │                                      │
      ↓                                      ↓
      │                            selectSubjectToManage(subject)
      │                            → Cargar datos en subjectForm
      │
      ↓
    openCreateSubjectFromList()
    → Limpiar subjectForm
    → setIsCreateSubjectOpen(true)
    → setSubjectOpenedFromList(true)
                         │
                         ↓
    ┌─────────────────────────────────────────────────────┐
    │ CreateSubjectModal Renderizado (CREAR o EDITAR)    │
    │ Props: form, onChange, onCareerToggle, ...          │
    └─┬───────────────────────────────────────────────────┘
      │
      ├─ Usuario ingresa datos
      ├─ Selecciona carreras (dropdown + checkboxes)
      ├─ Para cada carrera: selecciona semestre
      │
      ↓
      Click "Confirmar" / "Guardar cambios"
                         │
                         ↓
    confirmCreateSubject() o confirmEditSubject()
    [createSubjectModalFunctions.js]
                         │
                         ├─ Validar datos
                         ├─ No duplicar nombre
                         ├─ Verificar carreras y semestres
                         │
                         ↓ (Si OK)
                  Actualizar state
                  setSubjects([...])
                         │
                         ↓
    closeCreateSubjectModal()
    → setIsCreateSubjectOpen(false)
                         │
                         ↓ (Si vino de lista)
    Volver a SubjectsListModal (si subjectOpenedFromList === true)
                         │
                         ↓
    Usuario puede:
    • Buscar otra asignatura
    • Buscar y editar otra
    • Cerrar modal
```

---

## 🏗️ Arquitectura - Capas

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND REACT                             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Componentes UI (JSX)                                   │   │
│  │                                                         │   │
│  │  • Sidebar.jsx (botón "ASIGNATURAS")                   │   │
│  │  • SubjectsListModal.jsx (lista de materias)           │   │
│  │  • CreateSubjectModal.jsx ⭐ (form crear/editar)      │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            ↑                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  App.jsx (Estado centralizado)                         │   │
│  │                                                         │   │  
│  │  • subjects[] ← almacena todas las materias            │   │
│  │  • subjectForm {} ← formulario actual                  │   │
│  │  • subjectModalError ← validación                      │   │
│  │  • subjectEditMode ← si está editando                  │   │
│  │                                                         │   │
│  │  Funciones:                                            │   │
│  │  • openSubjectsListModal()                             │   │
│  │  • closeSubjectsListModal()                            │   │
│  │  • openCreateSubjectFromList()                         │   │
│  │  • updateSubjectForm(field, value)                     │   │
│  │  • toggleSubjectCareer(career)                         │   │
│  │  • selectSubjectToManage(subject)                      │   │
│  │  • confirmCreateSubject()                              │   │
│  │  • deleteSubject()                                     │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            ↑                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Lógica Modal (JS)                                     │   │
│  │  createSubjectModalFunctions.js ⭐                     │   │
│  │                                                         │   │
│  │  • confirmCreateSubject() → validar + agregar          │   │
│  │  • confirmEditSubject() → validar + actualizar         │   │
│  │  • confirmDeleteSubject() → eliminar                   │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                     │
│            IPC BRIDGE (window.api.materias)                     │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND ELECTRON/NODEJS                        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Handlers IPC (materias.handlers.js) ⭐              │   │
│  │                                                         │   │
│  │  ipcMain.handle("materias:crear", ...)               │   │
│  │  ipcMain.handle("materias:listar", ...)              │   │
│  │  ipcMain.handle("materias:actualizar", ...)          │   │
│  │  ipcMain.handle("materias:eliminar", ...)            │   │
│  │  ipcMain.handle("materias:obtenerPorId", ...)        │   │
│  │  ipcMain.handle("materias:listarCarrerasPlanes", ...)│   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            ↑                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Servicios (materias.service.js)                       │   │
│  │                                                         │   │
│  │  • altaMateria()          → crear                      │   │
│  │  • obtenerMaterias()      → listar                     │   │
│  │  • actualizarMateria()    → editar                     │   │
│  │  • bajaMateria()          → eliminar                   │   │
│  │  • obtenerMateriaPorId()  → por id                     │   │
│  │                                                         │   │
│  │  (Lógica de negocio, validaciones)                    │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            ↑                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Repository (materias.repository.js)                   │   │
│  │                                                         │   │
│  │  • crearMateria(sql)                                   │   │
│  │  • listarMaterias(sql)                                 │   │
│  │  • actualizarMateria(sql)                              │   │
│  │  • eliminarMateria(sql)                                │   │
│  │  • obtenerMateriaPorId(sql)                            │   │
│  │                                                         │   │
│  │  (Queries Drizzle a BD)                                │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             ↓
              ┌──────────────────────────────┐
              │    BASE DE DATOS (SQLite)    │
              │                              │
              │  Tabla: materias             │
              │  ├─ id (PK)                  │
              │  ├─ nombre                   │
              │  ├─ tipo (A/B/C)             │
              │  ├─ creditos                 │
              │  └─ ...                      │
              │                              │
              │  Tabla: materiaCarrera (M:N)│
              │  ├─ idMateria (FK)           │
              │  ├─ idCarrera (FK)           │
              │  ├─ semestreAnio             │
              │  └─ ...                      │
              │                              │
              └──────────────────────────────┘
```

---

## 🔄 Flujo de Datos - CREATE

```
Usuario escribe nombre en form
         ↓
onChange("nombre", "Prog 1")
         ↓
updateSubjectForm()
         ↓
setSubjectForm({ ...prev, nombre: "Prog 1" })
         ↓
CreateSubjectModal renderiza con nuevo valor
         ↓
Usuario selecciona carrera
         ↓
onCareerToggle("Ingenieria en Sistemas")
         ↓
toggleSubjectCareer()
         ↓
setSubjectForm({ carreras: ["Ingenieria en Sistemas"] })
         ↓
Usuario selecciona semestre para carrera
         ↓
onCareerSemesterChange("Ingenieria...", "1er s 1er año")
         ↓
changeSubjectCareerSemester()
         ↓
setSubjectForm({ carrerasSemestre: { "Ingenieria...": "1er s 1er año" } })
         ↓
Usuario click "Confirmar"
         ↓
confirmCreateSubject()
         ↓
createSubjectModalFns.confirmCreateSubject({
  subjectForm,      // { nombre, tipo, creditos, carreras, ... }
  subjects,
  setSubjectModalError,
  setSubjects,
  closeCreateSubjectModal
})
         ↓
Validar datos
         ↓
setSubjects([...subjects, newSubject])
         ↓
closeCreateSubjectModal()
         ↓
Modal se cierra, state.subjects actualizado ✓
```

---

## 🔄 Flujo de Datos - UPDATE

```
Usuario click en materia existente en lista
         ↓
onSelectSubject(subject)
         ↓
selectSubjectToManage(subject)  [App.jsx]
         ↓
setSubjectForm(subject)  // Carga datos existentes
setSubjectEditMode(subject)
setIsCreateSubjectOpen(true)
         ↓
CreateSubjectModal renderiza con datos precargados
(isEditMode={true}, botón dice "Guardar cambios")
         ↓
Usuario modifica campos
         ↓
onChange() → updateSubjectForm() → setSubjectForm()
         ↓
Usuario selecciona/deselecciona carreras
         ↓
onCareerToggle() → toggleSubjectCareer() → setSubjectForm()
         ↓
Usuario click "Guardar cambios"
         ↓
confirmCreateSubject()  [detects subjectEditMode !== null]
         ↓
createSubjectModalFns.confirmEditSubject({
  subjectForm,
  subjects,
  originalSubject: subjectEditMode,
  setSubjectModalError,
  setSubjects,
  closeCreateSubjectModal
})
         ↓
Validar datos (nombre único EXCEPTO el original)
         ↓
setSubjects([...updated])
         ↓
closeCreateSubjectModal()
         ↓
Modal se cierra, state.subjects actualizado ✓
```

---

## 🗂️ Estructura de Carpetas (Relevante)

```
reto-summer-2026-calendario-fit/
│
├── front/
│   ├── react/
│   │   ├── App.jsx ⭐ (orquestación principal)
│   │   ├── data.js (datos iniciales, AppData)
│   │   │
│   │   ├── components/
│   │   │   ├── Sidebar.jsx (botón ASIGNATURAS)
│   │   │   ├── ScheduleGrid.jsx
│   │   │   ├── AlertsPanel.jsx
│   │   │   └── ...
│   │   │
│   │   └── modals/
│   │       ├── CreateSubjectModal.jsx ⭐
│   │       ├── SubjectsListModal.jsx ⭐
│   │       ├── createSubjectModalFunctions.js ⭐
│   │       ├── CreateCareerModal.jsx
│   │       ├── CreateTeacherModal.jsx
│   │       ├── GroupsModal.jsx
│   │       ├── SubjectGroupsModal.jsx
│   │       └── ...
│   │
│   ├── services/
│   │   └── excelService.js
│   │
│   ├── index.html
│   ├── style.css ⭐ (estilos)
│   └── main.jsx
│
├── modules/
│   ├── registerHandlers.js ⭐ (importa y registra)
│   │
│   ├── materias/
│   │   ├── materias.handlers.js ⭐ (IPC handlers)
│   │   ├── materias.service.js ⭐ (lógica negocio)
│   │   └── materias.repository.js ⭐ (BD queries)
│   │
│   ├── carreras/
│   ├── docentes/
│   ├── grupos/
│   ├── profesorGrupo/
│   └── ...
│
├── db/
│   ├── drizzle/
│   │   ├── schema/
│   │   │   ├── base.js (tabla materias)
│   │   │   ├── links.js
│   │   │   ├── relations.js
│   │   │   └── index.js
│   │   │
│   │   └── migrations/
│   │       ├── 0000_*.sql
│   │       ├── 0001_*.sql
│   │       └── ...
│   │
│   ├── database.js
│   ├── init.js
│   └── schema.js
│
└── electron/
    ├── main.js (punto entrada Electron)
    └── preload.js (expone window.api)
```

---

## 🔌 Interfaz window.api.materias

```javascript
// Disponible en frontend gracias a electron/preload.js

window.api.materias = {
  
  // CREATE
  crear(data: {
    nombre: string,
    tipo: string,
    creditos: number,
    requerimientosSalon?: string,
    tieneContrasemestre?: boolean
  }): Promise<{ success, data }>
  
  // READ
  listar(): Promise<{ success, data: [] }>
  obtenerPorId(id: number): Promise<{ success, data: {} }>
  listarCarrerasPlanes(nombreMateria: string): Promise<{ success, data: [] }>
  
  // UPDATE
  actualizar(id: number, datos: {}): Promise<{ success, data }>
  
  // DELETE
  eliminar(id: number): Promise<{ success, data }>
}
```

---

## 📍 Puntos Críticos de Integración

| Punto | Archivo | Línea | Acción |
|-------|---------|-------|--------|
| **Botón UI** | Sidebar.jsx | 25 | Agregar onClick y prop |
| **Estado global** | App.jsx | 50-85 | Agregar states |
| **Funciones control** | App.jsx | 377-493 | Agregar funciones |
| **Props a Sidebar** | App.jsx | 602 | Pasar onOpenSubjects |
| **Renderizado modales** | App.jsx | 690-710 | Renderizar componentes |
| **Handlers IPC** | registerHandlers.js | 2, 14 | Importar y registrar |
| **Lógica modal** | App.jsx + createSubjectModalFunctions.js | -- | Validaciones |
| **Estilos** | front/style.css | END | Clases CSS |

---

## 🧪 Testing Script

```javascript
// Copiar en consola del navegador para probar

// 1. Modal component exists
console.assert(window.CreateSubjectModal, "❌ CreateSubjectModal no existe");
console.assert(window.SubjectsListModal, "❌ SubjectsListModal no existe");

// 2. Functions exist
console.assert(window.CreateSubjectModalFunctions, "❌ CreateSubjectModalFunctions no existe");
console.assert(window.CreateSubjectModalFunctions.confirmCreateSubject, "❌ confirmCreateSubject no existe");

// 3. API exists
(async () => {
  try {
    const result = await window.api.materias.listar();
    console.assert(result.success, "❌ API.listar() falló");
    console.log("✅ API funcionando");
  } catch (err) {
    console.error("❌ API error:", err);
  }
})();

// 4. UI renders
setTimeout(() => {
  const btn = document.querySelector("[class*='action-btn'][onclick*='Asignatura']");
  console.assert(btn, "❌ Botón ASIGNATURAS no renderizado");
  console.log("✅ Interfaz OK");
}, 1000);
```

---

Generado: 26 Feb 2026 | Proyecto: reto-summer-2026-calendario-fit
