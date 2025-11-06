import { describe, expect, it } from "vitest";
import { DateTime } from "luxon";
import swisseph from "swisseph";
import { SwissEphemerisAdapter } from "@/server/providers/ephemeris/SwissEphemerisAdapter";

describe("SwissEphemerisAdapter", () => {
  const adapter = new SwissEphemerisAdapter({ engine: "moshier" });
  const birth = DateTime.fromISO("2024-01-01T12:00:00Z");
  const coordinates = { latitude: 51.5, longitude: -0.1 };

  it("maps Swiss Ephemeris output into the shared response contract", async () => {
    const response = await adapter.getPositions(birth, coordinates, {
      zodiac: "tropical",
      houseSystem: "P",
    });

    expect(response.metadata.provider).toBe("swiss-ephemeris");
    expect(response.metadata.engine).toBe("moshier");
    expect(response.metadata.options.houseSystem).toBe("P");
    expect(response.bodies.length).toBeGreaterThanOrEqual(10);
    expect(response.bodies.some((body) => body.id === "mean_node")).toBe(true);
    expect(response.houses).toHaveLength(12);
    expect(response.angles.some((angle) => angle.id === "asc")).toBe(true);
    expect(response.angles.some((angle) => angle.id === "mc")).toBe(true);

    const sun = response.bodies.find((body) => body.id === "sun");
    expect(sun).toBeDefined();
    expect(sun?.longitude).toBeGreaterThan(200);
    expect(sun?.longitude).toBeLessThan(360);
    expect(typeof sun?.house).toBe("number");
    expect(sun?.retrograde).toBe(false);

    const firstHouse = response.houses[0];
    expect(firstHouse.index).toBe(1);
    expect(firstHouse.cusp).toBeGreaterThanOrEqual(0);
    expect(firstHouse.cusp).toBeLessThan(360);
  });

  it("honours sidereal calculations and annotates metadata", async () => {
    const sidereal = await adapter.getPositions(birth, coordinates, {
      zodiac: "sidereal",
      ayanamsa: "lahiri",
      houseSystem: "P",
    });

    expect(sidereal.metadata.options.zodiac).toBe("sidereal");
    expect(sidereal.metadata.options.ayanamsa).toBe("lahiri");
    expect(sidereal.metadata.flags & swisseph.SEFLG_SIDEREAL).toBe(swisseph.SEFLG_SIDEREAL);

    const tropical = await adapter.getPositions(birth, coordinates, {
      zodiac: "tropical",
      houseSystem: "P",
    });

    const siderealSun = sidereal.bodies.find((body) => body.id === "sun");
    const tropicalSun = tropical.bodies.find((body) => body.id === "sun");
    expect(siderealSun).toBeDefined();
    expect(tropicalSun).toBeDefined();

    const difference = Math.abs(((siderealSun!.longitude - tropicalSun!.longitude + 360) % 360));
    expect(difference).toBeGreaterThan(20);
  });

  it("throws for invalid coordinate payloads", async () => {
    await expect(
      adapter.getPositions(birth, { latitude: Number.NaN, longitude: coordinates.longitude }, {
        zodiac: "tropical",
        houseSystem: "P",
      }),
    ).rejects.toThrow(/finite latitude/);
  });
});
