import { registerProvider } from "@/providers";
import { AstronomyEngineEphemerisProvider } from "@/providers/ephemeris/AstronomyEngineEphemerisProvider";
import { SwissEphemerisAdapter } from "./ephemeris/SwissEphemerisAdapter";
import { resolveSwissEphemerisConfig } from "./ephemeris/config";

export const registerServerProviders = () => {
  const config = resolveSwissEphemerisConfig();
  if (config.enabled) {
    try {
      registerProvider({
        key: "ephemeris",
        provider: new SwissEphemerisAdapter(config),
      });
      return { ephemerisRegistered: true };
    } catch (error) {
      console.error("Failed to initialise Swiss Ephemeris provider", error);
    }
  }

  registerProvider({
    key: "ephemeris",
    provider: new AstronomyEngineEphemerisProvider(),
  });
  return { ephemerisRegistered: true };
};
