import type { SwissEphemerisAdapterConfig, SwissEphemerisEngine } from "./SwissEphemerisAdapter";

export interface SwissEphemerisEnvironmentConfig extends SwissEphemerisAdapterConfig {
  enabled: boolean;
}

const parseEngine = (value?: string): SwissEphemerisEngine => {
  if (!value) {
    return "swiss";
  }
  const lower = value.toLowerCase();
  if (lower === "moshier" || lower === "mosheph") {
    return "moshier";
  }
  if (lower === "jpl" || lower === "jpleph" || lower === "de430" || lower === "de431") {
    return "jpl";
  }
  return "swiss";
};

const parseBoolean = (value?: string) => {
  if (!value) {
    return false;
  }
  return /^(true|1|yes|on)$/i.test(value.trim());
};

export const resolveSwissEphemerisConfig = (): SwissEphemerisEnvironmentConfig => {
  const dataPath = process.env.SWISS_EPHEMERIS_DATA_PATH?.trim() || undefined;
  const jplFile = process.env.SWISS_EPHEMERIS_JPL_FILE?.trim() || undefined;
  const defaultHouseSystem = process.env.SWISS_EPHEMERIS_DEFAULT_HOUSE_SYSTEM?.trim() || undefined;
  const defaultAyanamsa = process.env.SWISS_EPHEMERIS_DEFAULT_AYANAMSA?.trim() || undefined;
  const licenseKey = process.env.SWISS_EPHEMERIS_LICENSE_KEY?.trim() || undefined;
  const licenseFile = process.env.SWISS_EPHEMERIS_LICENSE_FILE?.trim() || undefined;
  const engine = parseEngine(process.env.SWISS_EPHEMERIS_ENGINE);

  const enabled =
    parseBoolean(process.env.SWISS_EPHEMERIS_ENABLED) || Boolean(dataPath) || Boolean(jplFile);

  return {
    enabled,
    dataPath,
    jplFile,
    engine,
    defaultHouseSystem,
    defaultAyanamsa,
    licenseKey,
    licenseFile,
  };
};
