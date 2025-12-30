import type { DateTime } from "luxon";
import type { EphemerisOptions, EphemerisProvider } from "@/calculators";
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

const normaliseHouse = (value: number) => {
  const floored = Math.floor(value);
  const mod = ((floored - 1) % 12) + 1;
  return mod <= 0 ? mod + 12 : mod;
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
  ): Promise<EphemerisResponse> {
    const utc = birth.toUTC();
    const millis = utc.toMillis();
    const base = millis / (1000 * 60 * 60 * 24); // days since epoch

    const bodies = PLANETS.map((name, index) => {
      const drift = (index + 1) * 13.176358; // pseudo synodic progression
      const longitude = wrapDegrees(base * drift + coordinates.longitude * 0.5);
      const houseValue = ((longitude / 30 + (options.houseSystem ? 1 : 0)) % 12) + 1;
      return {
        id: name.toLowerCase(),
        name,
        longitude: Number(longitude.toFixed(2)),
        latitude: 0,
        distance: 1,
        longitudeSpeed: Number((drift % 360).toFixed(4)),
        latitudeSpeed: 0,
        distanceSpeed: 0,
        house: normaliseHouse(houseValue),
        retrograde: index % 3 === 0,
      };
    });

    const ascendant = wrapDegrees(coordinates.longitude + 90);
    const midheaven = wrapDegrees(coordinates.longitude + 180);

    const houses = Array.from({ length: 12 }, (_, index) => {
      const cusp = wrapDegrees(ascendant + index * 30);
      return { index: index + 1, cusp: Number(cusp.toFixed(2)), speed: 0 };
    });

    const angles = [
      { id: "asc", longitude: Number(ascendant.toFixed(2)), speed: 0 },
      { id: "mc", longitude: Number(midheaven.toFixed(2)), speed: 0 },
    ];

    return {
      bodies,
      houses,
      angles,
      metadata: {
        provider: "demo-ephemeris",
        version: "demo",
        engine: "moshier",
        options: {
          zodiac: options.zodiac,
          ayanamsa: options.ayanamsa,
          houseSystem: options.houseSystem ?? "demo",
        },
        timestamp: utc.toISO() ?? birth.toISO() ?? new Date(millis).toISOString(),
        location: { latitude: coordinates.latitude, longitude: coordinates.longitude },
        flags: 0,
      },
    };
  }
}
