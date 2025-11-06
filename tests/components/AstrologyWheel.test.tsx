import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AstrologyWheel } from "@/components/ephemeris/AstrologyWheel";
import type { HouseCusp } from "@/lib/ephemeris";

const sampleCusps: HouseCusp[] = [
  { house: 1, longitude: 123.4 },
  { house: 2, longitude: 158.1 },
  { house: 3, longitude: 201.9 },
  { house: 4, longitude: 249.5 },
  { house: 5, longitude: 292.3 },
  { house: 6, longitude: 327.8 },
  { house: 7, longitude: 3.2 },
  { house: 8, longitude: 42.6 },
  { house: 9, longitude: 83.5 },
  { house: 10, longitude: 119.7 },
  { house: 11, longitude: 151.8 },
  { house: 12, longitude: 188.4 },
];

describe("AstrologyWheel", () => {
  it("renders provided cusps without normalising to 30°", () => {
    render(
      <AstrologyWheel
        cusps={sampleCusps}
        angles={{ ascendant: 123.4, descendant: 303.4, midheaven: 119.7, imumCoeli: 299.7 }}
        metadata={{ zodiac: "tropical", houseSystem: "Placidus" }}
      />,
    );

    expect(screen.getByTestId("cusp-2")).toHaveAttribute("data-longitude", "158.1");
    expect(screen.getByTestId("cusp-7")).toHaveAttribute("data-longitude", "3.2");
  });

  it("shows an empty state when no cusps are provided", () => {
    render(
      <AstrologyWheel
        cusps={[]}
        angles={{ ascendant: 0, descendant: 180, midheaven: 90, imumCoeli: 270 }}
      />,
    );

    expect(screen.getByText(/No cusp data available/i)).toBeInTheDocument();
  });
});
