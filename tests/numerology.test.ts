import { describe, expect, it } from "vitest";
import { computeLifePath, computeBirthNumber, computeNameNumber } from "@/lib/numerology";

describe("numerology calculations", () => {
  it("computes life path 13/4 for 1992-09-01", () => {
    const lifePath = computeLifePath("1992-09-01");
    expect(lifePath.compound).toBe(13);
    expect(lifePath.reduced).toBe(4);
  });

  it("computes birth number 1 for day = 1", () => {
    const birthNumber = computeBirthNumber("1992-09-01");
    expect(birthNumber.compound).toBe(1);
    expect(birthNumber.reduced).toBe(1);
  });

  it("computes name numbers deterministically", () => {
    const p = computeNameNumber("MetaMap", "pythagorean");
    const c = computeNameNumber("MetaMap", "chaldean");
    expect(p.reduced).toBeGreaterThan(0);
    expect(c.reduced).toBeGreaterThan(0);
  });
});
