import { registerDocentesHandlers } from "./docentes/docentes.handlers.js";
// más adelante:
// import { registerAlumnosHandlers } from "./alumnos/alumnos.handlers.js";

export function registerAllHandlers() {
  registerDocentesHandlers();
  // registerAlumnosHandlers();
}
