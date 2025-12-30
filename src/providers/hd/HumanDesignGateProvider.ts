import { Body, Ecliptic, GeoVector, MakeTime } from "astronomy-engine";
import { DateTime } from "luxon";
import type { HDProvider } from "@/calculators";

type Centres = {
  head: CentreState;
  ajna: CentreState;
  throat: CentreState;
  g: CentreState;
  ego: CentreState;
  sacral: CentreState;
  solarPlexus: CentreState;
  spleen: CentreState;
  root: CentreState;
};

type CentreState = "defined" | "undefined";

const GATE_TO_CENTER: Record<number, keyof Centres> = {
  1: "g",
  2: "g",
  3: "sacral",
  4: "ajna",
  5: "sacral",
  6: "solarPlexus",
  7: "g",
  8: "throat",
  9: "sacral",
  10: "g",
  11: "ajna",
  12: "throat",
  13: "g",
  14: "sacral",
  15: "g",
  16: "throat",
  17: "ajna",
  18: "spleen",
  19: "root",
  20: "throat",
  21: "ego",
  22: "solarPlexus",
  23: "throat",
  24: "ajna",
  25: "g",
  26: "ego",
  27: "sacral",
  28: "spleen",
  29: "sacral",
  30: "solarPlexus",
  31: "throat",
  32: "spleen",
  33: "throat",
  34: "sacral",
  35: "throat",
  36: "solarPlexus",
  37: "solarPlexus",
  38: "root",
  39: "root",
  40: "ego",
  41: "root",
  42: "sacral",
  43: "ajna",
  44: "spleen",
  45: "throat",
  46: "g",
  47: "ajna",
  48: "spleen",
  49: "solarPlexus",
  50: "spleen",
  51: "ego",
  52: "root",
  53: "root",
  54: "root",
  55: "solarPlexus",
  56: "throat",
  57: "spleen",
  58: "root",
  59: "sacral",
  60: "root",
  61: "head",
  62: "throat",
  63: "head",
  64: "head",
};

const PLANETS: Array<{ id: string; body: Body }> = [
  { id: "Sun", body: Body.Sun },
  { id: "Earth", body: Body.Earth },
  { id: "Moon", body: Body.Moon },
  { id: "Mercury", body: Body.Mercury },
  { id: "Venus", body: Body.Venus },
  { id: "Mars", body: Body.Mars },
  { id: "Jupiter", body: Body.Jupiter },
  { id: "Saturn", body: Body.Saturn },
  { id: "Uranus", body: Body.Uranus },
  { id: "Neptune", body: Body.Neptune },
  { id: "Pluto", body: Body.Pluto },
];

const wrapDegrees = (value: number) => {
  const mod = value % 360;
  return mod < 0 ? mod + 360 : mod;
};

const computeLongitude = (date: DateTime, body: Body): number => {
  const vector = GeoVector(body, MakeTime(date.toUTC().toJSDate()), true);
  const ecliptic = Ecliptic(vector);
  return wrapDegrees(ecliptic.elon);
};

const longitudeToGate = (longitude: number) => {
  const gate = Math.floor(longitude / 5.625) + 1;
  const remainder = longitude % 5.625;
  const line = Math.floor(remainder / (5.625 / 6)) + 1;
  return { gate, line };
};

const initialiseCentres = (): Centres => ({
  head: "undefined",
  ajna: "undefined",
  throat: "undefined",
  g: "undefined",
  ego: "undefined",
  sacral: "undefined",
  solarPlexus: "undefined",
  spleen: "undefined",
  root: "undefined",
});

const markCentre = (centres: Centres, gate: number) => {
  const centre = GATE_TO_CENTER[gate];
  if (centre) {
    centres[centre] = "defined";
  }
};

const determineType = (centres: Centres): string => {
  const sacral = centres.sacral === "defined";
  const throat = centres.throat === "defined";
  const motor = sacral || centres.ego === "defined" || centres.solarPlexus === "defined" || centres.root === "defined";
  const definedCount = Object.values(centres).filter((state) => state === "defined").length;
  if (sacral && throat && motor) {
    return "Manifesting Generator";
  }
  if (sacral) {
    return "Generator";
  }
  if (throat && motor) {
    return "Manifestor";
  }
  if (definedCount <= 2) {
    return "Reflector";
  }
  return "Projector";
};

const determineAuthority = (centres: Centres): string => {
  if (centres.solarPlexus === "defined") {
    return "Emotional";
  }
  if (centres.sacral === "defined") {
    return "Sacral";
  }
  if (centres.spleen === "defined") {
    return "Splenic";
  }
  if (centres.ego === "defined") {
    return "Ego";
  }
  if (centres.g === "defined") {
    return "Self-Projected";
  }
  if (centres.head === "defined" && centres.ajna === "defined") {
    return "Mental";
  }
  return "Lunar";
};

export class HumanDesignGateProvider implements HDProvider {
  async computeBodyGraph(input: {
    birthDateTime: string;
    timezone: string;
    coordinates?: { latitude: number; longitude: number };
    variant?: string;
  }): Promise<{
    centres: Record<string, CentreState>;
    type?: string;
    authority?: string;
  }> {
    const birth = DateTime.fromISO(input.birthDateTime, { zone: input.timezone });
    if (!birth.isValid) {
      throw new Error("Invalid birth datetime provided for Human Design computation.");
    }

    const centres = initialiseCentres();
    PLANETS.forEach((planet) => {
      const longitude = computeLongitude(birth, planet.body);
      const { gate } = longitudeToGate(longitude);
      markCentre(centres, gate);
    });

    const type = determineType(centres);
    const authority = determineAuthority(centres);

    return {
      centres,
      type,
      authority,
    };
  }
}
