import type { PlanetPosition } from "@/calculators/ephemeris";
import type { ZodiacType } from "@/calculators/ephemeris";

export interface HouseCusp {
  house: number;
  longitude: number;
  label?: string;
}

export interface EphemerisAngles {
  ascendant: number;
  descendant: number;
  midheaven: number;
  imumCoeli: number;
}

export interface EphemerisMetadata {
  zodiac: ZodiacType;
  houseSystem?: string;
  ayanamsa?: string;
  provider?: string;
}

export interface EphemerisResponse {
  positions: PlanetPosition[];
  cusps: HouseCusp[];
  angles: EphemerisAngles;
  metadata: EphemerisMetadata;
}
