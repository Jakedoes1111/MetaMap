import type { DateTime } from "luxon";
import type { EphemerisResponse, ZodiacType } from "@/lib/ephemeris";

export interface EphemerisOptions {
  zodiac: ZodiacType;
  ayanamsa?: string;
  houseSystem?: string;
}

/**
 * Defines the contract for ephemeris integrations such as Swiss Ephemeris or JPL.
 * Implementations may rely on paid data sources and should annotate privacy requirements.
 */
export interface EphemerisProvider {
  getPositions: (
    birth: DateTime,
    coordinates: { latitude: number; longitude: number },
    options: EphemerisOptions,
  ) => Promise<EphemerisResponse>;
}
