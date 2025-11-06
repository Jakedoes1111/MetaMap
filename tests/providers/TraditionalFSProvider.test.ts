import { describe, expect, it } from "vitest";
import { TraditionalFSProvider } from "@/providers/fs/TraditionalFSProvider";

const provider = new TraditionalFSProvider();

describe("TraditionalFSProvider", () => {
  it("computes flying stars with north-facing period 8 chart", async () => {
    const stars = await provider.computeFlyingStars({
      sittingDegrees: 180,
      facingDegrees: 0,
      period: 8,
    });

    expect(stars).toHaveLength(9);
    expect(stars.find((cell) => cell.palace === "Centre")).toMatchObject({
      star: 8,
      baseStar: 5,
      periodStar: 8,
    });
    expect(stars.find((cell) => cell.palace === "North")).toMatchObject({
      star: 9,
      baseStar: 1,
      periodStar: 8,
    });
  });

  it("derives life gua directions for 1992 male birth", async () => {
    const mansions = await provider.computeEightMansions({ birthYear: 1992, gender: "male" });

    expect(mansions.mingGua).toBe("6");
    expect(mansions.favourableDirections).toEqual([
      "North-West",
      "North-East",
      "West",
      "South-West",
    ]);
    expect(mansions.unfavourableDirections).toContain("South");
  });
});
