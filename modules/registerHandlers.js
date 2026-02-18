import { registerDocentesHandlers } from "./docentes/docentes.handlers.js";
import { registrarMateriasHandlers } from "./materias/materias.handlers.js";
import { registerCarrerasHandlers } from "./carreras/carreras.handlers.js";
// más adelante:
// import { registerAlumnosHandlers } from "./alumnos/alumnos.handlers.js";

export function registerAllHandlers() {
  registerDocentesHandlers();
  registrarMateriasHandlers();
  registerCarrerasHandlers();
  // registerAlumnosHandlers();
}
