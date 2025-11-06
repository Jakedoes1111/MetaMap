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
] as const;

const STAR_SETS = [
  ["Zi Wei", "Tian Ji"],
  ["Tai Yang", "Wu Qu"],
  ["Tian Tong", "Lian Zhen"],
  ["Tai Yin", "Tan Lang"],
  ["Ju Men", "Tian Liang"],
  ["Qi Sha", "Po Jun"],
];

const pickStars = (seed: number): string[] => {
  const stars = STAR_SETS[seed % STAR_SETS.length];
  const modifier = seed % 12;
  return stars.map((star) => `${star} ${modifier}`);
};

const seedFromDate = (dateTime: DateTime, zone: string) => {
  const dt = dateTime.setZone(zone);
  return Math.abs(
    Math.floor(dt.year * 0.3 + dt.month * 1.7 + dt.day * 2.3 + dt.hour * 3.1 + dt.minute),
  );
};

export class DemoZWDSProvider implements ZWDSProvider {
  async computeChart(input: {
    dateTime: DateTime;
    zone: string;
    coordinates?: { latitude: number; longitude: number };
    variant?: string;
  }): Promise<ZWDSPalaceReading[]> {
    const seed = seedFromDate(input.dateTime, input.zone);
    return PALACES.map((palace, index) => ({
      palace,
      stars: pickStars(seed + index),
      notes: `demo-seed:${seed + index}`,
    }));
  }
}
