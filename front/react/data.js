/*
  Datos base de la app de calendario.
  Este archivo mantiene constantes y funciones simples reutilizables.
*/

const DAYS = ["LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];

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

const START_HOUR = 8;
const END_HOUR = 23;
const ROW_HEIGHT = 88;
const HEADER_HEIGHT = 28;
const TIME_COL_WIDTH = 72;

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
        name: `${semester === 1 ? "1er" : "2do"} semestre ${ordinalYearLabel(year)} año`,
        subtitle: "Ingenieria en Sistemas 2021",
        lectiveTerm: "Semestre lectivo actual",
        visible: year === 1,
        classes: [],
        alerts: []
      });
    }
  }

  return calendars;
}

const INITIAL_DATA = {
  careers: [
    "Ingenieria en Sistemas 2021",
    "Ingenieria en Sistemas 2026",
    "Ingenieria Electrica 2021"
  ],
  calendars: buildCalendars()
};

function cloneInitialData() {
  return JSON.parse(JSON.stringify(INITIAL_DATA));
}

function timeToMinutes(time) {
  const [hours, minutes] = String(time).split(":").map(Number);
  return hours * 60 + minutes;
}

function yearFromCalendarName(name) {
  const normalized = String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized.includes("1er")) return "1";
  if (normalized.includes("2do")) return "2";
  if (normalized.includes("3er")) return "3";
  if (normalized.includes("4to")) return "4";
  if (normalized.includes("5to")) return "5";
  return "";
}

function yearLabel(year) {
  if (year === "1") return "1er";
  if (year === "2") return "2do";
  if (year === "3") return "3er";
  if (year === "4") return "4to";
  return "5to";
}

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
  yearFromCalendarName,
  yearLabel
};
