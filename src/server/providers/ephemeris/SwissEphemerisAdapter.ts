import swisseph from "swisseph";
import type { DateTime } from "luxon";
import type { EphemerisOptions, EphemerisProvider } from "@/calculators";
import type { EphemerisBody, EphemerisResponse } from "@/lib/ephemeris";

export type SwissEphemerisEngine = "swiss" | "moshier" | "jpl";

export interface SwissEphemerisAdapterConfig {
  dataPath?: string;
  jplFile?: string;
  engine?: SwissEphemerisEngine;
  defaultHouseSystem?: string;
  defaultAyanamsa?: string;
  licenseKey?: string;
  licenseFile?: string;
}

const ENGINE_FLAGS: Record<SwissEphemerisEngine, number> = {
  swiss: swisseph.SEFLG_SWIEPH,
  moshier: swisseph.SEFLG_MOSEPH,
  jpl: swisseph.SEFLG_JPLEPH,
};

const PLANET_CATALOG: { id: string; name: string; code: number }[] = [
  { id: "sun", name: "Sun", code: swisseph.SE_SUN },
  { id: "moon", name: "Moon", code: swisseph.SE_MOON },
  { id: "mercury", name: "Mercury", code: swisseph.SE_MERCURY },
  { id: "venus", name: "Venus", code: swisseph.SE_VENUS },
  { id: "mars", name: "Mars", code: swisseph.SE_MARS },
  { id: "jupiter", name: "Jupiter", code: swisseph.SE_JUPITER },
  { id: "saturn", name: "Saturn", code: swisseph.SE_SATURN },
  { id: "uranus", name: "Uranus", code: swisseph.SE_URANUS },
  { id: "neptune", name: "Neptune", code: swisseph.SE_NEPTUNE },
  { id: "pluto", name: "Pluto", code: swisseph.SE_PLUTO },
  { id: "mean_node", name: "Mean Node", code: swisseph.SE_MEAN_NODE },
];

const AYANAMSA_MAP: Record<string, number> = {
  lahiri: swisseph.SE_SIDM_LAHIRI,
  fagan_bradley: swisseph.SE_SIDM_FAGAN_BRADLEY,
  deluce: swisseph.SE_SIDM_DELUCE,
  raman: swisseph.SE_SIDM_RAMAN,
  ushashashi: swisseph.SE_SIDM_USHASHASHI,
  krishnamurti: swisseph.SE_SIDM_KRISHNAMURTI,
  djwhal_khul: swisseph.SE_SIDM_DJWHAL_KHUL,
  yukteshwar: swisseph.SE_SIDM_YUKTESHWAR,
  jn_bhasin: swisseph.SE_SIDM_JN_BHASIN,
  hipparchos: swisseph.SE_SIDM_HIPPARCHOS,
  galcent: swisseph.SE_SIDM_GALCENT_0SAG,
  j2000: swisseph.SE_SIDM_J2000,
  j1900: swisseph.SE_SIDM_J1900,
  b1950: swisseph.SE_SIDM_B1950,
  suryasiddhanta: swisseph.SE_SIDM_SURYASIDDHANTA,
  suryasiddhanta_msun: swisseph.SE_SIDM_SURYASIDDHANTA_MSUN,
  aryabhata: swisseph.SE_SIDM_ARYABHATA,
  aryabhata_msun: swisseph.SE_SIDM_ARYABHATA_MSUN,
  ss_revati: swisseph.SE_SIDM_SS_REVATI,
  ss_citra: swisseph.SE_SIDM_SS_CITRA,
  true_citra: swisseph.SE_SIDM_TRUE_CITRA,
  true_revati: swisseph.SE_SIDM_TRUE_REVATI,
  true_pushya: swisseph.SE_SIDM_TRUE_PUSHYA,
  galalign_mardykes: swisseph.SE_SIDM_GALALIGN_MARDYKS,
  galcent_rgilbrand: swisseph.SE_SIDM_GALCENT_RGILBRAND,
  true_mula: swisseph.SE_SIDM_TRUE_MULA,
  true_sheoran: swisseph.SE_SIDM_TRUE_SHEORAN,
};

const wrapLongitude = (value: number) => {
  const normalised = value % 360;
  return normalised < 0 ? normalised + 360 : normalised;
};

const normaliseHouseIndex = (value: number) => {
  if (!Number.isFinite(value)) {
    return undefined;
  }
  const wrapped = ((value - 1) % 12 + 12) % 12;
  return Math.floor(wrapped) + 1;
};

const toJulianDay = (date: DateTime) => {
  const utc = date.toUTC();
  const fractionalHour =
    utc.hour +
    utc.minute / 60 +
    utc.second / 3600 +
    utc.millisecond / 3_600_000;
  return swisseph.swe_julday(utc.year, utc.month, utc.day, fractionalHour, swisseph.SE_GREG_CAL);
};

const resolveSiderealMode = (ayanamsa?: string) => {
  if (!ayanamsa) {
    return swisseph.SE_SIDM_LAHIRI;
  }
  const key = ayanamsa.toLowerCase();
  return AYANAMSA_MAP[key] ?? swisseph.SE_SIDM_LAHIRI;
};

const isResultError = <T extends object>(result: T | { error: string }): result is { error: string } => {
  return (result as { error?: string }).error != null;
};

export class SwissEphemerisAdapter implements EphemerisProvider {
  private readonly config: Required<Omit<SwissEphemerisAdapterConfig, "licenseKey" | "licenseFile">> &
    Pick<SwissEphemerisAdapterConfig, "licenseKey" | "licenseFile">;
  private readonly engine: SwissEphemerisEngine;
  private readonly baseFlags: number;

  constructor(config: SwissEphemerisAdapterConfig = {}) {
    this.engine = config.engine ?? "swiss";
    this.baseFlags = swisseph.SEFLG_SPEED | ENGINE_FLAGS[this.engine];
    this.config = {
      dataPath: config.dataPath ?? "",
      jplFile: config.jplFile ?? "",
      engine: this.engine,
      defaultHouseSystem: (config.defaultHouseSystem ?? "P").toUpperCase(),
      defaultAyanamsa: (config.defaultAyanamsa ?? "lahiri").toLowerCase(),
      licenseKey: config.licenseKey,
      licenseFile: config.licenseFile,
    };

    if (this.config.dataPath) {
      swisseph.swe_set_ephe_path(this.config.dataPath);
    }

    if (this.config.jplFile) {
      swisseph.swe_set_jpl_file(this.config.jplFile);
    }
  }

  async getPositions(
    birth: DateTime,
    coordinates: { latitude: number; longitude: number },
    options: EphemerisOptions,
  ): Promise<EphemerisResponse> {
    if (!birth.isValid) {
      throw new Error("Swiss Ephemeris requires a valid Luxon DateTime instance.");
    }
    if (!Number.isFinite(coordinates.latitude) || !Number.isFinite(coordinates.longitude)) {
      throw new Error("Swiss Ephemeris requires finite latitude and longitude values.");
    }

    const requestedHouseSystem = options.houseSystem?.trim().toUpperCase();
    const houseSystem = requestedHouseSystem?.charAt(0) || this.config.defaultHouseSystem;
    const zodiac = options.zodiac;

    const julianDay = toJulianDay(birth);
    let flags = this.baseFlags;

    const metadataOptions: EphemerisResponse["metadata"]["options"] = {
      zodiac,
      houseSystem,
      ayanamsa: undefined,
    };

    if (zodiac === "sidereal") {
      flags |= swisseph.SEFLG_SIDEREAL;
      const ayanamsaName = (options.ayanamsa ?? this.config.defaultAyanamsa).toLowerCase();
      const siderealMode = resolveSiderealMode(ayanamsaName);
      swisseph.swe_set_sid_mode(siderealMode, 0, 0);
      metadataOptions.ayanamsa = ayanamsaName;
    } else {
      // Reset sidereal mode to ensure subsequent tropical calls are not polluted by previous invocations.
      swisseph.swe_set_sid_mode(swisseph.SE_SIDM_FAGAN_BRADLEY, 0, 0);
    }

    const housesResult = swisseph.swe_houses_ex2(
      julianDay,
      flags & swisseph.SEFLG_SIDEREAL,
      coordinates.latitude,
      coordinates.longitude,
      houseSystem,
    );

    if (isResultError(housesResult)) {
      throw new Error(`Swiss Ephemeris house calculation failed: ${housesResult.error}`);
    }

    const obliquityResult = swisseph.swe_calc_ut(julianDay, swisseph.SE_ECL_NUT, 0);
    if (isResultError(obliquityResult)) {
      throw new Error(`Swiss Ephemeris obliquity calculation failed: ${obliquityResult.error}`);
    }

    const houses = housesResult.house.map((cusp, index) => ({
      index: index + 1,
      cusp: wrapLongitude(cusp),
      speed: housesResult.houseSpeed?.[index],
    }));

    const angles = [
      { id: "asc", longitude: wrapLongitude(housesResult.ascendant), speed: housesResult.ascendantSpeed },
      { id: "mc", longitude: wrapLongitude(housesResult.mc), speed: housesResult.mcSpeed },
      { id: "armc", longitude: wrapLongitude(housesResult.armc), speed: housesResult.armcSpeed },
      { id: "vertex", longitude: wrapLongitude(housesResult.vertex), speed: housesResult.vertexSpeed },
      {
        id: "equatorialAscendant",
        longitude: wrapLongitude(housesResult.equatorialAscendant),
        speed: housesResult.equatorialAscendantSpeed,
      },
      {
        id: "kochCoAscendant",
        longitude: wrapLongitude(housesResult.kochCoAscendant),
        speed: housesResult.kochCoAscendantSpeed,
      },
      {
        id: "munkaseyCoAscendant",
        longitude: wrapLongitude(housesResult.munkaseyCoAscendant),
        speed: housesResult.munkaseyCoAscendantSpeed,
      },
      {
        id: "munkaseyPolarAscendant",
        longitude: wrapLongitude(housesResult.munkaseyPolarAscendant),
        speed: housesResult.munkaseyPolarAscendantSpeed,
      },
    ].filter((angle) => Number.isFinite(angle.longitude));

    const bodies: EphemerisBody[] = PLANET_CATALOG.map((body) => {
      const result = swisseph.swe_calc_ut(julianDay, body.code, flags);
      if (isResultError(result)) {
        throw new Error(`Swiss Ephemeris calculation failed for ${body.name}: ${result.error}`);
      }

      const housePosition = swisseph.swe_houses_pos(
        housesResult.armc,
        coordinates.latitude,
        obliquityResult.longitude,
        houseSystem,
        result.longitude,
        result.latitude,
      );

      const house = isResultError(housePosition)
        ? undefined
        : normaliseHouseIndex(housePosition.housePosition);

      return {
        id: body.id,
        name: body.name,
        longitude: wrapLongitude(result.longitude),
        latitude: result.latitude,
        distance: result.distance,
        longitudeSpeed: result.longitudeSpeed,
        latitudeSpeed: result.latitudeSpeed,
        distanceSpeed: result.distanceSpeed,
        house,
        retrograde: result.longitudeSpeed < 0,
      };
    });

    return {
      bodies,
      houses,
      angles,
      metadata: {
        provider: "swiss-ephemeris",
        version: swisseph.swe_version(),
        engine: this.engine,
        options: metadataOptions,
        timestamp: birth.toUTC().toISO() ?? birth.toISO() ?? new Date().toISOString(),
        location: { latitude: coordinates.latitude, longitude: coordinates.longitude },
        flags,
        license:
          this.config.licenseKey || this.config.licenseFile
            ? { key: this.config.licenseKey, file: this.config.licenseFile }
            : undefined,
      },
    };
  }
}
