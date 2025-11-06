import type { DateTime } from "luxon";

export interface SexagenaryStemBranch {
  stem: string;
  branch: string;
}

export interface BaZiPillar {
  pillar: "year" | "month" | "day" | "hour";
  heavenlyStem: string;
  earthlyBranch: string;
  hiddenStems: string[];
}

export interface LuckPillar {
  index: number;
  startingAge: number;
  pillar: BaZiPillar;
  durationYears: number;
}

/**
 * Contract for Chinese calendar providers (e.g., HKO, SAA Chinese Almanac).
 * Implementations may require licensed datasets.
 * TODO: integrate Chinese calendar provider.
 */
export interface ChineseCalendarProvider {
  toSexagenary: (dateTime: DateTime, zone: string) => Promise<SexagenaryStemBranch>;
  baziPillars: (input: {
    dateTime: DateTime;
    zone: string;
    gender?: "yin" | "yang";
    variant?: string;
  }) => Promise<BaZiPillar[]>;
  luckPillars: (input: {
    dateTime: DateTime;
    zone: string;
    variant?: string;
  }) => Promise<LuckPillar[]>;
}
