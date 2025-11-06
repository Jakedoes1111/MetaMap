"use client";

import { useRef, useState } from "react";
import { parseCsv, parseJson } from "@/lib/csv";
import type { DataRow } from "@/schema";
import { useStore } from "@/store/useStore";

type ImportMode = "append" | "replace";

interface ImportFeedback {
  successCount: number;
  errorMessages: string[];
}

const initialFeedback: ImportFeedback = { successCount: 0, errorMessages: [] };

export const DataImporter = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState<ImportMode>("append");
  const [feedback, setFeedback] = useState<ImportFeedback>(initialFeedback);
  const addRows = useStore((state) => state.addRows);
  const replaceRows = useStore((state) => state.replaceRows);

  const handleRows = (rows: DataRow[]) => {
    if (mode === "replace") {
      replaceRows(rows);
    } else {
      addRows(rows);
    }
    setFeedback({ successCount: rows.length, errorMessages: [] });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const text = await file.text();
    const extension = file.name.toLowerCase().split(".").pop();
    if (extension === "csv") {
      const { rows, errors } = parseCsv(text);
      if (errors.length > 0) {
        setFeedback({
          successCount: rows.length,
          errorMessages: errors.map((error) => `Row ${error.row}: ${error.message}`),
        });
      } else {
        handleRows(rows);
      }
    } else if (extension === "json") {
      const { rows, errors } = parseJson(text);
      if (errors.length > 0) {
        setFeedback({
          successCount: rows.length,
          errorMessages: errors.map((error) => `Index ${error.row}: ${error.message}`),
        });
      } else {
        handleRows(rows);
      }
    } else {
      setFeedback({
        successCount: 0,
        errorMessages: ["Unsupported file type. Please provide CSV or JSON."],
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <section className="rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">Import data</h2>
          <p className="text-xs text-muted">
            Accepts CSV/JSON matching the MetaMap schema. Validation enforced with Zod.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span>Mode</span>
          <label className="inline-flex items-center gap-1">
            <input
              type="radio"
              name="import-mode"
              checked={mode === "append"}
              onChange={() => setMode("append")}
            />
            Append
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="radio"
              name="import-mode"
              checked={mode === "replace"}
              onChange={() => setMode("replace")}
            />
            Replace
          </label>
        </div>
      </header>
      <div className="flex flex-col gap-3 text-sm">
        <label
          htmlFor="metamap-import"
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-muted/70 bg-background/50 px-4 py-8 text-center transition hover:border-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <span className="text-sm font-semibold">Drop file or select</span>
          <span className="text-xs text-muted">CSV/JSON • UTF-8</span>
        </label>
        <input
          ref={fileInputRef}
          id="metamap-import"
          name="metamap-import"
          type="file"
          accept=".csv,.json"
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>
      {feedback.successCount > 0 && feedback.errorMessages.length === 0 && (
        <p className="mt-4 rounded bg-[hsl(var(--colour-positive)/0.15)] px-3 py-2 text-sm font-medium text-[hsl(var(--colour-positive))]">
          Imported {feedback.successCount} rows successfully.
        </p>
      )}
      {feedback.errorMessages.length > 0 && (
        <div className="mt-4 space-y-2 rounded bg-[hsl(var(--colour-conflict)/0.12)] px-3 py-2 text-sm text-[hsl(var(--colour-conflict))]">
          <p className="font-semibold">Import completed with errors:</p>
          <ul className="list-disc pl-5">
            {feedback.errorMessages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
