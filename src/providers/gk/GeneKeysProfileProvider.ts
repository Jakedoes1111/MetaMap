import { Body, Ecliptic, GeoVector, MakeTime } from "astronomy-engine";
import { DateTime } from "luxon";
import type { GKProvider } from "@/calculators";

const wrapDegrees = (value: number) => {
  const mod = value % 360;
  return mod < 0 ? mod + 360 : mod;
};

const computeLongitude = (date: DateTime, body: Body): number => {
  const vector = GeoVector(body, MakeTime(date.toUTC().toJSDate()), true);
  const ecliptic = Ecliptic(vector);
  return wrapDegrees(ecliptic.elon);
};

const longitudeToGeneKey = (longitude: number) => {
  const gate = Math.floor(longitude / 5.625) + 1;
  const remainder = longitude % 5.625;
  const line = Math.floor(remainder / (5.625 / 6)) + 1;
  return { geneKey: gate, line };
};

export class GeneKeysProfileProvider implements GKProvider {
  async computeProfile(input: {
    birthDateTime: string;
    timezone: string;
    variant?: string;
  }): Promise<{ spheres: Array<{ name: string; geneKey: number; line?: number }> }> {
    const birth = DateTime.fromISO(input.birthDateTime, { zone: input.timezone });
    if (!birth.isValid) {
      throw new Error("Invalid birth datetime supplied for Gene Keys profile.");
    }

    const sunLongitude = computeLongitude(birth, Body.Sun);
    const earthLongitude = wrapDegrees(sunLongitude + 180);

    const design = birth.minus({ days: 88 });
    const designSunLongitude = computeLongitude(design, Body.Sun);
    const designEarthLongitude = wrapDegrees(designSunLongitude + 180);

    const lifeWork = longitudeToGeneKey(sunLongitude);
    const evolution = longitudeToGeneKey(earthLongitude);
    const radiance = longitudeToGeneKey(designSunLongitude);
    const purpose = longitudeToGeneKey(designEarthLongitude);

    return {
      spheres: [
        { name: "Life's Work", geneKey: lifeWork.geneKey, line: lifeWork.line },
        { name: "Evolution", geneKey: evolution.geneKey, line: evolution.line },
        { name: "Radiance", geneKey: radiance.geneKey, line: radiance.line },
        { name: "Purpose", geneKey: purpose.geneKey, line: purpose.line },
      ],
    };
  }
}
