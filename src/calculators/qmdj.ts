import type { DateTime } from "luxon";

export interface QMDJCell {
  palace: string;
  star: string;
  door: string;
  deity: string;
}

export interface QMDJBoard {
  variant: string;
  chart: QMDJCell[]; // 3x3 Lo Shu flattened
}

/**
 * Contract for Qi Men Dun Jia computational engines.
 * TODO: integrate third-party calculator respecting licensing ("privacy:paid" where applicable).
 */
export interface QMDJProvider {
  generateBoard: (input: {
    dateTime: DateTime;
    zone: string;
    arrangement: "yang" | "yin";
    school: "Zhi Run" | "Chai Bu" | string;
  }) => Promise<QMDJBoard>;
}
