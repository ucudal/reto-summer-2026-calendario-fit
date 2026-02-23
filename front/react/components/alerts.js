/*
  alerts.js
  - Detecta docentes sin confirmar.
  - Detecta superposición de horarios entre clases visibles.
*/

function timeToMin(str) {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
}

function overlaps(s1, e1, s2, e2) {
  return s1 < e2 && s2 < e1;
}

function calculateAlerts(visibleCalendars) {
  const alerts = [];
  const seen = new Set();

  function add(alert) {
    const key = `${alert.type}|${alert.courseTitle}|${alert.groupId}`;
    if (!seen.has(key)) {
      seen.add(key);
      alerts.push(alert);
    }
  }

  // Junta todas las clases visibles en un solo array
  const allClasses = [];
  for (const cal of visibleCalendars) {
    for (const cls of cal.classes) {
      allClasses.push(cls);
    }
  }

  for (const cls of allClasses) {
    //  Alerta 1: docente sin confirmar
    if (!cls.teacher || cls.teacher.trim() === "") {
      add({
        type: "unconfirmed_teacher",
        message: `${cls.title} (${cls.group}) sin docente confirmado.`,
        courseTitle: cls.title,
        groupId: cls.group,
      });
    }

    // Alerta 2: superposición de horarios
    for (const other of allClasses) {
      if (other === cls) continue;
      // Evitar duplicados A→B y B→A
      if (cls.title + cls.group > other.title + other.group) continue;

      if (cls.day !== other.day) continue;

      const s1 = timeToMin(cls.start),
        e1 = timeToMin(cls.end);
      const s2 = timeToMin(other.start),
        e2 = timeToMin(other.end);

      if (overlaps(s1, e1, s2, e2)) {
        add({
          type: "schedule_conflict",
          message: `${cls.title} (${cls.group}) se superpone con ${other.title} (${other.group}) el ${cls.day}.`,
          courseTitle: cls.title,
          groupId: cls.group,
        });
        add({
          type: "schedule_conflict",
          message: `${cls.title} (${cls.group}) se superpone con ${other.title} (${other.group}) el ${cls.day}.`,
          courseTitle: other.title,
          groupId: other.group,
        });
      }
    }
  }

  return alerts;
}

window.calculateAlerts = calculateAlerts;
