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

// Datos iniciales en memoria.
const INITIAL_DATA = {
  careers: ["Ingenieria en Sistemas", "Ingenieria Industrial"],
  semesters: ["Primer semestre 2025", "Segundo semestre 2025", "Primer semestre 2026", "Segundo semestre 2026"],
  plans: ["Plan 2021", "Plan 2024"],
  // Relacion simple carrera -> planes habilitados.
  careerPlans: {
    "Ingenieria en Sistemas": ["Plan 2021", "Plan 2024"],
    "Ingenieria Industrial": ["Plan 2021"]
  },
  calendars: [
    {
      id: "s1y1",
      name: "1er semestre 1er año - Ingenieria en Sistemas",
      subtitle: "Ingenieria en Sistemas",
      lectiveTerm: "Primer semestre 2025",
      visible: true,
      classes: [
        {
          title: "Matematica Basica",
          group: "G1 - Compartida",
          detail: "Sistemas/Industrial | Aula 200",
          day: "MIE",
          start: "08:00",
          end: "09:20",
          type: "theory"
        },
        {
          title: "Fundamentos",
          group: "G1 - Alicia Mora",
          detail: "Aula 330",
          day: "VIE",
          start: "18:15",
          end: "19:35",
          type: "practice"
        },
        {
          title: "Taller 1",
          group: "G1 - Sin confirmar",
          detail: "Lab 3",
          day: "MAR",
          start: "11:00",
          end: "12:20",
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
      name: "2do semestre 1er año - Ingenieria en Sistemas",
      subtitle: "Ingenieria en Sistemas",
      lectiveTerm: "Primer semestre 2025",
      visible: true,
      classes: [
        {
          title: "Algebra",
          group: "G1 - Compartida",
          detail: "Aula 206",
          day: "LUN",
          start: "09:30",
          end: "10:50",
          type: "theory"
        },
        {
          title: "Programacion II",
          group: "G1 - Docente a confirmar",
          detail: "Lab 1",
          day: "JUE",
          start: "12:25",
          end: "13:45",
          type: "lab"
        }
      ],
      alerts: []
    },
    {
      id: "i-s1y1",
      name: "1er semestre 1er año - Ingenieria Industrial",
      lectiveTerm: "Primer semestre 2025",
      subtitle: "Ingenieria Industrial",
      visible: true,
      classes: [
        {
          title: "Matematica Basica",
          group: "G1 - Compartida",
          detail: "Sistemas/Industrial | Aula 200",
          day: "MIE",
          start: "08:00",
          end: "09:20",
          type: "theory"
        },
        {
          title: "Fisica 1",
          group: "G1 - Juan Perez",
          detail: "Industrial | Aula 210",
          day: "LUN",
          start: "11:00",
          end: "12:20",
          type: "theory"
        },
        {
          title: "Economia 1",
          group: "G1 - Pedro Mendez",
          detail: "Industrial | Aula 104",
          day: "JUE",
          start: "18:15",
          end: "19:35",
          type: "practice"
        }
      ],
      alerts: []
    },
    {
      id: "s1y2",
      name: "1er semestre 2do año - Ingenieria en Sistemas",
      lectiveTerm: "Primer semestre 2025",
      visible: false,
      classes: [],
      alerts: []
    },
    {
      id: "s2y2",
      name: "2do semestre 2do año - Ingenieria en Sistemas",
      subtitle: "Ingenieria en Sistemas",
      lectiveTerm: "Primer semestre 2025",
      visible: false,
      classes: [],
      alerts: []
    },
    {
      id: "s2y1-2025-2",
      name: "2do semestre 1er año - Ingenieria en Sistemas",
      subtitle: "Ingenieria en Sistemas",
      lectiveTerm: "Segundo semestre 2025",
      visible: true,
      classes: [
        {
          title: "Estructuras de Datos",
          group: "G1 - Laura Diaz",
          detail: "Aula 305",
          day: "MAR",
          start: "09:30",
          end: "10:50",
          type: "theory"
        },
        {
          title: "Estructuras de Datos",
          group: "G1 - Laura Diaz",
          detail: "Lab 2",
          day: "JUE",
          start: "18:15",
          end: "19:35",
          type: "lab"
        },
        {
          title: "Arquitectura de Computadores",
          group: "G1 - Miguel Torres",
          detail: "Aula 210",
          day: "LUN",
          start: "11:00",
          end: "12:20",
          type: "theory"
        }
      ],
      alerts: [
        "Estructuras de Datos comparte laboratorio con Redes."
      ]
    },
    {
      id: "s2y2-2025-2",
      name: "2do semestre 2do año - Ingenieria en Sistemas",
      subtitle: "Ingenieria en Sistemas",
      lectiveTerm: "Segundo semestre 2025",
      visible: true,
      classes: [
        {
          title: "Bases de Datos",
          group: "G1 - Ana Rodriguez",
          detail: "Lab 4",
          day: "MIE",
          start: "08:00",
          end: "09:20",
          type: "lab"
        },
        {
          title: "Sistemas Operativos",
          group: "G1 - Carlos Vega",
          detail: "Aula 120",
          day: "VIE",
          start: "16:50",
          end: "18:10",
          type: "theory"
        }
      ],
      alerts: []
    },

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

// Detecta año segun el nombre del calendario.
function yearFromCalendarName(name) {
  const normalized = name.toLowerCase();

  if (normalized.includes("1er año")) return "1";
  if (normalized.includes("2do año")) return "2";
  if (normalized.includes("3er año")) return "3";

  return "";
}

// Etiqueta corta para mostrar año en mensajes.
function yearLabel(year) {
  if (year === "1") return "1er";
  if (year === "2") return "2do";
  return "3er";
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
