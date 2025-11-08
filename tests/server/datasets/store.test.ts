import { describe, expect, it } from "vitest";
import { InMemoryDatasetStore } from "@/server/datasets";
import type { DataRow } from "@/schema";
import { createId } from "@/lib/id";

describe("InMemoryDatasetStore", () => {
  const buildRow = (overrides: Partial<DataRow> = {}): DataRow => ({
    id: createId(),
    person_id: "person-1",
    birth_datetime_local: "1992-09-01T06:03:00",
    birth_timezone: "Australia/Sydney",
    system: "WA",
    subsystem: "Tropical · Placidus",
    source_tool: "",
    source_url_or_ref: "",
    data_point: "Sun",
    verbatim_text: "Sun @ 150.12° (house 3)",
    category: "Guidance",
    subcategory: "Ephemeris",
    direction_cardinal: "",
    direction_degrees: 150,
    timing_window_start: null,
    timing_window_end: null,
    polarity: "0",
    strength: 0,
    confidence: 0.85,
    weight_system: 1,
    privacy: "public",
    provenance: "",
    notes: "longitude=150.12;house=3",
    ...overrides,
  });

  it("stores rows and appends provenance metadata", () => {
    const store = new InMemoryDatasetStore();
    const [record] = store.insertRows(
      [buildRow()],
      {
        provider: "ephemeris",
        timestamp: "2024-01-01T00:00:00.000Z",
        config: { zodiac: "Tropical", houseSystem: "Placidus" },
      },
    );

    expect(record.row.source_tool).toBe("ephemeris");
    expect(record.row.provenance).toContain("ephemeris:2024-01-01T00:00:00.000Z");
    expect(record.row.notes).toContain("provenance:timestamp=2024-01-01T00:00:00.000Z");
    expect(record.row.notes).toContain("provider=ephemeris");
    expect(record.row.notes).toContain('"houseSystem":"Placidus"');

    const stored = store.listRows();
    expect(stored).toHaveLength(1);
    expect(stored[0].notes).toContain("provider=ephemeris");
  });

  it("does not duplicate provenance markers when notes already contain text", () => {
    const store = new InMemoryDatasetStore();
    const [record] = store.insertRows(
      [buildRow({ notes: "existing" })],
      {
        provider: "ephemeris",
        timestamp: "2024-01-02T00:00:00.000Z",
        config: {},
      },
    );

    const provenanceCount = (record.row.notes.match(/provenance:/g) ?? []).length;
    expect(provenanceCount).toBe(1);
    expect(record.row.notes.startsWith("existing")).toBe(true);
    expect(record.row.provenance).toContain("ephemeris:2024-01-02T00:00:00.000Z");
    expect(record.row.provenance.split("|").length).toBe(1);
  });
});
