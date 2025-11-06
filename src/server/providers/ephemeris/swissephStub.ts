const DEGREE_CIRCLE = 360;
const J2000 = 2451545.0;

const normaliseDegrees = (value: number) => {
  const mod = value % DEGREE_CIRCLE;
  return mod < 0 ? mod + DEGREE_CIRCLE : mod;
};

const julianCenturies = (julianDay: number) => (julianDay - J2000) / 36525;

const constants = {
  SEFLG_SWIEPH: 1 << 0,
  SEFLG_MOSEPH: 1 << 1,
  SEFLG_JPLEPH: 1 << 2,
  SEFLG_SPEED: 1 << 8,
  SEFLG_SIDEREAL: 1 << 6,
  SE_GREG_CAL: 1,
  SE_ECL_NUT: 100,
  SE_SUN: 0,
  SE_MOON: 1,
  SE_MERCURY: 2,
  SE_VENUS: 3,
  SE_MARS: 4,
  SE_JUPITER: 5,
  SE_SATURN: 6,
  SE_URANUS: 7,
  SE_NEPTUNE: 8,
  SE_PLUTO: 9,
  SE_MEAN_NODE: 10,
  SE_SIDM_LAHIRI: 200,
  SE_SIDM_FAGAN_BRADLEY: 201,
  SE_SIDM_DELUCE: 202,
  SE_SIDM_RAMAN: 203,
  SE_SIDM_USHASHASHI: 204,
  SE_SIDM_KRISHNAMURTI: 205,
  SE_SIDM_DJWHAL_KHUL: 206,
  SE_SIDM_YUKTESHWAR: 207,
  SE_SIDM_JN_BHASIN: 208,
  SE_SIDM_HIPPARCHOS: 209,
  SE_SIDM_GALCENT_0SAG: 210,
  SE_SIDM_J2000: 211,
  SE_SIDM_J1900: 212,
  SE_SIDM_B1950: 213,
  SE_SIDM_SURYASIDDHANTA: 214,
  SE_SIDM_SURYASIDDHANTA_MSUN: 215,
  SE_SIDM_ARYABHATA: 216,
  SE_SIDM_ARYABHATA_MSUN: 217,
  SE_SIDM_SS_REVATI: 218,
  SE_SIDM_SS_CITRA: 219,
  SE_SIDM_TRUE_CITRA: 220,
  SE_SIDM_TRUE_REVATI: 221,
  SE_SIDM_TRUE_PUSHYA: 222,
  SE_SIDM_GALALIGN_MARDYKS: 223,
  SE_SIDM_GALCENT_RGILBRAND: 224,
  SE_SIDM_TRUE_MULA: 225,
  SE_SIDM_TRUE_SHEORAN: 226,
} as const;

const ayanamsaOffsets = new Map<number, number>([
  [constants.SE_SIDM_LAHIRI, 23.85],
  [constants.SE_SIDM_FAGAN_BRADLEY, 24.42],
  [constants.SE_SIDM_DELUCE, 22.65],
  [constants.SE_SIDM_RAMAN, 22.66],
  [constants.SE_SIDM_USHASHASHI, 20.3],
  [constants.SE_SIDM_KRISHNAMURTI, 23.98],
  [constants.SE_SIDM_DJWHAL_KHUL, 0],
  [constants.SE_SIDM_YUKTESHWAR, 23.82],
  [constants.SE_SIDM_JN_BHASIN, 23.7],
  [constants.SE_SIDM_HIPPARCHOS, 20.0],
  [constants.SE_SIDM_GALCENT_0SAG, 5.0],
  [constants.SE_SIDM_J2000, 24.0],
  [constants.SE_SIDM_J1900, 23.95],
  [constants.SE_SIDM_B1950, 23.86],
  [constants.SE_SIDM_SURYASIDDHANTA, 24.12],
  [constants.SE_SIDM_SURYASIDDHANTA_MSUN, 24.12],
  [constants.SE_SIDM_ARYABHATA, 23.85],
  [constants.SE_SIDM_ARYABHATA_MSUN, 23.85],
  [constants.SE_SIDM_SS_REVATI, 24.0],
  [constants.SE_SIDM_SS_CITRA, 23.85],
  [constants.SE_SIDM_TRUE_CITRA, 23.85],
  [constants.SE_SIDM_TRUE_REVATI, 24.0],
  [constants.SE_SIDM_TRUE_PUSHYA, 24.0],
  [constants.SE_SIDM_GALALIGN_MARDYKS, 5.0],
  [constants.SE_SIDM_GALCENT_RGILBRAND, 5.0],
  [constants.SE_SIDM_TRUE_MULA, 24.0],
  [constants.SE_SIDM_TRUE_SHEORAN, 24.0],
]);

let currentSiderealOffset = ayanamsaOffsets.get(constants.SE_SIDM_LAHIRI) ?? 24;

const planetParameters = new Map<number, { speed: number; phase: number; latAmp: number; distance: number }>([
  [constants.SE_SUN, { speed: 0.985647, phase: 280.46, latAmp: 0, distance: 1.0 }],
  [constants.SE_MOON, { speed: 13.176358, phase: 218.32, latAmp: 5.145, distance: 0.00257 }],
  [constants.SE_MERCURY, { speed: 4.092335, phase: 60.74, latAmp: 7.0, distance: 0.387 }],
  [constants.SE_VENUS, { speed: 1.60213, phase: 48.22, latAmp: 3.39, distance: 0.723 }],
  [constants.SE_MARS, { speed: 0.524039, phase: 18.6, latAmp: 1.85, distance: 1.524 }],
  [constants.SE_JUPITER, { speed: 0.083056, phase: 120.0, latAmp: 1.3, distance: 5.203 }],
  [constants.SE_SATURN, { speed: 0.0335, phase: 150.0, latAmp: 2.49, distance: 9.537 }],
  [constants.SE_URANUS, { speed: 0.0117, phase: 300.0, latAmp: 0.77, distance: 19.191 }],
  [constants.SE_NEPTUNE, { speed: 0.006, phase: 330.0, latAmp: 1.77, distance: 30.07 }],
  [constants.SE_PLUTO, { speed: 0.004, phase: 120.0, latAmp: 17.16, distance: 39.482 }],
  [constants.SE_MEAN_NODE, { speed: -0.0529539, phase: 125.0, latAmp: 0, distance: 0 }],
]);

const computeLatitude = (julianDay: number, code: number, latAmp: number) => {
  if (latAmp === 0) {
    return 0;
  }
  const angle = ((julianDay + code * 13) * Math.PI) / 180;
  return Number((Math.sin(angle) * latAmp).toFixed(4));
};

const swe_julday = (year: number, month: number, day: number, hour: number) => {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd =
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    b -
    1524.5;
  return jd + hour / 24;
};

const swe_set_sid_mode = (mode: number, _t0: number, ayanamsa?: number) => {
  if (typeof ayanamsa === "number" && !Number.isNaN(ayanamsa) && Math.abs(ayanamsa) > 1e-6) {
    currentSiderealOffset = ayanamsa;
    return;
  }
  const fallback = ayanamsaOffsets.get(mode);
  if (fallback != null) {
    currentSiderealOffset = fallback;
  }
};

const swe_calc_ut = (julianDay: number, body: number, flags: number) => {
  if (body === constants.SE_ECL_NUT) {
    const centuries = julianCenturies(julianDay);
    const obliquity = 23.439291 - 0.0130042 * centuries;
    return {
      longitude: obliquity,
      latitude: 0,
      distance: 0,
      longitudeSpeed: -0.0130042 / 36525,
      latitudeSpeed: 0,
      distanceSpeed: 0,
    };
  }

  const params = planetParameters.get(body) ?? { speed: 1, phase: 0, latAmp: 0, distance: 1 };
  const daysSinceEpoch = julianDay - J2000;
  let longitude = normaliseDegrees(params.phase + daysSinceEpoch * params.speed);
  if ((flags & constants.SEFLG_SIDEREAL) === constants.SEFLG_SIDEREAL) {
    longitude = normaliseDegrees(longitude - currentSiderealOffset);
  }

  return {
    longitude,
    latitude: computeLatitude(julianDay, body, params.latAmp),
    distance: params.distance,
    longitudeSpeed: params.speed,
    latitudeSpeed: params.latAmp ? params.latAmp * 0.001 : 0,
    distanceSpeed: 0,
  };
};

const swe_houses_ex2 = (
  julianDay: number,
  siderealFlag: number,
  latitude: number,
  longitude: number,
  houseSystem: string,
) => {
  const siderealAdjustment = siderealFlag ? currentSiderealOffset : 0;
  const base = normaliseDegrees((julianDay - J2000) * 15 + longitude * 0.5 - latitude * 0.1 - siderealAdjustment);
  const houseCusps = Array.from({ length: 12 }, (_, index) => normaliseDegrees(base + index * 30));

  return {
    house: houseCusps,
    houseSpeed: houseCusps.map(() => 0),
    ascendant: base,
    ascendantSpeed: 0,
    mc: normaliseDegrees(base + 90),
    mcSpeed: 0,
    armc: normaliseDegrees(base + 60),
    armcSpeed: 0,
    vertex: normaliseDegrees(base + 120),
    vertexSpeed: 0,
    equatorialAscendant: normaliseDegrees(base + 30),
    equatorialAscendantSpeed: 0,
    kochCoAscendant: normaliseDegrees(base + 150),
    kochCoAscendantSpeed: 0,
    munkaseyCoAscendant: normaliseDegrees(base + 180),
    munkaseyCoAscendantSpeed: 0,
    munkaseyPolarAscendant: normaliseDegrees(base + 210),
    munkaseyPolarAscendantSpeed: 0,
    houseSystem,
  };
};

const swe_houses_pos = (
  armc: number,
  _latitude: number,
  _eps: number,
  _houseSystem: string,
  bodyLongitude: number,
) => {
  const reference = normaliseDegrees(bodyLongitude - (armc - 60));
  const housePosition = reference / 30 + 1;
  return { housePosition, housePositionSpeed: 0, housePosition2: 0 };
};

const swe_set_ephe_path = () => {};
const swe_set_jpl_file = () => {};
const swe_version = () => "swisseph-stub";
const swe_get_ayanamsa_ut = () => currentSiderealOffset;

const stub = {
  ...constants,
  swe_julday,
  swe_calc_ut,
  swe_houses_ex2,
  swe_houses_pos,
  swe_set_ephe_path,
  swe_set_jpl_file,
  swe_set_sid_mode,
  swe_version,
  swe_get_ayanamsa_ut,
};

export default stub;
