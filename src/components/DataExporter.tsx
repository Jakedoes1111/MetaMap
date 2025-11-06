"use client";

import { useState } from "react";
import { rowsToCsv, rowsToJson } from "@/lib/csv";
import type { DatasetRow } from "@/store/useStore";

interface DataExporterProps {
  rows: DatasetRow[];
}

const downloadBlob = (content: string, type: string, filename: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const DataExporter = ({ rows }: DataExporterProps) => {
  const [format, setFormat] = useState<"csv" | "json">("csv");

  const handleExport = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    if (format === "csv") {
      downloadBlob(rowsToCsv(rows), "text/csv;charset=utf-8", `metamap-${timestamp}.csv`);
    } else {
      downloadBlob(rowsToJson(rows), "application/json;charset=utf-8", `metamap-${timestamp}.json`);
    }
  };

  return (
    <section className="rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-4 text-sm">
        <div>
          <h2 className="text-base font-semibold">Export data</h2>
          <p className="text-xs text-muted">
            Exports the current filtered dataset, preserving column order and ISO timestamps.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold">
          <label className="inline-flex items-center gap-1">
            <input
              type="radio"
              name="export-format"
              checked={format === "csv"}
              onChange={() => setFormat("csv")}
            />
            CSV
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="radio"
              name="export-format"
              checked={format === "json"}
              onChange={() => setFormat("json")}
            />
            JSON
          </label>
        </div>
      </header>
      <button
        type="button"
        onClick={handleExport}
        disabled={rows.length === 0}
        className="inline-flex items-center rounded-full bg-[hsl(var(--colour-accent))] px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-foreground"
      >
        Download {format.toUpperCase()} ({rows.length} rows)
      </button>
    </section>
  );
};
