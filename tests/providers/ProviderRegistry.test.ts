import { describe, expect, it } from "vitest";
import type { EphemerisProvider } from "@/calculators";
import type { EphemerisResponse } from "@/lib/ephemeris";
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
    const response: EphemerisResponse = {
      bodies: [],
      houses: [],
      angles: [],
      metadata: {
        provider: "stub",
        version: "test",
        engine: "astronomy-engine",
        options: { zodiac: "tropical", houseSystem: "Placidus" },
        timestamp: new Date(0).toISOString(),
        location: { latitude: 0, longitude: 0 },
        flags: 0,
      },
    };
    const stub: EphemerisProvider = {
      getPositions: async () => response,
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
