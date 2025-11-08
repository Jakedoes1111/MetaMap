import { describe, expect, it } from "vitest";
import { applyFilters } from "@/lib/filters";
import type { DatasetRow, FilterState } from "@/store/useStore";

const baseRow = (): DatasetRow => ({
  id: "row-1",
  person_id: "person",
  birth_datetime_local: "2024-01-01T00:00:00",
  birth_timezone: "UTC",
  system: "WA",
  subsystem: "",
  source_tool: "",
  source_url_or_ref: "",
  data_point: "Test",
  verbatim_text: "UNKNOWN",
  category: "Guidance",
  subcategory: "",
  direction_cardinal: "",
  direction_degrees: null,
  timing_window_start: null,
  timing_window_end: null,
  polarity: "+",
  strength: 0,
  confidence: 1,
  weight_system: 1,
  privacy: "public",
  provenance: "",
  notes: "",
  merged_from: [],
  conflict_set: null,
});

const defaultFilters: FilterState = {
  systems: [],
  categories: [],
  subsystem: "",
  polarity: null,
  confidenceRange: [0, 1],
  strengthRange: [-2, 2],
  timeRange: [null, null],
  showConflictsOnly: false,
  hideUnknown: false,
  hidePrivacyPaid: false,
};

describe("applyFilters", () => {
  it("hides paid rows when hidePrivacyPaid is enabled", () => {
    const rows = [baseRow(), { ...baseRow(), id: "paid", privacy: "paid" }];
    const filtered = applyFilters(rows, { ...defaultFilters, hidePrivacyPaid: true });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("row-1");
  });

  it("retains paid rows when the filter is disabled", () => {
    const rows = [baseRow(), { ...baseRow(), id: "paid", privacy: "paid" }];
    const filtered = applyFilters(rows, defaultFilters);
    expect(filtered).toHaveLength(2);
  });
});
