import { registerProvider } from "@/providers";
import { DemoEphemerisProvider } from "@/providers/ephemeris/DemoEphemerisProvider";
import { registerServerProviders } from "@/server/providers";
import { SolarlunarChineseCalendarProvider } from "@/providers/chineseCalendar/SolarlunarChineseCalendarProvider";
import { ClassicZWDSProvider } from "@/providers/zwds/ClassicZWDSProvider";
import { LoShuQMDJProvider } from "@/providers/qmdj/LoShuQMDJProvider";
import { TraditionalFSProvider } from "@/providers/fs/TraditionalFSProvider";
import { HumanDesignGateProvider } from "@/providers/hd/HumanDesignGateProvider";
import { GeneKeysProfileProvider } from "@/providers/gk/GeneKeysProfileProvider";

let bootstrapped = false;
let bootstrapPromise: Promise<void> | null = null;

const parseBoolean = (value?: string) => {
  if (!value) {
    return false;
  }
  return /^(true|1|yes|on)$/i.test(value.trim());
};

const shouldEnableDemoProviders = () => {
  const flag = process.env.NEXT_PUBLIC_ENABLE_DEMO_PROVIDERS;
  if (flag == null || flag.trim().length === 0) {
    return process.env.NODE_ENV !== "production";
  }
  return parseBoolean(flag);
};

const bootstrapProviders = async () => {
  const enableDemoProviders = shouldEnableDemoProviders();
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
