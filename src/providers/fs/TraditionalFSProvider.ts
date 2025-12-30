import type { EightMansionsResult, FSProvider, FlyingStar } from "@/calculators";

const PALACE_ORDER = [
  "North-West",
  "North",
  "North-East",
  "West",
  "Centre",
  "East",
  "South-West",
  "South",
  "South-East",
];

const LO_SHU_BASE = [6, 1, 8, 7, 5, 3, 2, 9, 4];

const computeDigitSum = (year: number) => {
  let total = year;
  while (total > 9) {
    total = total
      .toString()
      .split("")
      .reduce((accumulator, digit) => accumulator + Number(digit), 0);
  }
  return total;
};

const LIFE_GUA_DIRECTIONS: Record<string, { favourable: string[]; unfavourable: string[] }> = {
  "1": {
    favourable: ["North", "South-East", "East", "South"],
    unfavourable: ["South-West", "North-West", "West", "North-East"],
  },
  "2": {
    favourable: ["South-West", "West", "North-West", "North-East"],
    unfavourable: ["North", "South", "East", "South-East"],
  },
  "3": {
    favourable: ["South", "North", "South-East", "East"],
    unfavourable: ["West", "North-West", "North-East", "South-West"],
  },
  "4": {
    favourable: ["South-East", "East", "South", "North"],
    unfavourable: ["North-East", "South-West", "West", "North-West"],
  },
  "6": {
    favourable: ["North-West", "North-East", "West", "South-West"],
    unfavourable: ["South", "North", "South-East", "East"],
  },
  "7": {
    favourable: ["West", "North-East", "North-West", "South-West"],
    unfavourable: ["East", "South", "North", "South-East"],
  },
  "8": {
    favourable: ["North-East", "South-West", "North-West", "West"],
    unfavourable: ["South-East", "East", "South", "North"],
  },
  "9": {
    favourable: ["South", "East", "South-East", "North"],
    unfavourable: ["North-West", "West", "South-West", "North-East"],
  },
};

const normaliseDegrees = (degrees: number) => {
  const wrapped = degrees % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
};

const rotationOffset = (degrees: number) => {
  const wrapped = normaliseDegrees(degrees);
  return Math.round(wrapped / 45) % 8;
};

const buildFlyingStars = (
  period: number,
  facingDegrees: number,
  sittingDegrees: number,
): FlyingStar[] => {
  const offset = rotationOffset(facingDegrees);
  return PALACE_ORDER.map((palace, index) => {
    if (palace === "Centre") {
      const centreStar = ((period - 1) % 9) + 1;
      return {
        palace,
        star: centreStar,
        baseStar: 5,
        periodStar: centreStar,
      };
    }
    const baseIndex = (index + offset) % LO_SHU_BASE.length;
    const baseStar = LO_SHU_BASE[baseIndex];
    const periodStar = ((baseStar + period - 2) % 9) + 1;
    const sittingInfluence = Math.abs(Math.sin((sittingDegrees + baseIndex * 40) * Math.PI / 180));
    const star = Math.round(periodStar + sittingInfluence) % 9 || 9;
    return {
      palace,
      star,
      baseStar,
      periodStar,
    };
  });
};

const computeLifeGua = (birthYear: number, gender: "female" | "male" | "unspecified"): string => {
  const reduced = computeDigitSum(birthYear);
  if (gender === "unspecified") {
    return "UNKNOWN";
  }
  if (gender === "male") {
    const gua = 10 - reduced;
    if (gua === 5) {
      return "2";
    }
    return ((gua + 8) % 9 || 9).toString();
  }
  const gua = reduced + 5;
  const adjusted = gua > 9 ? gua - 9 : gua;
  if (adjusted === 5) {
    return "8";
  }
  return adjusted.toString();
};

export class TraditionalFSProvider implements FSProvider {
  async computeFlyingStars(input: {
    sittingDegrees: number;
    facingDegrees: number;
    period: number;
    variant?: string;
  }): Promise<FlyingStar[]> {
    return buildFlyingStars(input.period, input.facingDegrees, input.sittingDegrees);
  }

  async computeEightMansions(input: {
    birthYear: number;
    gender: "female" | "male" | "unspecified";
  }): Promise<EightMansionsResult> {
    const gua = computeLifeGua(input.birthYear, input.gender);
    const directions = LIFE_GUA_DIRECTIONS[gua] ?? {
      favourable: [],
      unfavourable: [],
    };
    return {
      mingGua: gua,
      favourableDirections: directions.favourable,
      unfavourableDirections: directions.unfavourable,
    };
  }
}
