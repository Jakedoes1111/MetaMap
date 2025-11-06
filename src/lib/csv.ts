import Papa from "papaparse";
import { DateTime } from "luxon";
import { UNKNOWN_TOKEN, CSV_HEADERS, DataRowSchema, WeightDefaults, type DataRow, type System } from "@/schema";
import { createId } from "@/lib/id";

type ParseError = { row: number; message: string };

const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const coerced = Number(value);
  return Number.isFinite(coerced) ? coerced : null;
};

const ensureWeight = (system: System, weight?: unknown) => {
  const fallback = WeightDefaults[system] ?? 1;
  if (weight === undefined || weight === null || weight === "") {
    return fallback;
  }
  const numeric = Number(weight);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
};

const ensureVerbatim = (text?: unknown) =>
  typeof text === "string" && text.trim().length > 0 ? text : UNKNOWN_TOKEN;

export const parseCsv = (content: string): { rows: DataRow[]; errors: ParseError[] } => {
  const results = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  const rows: DataRow[] = [];
  const errors: ParseError[] = [];

  results.data.forEach((raw, index) => {
    const candidate = {
      id: createId(),
      person_id: raw.person_id ?? "",
      birth_datetime_local: raw.birth_datetime_local ?? "",
      birth_timezone: raw.birth_timezone ?? "",
      system: raw.system,
      subsystem: raw.subsystem ?? "",
      source_tool: raw.source_tool ?? "",
      source_url_or_ref: raw.source_url_or_ref ?? "",
      data_point: raw.data_point ?? "",
      verbatim_text: ensureVerbatim(raw.verbatim_text),
      category: raw.category,
      subcategory: raw.subcategory ?? "",
      direction_cardinal: raw.direction_cardinal ?? "",
      direction_degrees: toNumberOrNull(raw.direction_degrees),
      timing_window_start: raw.timing_window_start ?? null,
      timing_window_end: raw.timing_window_end ?? null,
      polarity: raw.polarity as DataRow["polarity"],
      strength: Number(raw.strength),
      confidence: Number(raw.confidence),
      weight_system: ensureWeight(raw.system as System, raw.weight_system),
      notes: raw.notes ?? "",
    };

    const validation = DataRowSchema.safeParse(candidate);
    if (validation.success) {
      rows.push({
        ...validation.data,
        timing_window_start: validation.data.timing_window_start ?? null,
        timing_window_end: validation.data.timing_window_end ?? null,
        direction_degrees:
          validation.data.direction_degrees === undefined
            ? null
            : validation.data.direction_degrees,
      });
    } else {
      const message = validation.error.issues.map((issue) => issue.message).join("; ");
      errors.push({
        row: index + 2, // header row offset
        message,
      });
    }
  });

  if (results.errors.length > 0) {
    results.errors.forEach((error) =>
      errors.push({ row: error.row ?? -1, message: error.message }),
    );
  }

  return { rows, errors };
};

export const parseJson = (content: string): { rows: DataRow[]; errors: ParseError[] } => {
  try {
    const parsed = JSON.parse(content) as Array<Record<string, unknown>>;
    const rows: DataRow[] = [];
    const errors: ParseError[] = [];
    parsed.forEach((raw, index) => {
      const candidate = {
        id: createId(),
        person_id: String(raw.person_id ?? ""),
        birth_datetime_local: String(raw.birth_datetime_local ?? ""),
        birth_timezone: String(raw.birth_timezone ?? ""),
        system: raw.system,
        subsystem: (raw.subsystem as string) ?? "",
        source_tool: (raw.source_tool as string) ?? "",
        source_url_or_ref: (raw.source_url_or_ref as string) ?? "",
        data_point: String(raw.data_point ?? ""),
        verbatim_text: ensureVerbatim(raw.verbatim_text),
        category: raw.category,
        subcategory: (raw.subcategory as string) ?? "",
        direction_cardinal: (raw.direction_cardinal as string) ?? "",
        direction_degrees: toNumberOrNull(raw.direction_degrees),
        timing_window_start: (raw.timing_window_start as string) ?? null,
        timing_window_end: (raw.timing_window_end as string) ?? null,
        polarity: raw.polarity as DataRow["polarity"],
        strength: Number(raw.strength),
        confidence: Number(raw.confidence),
        weight_system: ensureWeight(raw.system as System, raw.weight_system),
        notes: (raw.notes as string) ?? "",
      };
      const validation = DataRowSchema.safeParse(candidate);
      if (validation.success) {
        rows.push({
          ...validation.data,
          timing_window_start: validation.data.timing_window_start ?? null,
          timing_window_end: validation.data.timing_window_end ?? null,
          direction_degrees:
            validation.data.direction_degrees === undefined
              ? null
              : validation.data.direction_degrees,
        });
      } else {
        errors.push({
          row: index,
          message: validation.error.issues.map((issue) => issue.message).join("; "),
        });
      }
    });
    return { rows, errors };
  } catch (error) {
    return {
      rows: [],
      errors: [{ row: -1, message: error instanceof Error ? error.message : "Invalid JSON" }],
    };
  }
};

export const rowsToCsv = (rows: DataRow[]): string =>
  Papa.unparse(
    rows.map((row) => ({
      person_id: row.person_id,
      birth_datetime_local: row.birth_datetime_local,
      birth_timezone: row.birth_timezone,
      system: row.system,
      subsystem: row.subsystem ?? "",
      source_tool: row.source_tool ?? "",
      source_url_or_ref: row.source_url_or_ref ?? "",
      data_point: row.data_point,
      verbatim_text: ensureVerbatim(row.verbatim_text),
      category: row.category,
      subcategory: row.subcategory ?? "",
      direction_cardinal: row.direction_cardinal ?? "",
      direction_degrees:
        row.direction_degrees === null || row.direction_degrees === undefined
          ? ""
          : row.direction_degrees,
      timing_window_start: row.timing_window_start ?? "",
      timing_window_end: row.timing_window_end ?? "",
      polarity: row.polarity,
      strength: row.strength,
      confidence: row.confidence,
      weight_system: row.weight_system,
      notes: row.notes ?? "",
    })),
    {
      columns: CSV_HEADERS,
    },
  );

export const rowsToJson = (rows: DataRow[]): string =>
  JSON.stringify(
    rows.map((row) => ({
      ...row,
      direction_degrees:
        row.direction_degrees === null || row.direction_degrees === undefined
          ? null
          : row.direction_degrees,
      timing_window_start: row.timing_window_start ?? null,
      timing_window_end: row.timing_window_end ?? null,
      verbatim_text: ensureVerbatim(row.verbatim_text),
    })),
    null,
    2,
  );

export const canonicalKey = (value: string) =>
  value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

export const compareIsoStrings = (a?: string | null, b?: string | null): number => {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;
  return DateTime.fromISO(a).toMillis() - DateTime.fromISO(b).toMillis();
};
