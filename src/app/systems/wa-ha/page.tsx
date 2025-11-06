"use client";

import { useStore } from "@/store/useStore";
import { WarningBanner } from "@/components/WarningBanner";
import { SystemPageLayout } from "@/components/SystemPageLayout";

const WaHaPage = () => {
  const { birthDetails, setBirthDetails } = useStore((state) => ({
    birthDetails: state.birthDetails,
    setBirthDetails: state.setBirthDetails,
  }));

  return (
    <SystemPageLayout
      title="Western / Hellenistic Astrology"
      description="Wheel placeholder with configurable zodiac and house system. Awaiting Swiss Ephemeris integration."
    >
      <WarningBanner
        title="UNKNOWN"
        description="TODO integrate Swiss Ephemeris or JPL provider. Natal positions are not generated to respect the no-invention standard."
      />
      <section className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
        <div className="rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900">
          <h2 className="text-base font-semibold">Wheel preview</h2>
          <p className="text-xs text-muted">
            Placeholder wheel shows rising sign, midheaven, and houses once a provider is wired.
          </p>
          <svg viewBox="-150 -150 300 300" className="mt-4 h-[280px] w-full">
            <circle r={120} fill="none" stroke="var(--colour-muted)" strokeWidth={2} />
            {Array.from({ length: 12 }).map((_, index) => {
              const angle = (index / 12) * Math.PI * 2;
              return (
                <line
                  key={index}
                  x1={0}
                  y1={0}
                  x2={Math.cos(angle) * 120}
                  y2={Math.sin(angle) * 120}
                  stroke="var(--colour-muted)"
                  strokeDasharray="4 2"
                />
              );
            })}
            <text
              x={0}
              y={0}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-semibold fill-foreground"
            >
              {birthDetails.zodiac} · {birthDetails.houseSystem}
            </text>
          </svg>
        </div>
        <form className="rounded-lg border border-muted/50 bg-white p-4 text-sm shadow-card dark:bg-slate-900">
          <fieldset className="mb-4">
            <legend className="text-sm font-semibold">Zodiac</legend>
            <label className="mt-2 flex items-center gap-2">
              <input
                type="radio"
                name="zodiac"
                checked={birthDetails.zodiac === "Tropical"}
                onChange={() => setBirthDetails({ zodiac: "Tropical" })}
              />
              Tropical
            </label>
            <label className="mt-2 flex items-center gap-2">
              <input
                type="radio"
                name="zodiac"
                checked={birthDetails.zodiac === "Sidereal"}
                onChange={() => setBirthDetails({ zodiac: "Sidereal" })}
              />
              Sidereal
            </label>
          </fieldset>
          <fieldset className="mb-4">
            <legend className="text-sm font-semibold">House system</legend>
            <select
              value={birthDetails.houseSystem}
              onChange={(event) =>
                setBirthDetails({ houseSystem: event.target.value as typeof birthDetails.houseSystem })
              }
              className="mt-2 w-full rounded border border-muted/60 bg-background p-2"
            >
              {["Placidus", "Whole Sign", "Equal", "Koch", "Porphyry", "Regiomontanus"].map((house) => (
                <option key={house} value={house}>
                  {house}
                </option>
              ))}
            </select>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-semibold">Ayanāṃśa (for sidereal)</legend>
            <input
              type="text"
              value={birthDetails.ayanamsa}
              onChange={(event) => setBirthDetails({ ayanamsa: event.target.value })}
              className="mt-2 w-full rounded border border-muted/60 bg-background p-2"
            />
            <p className="mt-2 text-xs text-muted">
              Applies when sidereal zodiac is selected. Providers should surface the chosen value in
              generated rows.
            </p>
          </fieldset>
        </form>
      </section>
    </SystemPageLayout>
  );
};

export default WaHaPage;
