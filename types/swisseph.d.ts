declare module "swisseph" {
  export const SEFLG_SWIEPH: number;
  export const SEFLG_MOSEPH: number;
  export const SEFLG_JPLEPH: number;
  export const SEFLG_SPEED: number;
  export const SEFLG_SIDEREAL: number;
  export const SE_GREG_CAL: number;
  export const SE_ECL_NUT: number;
  export const SE_SUN: number;
  export const SE_MOON: number;
  export const SE_MERCURY: number;
  export const SE_VENUS: number;
  export const SE_MARS: number;
  export const SE_JUPITER: number;
  export const SE_SATURN: number;
  export const SE_URANUS: number;
  export const SE_NEPTUNE: number;
  export const SE_PLUTO: number;
  export const SE_MEAN_NODE: number;
  export const SE_SIDM_LAHIRI: number;
  export const SE_SIDM_FAGAN_BRADLEY: number;
  export const SE_SIDM_DELUCE: number;
  export const SE_SIDM_RAMAN: number;
  export const SE_SIDM_USHASHASHI: number;
  export const SE_SIDM_KRISHNAMURTI: number;
  export const SE_SIDM_DJWHAL_KHUL: number;
  export const SE_SIDM_YUKTESHWAR: number;
  export const SE_SIDM_JN_BHASIN: number;
  export const SE_SIDM_HIPPARCHOS: number;
  export const SE_SIDM_GALCENT_0SAG: number;
  export const SE_SIDM_J2000: number;
  export const SE_SIDM_J1900: number;
  export const SE_SIDM_B1950: number;
  export const SE_SIDM_SURYASIDDHANTA: number;
  export const SE_SIDM_SURYASIDDHANTA_MSUN: number;
  export const SE_SIDM_ARYABHATA: number;
  export const SE_SIDM_ARYABHATA_MSUN: number;
  export const SE_SIDM_SS_REVATI: number;
  export const SE_SIDM_SS_CITRA: number;
  export const SE_SIDM_TRUE_CITRA: number;
  export const SE_SIDM_TRUE_REVATI: number;
  export const SE_SIDM_TRUE_PUSHYA: number;
  export const SE_SIDM_GALALIGN_MARDYKS: number;
  export const SE_SIDM_GALCENT_RGILBRAND: number;
  export const SE_SIDM_TRUE_MULA: number;
  export const SE_SIDM_TRUE_SHEORAN: number;

  export interface CalculationResult {
    longitude: number;
    latitude: number;
    distance: number;
    longitudeSpeed: number;
    latitudeSpeed: number;
    distanceSpeed: number;
    error?: string;
  }

  export interface HousesResult {
    house: number[];
    houseSpeed?: number[];
    ascendant: number;
    ascendantSpeed: number;
    mc: number;
    mcSpeed: number;
    armc: number;
    armcSpeed: number;
    vertex: number;
    vertexSpeed: number;
    equatorialAscendant: number;
    equatorialAscendantSpeed: number;
    kochCoAscendant: number;
    kochCoAscendantSpeed: number;
    munkaseyCoAscendant: number;
    munkaseyCoAscendantSpeed: number;
    munkaseyPolarAscendant: number;
    munkaseyPolarAscendantSpeed: number;
    houseSystem: string;
    error?: string;
  }

  export interface HousePositionResult {
    housePosition: number;
    housePositionSpeed: number;
    housePosition2: number;
    error?: string;
  }

  export function swe_julday(
    year: number,
    month: number,
    day: number,
    hour: number,
    calendar: number,
  ): number;

  export function swe_calc_ut(
    julianDay: number,
    body: number,
    flags: number,
  ): CalculationResult;

  export function swe_houses_ex2(
    julianDay: number,
    flags: number,
    latitude: number,
    longitude: number,
    houseSystem: string,
  ): HousesResult;

  export function swe_houses_pos(
    armc: number,
    latitude: number,
    eps: number,
    houseSystem: string,
    bodyLongitude: number,
    bodyLatitude?: number,
  ): HousePositionResult;

  export function swe_set_ephe_path(path?: string): void;
  export function swe_set_jpl_file(path?: string): void;
  export function swe_set_sid_mode(mode: number, t0: number, ayanamsa?: number): void;
  export function swe_version(): string;
  export function swe_get_ayanamsa_ut(julianDay: number): number;
}
