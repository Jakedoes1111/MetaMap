import { DateTime } from "luxon";
import type { FilterState, DatasetRow } from "@/store/useStore";

const withinRange = (value: number, [min, max]: [number, number]) => value >= min && value <= max;

const intervalsOverlap = (
  row: DatasetRow,
  filterRange: [string | null, string | null],
): boolean => {
  if (!filterRange[0] && !filterRange[1]) return true;
  if (!row.timing_window_start || !row.timing_window_end) return false;
  const start = DateTime.fromISO(row.timing_window_start);
  const end = DateTime.fromISO(row.timing_window_end);
  const filterStart = filterRange[0] ? DateTime.fromISO(filterRange[0]) : null;
  const filterEnd = filterRange[1] ? DateTime.fromISO(filterRange[1]) : null;
  if (filterStart && !filterStart.isValid) return true;
  if (filterEnd && !filterEnd.isValid) return true;
  const effectiveStart = filterStart ?? start;
  const effectiveEnd = filterEnd ?? end;
  return end >= effectiveStart && start <= effectiveEnd;
};

export const applyFilters = (rows: DatasetRow[], filters: FilterState): DatasetRow[] =>
  rows.filter((row) => {
    if (filters.systems.length > 0 && !filters.systems.includes(row.system)) {
      return false;
    }
    if (filters.categories.length > 0 && !filters.categories.includes(row.category)) {
      return false;
    }
    if (
      filters.subsystem.trim().length > 0 &&
      !(`${row.subsystem} ${row.data_point}`.toLowerCase().includes(filters.subsystem.toLowerCase()))
    ) {
      return false;
    }
    if (filters.polarity && row.polarity !== filters.polarity) {
      return false;
    }
    if (!withinRange(row.confidence, filters.confidenceRange)) {
      return false;
    }
    if (!withinRange(row.strength, filters.strengthRange)) {
      return false;
    }
    if (!intervalsOverlap(row, filters.timeRange)) {
      return false;
    }
    if (filters.showConflictsOnly && !row.conflict_set) {
      return false;
    }
    if (filters.hideUnknown && row.verbatim_text === "UNKNOWN") {
      return false;
    }
    if (filters.hidePrivacyPaid && row.privacy === "paid") {
      return false;
    }
    return true;
  });
