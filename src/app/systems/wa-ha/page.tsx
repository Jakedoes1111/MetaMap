"use client";

import { useStore } from "@/store/useStore";
import { WarningBanner } from "@/components/WarningBanner";
import { SystemPageLayout } from "@/components/SystemPageLayout";
import { AstrologyWheel } from "@/components/ephemeris/AstrologyWheel";
import type { HouseCusp, EphemerisAngles } from "@/lib/ephemeris";
import type { ZodiacType } from "@/calculators";

const WaHaPage = () => {
  const { birthDetails, setBirthDetails } = useStore((state) => ({
    birthDetails: state.birthDetails,
    setBirthDetails: state.setBirthDetails,
  }));

  const demoCusps: HouseCusp[] = [
    { house: 1, longitude: 102.5, label: "Asc" },
    { house: 2, longitude: 128.4 },
    { house: 3, longitude: 156.2 },
    { house: 4, longitude: 186.9 },
    { house: 5, longitude: 213.7 },
    { house: 6, longitude: 245.1 },
    { house: 7, longitude: 281.0, label: "Dsc" },
    { house: 8, longitude: 308.6 },
    { house: 9, longitude: 333.3 },
    { house: 10, longitude: 12.4, label: "MC" },
    { house: 11, longitude: 39.2 },
    { house: 12, longitude: 72.8 },
  ];

  const demoAngles: EphemerisAngles = {
    ascendant: demoCusps[0].longitude,
    descendant: demoCusps[6].longitude,
    midheaven: demoCusps[9].longitude,
    imumCoeli: (demoCusps[9].longitude + 180) % 360,
  };

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
          <AstrologyWheel
            cusps={demoCusps}
            angles={demoAngles}
            metadata={{
              zodiac: birthDetails.zodiac.toLowerCase() as ZodiacType,
              houseSystem: birthDetails.houseSystem,
            }}
          />
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
