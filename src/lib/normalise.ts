import { canonicalKey } from "@/lib/csv";
import { applyDirectionCardinal } from "@/lib/direction";
import { ensureClosedInterval } from "@/lib/time";
import type { DataRow } from "@/schema";

export type NormalisedRow = DataRow & {
  merged_from?: string[];
  conflict_set?: string | null;
};

const appendToken = (notes: string, token: string): string => {
  const trimmed = notes.trim();
  if (trimmed.includes(token)) {
    return trimmed;
  }
  return trimmed.length > 0 ? `${trimmed} | ${token}` : token;
};

const mergeListField = (a?: string, b?: string) => {
  const values = new Set<string>();
  const add = (value?: string) => {
    value
      ?.split(/[;|]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .forEach((item) => values.add(item));
  };
  add(a);
  add(b);
  return Array.from(values).join("; ");
};

const mergeNotes = (a?: string, b?: string) =>
  [a, b]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value && value.length > 0))
    .join(" | ");

const intervalsOverlap = (first: DataRow, second: DataRow): boolean => {
  const firstInterval = ensureClosedInterval(
    first.timing_window_start,
    first.timing_window_end,
    first.birth_timezone,
  );
  const secondInterval = ensureClosedInterval(
    second.timing_window_start,
    second.timing_window_end,
    second.birth_timezone,
  );
  if (!firstInterval && !secondInterval) return true;
  if (!firstInterval || !secondInterval) return true;
  return firstInterval.overlaps(secondInterval);
};

const choosePreferred = (current: NormalisedRow, incoming: DataRow): "current" | "incoming" => {
  const currentStrength = Math.abs(current.strength);
  const incomingStrength = Math.abs(incoming.strength);
  if (incomingStrength > currentStrength) return "incoming";
  if (incomingStrength < currentStrength) return "current";
  if (incoming.confidence > current.confidence) return "incoming";
  return "current";
};

export const dedupeRows = (rows: DataRow[]): NormalisedRow[] => {
  const grouped = new Map<string, NormalisedRow[]>();

  rows.forEach((row) => {
    const directionApplied = applyDirectionCardinal(row);
    const key = `${directionApplied.system}::${canonicalKey(directionApplied.data_point)}`;
    const existingGroup = grouped.get(key) ?? [];

    if (existingGroup.length === 0) {
      grouped.set(key, [{ ...directionApplied, merged_from: [] }]);
      return;
    }

    let merged = false;
    for (let i = 0; i < existingGroup.length; i += 1) {
      const candidate = existingGroup[i];
      if (intervalsOverlap(candidate, directionApplied)) {
        const preference = choosePreferred(candidate, directionApplied);
        const base: NormalisedRow =
          preference === "current"
            ? { ...candidate }
            : {
                ...directionApplied,
                merged_from: [],
              };
        const mergedFrom = new Set<string>([
          ...(candidate.merged_from ?? []),
          candidate.id,
          directionApplied.id,
        ]);
        const updated: NormalisedRow = {
          ...base,
          merged_from: Array.from(mergedFrom),
          source_tool: mergeListField(candidate.source_tool, directionApplied.source_tool),
          source_url_or_ref: mergeListField(
          candidate.source_url_or_ref,
          directionApplied.source_url_or_ref,
          ),
          notes: appendToken(
            mergeNotes(candidate.notes, directionApplied.notes),
            `merged:${Array.from(mergedFrom).join("+")}`,
          ),
        };
        existingGroup[i] = updated;
        merged = true;
        break;
      }
    }

    if (!merged) {
      existingGroup.push({ ...directionApplied, merged_from: [] });
    }

    grouped.set(key, existingGroup);
  });

  return Array.from(grouped.values()).flat();
};

export const markConflicts = (rows: NormalisedRow[]): NormalisedRow[] => {
  const byCanonical = new Map<string, NormalisedRow[]>();
  rows.forEach((row) => {
    const key = canonicalKey(row.data_point);
    const list = byCanonical.get(key) ?? [];
    list.push(row);
    byCanonical.set(key, list);
  });

  const result: NormalisedRow[] = [];

  byCanonical.forEach((group) => {
    const polarities = new Set(group.map((row) => row.polarity));
    if (polarities.has("+") && polarities.has("−")) {
      const conflictId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
      group.forEach((row) => {
        const notesWithConflict = appendToken(row.notes ?? "", `conflict_set:${conflictId}`);
        result.push({
          ...row,
          conflict_set: conflictId,
          notes: notesWithConflict,
        });
      });
    } else {
      result.push(...group);
    }
  });

  return result;
};

export const normaliseRows = (rows: DataRow[]): NormalisedRow[] => {
  const deduped = dedupeRows(rows);
  return markConflicts(deduped);
};
