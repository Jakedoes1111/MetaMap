import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/store/useStore", () => {
  const birthDetails = {
    zodiac: "Tropical",
    houseSystem: "Placidus",
    ayanamsa: "",
    birthDate: "1992-09-01",
    birthTime: "06:03",
    timezone: "UTC",
    latitude: null,
    longitude: null,
    timezoneConfirmed: false,
  };

  return {
    useStore: (selector: (state: unknown) => unknown) =>
      selector({ birthDetails, setBirthDetails: vi.fn() }),
  };
});

import WaHaPage from "@/app/systems/wa-ha/page";

describe("WA/HA page", () => {
  it("surfaces demo cusps on the astrology wheel", () => {
    render(<WaHaPage />);

    expect(screen.getByRole("img", { name: /astrology wheel/i })).toBeInTheDocument();
    const cuspLine = screen.getByTestId("cusp-10");
    expect(cuspLine).toHaveAttribute("data-longitude", "12.4");
    expect(screen.getByText(/Cusps and angles sourced/i)).toBeInTheDocument();
  });
});
