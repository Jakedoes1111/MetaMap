import { describe, expect, it } from "vitest";
import { degreesToCardinal } from "@/lib/direction";

describe("degreesToCardinal", () => {
  const cases: Array<[number, string]> = [
    [0, "N"],
    [22.4, "N"],
    [22.5, "NE"],
    [67.4, "NE"],
    [67.5, "E"],
    [112.4, "E"],
    [112.5, "SE"],
    [157.4, "SE"],
    [157.5, "S"],
    [202.4, "S"],
    [202.5, "SW"],
    [247.4, "SW"],
    [247.5, "W"],
    [292.4, "W"],
    [292.5, "NW"],
    [337.4, "NW"],
    [337.5, "N"],
    [359.9, "N"],
  ];

  cases.forEach(([input, output]) => {
    it(`maps ${input}° to ${output}`, () => {
      expect(degreesToCardinal(input)).toBe(output);
    });
  });
});
