import type { DateTime } from "luxon";
import type {
  BaZiPillar,
  ChineseCalendarProvider,
  LuckPillar,
  SexagenaryStemBranch,
} from "@/calculators";

const HEAVENLY_STEMS = ["Jia", "Yi", "Bing", "Ding", "Wu", "Ji", "Geng", "Xin", "Ren", "Gui"];
const EARTHLY_BRANCHES = [
  "Zi",
  "Chou",
  "Yin",
  "Mao",
  "Chen",
  "Si",
  "Wu",
  "Wei",
  "Shen",
  "You",
  "Xu",
  "Hai",
];

const makePillar = (index: number, pillar: BaZiPillar["pillar"]): BaZiPillar => {
  const stem = HEAVENLY_STEMS[index % HEAVENLY_STEMS.length];
  const branch = EARTHLY_BRANCHES[index % EARTHLY_BRANCHES.length];
  return {
    pillar,
    heavenlyStem: stem,
    earthlyBranch: branch,
    hiddenStems: [stem],
  };
};

const pathSum = (dt: DateTime) =>
  dt.year + dt.month * 3 + dt.day * 7 + dt.hour * 13 + dt.offset / 60;

/**
 * Demo Chinese calendar provider returning deterministic pillars to drive UI.
 */
export class DemoChineseCalendarProvider implements ChineseCalendarProvider {
  async toSexagenary(dateTime: DateTime, zone: string): Promise<SexagenaryStemBranch> {
    const inZone = dateTime.setZone(zone);
    const seed = Math.abs(Math.floor(pathSum(inZone)));
    return {
      stem: HEAVENLY_STEMS[seed % HEAVENLY_STEMS.length],
      branch: EARTHLY_BRANCHES[seed % EARTHLY_BRANCHES.length],
    };
  }

  async baziPillars(input: {
    dateTime: DateTime;
    zone: string;
    gender?: "yin" | "yang";
    variant?: string;
  }): Promise<BaZiPillar[]> {
    const inZone = input.dateTime.setZone(input.zone);
    const base = Math.abs(Math.floor(pathSum(inZone)));
    return [
      makePillar(base + 0, "year"),
      makePillar(base + 1, "month"),
      makePillar(base + 2, "day"),
      makePillar(base + 3, "hour"),
    ];
  }

  async luckPillars(input: {
    dateTime: DateTime;
    zone: string;
    gender?: "yin" | "yang";
    variant?: string;
  }): Promise<LuckPillar[]> {
    const inZone = input.dateTime.setZone(input.zone);
    const base = Math.abs(Math.floor(pathSum(inZone)));
    return Array.from({ length: 4 }).map((_, index) => ({
      index,
      startingAge: 10 + index * 10,
      durationYears: 10,
      pillar: makePillar(base + index + 5, "year"),
    }));
  }
}
