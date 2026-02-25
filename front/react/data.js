/*
  Este archivo guarda:
  1) Constantes de calendario (dias y bloques horarios)
  2) Colores para los bloques
  3) Datos iniciales de la app
  4) Funciones utilitarias simples
*/

// Dias visibles en la grilla semanal.
const DAYS = ["LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];

// Bloques fijos de horario para todos los dias.
const TIME_BLOCKS = [
  { start: "08:00", end: "09:20", label: "08:00 - 09:20" },
  { start: "09:30", end: "10:50", label: "09:30 - 10:50" },
  { start: "11:00", end: "12:20", label: "11:00 - 12:20" },
  { start: "12:25", end: "13:45", label: "12:25 - 13:45" },
  { start: "16:50", end: "18:10", label: "16:50 - 18:10" },
  { start: "18:15", end: "19:35", label: "18:15 - 19:35" },
  { start: "19:45", end: "21:05", label: "19:45 - 21:05" },
  { start: "21:15", end: "22:35", label: "21:15 - 22:35" }
];

// Para dibujar la grilla "como antes", usamos rango horario continuo.
const START_HOUR = 8;
const END_HOUR = 23;

// Alto de cada fila de hora (en pixeles).
const ROW_HEIGHT = 88;

// Alto de la fila de encabezado de dias (en pixeles).
const HEADER_HEIGHT = 28;

// Ancho de la columna de horas (en pixeles).
const TIME_COL_WIDTH = 72;

// Color por tipo de bloque.
const COLOR_BY_TYPE = {
  theory: "#ef8a3b",
  practice: "#3ba9ab",
  lab: "#cb6345"
};

function ordinalYearLabel(year) {
  if (year === 1) return "1er";
  if (year === 2) return "2do";
  if (year === 3) return "3er";
  if (year === 4) return "4to";
  return "5to";
}

function buildCalendars() {
  const calendars = [];

  for (let year = 1; year <= 5; year += 1) {
    for (let semester = 1; semester <= 2; semester += 1) {
      calendars.push({
        id: `s${semester}y${year}`,
        name: `${semester}er semestre ${ordinalYearLabel(year)} año`.replace("2er", "2do"),
        subtitle: "Ingenieria en Sistemas",
        visible: year === 1 && semester <= 2,
        classes: [],
        alerts: []
      });
    }
  }

  return calendars;
}

// Datos iniciales en memoria.
const INITIAL_DATA = {
  careers: [
    "Ingenieria en Sistemas 2021",
    "Ingenieria en Sistemas 2026",
    "Ingenieria Industrial 2021"
  ],
  calendars: buildCalendars()
};

// Devuelve una copia profunda para evitar compartir referencias.
function cloneInitialData() {
  return JSON.parse(JSON.stringify(INITIAL_DATA));
}

// Convierte "HH:MM" a minutos totales.
function timeToMinutes(time) {
  const parts = time.split(":").map(Number);
  return parts[0] * 60 + parts[1];
}

// Convierte numero de hora a formato "HH:00".
function formatHour(hour) {
  return `${String(hour).padStart(2, "0")}:00`;
}

// Detecta año segun el nombre del calendario.
function yearFromCalendarName(name) {
  const normalized = String(name || "").toLowerCase();
  const match = normalized.match(/([1-5])(er|do|to)\s+a(ñ|n)io/);
  if (match) return match[1];
  return "";
}

// Etiqueta corta para mostrar año en mensajes.
function yearLabel(year) {
  if (year === "1") return "1er";
  if (year === "2") return "2do";
  if (year === "3") return "3er";
  if (year === "4") return "4to";
  return "5to";
}

// Se expone todo en un solo objeto global para mantenerlo simple.
window.AppData = {
  DAYS,
  TIME_BLOCKS,
  START_HOUR,
  END_HOUR,
  ROW_HEIGHT,
  HEADER_HEIGHT,
  TIME_COL_WIDTH,
  COLOR_BY_TYPE,
  cloneInitialData,
  timeToMinutes,
  formatHour,
  yearFromCalendarName,
  yearLabel
};
