declare module "solarlunar" {
  interface SolarLunarResult {
    gzYear: string;
    gzMonth: string;
    gzDay: string;
    term?: number;
  }

  interface SolarLunar {
    solar2lunar(year: number, month: number, day: number): SolarLunarResult;
    getTerm(year: number, term: number): number;
  }

  const solarLunar: SolarLunar;
  export default solarLunar;
}
