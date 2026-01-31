"use client";

import ActionButton from "@/components/ActionButton";

interface DashboardExportButtonProps {
  label: string;
  filename: string;
  payload: Record<string, string | number | null>;
}

const buildCsv = (payload: Record<string, string | number | null>) => {
  const headers = Object.keys(payload);
  const values = headers.map((key) => {
    const raw = payload[key];
    const value = raw === null || raw === undefined ? "" : String(raw);
    return `"${value.replace(/\"/g, '""')}"`;
  });
  return `${headers.join(",")}\n${values.join(",")}\n`;
};

export default function DashboardExportButton({ label, filename, payload }: DashboardExportButtonProps) {
  const handleExport = () => {
    const csv = buildCsv(payload);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return <ActionButton label={label} variant="secondary" message="Insights exported." onClick={handleExport} />;
}
