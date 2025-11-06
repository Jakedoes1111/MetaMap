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

export const ensureProvidersBootstrapped = () => {
  if (bootstrapped) {
    return;
  }

  const { ephemerisRegistered } = registerServerProviders();

  if (!ephemerisRegistered) {
    registerProvider({
      key: "ephemeris",
      provider: new DemoEphemerisProvider(),
    });
  }

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

  bootstrapped = true;
};
