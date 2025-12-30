import type { DateTime } from "luxon";
import type { QMDJBoard, QMDJProvider } from "@/calculators";

const palaces = ["NW", "N", "NE", "W", "Center", "E", "SW", "S", "SE"] as const;

const stars = ["Tian Peng", "Tian Ren", "Tian Chong", "Tian Fu", "Tian Xing", "Tian Ying", "Tian Rui", "Tian Xian", "Tian Qin"];
const doors = ["Kai", "Xiu", "Sheng", "Shang", "Du", "Jing", "Si", "Jing", "Kai"];
const deities = ["Geng", "Xin", "Ren", "Gui", "Ding", "Bing", "Yi", "Jia", "Ji"];

const rotateArray = <T>(arr: readonly T[], offset: number) => {
  const mod = ((offset % arr.length) + arr.length) % arr.length;
  return Array.from({ length: arr.length }, (_, index) => arr[(index + mod) % arr.length]);
};

export class DemoQMDJProvider implements QMDJProvider {
  async generateBoard(input: {
    dateTime: DateTime;
    zone: string;
    arrangement: "yang" | "yin";
    school: "Zhi Run" | "Chai Bu" | string;
  }): Promise<QMDJBoard> {
    const dt = input.dateTime.setZone(input.zone);
    const seed = Math.abs(Math.floor(dt.toMillis() / (1000 * 60))) % stars.length;
    const arrangementOffset = input.arrangement === "yang" ? 1 : -1;
    const starSet = rotateArray(stars, seed);
    const doorSet = rotateArray(doors, seed + arrangementOffset);
    const deitySet = rotateArray(deities, seed + arrangementOffset * 2);

    return {
      variant: input.school,
      chart: palaces.map((palace, index) => ({
        palace,
        star: starSet[index % starSet.length],
        door: doorSet[index % doorSet.length],
        deity: deitySet[index % deitySet.length],
      })),
    };
  }
}
