import type { DatasetRow } from "@/store/useStore";
import { UNKNOWN_TOKEN } from "@/schema";

export const systemCount = (rows: DatasetRow[]): number =>
  new Set(rows.map((row) => row.system)).size;

export const unknownShare = (rows: DatasetRow[]): number => {
  if (rows.length === 0) return 0;
  const unknown = rows.filter((row) => row.verbatim_text === UNKNOWN_TOKEN).length;
  return (unknown / rows.length) * 100;
};

export const conflictCount = (rows: DatasetRow[]): number =>
  rows.filter((row) => Boolean(row.conflict_set)).length;

export const totalRows = (rows: DatasetRow[]): number => rows.length;

export const strengthWeightedAverage = (rows: DatasetRow[]): number => {
  if (rows.length === 0) return 0;
  const totalWeight = rows.reduce(
    (acc, row) => acc + row.weight_system * Math.abs(row.strength),
    0,
  );
  if (totalWeight === 0) return 0;
  const weightedSum = rows.reduce(
    (acc, row) => acc + row.strength * row.weight_system * row.confidence,
    0,
  );
  return weightedSum / totalWeight;
};
