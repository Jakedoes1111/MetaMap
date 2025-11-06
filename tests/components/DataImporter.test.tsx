import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { DataImporter } from "@/components/DataImporter";
import { useStore } from "@/store/useStore";
import type { DataRow } from "@/schema";

vi.mock("@/lib/csv", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/lib/csv");
  return {
    ...actual,
    parseCsv: vi.fn(),
    parseJson: vi.fn(),
  };
});

const { parseCsv } = await import("@/lib/csv");
const parseCsvMock = parseCsv as unknown as vi.Mock;

const mockRow: DataRow = {
  id: "11111111-1111-1111-1111-111111111111",
  person_id: "tester",
  birth_datetime_local: "2024-01-01T00:00:00",
  birth_timezone: "UTC",
  system: "Numerology_Pythagorean",
  subsystem: "",
  source_tool: "",
  source_url_or_ref: "",
  data_point: "Life Path 1",
  verbatim_text: "UNKNOWN",
  category: "Personality",
  subcategory: "",
  direction_cardinal: "",
  direction_degrees: null,
  timing_window_start: null,
  timing_window_end: null,
  polarity: "+",
  strength: 1,
  confidence: 0.5,
  weight_system: 1,
  notes: "",
};

describe("DataImporter", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    act(() => {
      useStore.getState().clearDataset();
    });
  });

  it("imports a CSV file and reports success", async () => {
    parseCsvMock.mockReturnValue({
      rows: [mockRow],
      errors: [],
    });

    render(<DataImporter />);

    const input = screen.getByLabelText(/Drop file or select/i);
    const file = new File(["person_id"], "sample.csv", { type: "text/csv" });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() =>
      expect(screen.getByText("Imported 1 rows successfully.")).toBeInTheDocument(),
    );

    expect(parseCsvMock).toHaveBeenCalledOnce();
  });
});
