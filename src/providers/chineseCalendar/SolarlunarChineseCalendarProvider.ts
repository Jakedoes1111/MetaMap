import solarLunar from "solarlunar";
import { DateTime } from "luxon";
import type {
  BaZiPillar,
  ChineseCalendarProvider,
  LuckPillar,
  SexagenaryStemBranch,
} from "@/calculators";

const STEM_MAP: Record<string, string> = {
  甲: "Jia",
  乙: "Yi",
  丙: "Bing",
  丁: "Ding",
  戊: "Wu",
  己: "Ji",
  庚: "Geng",
  辛: "Xin",
  壬: "Ren",
  癸: "Gui",
};

const BRANCH_MAP: Record<string, string> = {
  子: "Zi",
  丑: "Chou",
  寅: "Yin",
  卯: "Mao",
  辰: "Chen",
  巳: "Si",
  午: "Wu",
  未: "Wei",
  申: "Shen",
  酉: "You",
  戌: "Xu",
  亥: "Hai",
};

const BRANCH_ORDER = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const HIDDEN_STEMS: Record<string, string[]> = {
  Zi: ["Gui"],
  Chou: ["Ji", "Gui", "Xin"],
  Yin: ["Jia", "Bing", "Wu"],
  Mao: ["Yi"],
  Chen: ["Wu", "Yi", "Gui"],
  Si: ["Bing", "Wu", "Geng"],
  Wu: ["Ding", "Ji"],
  Wei: ["Ji", "Yi", "Ding"],
  Shen: ["Geng", "Ren", "Wu"],
  You: ["Xin"],
  Xu: ["Wu", "Xin", "Ding"],
  Hai: ["Ren", "Jia"],
};

const HOUR_BRANCHES: Array<{ branch: string; startHour: number }> = [
  { branch: "Zi", startHour: 23 },
  { branch: "Chou", startHour: 1 },
  { branch: "Yin", startHour: 3 },
  { branch: "Mao", startHour: 5 },
  { branch: "Chen", startHour: 7 },
  { branch: "Si", startHour: 9 },
  { branch: "Wu", startHour: 11 },
  { branch: "Wei", startHour: 13 },
  { branch: "Shen", startHour: 15 },
  { branch: "You", startHour: 17 },
  { branch: "Xu", startHour: 19 },
  { branch: "Hai", startHour: 21 },
];

const luckSequence = ["Jia", "Yi", "Bing", "Ding", "Wu", "Ji", "Geng", "Xin", "Ren", "Gui"];

const resolveStem = (symbol: string): string => STEM_MAP[symbol] ?? symbol;
const resolveBranch = (symbol: string): string => BRANCH_MAP[symbol] ?? symbol;

const toPillar = (value: string, pillar: BaZiPillar["pillar"]): BaZiPillar => {
  const [stemSymbol, branchSymbol] = value.split("");
  const stem = resolveStem(stemSymbol);
  const branch = resolveBranch(branchSymbol);
  const hiddenStems = HIDDEN_STEMS[branch] ?? [stem];
  return {
    pillar,
    heavenlyStem: stem,
    earthlyBranch: branch,
    hiddenStems,
  };
};

const computeHourPillar = (
  dateTime: DateTime,
  dayStem: string,
): BaZiPillar => {
  const hour = dateTime.hour;
  const branchEntry = HOUR_BRANCHES.find((entry, index) => {
    const endHour = HOUR_BRANCHES[(index + 1) % HOUR_BRANCHES.length].startHour;
    if (entry.startHour > endHour) {
      return hour >= entry.startHour || hour < endHour;
    }
    return hour >= entry.startHour && hour < endHour;
  });
  const branch = branchEntry?.branch ?? "Zi";
  const dayStemIndex = luckSequence.indexOf(dayStem);
  const branchIndex = HOUR_BRANCHES.findIndex((entry) => entry.branch === branch);
  const stemIndex = (dayStemIndex * 2 + branchIndex) % luckSequence.length;
  const heavenlyStem = luckSequence[stemIndex];
  return {
    pillar: "hour",
    heavenlyStem,
    earthlyBranch: branch,
    hiddenStems: HIDDEN_STEMS[branch] ?? [heavenlyStem],
  };
};

const computeLuckStartingAge = (birth: DateTime, forward: boolean) => {
  const solarIndex = birth.month * 2;
  const rawTerm = forward ? solarIndex + 1 : solarIndex - 1;
  const normalised = ((rawTerm - 1 + 24) % 24) + 1;
  const year = birth.year;
  const termDay = solarLunar.getTerm(year, normalised);
  const termMonth = Math.ceil(normalised / 2) || 1;
  const safeDay = Number.isFinite(termDay) && termDay > 0 ? termDay : 1;
  const termDate = DateTime.utc(year, termMonth, safeDay);
  const birthUtc = birth.toUTC();
  const diffDays = forward
    ? termDate.diff(birthUtc, "days").days
    : birthUtc.diff(termDate, "days").days;
  const adjusted = Math.max(0, diffDays);
  return Math.round(adjusted / 3);
};

export class SolarlunarChineseCalendarProvider implements ChineseCalendarProvider {
  async toSexagenary(dateTime: DateTime, zone: string): Promise<SexagenaryStemBranch> {
    const local = dateTime.setZone(zone);
    const data = solarLunar.solar2lunar(local.year, local.month, local.day);
    const [stemSymbol, branchSymbol] = data.gzDay.split("");
    return {
      stem: resolveStem(stemSymbol),
      branch: resolveBranch(branchSymbol),
    };
  }

  async baziPillars(input: {
    dateTime: DateTime;
    zone: string;
    gender?: "yin" | "yang";
    variant?: string;
  }): Promise<BaZiPillar[]> {
    const local = input.dateTime.setZone(input.zone);
    const data = solarLunar.solar2lunar(local.year, local.month, local.day);
    const yearPillar = toPillar(data.gzYear, "year");
    const monthPillar = toPillar(data.gzMonth, "month");
    const dayPillar = toPillar(data.gzDay, "day");
    const hourPillar = computeHourPillar(local, dayPillar.heavenlyStem);
    return [yearPillar, monthPillar, dayPillar, hourPillar];
  }

  async luckPillars(input: {
    dateTime: DateTime;
    zone: string;
    variant?: string;
  }): Promise<LuckPillar[]> {
    const local = input.dateTime.setZone(input.zone);
    const data = solarLunar.solar2lunar(local.year, local.month, local.day);
    const genderForward = input.variant === "yin" ? false : true;
    const startAge = computeLuckStartingAge(local, genderForward);
    const stemSymbol = data.gzMonth[0] ?? "甲";
    const startStem = resolveStem(stemSymbol);
    const startIndex = Math.max(0, luckSequence.indexOf(startStem));
    return Array.from({ length: 8 }).map((_, index) => {
      const stem = luckSequence[(startIndex + index) % luckSequence.length];
      const branch = BRANCH_ORDER[(index + HOUR_BRANCHES.length) % BRANCH_ORDER.length];
      const branchName = resolveBranch(branch);
      return {
        index,
        startingAge: startAge + index * 10,
        durationYears: 10,
        pillar: {
          pillar: "year",
          heavenlyStem: stem,
          earthlyBranch: branchName,
          hiddenStems: HIDDEN_STEMS[branchName] ?? [stem],
        },
      };
    });
  }
}
