import type { DateTime } from "luxon";
import type { EphemerisOptions, EphemerisProvider, PlanetPosition } from "@/calculators";
import type { EphemerisResponse } from "@/lib/ephemeris";

const PLANETS = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
] as const;

const wrapDegrees = (value: number) => {
  const normalised = value % 360;
  return normalised < 0 ? normalised + 360 : normalised;
};

/**
 * Demo-friendly ephemeris implementation used for development environments.
 * Generates deterministic pseudo-longitudes based on the input timestamp to
 * exercise visualisations without sourcing licensed planetary data.
 */
export class DemoEphemerisProvider implements EphemerisProvider {
  async getEphemeris(
    birth: DateTime,
    coordinates: { latitude: number; longitude: number },
    options: EphemerisOptions,
  ): Promise<EphemerisResponse> {
    const millis = birth.toMillis();
    const base = millis / (1000 * 60 * 60 * 24); // days since epoch
    const positions: PlanetPosition[] = PLANETS.map((name, index) => {
      const drift = (index + 1) * 13.176358; // pseudo synodic progression
      const longitude = wrapDegrees(base * drift + coordinates.longitude * 0.5);
      return {
        name,
        longitude: Number(longitude.toFixed(2)),
        house: ((Math.floor(longitude / 30) + (options.houseSystem ? 1 : 0)) % 12) + 1,
      };
    });

    const ascendant = wrapDegrees(coordinates.longitude + 90);
    const midheaven = wrapDegrees(coordinates.longitude + 180);

    const cusps = Array.from({ length: 12 }, (_, index) => ({
      house: index + 1,
      longitude: wrapDegrees(ascendant + index * 30 + (options.houseSystem ? index * 0.5 : 0)),
    }));

    return {
      positions,
      cusps,
      angles: {
        ascendant,
        descendant: wrapDegrees(ascendant + 180),
        midheaven,
        imumCoeli: wrapDegrees(midheaven + 180),
      },
      metadata: {
        zodiac: options.zodiac,
        houseSystem: options.houseSystem,
        ayanamsa: options.ayanamsa,
        provider: "DemoEphemerisProvider",
      },
    };
  }
}
