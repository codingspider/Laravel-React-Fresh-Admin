import React from "react";
import { Button, HStack, Icon } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { Printer, Download } from "lucide-react";

const esc = (value) =>
    String(value === null || value === undefined ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

const tableHtml = (cols, rows) => {
    const th = cols.filter((col) => col.header && col.accessorKey).map((col) => `<th>${esc(col.header)}</th>`).join("");
    const trs = rows
        .map(
            (row) =>
                `<tr>${cols
                    .filter((col) => col.header && col.accessorKey)
                    .map((col) => `<td class="${col.accessorKey === "amount" ? "num" : ""}">${esc(row[col.accessorKey])}</td>`)
                    .join("")}</tr>`
        )
        .join("");
    return `<table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`;
};

const csvText = (cols, rows) => {
    const headers = cols.filter((col) => col.header && col.accessorKey).map((col) => col.header);
    const body = rows.map((row) =>
        cols
            .filter((col) => col.header && col.accessorKey)
            .map((col) => `"${String(row[col.accessorKey] ?? "").replace(/"/g, '""')}"`)
            .join(",")
    );
    return [headers.map((h) => `"${h}"`).join(","), ...body].join("\n");
};

/**
 * Reusable Print + Download CSV controls for generated reports.
 *
 * @param {Object} props
 * @param {string} props.title    Report title shown in the printed document.
 * @param {string} props.period   Period text shown under the title (e.g. "01 Jan 2026 - 31 Jan 2026").
 * @param {Array}  props.columns  Column definitions: [{ header, accessorKey }]. (Single-table mode)
 * @param {Array}  props.rows     Row objects (values are formatted strings). (Single-table mode)
 * @param {Array}  props.summary  Summary rows: [{ label, value }].
 * @param {Array}  props.sections Optional multi-table mode: [{ title, columns, rows }].
 * @param {string} props.filename Base filename for the CSV download.
 */
export default function ReportExport({ title = "", period = "", columns = [], rows = [], summary = [], sections = [], filename = "report" }) {
    const { t } = useTranslation();
    const useSections = sections.length > 0;

    const handlePrint = () => {
        const tables = useSections
            ? sections
                  .filter((sec) => sec.rows.length)
                  .map(
                      (sec) =>
                          `<div class="sec"><h2>${esc(sec.title)}</h2>${tableHtml(sec.columns, sec.rows)}</div>`
                  )
                  .join("")
            : tableHtml(columns, rows);

        if (!tables) return;

        const sumHtml = summary
            .map((s) => `<div class="srow"><span class="srow-label">${esc(s.label)}</span><span class="sval">${esc(s.value)}</span></div>`)
            .join("");

        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; color: #111; padding: 32px; }
  .rpt { max-width: 960px; margin: 0 auto; }
  .head { border-bottom: 3px solid #0d9488; padding-bottom: 12px; margin-bottom: 20px; }
  .head h1 { font-size: 20px; font-weight: 700; color: #0f172a; }
  .head p.period { font-size: 13px; color: #64748b; margin-top: 4px; }
  .summary { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; }
  .summary .srow { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; min-width: 150px; }
  .summary .srow span { display: block; }
  .summary .srow .srow-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px; color: #64748b; }
  .summary .srow .sval { font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 2px; }
  .sec { margin-top: 28px; }
  .sec h2 { font-size: 14px; font-weight: 700; color: #0f172a; border-left: 4px solid #0d9488; padding-left: 8px; margin-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  thead th { background: #f1f5f9; text-align: left; padding: 8px 10px; border-bottom: 2px solid #cbd5e1; font-weight: 700; color: #0f172a; text-transform: uppercase; font-size: 11px; }
  tbody td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
  tbody tr:nth-child(even) { background: #f8fafc; }
  .num { text-align: right; }
</style>
</head><body>
  <div class="rpt">
    <div class="head">
      <h1>${esc(title)}</h1>
      ${period ? `<p class="period">${esc(period)}</p>` : ""}
    </div>
    ${summary.length ? `<div class="summary">${sumHtml}</div>` : ""}
    ${tables}
  </div>
</body></html>`;

        const win = window.open("", "_blank", "width=960,height=720");
        if (!win) return;
        win.document.open();
        win.document.write(html);
        win.document.close();
        setTimeout(() => win.print(), 350);
    };

    const handleCSV = () => {
        let csv;
        if (useSections) {
            const parts = sections
                .filter((sec) => sec.rows.length)
                .map((sec) => `${sec.title}\n${csvText(sec.columns, sec.rows)}`);
            csv = parts.join("\n\n");
        } else {
            csv = csvText(columns, rows);
        }
        if (!csv) return;

        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${filename}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <HStack spacing={2}>
            <Button
                size="sm"
                variant="outline"
                leftIcon={<Icon as={Printer} boxSize={4} />}
                onClick={handlePrint}
                borderRadius="lg"
            >
                {t("print")}
            </Button>
            <Button
                size="sm"
                variant="outline"
                leftIcon={<Icon as={Download} boxSize={4} />}
                onClick={handleCSV}
                borderRadius="lg"
            >
                {t("download_csv")}
            </Button>
        </HStack>
    );
}
