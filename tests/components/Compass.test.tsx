import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Compass } from "@/components/Compass";
import { useStore } from "@/store/useStore";
import type { DatasetRow } from "@/store/useStore";

const baseRow: DatasetRow = {
  id: "compass-row",
  person_id: "person",
  birth_datetime_local: "2024-01-01T00:00:00",
  birth_timezone: "UTC",
  system: "FS",
  subsystem: "",
  source_tool: "",
  source_url_or_ref: "",
  data_point: "Facing North prosperity sector",
  verbatim_text: "UNKNOWN",
  category: "Property",
  subcategory: "Wealth Sector",
  direction_cardinal: "N",
  direction_degrees: 0,
  timing_window_start: null,
  timing_window_end: null,
  polarity: "+",
  strength: 2,
  confidence: 0.5,
  weight_system: 1,
  notes: "",
  merged_from: [],
  conflict_set: null,
};

describe("Compass", () => {
  beforeEach(() => {
    // Ensure store weight defaults for deterministic summary ratios
    act(() => {
      useStore.getState().resetWeights();
    });
  });

  it("summarises directional rows by sector", () => {
    render(<Compass rows={[baseRow]} />);

    expect(screen.getByText(/N • 1 rows • Weighted 1.00/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Facing North prosperity sector/i),
    ).toBeInTheDocument();
  });
});
