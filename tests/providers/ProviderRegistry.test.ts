import { describe, expect, it } from "vitest";
import type { EphemerisProvider } from "@/calculators";
import {
  ProviderUnavailableError,
  getProvider,
  listProviderStatus,
  registerProvider,
  resetProviders,
} from "@/providers";

describe("ProviderRegistry", () => {
  it("throws ProviderUnavailableError when provider missing", () => {
    resetProviders();
    expect(() => getProvider("ephemeris")).toThrow(ProviderUnavailableError);
  });

  it("returns registered provider", () => {
    resetProviders();
    const stub: EphemerisProvider = {
      getEphemeris: async () => ({
        positions: [],
        cusps: [],
        angles: {
          ascendant: 0,
          descendant: 180,
          midheaven: 90,
          imumCoeli: 270,
        },
        metadata: {
          zodiac: "tropical",
        },
      }),
    };
    registerProvider({ key: "ephemeris", provider: stub });
    expect(getProvider("ephemeris")).toBe(stub);
  });

  it("reports status including registration flag", () => {
    resetProviders();
    const statuses = listProviderStatus();
    expect(statuses.find((status) => status.key === "fs")?.registered).toBe(false);
  });
});
