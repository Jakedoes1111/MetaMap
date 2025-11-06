import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";
import { ensureClosedInterval, sameInstantToStartEnd } from "@/lib/time";

describe("ensureClosedInterval", () => {
  it("returns null when both values missing", () => {
    expect(ensureClosedInterval(null, null)).toBeNull();
  });

  it("throws when only one bound provided", () => {
    expect(() => ensureClosedInterval("2024-01-01T00:00:00Z", null)).toThrow();
    expect(() => ensureClosedInterval(null, "2024-01-02T00:00:00Z")).toThrow();
  });

  it("rejects if end precedes start", () => {
    expect(() =>
      ensureClosedInterval("2024-01-02T00:00:00Z", "2024-01-01T00:00:00Z"),
    ).toThrow("Interval end must be after or equal to start.");
  });

  it("returns an interval for valid bounds", () => {
    const interval = ensureClosedInterval("2024-01-01T00:00:00Z", "2024-01-02T00:00:00Z");
    expect(interval).not.toBeNull();
    expect(interval?.contains(interval!.start)).toBe(true);
  });
});

describe("sameInstantToStartEnd", () => {
  it("duplicates start and end correctly", () => {
    const iso = "2024-01-01T00:00:00Z";
    const { start, end } = sameInstantToStartEnd(DateTime.fromISO(iso), "UTC");
    expect(start).toEqual(end);
  });
});
