"use client";

import { useState } from "react";
import { WarningBanner } from "@/components/WarningBanner";
import { SystemPageLayout } from "@/components/SystemPageLayout";
import { useStore } from "@/store/useStore";
import type { BaZiPillar, LuckPillar } from "@/calculators";

const pillarLabel = (pillar: BaZiPillar["pillar"]) => {
  switch (pillar) {
    case "year":
      return "Year";
    case "month":
      return "Month";
    case "day":
      return "Day";
    case "hour":
      return "Hour";
    default:
      return pillar;
  }
};

const BaZiPage = () => {
  const {
    birthDetails,
    invokeProvider,
    providerLoading,
    providerErrors,
    clearProviderError,
    appendRow,
    pruneRows,
  } = useStore((state) => ({
    birthDetails: state.birthDetails,
    invokeProvider: state.invokeProvider,
    providerLoading: state.providerLoading,
    providerErrors: state.providerErrors,
    clearProviderError: state.clearProviderError,
    appendRow: state.appendRow,
    pruneRows: state.pruneRows,
  }));

  const [pillars, setPillars] = useState<BaZiPillar[] | null>(null);
  const [luckPillars, setLuckPillars] = useState<LuckPillar[]>([]);
  const [gender, setGender] = useState<"yin" | "yang" | "unspecified">("unspecified");

  const loading = providerLoading.chineseCalendar ?? false;
  const errorMessage = providerErrors.chineseCalendar;

  const requestPayload = {
    birthIso: `${birthDetails.birthDate}T${birthDetails.birthTime}`,
    timezone: birthDetails.timezone,
    gender: gender === "unspecified" ? undefined : gender,
    variant: "default",
  };

  const handleFetch = async () => {
    clearProviderError("chineseCalendar");
    const response = await invokeProvider<typeof requestPayload, { pillars: BaZiPillar[]; luckPillars: LuckPillar[] }>(
      "chineseCalendar",
      requestPayload,
    );
    if (response.status === 200 && response.data) {
      setPillars(response.data.pillars);
      setLuckPillars(response.data.luckPillars);
      const birthIso = `${birthDetails.birthDate}T${birthDetails.birthTime}`;
      pruneRows((row) => row.system === "BaZi");
      response.data.pillars.forEach((pillar) => {
        appendRow({
          person_id: "default-person",
          birth_datetime_local: birthIso,
          birth_timezone: birthDetails.timezone,
          system: "BaZi",
          subsystem: requestPayload.variant,
          source_tool: "chineseCalendar",
          source_url_or_ref: "",
          data_point: `${pillarLabel(pillar.pillar)} pillar`,
          verbatim_text: `${pillar.heavenlyStem} · ${pillar.earthlyBranch} (Hidden: ${pillar.hiddenStems.join(", ")})`,
          category: "Timing",
          subcategory: "Pillar",
          direction_cardinal: "",
          direction_degrees: null,
          timing_window_start: null,
          timing_window_end: null,
          polarity: "+",
          strength: 0,
          confidence: 0.85,
          weight_system: 1,
          notes: `pillar=${pillar.pillar}`,
        });
      });
      response.data.luckPillars.forEach((luck) => {
        appendRow({
          person_id: "default-person",
          birth_datetime_local: birthIso,
          birth_timezone: birthDetails.timezone,
          system: "BaZi",
          subsystem: `${requestPayload.variant} luck`,
          source_tool: "chineseCalendar",
          source_url_or_ref: "",
          data_point: `Luck pillar ${luck.index + 1}`,
          verbatim_text: `${luck.pillar.heavenlyStem} · ${luck.pillar.earthlyBranch} (start age ${luck.startingAge})`,
          category: "Timing",
          subcategory: "Luck",
          direction_cardinal: "",
          direction_degrees: null,
          timing_window_start: null,
          timing_window_end: null,
          polarity: "+",
          strength: 0,
          confidence: 0.8,
          weight_system: 1,
          notes: `duration=${luck.durationYears}y`,
        });
      });
    }
  };

  return (
    <SystemPageLayout
      title="BaZi (Four Pillars)"
      description="Compute Heavenly Stems and Earthly Branches using the configured Chinese calendar provider."
    >
      <WarningBanner
        title={pillars ? "BaZi pillars computed" : "Awaiting provider"}
        description={
          pillars
            ? "Sexagenary stems and branches are derived from the configured Chinese calendar provider."
            : "Provide accurate birth details then compute to populate the pillars and decadal cycles."
        }
      />
      <section className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <div className="rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Four Pillars</h2>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <label className="inline-flex items-center gap-1">
                Gender
                <select
                  className="rounded border border-muted/60 bg-background p-1 text-xs"
                  value={gender}
                  onChange={(event) => setGender(event.target.value as typeof gender)}
                >
                  <option value="unspecified">Unspecified</option>
                  <option value="yin">Yin</option>
                  <option value="yang">Yang</option>
                </select>
              </label>
              <button
                type="button"
                className="rounded-full bg-[hsl(var(--colour-accent))] px-3 py-1 text-xs font-semibold text-white shadow disabled:opacity-60"
                onClick={handleFetch}
                disabled={loading}
              >
                {loading ? "Computing…" : "Compute pillars"}
              </button>
            </div>
          </header>
          {errorMessage && (
            <p className="mt-3 rounded border border-[hsl(var(--colour-conflict))]/40 bg-[hsl(var(--colour-conflict)/0.1)] px-3 py-2 text-xs text-[hsl(var(--colour-conflict))]">
              {errorMessage}
            </p>
          )}
          <div className="mt-4 grid grid-cols-4 gap-3 text-center text-sm font-semibold">
            {(pillars ?? []).map((pillar) => (
              <div key={pillar.pillar} className="rounded bg-background/60 p-4 shadow-sm">
                <p className="text-xs uppercase text-muted">{pillarLabel(pillar.pillar)}</p>
                <p className="mt-2 text-lg">
                  {pillar.heavenlyStem} · {pillar.earthlyBranch}
                </p>
                <p className="text-xs text-muted">Hidden: {pillar.hiddenStems.join(", ")}</p>
              </div>
            ))}
            {!pillars &&
              ["Year", "Month", "Day", "Hour"].map((label) => (
                <div key={label} className="rounded bg-background/60 p-4 shadow-sm">
                  <p className="text-xs uppercase text-muted">{label}</p>
                  <p className="mt-2 text-lg text-muted">UNKNOWN</p>
                  <p className="text-xs text-muted">Awaiting provider</p>
                </div>
              ))}
          </div>
        </div>
        <div className="rounded-lg border border-muted/50 bg-white p-4 text-sm shadow-card dark:bg-slate-900">
          <h2 className="text-base font-semibold">Luck pillars</h2>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-xs uppercase text-muted">
                <th className="pb-2 text-left">Index</th>
                <th className="pb-2 text-left">Starting age</th>
                <th className="pb-2 text-left">Pillar</th>
              </tr>
            </thead>
            <tbody>
              {luckPillars.length > 0
                ? luckPillars.map((pillar) => (
                    <tr key={pillar.index} className="border-t border-muted/30">
                      <td className="py-2">{pillar.index + 1}</td>
                      <td className="py-2">{pillar.startingAge}</td>
                      <td className="py-2">
                        {pillar.pillar.heavenlyStem} · {pillar.pillar.earthlyBranch}
                      </td>
                    </tr>
                  ))
                : [0, 1, 2, 3].map((index) => (
                    <tr key={index} className="border-t border-muted/30">
                      <td className="py-2">{index + 1}</td>
                      <td className="py-2 text-muted">UNKNOWN</td>
                      <td className="py-2 text-muted">UNKNOWN</td>
                    </tr>
                  ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted">
            Birth timezone: {birthDetails.timezone}. Update the gender selection before computing to
            tailor luck pillar scheduling.
          </p>
        </div>
      </section>
    </SystemPageLayout>
  );
};

export default BaZiPage;
