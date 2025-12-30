export type ZodiacType = "tropical" | "sidereal";

export interface EphemerisBody {
  /** Canonical identifier (e.g. sun, moon, mars). */
  id: string;
  /** Display label for the celestial body. */
  name: string;
  /** Ecliptic longitude in degrees (0-360). */
  longitude: number;
  /** Ecliptic latitude in degrees. */
  latitude: number;
  /** Distance in astronomical units. */
  distance: number;
  /** Apparent motion in longitude (deg/day). */
  longitudeSpeed: number;
  /** Apparent motion in latitude (deg/day). */
  latitudeSpeed: number;
  /** Apparent change in distance (AU/day). */
  distanceSpeed: number;
  /** Assigned house number (1-12) when available. */
  house?: number;
  /** Indicates whether the body is in apparent retrograde motion. */
  retrograde?: boolean;
}

export interface EphemerisHouse {
  /** House number (1-12). */
  index: number;
  /** House cusp longitude in degrees. */
  cusp: number;
  /** Daily motion of the cusp in degrees/day when provided. */
  speed?: number;
}

export interface EphemerisAngle {
  /** Unique identifier such as asc, mc, vertex. */
  id: string;
  /** Angular position in degrees. */
  longitude: number;
  /** Angular velocity in degrees/day when exposed by the provider. */
  speed?: number;
}

export interface EphemerisMetadata {
  /** Identifier for the backing provider implementation. */
  provider: string;
  /** Human-readable provider version string. */
  version: string;
  /** Back-end engine used by the ephemeris provider. */
  engine: "swiss" | "moshier" | "jpl" | "astronomy-engine";
  /**
   * Original request context allowing consumers to trace what configuration
   * produced the response.
   */
  options: {
    zodiac: ZodiacType;
    ayanamsa?: string;
    houseSystem: string;
  };
  /** Original UTC timestamp ISO string used for the computation. */
  timestamp: string;
  /** Geographic coordinates used for the calculation. */
  location: { latitude: number; longitude: number };
  /** Numeric Swiss Ephemeris flag mask leveraged during calculation. */
  flags: number;
  /** Optional licensing metadata exposed for observability. */
  license?: {
    key?: string;
    file?: string;
  };
}

export interface EphemerisResponse {
  bodies: EphemerisBody[];
  houses: EphemerisHouse[];
  angles: EphemerisAngle[];
  metadata: EphemerisMetadata;
}
