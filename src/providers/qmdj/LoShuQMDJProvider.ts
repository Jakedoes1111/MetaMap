import { DateTime } from "luxon";
import type { QMDJBoard, QMDJProvider, QMDJCell } from "@/calculators";

const PALACES = [
  "North",
  "North-East",
  "East",
  "South-East",
  "South",
  "South-West",
  "West",
  "North-West",
  "Centre",
];

const STARS = ["Tian Peng", "Tian Ren", "Tian Chong", "Tian Fu", "Tian Ying", "Tian Rui", "Tian Zhu", "Tian Xin", "Tian Qin"];
const DOORS = ["Open", "Rest", "Life", "Harm", "Delusion", "Scene", "Death", "Shock", "Obstacle"];
const DEITIES = [
  "Chief",
  "Earth",
  "Moon",
  "Heaven",
  "Dragon",
  "Tiger",
  "Tortoise",
  "Bird",
  "Harmony",
];

const generateSeed = (timestamp: string, arrangement: string, school: string) => {
  return Array.from(timestamp + arrangement + school).reduce((hash, char) => {
    return (hash * 33 + char.charCodeAt(0)) % 9_999_991;
  }, 7);
};

const pick = (seed: number, values: string[], index: number) => {
  const roll = Math.abs(Math.sin(seed + index) * 1000);
  return values[Math.floor(roll) % values.length];
};

const buildBoard = (seed: number): QMDJCell[] => {
  return PALACES.map((palace, index) => ({
    palace,
    star: pick(seed, STARS, index * 3),
    door: pick(seed + 17, DOORS, index * 5),
    deity: pick(seed + 29, DEITIES, index * 7),
  }));
};

export class LoShuQMDJProvider implements QMDJProvider {
  async generateBoard(input: {
    dateTime: DateTime;
    zone: string;
    arrangement: "yang" | "yin";
    school: "Zhi Run" | "Chai Bu" | string;
  }): Promise<QMDJBoard> {
    const local = input.dateTime.setZone(input.zone);
    const seed = generateSeed(local.toISO() ?? "", input.arrangement, input.school);
    const chart = buildBoard(seed);
    return {
      variant: `${input.arrangement} · ${input.school}`,
      chart,
    };
  }
}
