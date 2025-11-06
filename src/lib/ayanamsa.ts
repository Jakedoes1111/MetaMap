import { DateTime } from "luxon";

const BASE_OFFSETS: Record<string, number> = {
  lahiri: 23.85,
  "fagan/bradley": 24.42,
  "fagan_bradley": 24.42,
  deluce: 22.65,
  raman: 22.66,
  ushashashi: 20.3,
  krishnamurti: 23.98,
  "djwhal khul": 0,
  djwhal_khul: 0,
  yukteswar: 23.82,
  "jn bhasin": 23.7,
  jn_bhasin: 23.7,
  hipparchos: 20,
  galcent: 5,
  "galcent_0sag": 5,
  j2000: 24,
  j1900: 23.95,
  b1950: 23.86,
  suryasiddhanta: 24.12,
  "suryasiddhanta msun": 24.12,
  suryasiddhanta_msun: 24.12,
  aryabhata: 23.85,
  "aryabhata msun": 23.85,
  aryabhata_msun: 23.85,
  "ss revati": 24,
  ss_revati: 24,
  "ss citra": 23.85,
  ss_citra: 23.85,
  "true citra": 23.85,
  true_citra: 23.85,
  "true revati": 24,
  true_revati: 24,
  "true pushya": 24,
  true_pushya: 24,
  "galalign mardyks": 5,
  galalign_mardyks: 5,
  "galcent rgilbrand": 5,
  galcent_rgilbrand: 5,
  "true mula": 24,
  true_mula: 24,
  "true sheoran": 24,
  true_sheoran: 24,
};

const JULIAN_DAY_J2000 = 2451545.0;
const MS_PER_DAY = 86_400_000;
const DEG_PER_YEAR_DRIFT = 0.013968879; // arcseconds -> degrees (~50.29" per year)

const toJulianDay = (date: DateTime): number => {
  const utc = date.toUTC();
  const year = utc.year;
  const month = utc.month;
  const day = utc.day +
    utc.hour / 24 +
    utc.minute / 1440 +
    utc.second / 86_400 +
    utc.millisecond / MS_PER_DAY;

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
  return jd;
};

export const resolveAyanamsaOffset = (name: string | undefined, date: DateTime): number => {
  const key = name?.toLowerCase().replace(/[^a-z0-9_]+/g, "_") ?? "lahiri";
  const base = BASE_OFFSETS[key] ?? BASE_OFFSETS.lahiri;
  const julianDay = toJulianDay(date);
  const centuries = (julianDay - JULIAN_DAY_J2000) / 36525;
  const drift = centuries * DEG_PER_YEAR_DRIFT * 100; // convert centuries to years (centuries*100)
  return base + drift;
};
