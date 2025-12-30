import { describe, expect, it } from "vitest";
import { GeneKeysProfileProvider } from "@/providers/gk/GeneKeysProfileProvider";

const provider = new GeneKeysProfileProvider();

describe("GeneKeysProfileProvider", () => {
  it("returns hologenetic spheres for the supplied birth details", async () => {
    const profile = await provider.computeProfile({
      birthDateTime: "1992-09-01T06:03:00",
      timezone: "Australia/Sydney",
    });

    expect(profile.spheres).toHaveLength(4);
    expect(profile.spheres[0]).toEqual({ name: "Life's Work", geneKey: 29, line: 2 });
    expect(profile.spheres[1]).toEqual({ name: "Evolution", geneKey: 61, line: 2 });
    expect(profile.spheres[2].geneKey).toBe(14);
    expect(profile.spheres[3].geneKey).toBe(46);
  });
});
