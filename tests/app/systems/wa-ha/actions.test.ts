import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { persistEphemerisResults } from "@/app/systems/wa-ha/actions";
import { listDatasetRows, resetDatasetStore } from "@/server/datasets";

const SAMPLE_POSITIONS = [
  {
    id: "sun",
    name: "Sun",
    longitude: 150.1234,
    latitude: 0.1,
    distance: 1,
    longitudeSpeed: 0.98,
    latitudeSpeed: 0.01,
    distanceSpeed: 0,
    house: 3,
  },
  {
    id: "moon",
    name: "Moon",
    longitude: 210.9876,
    latitude: -0.5,
    distance: 0.00257,
    longitudeSpeed: 13.2,
    latitudeSpeed: 0.12,
    distanceSpeed: 0,
  },
];

describe("persistEphemerisResults", () => {
  beforeEach(() => {
    resetDatasetStore();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-05T10:30:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("persists ephemeris rows with provenance metadata", async () => {
    const rows = await persistEphemerisResults({
      personId: "default-person",
      birth: { date: "1992-09-01", time: "06:03", timezone: "Australia/Sydney" },
      options: { zodiac: "Tropical", houseSystem: "Placidus", ayanamsa: "Lahiri" },
      coordinates: { latitude: -33.8688, longitude: 151.2093 },
      positions: SAMPLE_POSITIONS,
      provider: "ephemeris",
    });

    expect(rows).toHaveLength(2);
    expect(rows[0].system).toBe("WA");
    expect(rows[0].notes).toContain("provenance:timestamp=2024-01-05T10:30:00.000Z");
    expect(rows[0].notes).toContain('"houseSystem":"Placidus"');

    const stored = listDatasetRows();
    expect(stored).toHaveLength(2);
    expect(stored[1].notes).toContain("provider=ephemeris");
    expect(stored[1].source_tool).toBe("ephemeris");
  });

  it("returns an empty array when no positions are provided", async () => {
    const rows = await persistEphemerisResults({
      personId: "default-person",
      birth: { date: "1992-09-01", time: "06:03", timezone: "Australia/Sydney" },
      options: { zodiac: "Sidereal", houseSystem: "Whole Sign", ayanamsa: "Krishnamurti" },
      coordinates: { latitude: null, longitude: null },
      positions: [],
      provider: "ephemeris",
    });

    expect(rows).toHaveLength(0);
    expect(listDatasetRows()).toHaveLength(0);
  });
});
