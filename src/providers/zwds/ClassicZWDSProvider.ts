import type { DateTime } from "luxon";
import type { ZWDSProvider, ZWDSPalaceReading } from "@/calculators";

const PALACES = [
  "Life",
  "Wealth",
  "Travel",
  "Career",
  "Health",
  "Children",
  "Spouse",
  "Siblings",
  "Parents",
  "Property",
  "Friends",
  "Servants",
];

const MAJOR_STARS = [
  "Zi Wei",
  "Tian Ji",
  "Tai Yang",
  "Wu Qu",
  "Tian Tong",
  "Lian Zhen",
  "Qi Sha",
  "Po Jun",
  "Tian Liang",
  "Tai Yin",
  "Tan Lang",
  "Ju Men",
];

const MINOR_STARS = [
  "Left Assistant",
  "Right Assistant",
  "Wen Chang",
  "Wen Qu",
  "Fire Star",
  "Bell Star",
  "Sky Horse",
  "Sky Happiness",
  "Sky Noble",
  "Sky Cry",
  "Sky Weeping",
  "Dragon Pool",
  "Phoenix Lair",
];

const hashSeed = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 1_000_003;
  }
  return hash;
};

const selectStars = (seed: number, source: string[], count: number): string[] => {
  const stars: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const roll = Math.abs(Math.sin(seed + index) * 1000);
    const star = source[Math.floor(roll) % source.length];
    if (!stars.includes(star)) {
      stars.push(star);
    }
  }
  return stars;
};

export class ClassicZWDSProvider implements ZWDSProvider {
  async computeChart(input: {
    dateTime: DateTime;
    zone: string;
    coordinates?: { latitude: number; longitude: number };
    variant?: string;
  }): Promise<ZWDSPalaceReading[]> {
    const local = input.dateTime.setZone(input.zone);
    const seed = hashSeed(`${local.toISO()}:${input.variant ?? "classic"}`);
    return PALACES.map((palace, index) => {
      const major = selectStars(seed + index * 13, MAJOR_STARS, 2);
      const minor = selectStars(seed + index * 17, MINOR_STARS, 2);
      const notes = `Cycle index ${index + 1}; variant=${input.variant ?? "classic"}`;
      return {
        palace,
        stars: [...major, ...minor],
        notes,
      };
    });
  }
}
