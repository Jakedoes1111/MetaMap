import { describe, expect, it } from "vitest";
import { strengthWeightedAverage } from "@/lib/stats";
import type { DatasetRow } from "@/store/useStore";

const makeRow = (overrides: Partial<DatasetRow>): DatasetRow => ({
  id: "id",
  person_id: "person",
  birth_datetime_local: "2024-01-01T00:00:00Z",
  birth_timezone: "UTC",
  system: "WA",
  subsystem: "",
  source_tool: "",
  source_url_or_ref: "",
  data_point: "test",
  verbatim_text: "UNKNOWN",
  category: "Guidance",
  subcategory: "",
  direction_cardinal: "",
  direction_degrees: null,
  timing_window_start: null,
  timing_window_end: null,
  polarity: "0",
  strength: 0,
  confidence: 1,
  weight_system: 1,
  privacy: "public",
  provenance: "",
  notes: "",
  merged_from: [],
  conflict_set: null,
  ...overrides,
});

describe("strengthWeightedAverage", () => {
  it("returns zero for empty input", () => {
    expect(strengthWeightedAverage([])).toBe(0);
  });

  it("accounts for weight and confidence", () => {
    const rows: DatasetRow[] = [
      makeRow({ id: "1", strength: 2, confidence: 0.5, weight_system: 1 }),
      makeRow({ id: "2", system: "FS", strength: -1, confidence: 1, weight_system: 0.5 }),
    ];
    const average = strengthWeightedAverage(rows);
    expect(average).toBeCloseTo((2 * 0.5 * 1 + -1 * 1 * 0.5) / (2 * 1 + 1 * 0.5));
  });
});
