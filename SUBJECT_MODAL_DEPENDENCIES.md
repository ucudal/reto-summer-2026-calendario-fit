# Mapeo de Dependencias: Modal y Botón de Asignaturas

## 📋 Resumen Ejecutivo
La funcionalidad de ver, crear y editar asignaturas está distribuida en **3 capas principales**:
1. **Frontend React** (componentes, modales, lógica UI)
2. **Backend Electron/IPC** (handlers y servicios)
3. **Base de Datos** (esquema y migraciones)

---

## 🎯 PARTE 1: FRONTEND REACT

### 1.1 Componentes de UI (Archivos JSX)

#### **CreateSubjectModal.jsx** ⭐ Principal
- **Ubicación:** `front/react/modals/CreateSubjectModal.jsx`
- **Función:** Modal para crear y editar asignaturas
- **Props que recibe:**
  ```jsx
  {
    isOpen,              // booleano
    form: {              // objeto con datos de asignatura
      id,
      nombre,
      tipo,
      creditos,
      carreras: [],      // array de carreras seleccionadas
      carrerasSemestre: {}, // objeto { carrera: "semestre" }
      requerimientosSalon
    },
    errorMessage,
    onClose,             // función callback
    onBack,              // función callback opcional
    onChange,            // (field, value) => void
    onCareerToggle,      // (career) => void
    onCareerSemesterChange, // (career, semester) => void
    onSubmit,            // función callback
    onDelete,            // función callback opcional
    isEditMode,          // booleano
    availableCareers     // array de strings
  }
  ```
- **Renderizado en:** `front/react/App.jsx` línea ~698
- **Estilos CSS:** `.group-modal`, `.groups-list-modal`, `.create-subject-modal`

#### **SubjectsListModal.jsx** ⭐ Secundaria
- **Ubicación:** `front/react/modals/SubjectsListModal.jsx`
- **Función:** Modal que lista todas las asignaturas existentes
- **Props que recibe:**
  ```jsx
  {
    isOpen,
    subjects,            // array de objetos asignatura
    onClose,
    onSelectSubject,     // (subject) => void (para editar)
    onCreateNew          // () => void (abre modal crear)
  }
  ```
- **Renderizado en:** `front/react/App.jsx` línea ~690

#### **SubjectGroupsModal.jsx** (Relacionado)
- **Ubicación:** `front/react/modals/SubjectGroupsModal.jsx`
- **Función:** Modal para ver grupos de una asignatura
- **Interacción:** Llama a `window.api.materias.listarCarrerasPlanes(subject)`
- **Líneas relevantes:** 120, 128

#### **GroupsModal.jsx** (Relacionado)
- **Ubicación:** `front/react/modals/GroupsModal.jsx`
- **Función:** Modal para ver grupos por asignatura
- **Interacción:** Llama a `window.api.materias.listar()`
- **Líneas relevantes:** 39, 44

#### **Sidebar.jsx**
- **Ubicación:** `front/react/components/Sidebar.jsx`
- **Botón:** "ASIGNATURAS" línea 25
- **Prop recibida:** `onOpenSubjects` (callback)
- **Línea de botón:**
  ```jsx
  <button className="action-btn" type="button" onClick={onOpenSubjects}>
    ASIGNATURAS
  </button>
  ```

### 1.2 Funciones de Lógica (Archivo JS)

#### **createSubjectModalFunctions.js** 🔧 Crítica
- **Ubicación:** `front/react/modals/createSubjectModalFunctions.js`
- **Exporta:**
  ```javascript
  window.CreateSubjectModalFunctions = {
    confirmCreateSubject,   // (options) => void
    confirmEditSubject,     // (options) => void
    confirmDeleteSubject    // (options) => void
  }
  ```
- **Qué hace cada función:**
  - `confirmCreateSubject`: Valida y agrega nueva asignatura a `subjects`
  - `confirmEditSubject`: Valida y actualiza asignatura existente
  - `confirmDeleteSubject`: Confirma eliminación de asignatura
- **Validaciones incluidas:**
  - Nombre obligatorio
  - Tipo obligatorio
  - No duplicar nombres
  - Seleccionar al menos una carrera
  - Semestre por carrera

### 1.3 Gestión de Estado en App.jsx

#### **Estados relevantes:**
```jsx
const [subjects, setSubjects] = React.useState([...]);          // Array principal
const [isSubjectsListOpen, setIsSubjectsListOpen] = React.useState(false);
const [isCreateSubjectOpen, setIsCreateSubjectOpen] = React.useState(false);
const [subjectModalError, setSubjectModalError] = React.useState("");
const [subjectForm, setSubjectForm] = React.useState({});       // Formulario
const [subjectEditMode, setSubjectEditMode] = React.useState(null);
const [subjectOpenedFromList, setSubjectOpenedFromList] = React.useState(false);
```

#### **Funciones de manejo en App.jsx:**
```jsx
// Líneas 377-410
openSubjectsListModal()              // Abre modal lista
closeSubjectsListModal()             // Cierra modal lista
openCreateSubjectFromList()          // Abre modal crear (limpio)
closeCreateSubjectModal()            // Cierra modal crear
backToSubjectsListFromModal()        // Vuelve a lista desde crear

// Líneas 414-434
updateSubjectForm(field, value)      // Actualiza form input
toggleSubjectCareer(career)          // Agrega/quita carrera
changeSubjectCareerSemester(...)     // Cambia semestre por carrera

// Líneas 437-463
selectSubjectToManage(subject)       // Carga subject en form para editar
confirmCreateSubject()               // Valida y crea
deleteSubject()                      // Elimina subject
```

### 1.4 Conexión entre componentes

```
Sidebar.jsx (botón "ASIGNATURAS")
    ↓ onClick={onOpenSubjects}
App.jsx (openSubjectsListModal)
    ↓ setIsSubjectsListOpen(true)
SubjectsListModal.jsx (muestra listado)
    ├─ onClick={onCreateNew} → openCreateSubjectFromList()
    │  ↓
    │  CreateSubjectModal.jsx (vacío, crear)
    │
    └─ onClick={onSelectSubject} → selectSubjectToManage(subject)
       ↓
       CreateSubjectModal.jsx (lleno, editar)
```

---

## 🔌 PARTE 2: BACKEND ELECTRON / IPC

### 2.1 Registro de Handlers

#### **registerHandlers.js** (Entrada)
- **Ubicación:** `modules/registerHandlers.js`
- **Línea crítica:** 2, 14
  ```javascript
  import { registrarMateriasHandlers } from "./materias/materias.handlers.js";
  // ...
  registrarMateriasHandlers();
  ```

### 2.2 Handlers IPC

#### **materias.handlers.js** 🔧 Crítica
- **Ubicación:** `modules/materias/materias.handlers.js`
- **Handlers registrados:**

| Handler | Método | Parámetro | Retorna |
|---------|--------|-----------|---------|
| `materias:crear` | POST | `{ nombre, tipo, creditos, ... }` | `{ success, data }` |
| `materias:listar` | GET | ninguno | `{ success, data: [] }` |
| `materias:listarCarrerasPlanes` | GET | `nombreMateria` | `{ success, data: [] }` |
| `materias:obtenerPorId` | GET | `id` | `{ success, data }` |
| `materias:actualizar` | PUT | `{ id, datos }` | `{ success, data }` |
| `materias:eliminar` | DELETE | `id` | `{ success, data }` |

**Ejemplo de uso en frontend:**
```javascript
await window.api.materias.listar()
await window.api.materias.crear({ nombre: "Prog 1", tipo: "A", ... })
await window.api.materias.actualizar({ id: 1, datos: {...} })
await window.api.materias.eliminar(id)
```

### 2.3 Servicios (Business Logic)

#### **materias.service.js**
- **Ubicación:** `modules/materias/materias.service.js`
- **Funciones principales:**
  ```javascript
  altaMateria(asignatura)                    // Crear
  obtenerMaterias()                          // Listar
  obtenerCarrerasPlanesPorMateriaNombre()    // Obtener carreras plan
  obtenerMateriaPorId(id)                    // Obtener por ID
  actualizarMateria(id, datos)               // Actualizar
  bajaMateria(id)                            // Eliminar
  ```

### 2.4 Repository (Acceso a BD)

#### **materias.repository.js** 🗄️
- **Ubicación:** `modules/materias/materias.repository.js`
- **Funciones de BD:**
  ```javascript
  crearMateria(asignatura)         // INSERT
  listarMaterias()                 // SELECT *
  obtenerMateriaPorId(id)          // SELECT WHERE id
  actualizarMateria(id, datos)     // UPDATE
  eliminarMateria(id)              // DELETE
  listarCarrerasPlanesPorMateria() // JOIN materias + materiaCarrera
  ```

---

## 🗄️ PARTE 3: BASE DE DATOS

### 3.1 Esquema

#### **db/drizzle/schema/base.js**
- **Tabla principal:** `materias`
  ```javascript
  {
    id: integer (PK),
    nombre: varchar,
    tipo: varchar (A, B, C),
    creditos: integer,
    tieneContrasemestre: boolean,
    // ... otros campos
  }
  ```

#### **Tabla relacionada:** `materiaCarrera` (Relación M:N)
- Conecta materias ↔ carreras con semestres
  ```javascript
  {
    idMateria: FK → materias,
    idCarrera: FK → carreras,
    semestreAnio: varchar (ej: "1er s 1er año")
  }
  ```

### 3.2 Migraciones

- **Ubicación:** `db/drizzle/migrations/`
- **Archivos relevantes:**
  - `0000_magical_hannibal_king.sql` (inicial, probablemente crea tabla materias)
  - `0001_left_fixer.sql`, `0002_abandoned_havok.sql`, etc.

---

## 📊 TABLA RESUMEN: Archivos por Funcionalidad

| Funcionalidad | Archivos | Tipo |
|---|---|---|
| **Botón en sidebar** | `Sidebar.jsx` | Frontend UI |
| **Modal lista** | `SubjectsListModal.jsx` | Frontend UI |
| **Modal crear/editar** | `CreateSubjectModal.jsx` | Frontend UI ⭐ |
| **Lógica modal** | `createSubjectModalFunctions.js` | Frontend Logic ⭐ |
| **Estado App** | `App.jsx` (líneas 50-85, 377-493) | Frontend Logic ⭐ |
| **Handlers IPC** | `materias.handlers.js` | Backend ⭐ |
| **Servicios** | `materias.service.js` | Backend |
| **Repository BD** | `materias.repository.js` | Backend |
| **Registro** | `registerHandlers.js` | Backend |
| **Esquema BD** | `db/drizzle/schema/base.js` | Database |
| **Estilos** | `front/style.css` | CSS |

---

## 🚀 PLAN DE MIGRACIÓN MANUAL

### Paso 1: Copiar archivos frontend
```
1. front/react/modals/CreateSubjectModal.jsx
2. front/react/modals/SubjectsListModal.jsx
3. front/react/modals/createSubjectModalFunctions.js
```

### Paso 2: Integrar en App.jsx
- Copiar **estados** (líneas 50-85)
- Copiar **funciones de manejo** (líneas 377-493)
- Copiar **renderizado de modales** (líneas 690-710)
- Copiar **callback en Sidebar** (línea 602: `onOpenSubjects={openSubjectsListModal}`)

### Paso 3: Copiar archivos backend
```
1. modules/materias/materias.handlers.js
2. modules/materias/materias.service.js
3. modules/materias/materias.repository.js
```

### Paso 4: Actualizar registerHandlers.js
- Importar `registrarMateriasHandlers`
- Llamar función en el registro

### Paso 5: Verificar esquema BD
- Asegurar que tabla `materias` existe en destino
- Asegurar que tabla `materiaCarrera` existe
- Copiar migraciones si no existen

### Paso 6: Verificar estilos CSS
- Copiar clases usadas del modal (búsqueda en `front/style.css`):
  - `.group-modal`
  - `.groups-list-modal`
  - `.create-subject-modal`
  - `.form-label`, `.form-input`, `.modal-*`
  - `.subject-careers-*` (nuevas)
  - `.teacher-chip*` (reutilizadas)

---

## 🔗 DEPENDENCIAS CRUZADAS (Importante)

### SubjectGroupsModal depende de materias:
```javascript
// SubjectGroupsModal.jsx línea 128
const response = await window.api.materias.listarCarrerasPlanes(subject);
```

### GroupsModal depende de materias:
```javascript
// GroupsModal.jsx línea 44
const response = await window.api.materias.listar();
```

### Data.js (Datos iniciales)
- Proporciona carreras a través de `window.AppData`
- Se pasa como prop `availableCareers` al modal

---

## ✅ Checklist de Migración

- [ ] Copiar 3 archivos frontend modales
- [ ] Copiar estados de App.jsx
- [ ] Copiar funciones de App.jsx
- [ ] Copiar renderizado en App.jsx
- [ ] Copiar prop en Sidebar
- [ ] Copiar 3 archivos backend (handlers, service, repository)
- [ ] Actualizar registerHandlers.js
- [ ] Verificar tabla `materias` en BD
- [ ] Copiar estilos CSS relevantes
- [ ] Prueba: Clicar botón "ASIGNATURAS"
- [ ] Prueba: Crear nueva asignatura
- [ ] Prueba: Editar asignatura
- [ ] Prueba: Eliminar asignatura
- [ ] Prueba: Seleccionar múltiples carreras
- [ ] Prueba: Cambiar semestre por carrera

---

## 📝 Notas Importantes

1. **Estado compartido:** `subjects` y `careers` se manejan en `App.jsx`. Si la otra branch ya tiene gestión de carreras, reutilizar.

2. **API Window:** Los handlers se acceden vía `window.api.materias.*`. Asegurar que Electron preload expone esto.

3. **Validaciones:** Están en `createSubjectModalFunctions.js`. No duplicar lógica.

4. **Carreras:** Se pasan desde `App.jsx` como `availableCareers={careers}`. Asegurar que `careers` se llena correctamente.

5. **Estilos nuevos:** En la última iteración se agregaron clases `.subject-careers-*` y `.subject-career-chip-row` que están en el último `front/style.css`.

---

## 🆘 En caso de "No funciona"

1. ¿Abre el modal? → Revisar `isSubjectsListOpen` state 
2. ¿El modal está vacío? → Revisar que `subjects` tenga datos iniciales
3. ¿Botón no hace nada? → Revisar que `onOpenSubjects` esté pasado en Sidebar
4. ¿API no responde? → Revisar que handlers estén registrados en `registerHandlers.js`
5. ¿BD vacía? → Copiar migraciones y ejecutar `npm run migrations`

---

Generado: 26 Feb 2026 | Proyecto: reto-summer-2026-calendario-fit
