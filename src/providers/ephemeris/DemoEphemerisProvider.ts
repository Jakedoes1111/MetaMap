import type { DateTime } from "luxon";
import type { EphemerisOptions, EphemerisProvider, PlanetPosition } from "@/calculators";

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
  async getPositions(
    birth: DateTime,
    coordinates: { latitude: number; longitude: number },
    options: EphemerisOptions,
  ): Promise<PlanetPosition[]> {
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

    // Always include Ascendant/Midheaven placeholders for UI consumption.
    positions.push(
      {
        name: options.zodiac === "sidereal" ? "Ascendant (sidereal)" : "Ascendant",
        longitude: wrapDegrees(coordinates.longitude + 90),
        house: 1,
      },
      {
        name: "Midheaven",
        longitude: wrapDegrees(coordinates.longitude + 180),
        house: 10,
      },
    );

    return positions;
  }
}
