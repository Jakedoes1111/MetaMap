import { registerProvider } from "@/providers";
import { DemoEphemerisProvider } from "@/providers/ephemeris/DemoEphemerisProvider";
import { registerServerProviders } from "@/server/providers";
import { SolarlunarChineseCalendarProvider } from "@/providers/chineseCalendar/SolarlunarChineseCalendarProvider";
import { ClassicZWDSProvider } from "@/providers/zwds/ClassicZWDSProvider";
import { LoShuQMDJProvider } from "@/providers/qmdj/LoShuQMDJProvider";
import { TraditionalFSProvider } from "@/providers/fs/TraditionalFSProvider";
import { HumanDesignGateProvider } from "@/providers/hd/HumanDesignGateProvider";
import { GeneKeysProfileProvider } from "@/providers/gk/GeneKeysProfileProvider";
import { getRuntimeConfig } from "@/server/config/runtime";

let bootstrapped = false;
let bootstrapPromise: Promise<void> | null = null;

const bootstrapProviders = async () => {
  const enableDemoProviders = getRuntimeConfig().enableDemoProviders;
  const { ephemerisRegistered } = await registerServerProviders();

  if (enableDemoProviders && !ephemerisRegistered) {
    registerProvider({
      key: "ephemeris",
      provider: new DemoEphemerisProvider(),
    });
  }

  if (enableDemoProviders) {
    registerProvider({
      key: "chineseCalendar",
      provider: new SolarlunarChineseCalendarProvider(),
    });
    registerProvider({
      key: "zwds",
      provider: new ClassicZWDSProvider(),
    });
    registerProvider({
      key: "qmdj",
      provider: new LoShuQMDJProvider(),
    });
    registerProvider({
      key: "fs",
      provider: new TraditionalFSProvider(),
    });
    registerProvider({
      key: "hd",
      provider: new HumanDesignGateProvider(),
    });
    registerProvider({
      key: "gk",
      provider: new GeneKeysProfileProvider(),
    });
  }

  bootstrapped = true;
};

export const ensureProvidersBootstrapped = async () => {
  if (bootstrapped) {
    return;
  }

  if (!bootstrapPromise) {
    bootstrapPromise = bootstrapProviders().finally(() => {
      bootstrapPromise = null;
    });
  }

  await bootstrapPromise;
};
