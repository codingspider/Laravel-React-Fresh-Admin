import React from "react";
import { Button, HStack, Icon, Box, Table, Thead, Tbody, Tr, Th, Td, useToast } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { Printer, Download } from "lucide-react";

export default function TableExportButtons({ data = [], columns = [], filename = "export" }) {
    const { t } = useTranslation();
    const toast = useToast();
    const printCols = columns.filter((col) => col.header && col.accessorKey);

    const handlePrint = () => {
        if (!data.length) return;

        const headerCells = printCols
            .map((col) => `<th style="padding:8px 12px;text-align:left;border-bottom:2px solid #333;font-weight:600;font-size:13px;">${col.header}</th>`)
            .join("");

        const bodyRows = data
            .map((row) => {
                const cells = printCols
                    .map((col) => {
                        const val = row[col.accessorKey];
                        const text = val !== null && val !== undefined ? String(val) : "-";
                        return `<td style="padding:6px 12px;border-bottom:1px solid #ddd;font-size:13px;">${text}</td>`;
                    })
                    .join("");
                return `<tr>${cells}</tr>`;
            })
            .join("");

        const printHtml = `
            <div id="__print_area__" style="position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;z-index:999999;padding:40px;overflow:auto;">
                <h2 style="margin-bottom:16px;font-size:16px;font-family:Arial,sans-serif;">${filename.replace(/_/g, " ").toUpperCase()}</h2>
                <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;">
                    <thead><tr>${headerCells}</tr></thead>
                    <tbody>${bodyRows}</tbody>
                </table>
            </div>
        `;

        const container = document.createElement("div");
        container.innerHTML = printHtml;
        document.body.appendChild(container);

        const doPrint = () => {
            window.print();
            setTimeout(() => {
                if (container.parentNode) container.parentNode.removeChild(container);
            }, 600);
        };

        doPrint();
    };

    const handleExportCSV = () => {
        if (!data.length) return;

        const headers = printCols.map((col) => col.header);
        const rows = data.map((row) =>
            printCols.map((col) => {
                const val = row[col.accessorKey];
                return val !== null && val !== undefined ? String(val).replace(/,/g, ";") : "";
            })
        );

        const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
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
                onClick={handleExportCSV}
                borderRadius="lg"
            >
                {t("download_csv")}
            </Button>
        </HStack>
    );
}
