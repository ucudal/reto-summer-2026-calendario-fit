// front/react/services/excelService.js
// Nota: NO usar import/export en esta app (Babel standalone + scripts).
// ExcelJS llega por <script src="../node_modules/exceljs/dist/exceljs.min.js"></script>

(function () {
    const INSTITUTION_BLUE = "FF0B2D4A"; // azul institucional (ajustable)
    const HEADER_TEXT_COLOR = "FFFFFFFF";
    const LIGHT_HEADER_FILL = "FFF2F2F2";

    // ✅ Base64 en TXT (renderer-safe: sin fs, sin require)
    // Archivo: front/react/services/ucuLogo.base64.txt
    // Contenido: solo el base64, sin "data:image/png;base64,"
    const LOGO_BASE64_TXT_PATH = "./react/services/ucuLogo.base64.txt";

    // Cache simple para no fetchear el txt por cada export
    let _cachedLogoBase64 = null;
    let _cachedLogoLoadError = null;

    function safeSheetName(name) {
        const cleaned = String(name || "Hoja")
            .replace(/[\[\]\*\/\\\?\:]/g, " ")
            .trim();
        return cleaned.slice(0, 31) || "Hoja";
    }

    function hexToArgb(hex) {
        const h = String(hex || "").replace("#", "").trim();
        const six =
            h.length === 3 ? h.split("").map((ch) => ch + ch).join("") : h.padStart(6, "0").slice(0, 6);
        return "FF" + six.toUpperCase();
    }

    function pickClassHexColor(cls, COLOR_BY_TYPE) {
        // ✅ Prioridad 1: color del grupo (la app ya lo guarda en GROUP_COLORS)
        const direct = String(cls?.color || "").trim();
        if (direct) return direct;

        // ✅ Prioridad 2: si viene como cls.groups[0].color
        const groups = Array.isArray(cls?.groups) ? cls.groups : [];
        const groupColor = String(groups[0]?.color || "").trim();
        if (groupColor) return groupColor;

        // ✅ Fallback: por tipo (lo viejo)
        const t = String(cls?.type || "").trim();
        const byType = t && COLOR_BY_TYPE ? COLOR_BY_TYPE[t] : "";
        if (byType) return byType;

        return "#D9D9D9";
    }

    function normalizeText(s) {
        return String(s || "").trim().toLowerCase();
    }

    function getSemesterYearFromId(id) {
        const match = String(id || "").match(/^s([12])y([1-5])/);
        if (!match) return null;
        return { semester: match[1], year: match[2] };
    }

    function isLectiveTermFirst(lectiveTerm) {
        const t = normalizeText(lectiveTerm);
        return t.includes("1er semestre") || t.startsWith("1er");
    }

    function isLectiveTermSecond(lectiveTerm) {
        const t = normalizeText(lectiveTerm);
        return t.includes("2do semestre") || t.startsWith("2do");
    }

    // Regla CONTRASEMESTRE:
    // - Si lectivo es 1er semestre: marcar s2y1 y s2y2
    // - Si lectivo es 2do semestre: marcar s1y1 y s1y2
    function shouldMarkContra(calendar) {
        const info = getSemesterYearFromId(calendar?.id);
        if (!info) return false;

        const isYear12 = info.year === "1" || info.year === "2";
        if (!isYear12) return false;

        const lective = String(calendar?.lectiveTerm || "");
        const lectiveIsFirst = isLectiveTermFirst(lective);
        const lectiveIsSecond = isLectiveTermSecond(lective);

        if (lectiveIsFirst && info.semester === "2") return true;
        if (lectiveIsSecond && info.semester === "1") return true;

        return false;
    }

    // “Carreras de X” según selectedCareer:
    // tus reglas de matching + quitar "Ingeniería " del resultado final.
    function resolveCarreraHeader(selectedCareer) {
        if (!selectedCareer) return "Carreras";

        let value = String(selectedCareer)
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // quitar acentos
            .trim();

        // eliminar palabras basura
        value = value
            .replace(/\bingenieria\b/g, "")
            .replace(/\bing\b/g, "")
            .replace(/\ben\b/g, "")
            .replace(/\bde\b/g, "")
            .replace(/\baño\b/g, "")
            .replace(/\banio\b/g, "")
            .replace(/\b\d{4}\b/g, "") // elimina 2021, 2026, etc
            .replace(/\s+/g, " ")
            .trim();

        // capitalizar primera letra
        const finalName =
            value.charAt(0).toUpperCase() + value.slice(1);

        return `Carreras de ${finalName}`;
    }

    function rangesOverlap(aStart, aEnd, bStart, bEnd) {
        return aStart <= bEnd && bStart <= aEnd;
    }

    // Asignación tipo “calendar layout” para crear subcolumnas por día
    function assignLanesForDay(classesForDay, blockIndexByStart, blockIndexByEnd) {
        const mapped = (classesForDay || [])
            .map((cls) => {
                const sIdx = blockIndexByStart.get(String(cls.start));
                const eIdx = blockIndexByEnd.get(String(cls.end));
                if (sIdx == null || eIdx == null) return null;
                return { cls, startIdx: sIdx, endIdx: eIdx };
            })
            .filter(Boolean)
            .sort((a, b) => {
                if (a.startIdx !== b.startIdx) return a.startIdx - b.startIdx;
                return a.endIdx - b.endIdx;
            });

        const lanes = []; // lane -> rangos ya ocupados
        const assigned = [];

        for (const item of mapped) {
            let placedLane = -1;

            for (let laneIndex = 0; laneIndex < lanes.length; laneIndex++) {
                const laneRanges = lanes[laneIndex];
                let conflict = false;

                for (const r of laneRanges) {
                    if (rangesOverlap(item.startIdx, item.endIdx, r.startIdx, r.endIdx)) {
                        conflict = true;
                        break;
                    }
                }

                if (!conflict) {
                    placedLane = laneIndex;
                    laneRanges.push({ startIdx: item.startIdx, endIdx: item.endIdx });
                    break;
                }
            }

            if (placedLane === -1) {
                placedLane = lanes.length;
                lanes.push([{ startIdx: item.startIdx, endIdx: item.endIdx }]);
            }

            assigned.push({ ...item, lane: placedLane });
        }

        return { assigned, laneCount: Math.max(1, lanes.length) };
    }

    function buildClassRichLines(cls) {

        const title =
            cls?.title ||
            cls?.subject ||
            cls?.materia ||
            cls?.nombreMateria ||
            "";

        const teachersArray = Array.isArray(cls?.teachers) ? cls.teachers : [];

        const teacher =
            teachersArray.length > 0
                ? teachersArray.join(", ")
                : "TBD";

        const classNumber =
            cls?.classNumber ||
            cls?.numeroClase ||
            cls?.nroClase ||
            cls?.idClase ||
            cls?.classId ||
            "";

        const creditsRaw =
            cls?.credits ??
            cls?.creditos ??
            cls?.credito;

        const credits =
            typeof creditsRaw === "number" && !isNaN(creditsRaw)
                ? creditsRaw
                : null;

        const lines = [];

        if (title) lines.push(String(title));

        lines.push(String(teacher)); // siempre mostramos docente o TBD

        if (classNumber) lines.push(`N° de clase: ${classNumber}`);

        if (credits !== null) lines.push(`Créditos: ${credits}`);

        return lines;
    }

    async function loadLogoBase64FromTxt() {
        if (_cachedLogoBase64) return _cachedLogoBase64;
        if (_cachedLogoLoadError) throw _cachedLogoLoadError;

        try {
            const res = await fetch(LOGO_BASE64_TXT_PATH);
            if (!res.ok) throw new Error(`No se pudo cargar base64 txt: ${LOGO_BASE64_TXT_PATH}`);
            const txt = (await res.text()).trim();
            if (!txt) throw new Error("El archivo base64 txt está vacío");
            _cachedLogoBase64 = txt;
            return _cachedLogoBase64;
        } catch (e) {
            _cachedLogoLoadError = e;
            throw e;
        }
    }

    function setFill(cell, argb) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb } };
    }

    function setBorder(cell, border) {
        cell.border = border;
    }

    function borderAllThin() {
        return {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" }
        };
    }

    function borderRowThickTopBottom() {
        return {
            top: { style: "medium" },
            left: { style: "thin" },
            bottom: { style: "medium" },
            right: { style: "thin" }
        };
    }

    function borderHeaderMedium() {
        return {
            top: { style: "medium" },
            left: { style: "medium" },
            bottom: { style: "medium" },
            right: { style: "medium" }
        };
    }

    window.exportSchedulesToExcel = async function exportSchedulesToExcel(payload) {
        if (!window.ExcelJS || !window.ExcelJS.Workbook) {
            throw new Error("ExcelJS no está cargado. Revisá el script exceljs.min.js en index.html.");
        }
        if (!window.AppData) {
            throw new Error("AppData no está cargado. Revisá el orden de scripts (data.js antes que excelService.js).");
        }

        const calendars = payload?.calendars;
        const selectedCareer = payload?.selectedCareer;
        const currentLectiveTerm = payload?.currentLectiveTerm;

        // ✅ default 2026
        const selectedPlan = "20__";

        if (!Array.isArray(calendars)) throw new Error("Payload inválido: falta calendars[]");
        if (!selectedCareer) throw new Error("Payload inválido: falta selectedCareer");
        if (!currentLectiveTerm) throw new Error("Payload inválido: falta currentLectiveTerm");

        const { DAYS, TIME_BLOCKS, COLOR_BY_TYPE } = window.AppData;

        const calendarsToExport = calendars.filter((c) => {
            if (!c) return false;
            const sameCareer = String(c.subtitle || "") === String(selectedCareer || "");
            const sameLective = String(c.lectiveTerm || "") === String(currentLectiveTerm || "");
            return sameCareer && sameLective;
        });

        if (calendarsToExport.length === 0) {
            throw new Error(`No hay calendarios para exportar para:\n- ${selectedCareer}\n- ${currentLectiveTerm}`);
        }

        // Pre-maps para bloques
        const blockIndexByStart = new Map();
        const blockIndexByEnd = new Map();
        TIME_BLOCKS.forEach((b, idx) => {
            blockIndexByStart.set(String(b.start), idx);
            blockIndexByEnd.set(String(b.end), idx);
        });

        const workbook = new window.ExcelJS.Workbook();
        workbook.creator = "CalendarioFIT";
        workbook.created = new Date();

        // ✅ Logo desde TXT (sin estirar)
        let logoImageId = null;
        try {
            const base64 = await loadLogoBase64FromTxt();
            logoImageId = workbook.addImage({
                base64: `data:image/png;base64,${base64}`,
                extension: "png"
            });
        } catch (e) {
            console.warn("No se pudo cargar el logo base64 (txt). Exportará sin logo. Detalle:", e?.message || e);
        }

        const headerCarreraLine = resolveCarreraHeader(selectedCareer);

        for (const calendar of calendarsToExport) {
            // ====== LANES POR DÍA ======
            const classes = Array.isArray(calendar.classes) ? calendar.classes : [];
            const classesByDay = {};
            for (const d of DAYS) classesByDay[d] = [];
            for (const cls of classes) {
                const day = String(cls?.day || "");
                if (!classesByDay[day]) continue;
                classesByDay[day].push(cls);
            }

            const dayLanesInfo = {};
            let totalDayCols = 0;
            for (const day of DAYS) {
                const info = assignLanesForDay(classesByDay[day], blockIndexByStart, blockIndexByEnd);
                dayLanesInfo[day] = info;
                totalDayCols += info.laneCount;
            }

            // ✅ ancho mínimo A..I para evitar “hueco” al final (como tus screenshots)
            const lastCol = 1 + totalDayCols;

            const sheet = workbook.addWorksheet(safeSheetName(calendar.name));

            // ====== COLUMN WIDTHS (PDF-ish) ======
            sheet.getColumn(1).width = 16; // HORA
            for (let c = 2; c <= lastCol; c++) sheet.getColumn(c).width = 26;

            // ====== HEADER AZUL (merge 1-2 sin corte) ======
            sheet.mergeCells(1, 1, 2, lastCol);
            const headerCell = sheet.getCell(1, 1);

            headerCell.value = {
                richText: [
                    {
                        text: "Facultad de Ingeniería y Tecnologías",
                        font: { bold: true, color: { argb: HEADER_TEXT_COLOR }, size: 14 }
                    },
                    { text: "\n" },
                    {
                        text: headerCarreraLine,
                        font: { bold: true, color: { argb: HEADER_TEXT_COLOR }, size: 12 }
                    }
                ]
            };

            setFill(headerCell, INSTITUTION_BLUE);
            headerCell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };

            sheet.getRow(1).height = 26;
            sheet.getRow(2).height = 22;

            // ✅ LOGO con padding (NO estirar)
            // ExcelJS: usar tl + ext evita deformación.
            if (logoImageId != null) {

                const logoWidthPx = 160;   // más chico
                const logoHeightPx = 42;   // proporcional

                const lastCol0 = lastCol - 1; // 0-based

                sheet.addImage(logoImageId, {
                    tl: {
                        col: lastCol0,   // 👈 casi al borde derecho real
                        row: 0.55              // 👈 centrado verticalmente en filas 1–2
                    },
                    ext: {
                        width: logoWidthPx,
                        height: logoHeightPx
                    }
                });
            }

            // ====== TITULO (fila 3: ya no existe “fila 3 al pedo”) ======
            const titleStartRow = 3; // 👈 antes era 4

            const titleLine1 = `HORARIOS ${String(calendar.name || "").toUpperCase()}`;
            const hasContra = shouldMarkContra(calendar);

            sheet.mergeCells(titleStartRow, 1, titleStartRow, lastCol);
            const t1 = sheet.getCell(titleStartRow, 1);
            t1.value = titleLine1;
            t1.font = { bold: true, size: 14 };
            t1.alignment = { horizontal: "center", vertical: "middle" };
            sheet.getRow(titleStartRow).height = 26;

            let cursorRow = titleStartRow + 1;

            if (hasContra) {
                sheet.mergeCells(cursorRow, 1, cursorRow, lastCol);
                const t2 = sheet.getCell(cursorRow, 1);
                t2.value = "CONTRASEMESTRE";
                t2.font = { bold: true, size: 13, color: { argb: "FFFF0000" } };
                t2.alignment = { horizontal: "center", vertical: "middle" };
                sheet.getRow(cursorRow).height = 22;
                cursorRow++;
            }

            sheet.mergeCells(cursorRow, 1, cursorRow, lastCol);
            const t3 = sheet.getCell(cursorRow, 1);
            t3.value = `– PLAN ${selectedPlan}`;
            t3.font = { bold: true, size: 12 };
            t3.alignment = { horizontal: "center", vertical: "middle" };
            sheet.getRow(cursorRow).height = 20;

            cursorRow += 1;

            sheet.mergeCells(cursorRow, 1, cursorRow, lastCol);
            const sub = sheet.getCell(cursorRow, 1);
            sub.value = "Además de estos cursos puedes hacer al menos uno del Core UCU en cualquiera de las áreas de Antropología y Filosofía, Ética y Ciudadanía o Sociedad y Religión. ";
            sub.font = { italic: true, size: 10, color: { argb: "FFB00020" } };
            sub.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            sheet.getRow(cursorRow).height = 18;

            cursorRow += 1;

            // ====== HEADER DE TABLA ======
            const headerRowIndex = cursorRow;

            const headerRow = sheet.getRow(headerRowIndex);
            headerRow.height = 24;

            const horaHeader = headerRow.getCell(1);
            horaHeader.value = "HORA";
            horaHeader.font = { bold: true };
            horaHeader.alignment = { horizontal: "center", vertical: "middle" };
            setFill(horaHeader, LIGHT_HEADER_FILL);
            setBorder(horaHeader, borderHeaderMedium());

            // Rangos por día (para merges de encabezado)
            const dayColRanges = {};
            let colCursor = 2;

            for (const day of DAYS) {
                const laneCount = dayLanesInfo[day].laneCount || 1;
                const startCol = colCursor;
                const endCol = colCursor + laneCount - 1;

                dayColRanges[day] = { startCol, endCol, laneCount };

                if (laneCount > 1) {
                    sheet.mergeCells(headerRowIndex, startCol, headerRowIndex, endCol);
                }

                const dayCell = headerRow.getCell(startCol);
                dayCell.value = day;
                dayCell.font = { bold: true };
                dayCell.alignment = { horizontal: "center", vertical: "middle" };
                setFill(dayCell, LIGHT_HEADER_FILL);

                for (let c = startCol; c <= endCol; c++) {
                    const hc = headerRow.getCell(c);
                    setFill(hc, LIGHT_HEADER_FILL);
                    setBorder(hc, borderHeaderMedium());
                }

                colCursor = endCol + 1;
            }

            // Freeze hasta header
            sheet.views = [{ state: "frozen", ySplit: headerRowIndex }];

            // ====== GRILLA POR TIME_BLOCKS ======
            const blockRowByIndex = new Map();
            let rowIndex = headerRowIndex + 1;

            for (let i = 0; i < TIME_BLOCKS.length; i++) {
                const block = TIME_BLOCKS[i];
                blockRowByIndex.set(i, rowIndex);

                const row = sheet.getRow(rowIndex);
                row.height = 88;

                const timeCell = row.getCell(1);
                timeCell.value = String(block.label || `${block.start} - ${block.end}`);
                timeCell.font = { bold: true, size: 11 };
                timeCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };

                for (let c = 1; c <= lastCol; c++) {
                    const cell = row.getCell(c);
                    setBorder(cell, borderRowThickTopBottom());
                    if (c !== 1) {
                        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
                    }
                }

                rowIndex++;
            }

            // ====== COLOCAR CLASES ======
            const placed = new Set();
            function placeKey(day, lane, startIdx) {
                return `${day}__${lane}__${startIdx}`;
            }

            for (const day of DAYS) {
                const info = dayLanesInfo[day];
                const assigned = info.assigned || [];
                const range = dayColRanges[day];

                for (const item of assigned) {
                    const cls = item.cls;
                    const lane = item.lane;
                    const col = range.startCol + lane;

                    const startRow = blockRowByIndex.get(item.startIdx);
                    const endRow = blockRowByIndex.get(item.endIdx);

                    if (startRow == null || endRow == null) continue;

                    const k = placeKey(day, lane, item.startIdx);
                    if (placed.has(k)) continue;
                    placed.add(k);

                    if (endRow > startRow) {
                        try {
                            sheet.mergeCells(startRow, col, endRow, col);
                        } catch (e) {
                            console.warn("Merge falló (posible conflicto):", calendar.name, day, cls.start, cls.end, e);
                            continue;
                        }
                    }

                    const cell = sheet.getCell(startRow, col);

                    const lines = buildClassRichLines(cls);
                    cell.value = lines.join("\n");
                    cell.font = { bold: false, size: 11 };

                    cell.alignment = {
                        horizontal: "center",
                        vertical: "middle",
                        wrapText: true
                    };

                    const hex = pickClassHexColor(cls, COLOR_BY_TYPE);
                    setFill(cell, hexToArgb(hex));

                    setBorder(cell, borderAllThin());
                }
            }

            // ====== FOOTER INSTITUCIONAL ======
            // ✅ SIN filas “al pedo” antes del footer (no agregamos rowIndex += 1 con espacios)
            // ✅ Merge vertical de 3 filas en un solo bloque (como el header)
            const footerStartRow = rowIndex; // justo después del último bloque

            // Alturas para que se vea igual que tu referencia
            sheet.getRow(footerStartRow).height = 20;
            sheet.getRow(footerStartRow + 1).height = 18;
            sheet.getRow(footerStartRow + 2).height = 18;

            sheet.mergeCells(footerStartRow, 1, footerStartRow + 2, lastCol);

            const footerCell = sheet.getCell(footerStartRow, 1);
            footerCell.value = {
                richText: [
                    { text: "Bedelía", font: { bold: true, size: 12, color: { argb: HEADER_TEXT_COLOR } } },
                    { text: "\n" },
                    { text: "HORARIO: lunes a viernes: 08:00 a 21:00 hs", font: { size: 11, color: { argb: HEADER_TEXT_COLOR } } },
                    { text: "\n" },
                    { text: "2487 2717 int. 723   •   estudiantes@ucu.edu.uy", font: { size: 11, color: { argb: HEADER_TEXT_COLOR } } }
                ]
            };

            setFill(footerCell, INSTITUTION_BLUE);
            footerCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        }

        const buffer = await workbook.xlsx.writeBuffer();
        return window.api.excel.guardarArchivo(buffer);
    };
})();