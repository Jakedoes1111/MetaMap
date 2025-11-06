import type { DateTime } from "luxon";
import type { EphemerisResponse } from "@/lib/ephemeris";

export type ZodiacType = "tropical" | "sidereal";

export interface PlanetPosition {
  name: string;
  longitude: number; // degrees 0-360
  house?: number;
}

export interface EphemerisOptions {
  zodiac: ZodiacType;
  ayanamsa?: string;
  houseSystem?: string;
}

/**
 * Defines the contract for ephemeris integrations such as Swiss Ephemeris or JPL.
 * Implementations may rely on paid data sources and should annotate privacy requirements.
 * TODO: integrate concrete ephemeris providers.
 */
export interface EphemerisProvider {
  getEphemeris: (
    birth: DateTime,
    coordinates: { latitude: number; longitude: number },
    options: EphemerisOptions,
  ) => Promise<EphemerisResponse>;
}
