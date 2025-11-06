import { registerProvider } from "@/providers";
import { SwissEphemerisAdapter } from "./ephemeris/SwissEphemerisAdapter";
import { resolveSwissEphemerisConfig } from "./ephemeris/config";

export const registerServerProviders = () => {
  const config = resolveSwissEphemerisConfig();
  if (!config.enabled) {
    return { ephemerisRegistered: false };
  }

  try {
    registerProvider({
      key: "ephemeris",
      provider: new SwissEphemerisAdapter(config),
    });
    return { ephemerisRegistered: true };
  } catch (error) {
    console.error("Failed to initialise Swiss Ephemeris provider", error);
    return { ephemerisRegistered: false };
  }
};
