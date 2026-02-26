// front/react/services/excelService.js
// Nota: NO usar import/export en esta app (Babel standalone + scripts).
// ExcelJS llega por <script src="../node_modules/exceljs/dist/exceljs.min.js"></script>

(function () {
    function timeToMinutes(time) {
        const [h, m] = String(time).split(":").map(Number);
        return h * 60 + m;
    }

    function minutesToLabel(totalMinutes) {
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }

    function safeSheetName(name) {
        // Excel limita caracteres y largo
        const cleaned = String(name || "Hoja")
            .replace(/[\[\]\*\/\\\?\:]/g, " ")
            .trim();
        return cleaned.slice(0, 31) || "Hoja";
    }

    window.exportSchedulesToExcel = async function exportSchedulesToExcel(data) {
        if (!window.ExcelJS || !window.ExcelJS.Workbook) {
            throw new Error("ExcelJS no está cargado. Revisá el script exceljs.min.js en index.html.");
        }
        if (!window.AppData) {
            throw new Error("AppData no está cargado. Revisá el orden de scripts (data.js antes que excelService.js).");
        }
        if (!data || !Array.isArray(data.calendars)) {
            throw new Error("Data inválida: falta data.calendars.");
        }

        const { DAYS, START_HOUR, END_HOUR, COLOR_BY_TYPE } = window.AppData;

        // En tu PDF usan LUN-VIE, pero tu app tiene SAB también.
        // Lo dejamos dinámico según DAYS.
        const dayHeaders = DAYS;

        const workbook = new window.ExcelJS.Workbook();
        workbook.creator = "CalendarioFIT";
        workbook.created = new Date();

        // pasos de 30 min para que quede más fino y “mejor que el PDF”
        const STEP_MIN = 30;
        const startMin = START_HOUR * 60;
        const endMin = END_HOUR * 60;

        for (const calendar of data.calendars) {
            const sheet = workbook.addWorksheet(safeSheetName(calendar.name));

            // ---------------- HEADER BONITO ----------------
            sheet.mergeCells(1, 1, 1, 1 + dayHeaders.length);
            const titleCell = sheet.getCell(1, 1);
            titleCell.value = `HORARIOS — ${String(calendar.name || "").toUpperCase()}`;
            titleCell.font = { bold: true, size: 16 };
            titleCell.alignment = { vertical: "middle", horizontal: "center" };
            sheet.getRow(1).height = 28;

            sheet.mergeCells(2, 1, 2, 1 + dayHeaders.length);
            const subCell = sheet.getCell(2, 1);
            subCell.value = calendar.subtitle ? String(calendar.subtitle) : "";
            subCell.font = { italic: true, size: 11 };
            subCell.alignment = { vertical: "middle", horizontal: "center" };
            sheet.getRow(2).height = 18;

            sheet.addRow([]); // fila 3 separador

            // ---------------- CABECERA TABLA ----------------
            const headerRowIndex = 4;
            const headerRow = sheet.getRow(headerRowIndex);
            headerRow.getCell(1).value = "HORA";
            headerRow.getCell(1).font = { bold: true };
            headerRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };

            for (let i = 0; i < dayHeaders.length; i++) {
                const c = headerRow.getCell(2 + i);
                c.value = dayHeaders[i];
                c.font = { bold: true };
                c.alignment = { horizontal: "center", vertical: "middle" };
            }
            headerRow.height = 20;

            // Column widths
            sheet.getColumn(1).width = 10;
            for (let i = 0; i < dayHeaders.length; i++) {
                sheet.getColumn(2 + i).width = 24;
            }

            // Estilo header
            for (let col = 1; col <= 1 + dayHeaders.length; col++) {
                const c = headerRow.getCell(col);
                c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFEFEF" } };
                c.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" }
                };
            }

            // ---------------- GRILLA HORARIA ----------------
            // Mapa minuto->fila
            const minuteToRow = new Map();
            let rowIndex = headerRowIndex + 1;

            for (let t = startMin; t < endMin; t += STEP_MIN) {
                minuteToRow.set(t, rowIndex);
                const row = sheet.getRow(rowIndex);
                row.getCell(1).value = minutesToLabel(t);
                row.getCell(1).font = { bold: true };
                row.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
                row.height = 32;

                // bordes de toda la fila
                for (let col = 1; col <= 1 + dayHeaders.length; col++) {
                    const cell = row.getCell(col);
                    cell.border = {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        bottom: { style: "thin" },
                        right: { style: "thin" }
                    };
                    if (col !== 1) {
                        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
                    }
                }

                rowIndex++;
            }

            // Congelar header (todo lo de arriba)
            sheet.views = [{ state: "frozen", ySplit: headerRowIndex }];

            // ---------------- CLASES ----------------
            const classes = Array.isArray(calendar.classes) ? calendar.classes : [];
            for (const cls of classes) {
                const dayIndex = dayHeaders.indexOf(cls.day);
                if (dayIndex === -1) continue;

                const sMin = timeToMinutes(cls.start);
                const eMin = timeToMinutes(cls.end);

                // redondeo a STEP_MIN
                const sAligned = Math.floor(sMin / STEP_MIN) * STEP_MIN;
                const eAligned = Math.ceil(eMin / STEP_MIN) * STEP_MIN;

                const startRow = minuteToRow.get(sAligned);
                const endRow = minuteToRow.get(eAligned - STEP_MIN);
                if (!startRow || !endRow) continue;

                const col = 2 + dayIndex;

                // merge vertical
                sheet.mergeCells(startRow, col, endRow, col);
                const cell = sheet.getCell(startRow, col);

                const parts = [
                    cls.title || "",
                    cls.group ? String(cls.group) : "",
                    cls.detail ? String(cls.detail) : ""
                ].filter(Boolean);

                cell.value = parts.join("\n");
                cell.font = { bold: true, size: 11 };
                cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };

                const hex = (COLOR_BY_TYPE && COLOR_BY_TYPE[cls.type]) ? COLOR_BY_TYPE[cls.type] : "#cccccc";
                const argb = "FF" + String(hex).replace("#", "").toUpperCase().padStart(6, "0");

                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb } };

                // bordes (por si el merge pisa algo)
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" }
                };
            }
        }

        // Escribir buffer y pedir guardado por IPC (tu handler ya existe)
        const buffer = await workbook.xlsx.writeBuffer();
        return window.api.excel.guardarArchivo(buffer);
    };
})();