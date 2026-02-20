/*
  Este archivo guarda:
  1) Constantes de calendario (dias, hora inicio, hora fin)
  2) Colores para los bloques
  3) Datos iniciales de la app
  4) Funciones utilitarias simples
*/

// Dias visibles en la grilla semanal.
const DAYS = ["LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];

// Hora minima visible en calendario.
const START_HOUR = 8;

// Hora maxima visible en calendario.
const END_HOUR = 20;

// Alto de cada fila de hora (en pixeles).
const ROW_HEIGHT = 44;

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

// Datos iniciales en memoria.
const INITIAL_DATA = {
  careers: ["Ingenieria en Sistemas", "Ingenieria Industrial"],
  plans: ["Plan 2021", "Plan 2024"],
  calendars: [
    {
      id: "s1y1",
      name: "1er semestre 1er anio",
      subtitle: "Ingenieria en Sistemas",
      visible: true,
      classes: [
        {
          title: "Matematica Basica",
          group: "G1 - Compartida",
          detail: "Sistemas/Industrial | Aula 200",
          day: "MIE",
          start: "08:00",
          end: "10:00",
          type: "theory"
        },
        {
          title: "Fundamentos",
          group: "G1 - Alicia Mora",
          detail: "Aula 330",
          day: "VIE",
          start: "09:00",
          end: "11:00",
          type: "practice"
        },
        {
          title: "Taller 1",
          group: "G1 - Sin confirmar",
          detail: "Lab 3",
          day: "MAR",
          start: "12:00",
          end: "14:00",
          type: "lab"
        }
      ],
      alerts: [
        "Matematica 1 (compartida) se pisa con Fisica 1 en Industrial.",
        "Programacion I (G2) sin docente confirmado."
      ]
    },
    {
      id: "s2y1",
      name: "2do semestre 1er anio",
      subtitle: "Ingenieria en Sistemas",
      visible: true,
      classes: [
        {
          title: "Algebra",
          group: "G1 - Compartida",
          detail: "Aula 206",
          day: "LUN",
          start: "10:00",
          end: "12:00",
          type: "theory"
        },
        {
          title: "Programacion II",
          group: "G1 - Docente a confirmar",
          detail: "Lab 1",
          day: "JUE",
          start: "14:00",
          end: "16:00",
          type: "lab"
        }
      ],
      alerts: []
    },
    {
      id: "s1y2",
      name: "1er semestre 2do anio",
      subtitle: "Ingenieria en Sistemas",
      visible: false,
      classes: [],
      alerts: []
    },
    {
      id: "s2y2",
      name: "2do semestre 2do anio",
      subtitle: "Ingenieria en Sistemas",
      visible: false,
      classes: [],
      alerts: []
    },
    {
      id: "s3",
      name: "3er anio",
      subtitle: "Ingenieria en Sistemas",
      visible: false,
      classes: [],
      alerts: []
    }
  ]
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

// Detecta anio segun el nombre del calendario.
function yearFromCalendarName(name) {
  const normalized = name.toLowerCase();

  if (normalized.includes("1er anio")) return "1";
  if (normalized.includes("2do anio")) return "2";
  if (normalized.includes("3er anio")) return "3";

  return "";
}

// Etiqueta corta para mostrar anio en mensajes.
function yearLabel(year) {
  if (year === "1") return "1er";
  if (year === "2") return "2do";
  return "3er";
}

// Se expone todo en un solo objeto global para mantenerlo simple.
window.AppData = {
  DAYS,
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
