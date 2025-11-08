import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Timeline } from "@/components/Timeline";
import type { DatasetRow } from "@/store/useStore";

const makeRow = (overrides: Partial<DatasetRow>): DatasetRow => ({
  id: "timeline-row",
  person_id: "person",
  birth_datetime_local: "2024-01-01T00:00:00",
  birth_timezone: "UTC",
  system: "WA",
  subsystem: "",
  source_tool: "",
  source_url_or_ref: "",
  data_point: "Transit window",
  verbatim_text: "UNKNOWN",
  category: "Timing",
  subcategory: "",
  direction_cardinal: "",
  direction_degrees: null,
  timing_window_start: "2024-01-01T00:00:00Z",
  timing_window_end: "2024-02-01T00:00:00Z",
  polarity: "+",
  strength: 1,
  confidence: 0.5,
  weight_system: 1,
  privacy: "public",
  provenance: "",
  notes: "",
  merged_from: [],
  conflict_set: null,
  ...overrides,
});

describe("Timeline", () => {
  it("renders timeline entries for rows with timing windows", () => {
    const rows = [makeRow({ data_point: "Transit window" })];

    render(<Timeline rows={rows} timezone="UTC" />);

    expect(screen.getByText("Transit window")).toBeInTheDocument();
    expect(
      screen.queryByText(/No timing windows available/i),
    ).not.toBeInTheDocument();
  });

  it("shows paid rows alongside public entries", () => {
    const rows = [
      makeRow({ id: "public", data_point: "Public", privacy: "public" }),
      makeRow({ id: "paid", data_point: "Paid", privacy: "paid" }),
    ];

    render(<Timeline rows={rows} timezone="UTC" />);

    expect(screen.getByText("Public")).toBeInTheDocument();
    expect(screen.getByText("Paid")).toBeInTheDocument();
  });
});
