import Link from "next/link";
import type { BirthDetails } from "@/store/useStore";
import { WarningBanner } from "@/components/WarningBanner";

interface SystemCardsProps {
  birthDetails: BirthDetails;
}

interface CardItem {
  system: string;
  title: string;
  route: string;
  description: string;
  variant?: boolean;
  warning?: string;
}

const items: CardItem[] = [
  {
    system: "WA",
    title: "Western / Hellenistic Astrology (WA/HA)",
    route: "/systems/wa-ha",
    description:
      "Natal wheel placeholder with selectable house system and zodiac. Swiss Ephemeris integration pending.",
    warning: "TODO integrate Swiss Ephemeris; currently no natal inventions.",
  },
  {
    system: "JA",
    title: "Jyotiṣa Astrology (JA)",
    route: "/systems/ja",
    description:
      "Nakṣatra and Dashā panels include ayanāṃśa selector. Displays VARIANT badges when not using Lahiri.",
  },
  {
    system: "BaZi",
    title: "BaZi Four Pillars",
    route: "/systems/bazi",
    description:
      "Four Pillars and Luck Pillars grids. Chinese calendar provider required for live data.",
    warning: "UNKNOWN until a Chinese calendar provider is configured; mark privacy as paid for licensed data.",
  },
  {
    system: "ZWDS",
    title: "Zi Wei Dou Shu",
    route: "/systems/zwds",
    description: "12-palace layout placeholder awaiting chart provider.",
    warning: "UNKNOWN pending ZWDS calculator integration.",
  },
  {
    system: "QMDJ",
    title: "Qi Men Dun Jia",
    route: "/systems/qmdj",
    description:
      "3×3 Lo Shu board with school selector and hour/day toggle. Displays TODO markers until provider added.",
  },
  {
    system: "FS",
    title: "Feng Shui",
    route: "/systems/fs",
    description:
      "Flying Star matrix and Eight Mansions Gua calculator. Records UNKNOWN when calculators absent.",
  },
  {
    system: "HD",
    title: "Human Design",
    route: "/systems/hd",
    description:
      "BodyGraph scaffold referencing system weight 0.6. Awaiting BodyGraph provider for live gates.",
    warning: "TODO integrate HD provider; set privacy to paid when using licensed APIs.",
  },
  {
    system: "GK",
    title: "Gene Keys",
    route: "/systems/gk",
    description:
      "Hologenetic profile placeholders referencing system weight 0.5. No gate interpretations without provider.",
  },
  {
    system: "IChing",
    title: "I Ching",
    route: "/systems/iching",
    description: "RNG casting tool (3-coin or yarrow) logging results into dataset.",
  },
  {
    system: "Tarot",
    title: "Tarot",
    route: "/systems/tarot",
    description: "Spread builder with crypto-secure deck shuffler and reading logs.",
  },
  {
    system: "Numerology_Pythagorean",
    title: "Numerology",
    route: "/systems/numerology",
    description: "Birthdate and name calculations for Pythagorean and Chaldean systems.",
  },
  {
    system: "Geomancy",
    title: "Geomancy",
    route: "/systems/geomancy",
    description: "Shield chart RNG using crypto.getRandomValues, logging judge and witnesses.",
  },
  {
    system: "Palmistry",
    title: "Palmistry",
    route: "/systems/palmistry",
    description: "Feature log with local-only image placeholders. No diagnostic claims.",
  },
  {
    system: "MianXiang",
    title: "Miàn Xiàng",
    route: "/systems/mianxiang",
    description: "Face map placeholders with secure local uploads.",
  },
];

export const SystemCards = ({ birthDetails }: SystemCardsProps) => (
  <section className="rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900">
    <header className="mb-4">
      <h2 className="text-base font-semibold">System dashboards</h2>
      <p className="text-xs text-muted">
        Jump into a system to personalise settings or connect a calculator plug-in.
      </p>
    </header>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const variant =
          item.system === "JA" ? birthDetails.ayanamsa !== "Lahiri" : item.variant ?? false;
        return (
          <article
            key={item.system}
            className="flex h-full flex-col justify-between rounded-lg border border-muted/40 bg-background/60 p-4 shadow-sm transition hover:border-accent/60 hover:shadow-card"
          >
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{item.title}</h3>
                {variant && (
                  <span className="rounded bg-[hsl(var(--colour-conflict)/0.12)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[hsl(var(--colour-conflict))]">
                    VARIANT
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground/80">{item.description}</p>
              {item.warning && (
                <WarningBanner title="UNKNOWN" description={item.warning} variant="unknown" />
              )}
            </div>
            <Link
              href={item.route}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-[hsl(var(--colour-accent))] px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2"
            >
              Open dashboard
            </Link>
          </article>
        );
      })}
    </div>
  </section>
);
