(() => {
  function useAlerts({ data, setData }) {
    React.useEffect(() => {
      if (!data || !Array.isArray(data.calendars)) return;

      function parseTime(t) {
        if (!t || typeof t !== "string") return null;
        const parts = t.split(":").map((p) => Number(p));
        if (
          parts.length < 2 ||
          Number.isNaN(parts[0]) ||
          Number.isNaN(parts[1])
        )
          return null;
        return parts[0] * 60 + parts[1];
      }

      function rangesOverlap(aStart, aEnd, bStart, bEnd) {
        return aStart < bEnd && bStart < aEnd;
      }

      const newCalendars = data.calendars.map((cal) => {
        const classes = Array.isArray(cal.classes) ? cal.classes : [];
        const calAlerts = [];
        const classAlerts = classes.map(() => []);

        // 1) Docente sin confirmar
        classes.forEach((cl, idx) => {
          if (!Array.isArray(cl.teachers) || cl.teachers.length === 0) {
            classAlerts[idx].push("no_teacher");
            calAlerts.push(
              `Docente sin confirmar "${cl.title || ""}" (${cl.group || cl.classNumber || "G?"}) sin docente confirmado.`,
            );
          }
        });

        
        for (let i = 0; i < classes.length; i += 1) {
          for (let j = i + 1; j < classes.length; j += 1) {
            const A = classes[i];
            const B = classes[j];
            if (!A || !B) continue;
            if (A.day !== B.day) continue;
            const aStart = parseTime(A.start);
            const aEnd = parseTime(A.end);
            const bStart = parseTime(B.start);
            const bEnd = parseTime(B.end);
            if (
              aStart == null ||
              aEnd == null ||
              bStart == null ||
              bEnd == null
            )
              continue;
            if (!rangesOverlap(aStart, aEnd, bStart, bEnd)) continue;

            const titleA = String(A.title || "");
            const titleB = String(B.title || "");
            const groupA = String(A.group || A.classNumber || "").trim();
            const groupB = String(B.group || B.classNumber || "").trim();
            const teachersA = Array.isArray(A.teachers) ? A.teachers : [];
            const teachersB = Array.isArray(B.teachers) ? B.teachers : [];

        
            if (titleA === titleB && groupA && groupA === groupB) {
              classAlerts[i].push("duplicate_group");
              classAlerts[j].push("duplicate_group");
              calAlerts.push(
                `Grupo duplicado en mismo calendario "${titleA}" (${groupA}) tiene entradas duplicadas con horario superpuesto en ${cal.name}`,
              );
            }

            // Superposición entre clases distintas en mismo grupo
            if (groupA && groupA === groupB && titleA !== titleB) {
              classAlerts[i].push("overlap_diff_classes_same_group");
              classAlerts[j].push("overlap_diff_classes_same_group");
              calAlerts.push(
                `Superposición entre clases distintas "${titleA}" (${groupA}) se superpone con "${titleB}" (${groupB}) el ${A.day}.`,
              );
            }

            
            const shared = teachersA.filter((t) => teachersB.includes(t));
            shared.forEach((t) => {
              if (titleA === titleB && groupA !== groupB) {
                classAlerts[i].push("teacher_same_subject_diff_group");
                classAlerts[j].push("teacher_same_subject_diff_group");
                calAlerts.push(
                  `Mismo docente, misma materia, distinto grupo: Docente "${t}" dicta "${titleA}" en dos grupos distintos (${groupA} y ${groupB}) con horario superpuesto el ${A.day}.`,
                );
              } else if (titleA !== titleB) {
                classAlerts[i].push("teacher_diff_subject");
                classAlerts[j].push("teacher_diff_subject");
                calAlerts.push(
                  `Mismo docente, distinta materia: Docente "${t}" tiene dos materias distintas al mismo tiempo el ${A.day}: "${titleA}" y "${titleB}".`,
                );
              }
            });
          }
        }

    
        const newClasses = classes.map((cl, idx) => ({
          ...cl,
          _alerts: Array.from(new Set(classAlerts[idx] || [])),
        }));

        return {
          ...cal,
          classes: newClasses,
          alerts: Array.from(new Set(calAlerts)),
        };
      });

      // 5) Curso compartido inconsistente entre calendarios
    
      const sharedMap = {};
      newCalendars.forEach((cal) => {
        (cal.classes || []).forEach((cl) => {
          const key = `${String(cl.title || "").toLowerCase()}||${String(
            cl.group || cl.classNumber || "",
          ).toLowerCase()}`;
          if (!sharedMap[key]) sharedMap[key] = {};
          const calSet = sharedMap[key][cal.name] || new Set();
          calSet.add(`${cl.day}|${cl.start}|${cl.end}`);
          sharedMap[key][cal.name] = calSet;
        });
      });

      Object.keys(sharedMap).forEach((k) => {
        const perCal = sharedMap[k];
        const calNames = Object.keys(perCal);
        if (calNames.length < 2) return;
        const repr = calNames.map((n) =>
          Array.from(perCal[n]).sort().join(";"),
        );
        const allEqual = repr.every((r) => r === repr[0]);
        if (!allEqual) {
          const parts = k.split("||");
          const title = parts[0] || "";
          const group = parts[1] || "G?";
          const msg = `Curso compartido inconsistente entre calendarios "${title}" (${group}) tiene horarios distintos en ${calNames.join(" y ")}. Revisá la inconsistencia.`;
        
          newCalendars.forEach((cal, ci) => {
            const has = (cal.classes || []).some(
              (cl) =>
                String(cl.title || "").toLowerCase() === title &&
                String(cl.group || cl.classNumber || "").toLowerCase() ===
                  group,
            );
            if (has) {
              cal.alerts = Array.from(new Set([...(cal.alerts || []), msg]));
              cal.classes = (cal.classes || []).map((cl) => {
                if (
                  String(cl.title || "").toLowerCase() === title &&
                  String(cl.group || cl.classNumber || "").toLowerCase() ===
                    group
                ) {
                  return {
                    ...cl,
                    _alerts: Array.from(
                      new Set([...(cl._alerts || []), "shared_inconsistent"]),
                    ),
                  };
                }
                return cl;
              });
            }
          });
        }
      });

    
      const finalCalendars = newCalendars.map((cal) => ({
        ...cal,
        alerts: Array.from(new Set(cal.alerts || [])),
      }));

      
      setData((prev) => {
        try {
          const prevJson = JSON.stringify(prev.calendars || []);
          const nextJson = JSON.stringify(finalCalendars || []);
          if (prevJson === nextJson) return prev;
        } catch (e) {
          
        }
        return { ...prev, calendars: finalCalendars };
      });
    }, [data]);
  }

  window.useAlerts = useAlerts;
})();
