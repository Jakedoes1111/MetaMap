import { registerProvider } from "@/providers";
import { DemoEphemerisProvider } from "@/providers/ephemeris/DemoEphemerisProvider";
import { DemoChineseCalendarProvider } from "@/providers/chineseCalendar/DemoChineseCalendarProvider";
import { DemoZWDSProvider } from "@/providers/zwds/DemoZWDSProvider";
import { DemoQMDJProvider } from "@/providers/qmdj/DemoQMDJProvider";

let bootstrapped = false;

const shouldEnableDemoProviders = () =>
  process.env.NEXT_PUBLIC_ENABLE_DEMO_PROVIDERS === "true" ||
  process.env.ENABLE_DEMO_PROVIDERS === "true" ||
  process.env.NODE_ENV !== "production";

export const ensureProvidersBootstrapped = () => {
  if (bootstrapped) {
    return;
  }

  if (shouldEnableDemoProviders()) {
    registerProvider({
      key: "ephemeris",
      provider: new DemoEphemerisProvider(),
    });
    registerProvider({
      key: "chineseCalendar",
      provider: new DemoChineseCalendarProvider(),
    });
    registerProvider({
      key: "zwds",
      provider: new DemoZWDSProvider(),
    });
    registerProvider({
      key: "qmdj",
      provider: new DemoQMDJProvider(),
    });
  }

  bootstrapped = true;
};
