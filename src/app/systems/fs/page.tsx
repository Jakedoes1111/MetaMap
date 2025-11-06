"use client";

import { useState } from "react";
import { WarningBanner } from "@/components/WarningBanner";
import { SystemPageLayout } from "@/components/SystemPageLayout";
import { useStore } from "@/store/useStore";
import type { EightMansionsResult, FlyingStar } from "@/calculators";

const periods = Array.from({ length: 9 }, (_, index) => index + 1);
const floorGrid = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "Centre"];

const placeholderStars = floorGrid.map((label) => ({
  palace: label,
  star: null as number | null,
  baseStar: null as number | null,
  periodStar: null as number | null,
}));

const FsPage = () => {
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

  const [period, setPeriod] = useState(8);
  const [facing, setFacing] = useState<number | null>(null);
  const [gender, setGender] = useState<"female" | "male" | "unspecified">("unspecified");
  const [flyingStars, setFlyingStars] = useState<FlyingStar[] | null>(null);
  const [eightMansions, setEightMansions] = useState<EightMansionsResult | null>(null);

  const loading = providerLoading.fs ?? false;
  const errorMessage = providerErrors.fs;

  const handleCompute = async () => {
    const birthYear = Number.parseInt(birthDetails.birthDate.split("-")[0] ?? "0", 10);
    if (Number.isNaN(birthYear) || facing == null) {
      return;
    }

    clearProviderError("fs");

    const response = await invokeProvider<
      {
        sittingDegrees: number;
        facingDegrees: number;
        period: number;
        birthYear: number;
        gender: "female" | "male" | "unspecified";
      },
      { flyingStars: FlyingStar[]; eightMansions: EightMansionsResult }
    >("fs", {
      sittingDegrees: (facing + 180) % 360,
      facingDegrees: facing,
      period,
      birthYear,
      gender,
    });

    if (response.status !== 200 || !response.data) {
      return;
    }

    setFlyingStars(response.data.flyingStars);
    setEightMansions(response.data.eightMansions);

    const birthIso = `${birthDetails.birthDate}T${birthDetails.birthTime}`;
    pruneRows((row) => row.system === "FS");

    response.data.flyingStars.forEach((cell) => {
      appendRow({
        person_id: "default-person",
        birth_datetime_local: birthIso,
        birth_timezone: birthDetails.timezone,
        system: "FS",
        subsystem: `Period ${period}`,
        source_tool: "fs",
        source_url_or_ref: "",
        data_point: `${cell.palace} palace`,
        verbatim_text: `Star ${cell.star} (base ${cell.baseStar} / period ${cell.periodStar})`,
        category: "Direction",
        subcategory: "Flying Star",
        direction_cardinal: "",
        direction_degrees: cell.palace === "Centre" ? null : facing,
        timing_window_start: null,
        timing_window_end: null,
        polarity: "+",
        strength: 0,
        confidence: 0.7,
        weight_system: 1,
        notes: `facing=${facing}`,
      });
    });

    appendRow({
      person_id: "default-person",
      birth_datetime_local: birthIso,
      birth_timezone: birthDetails.timezone,
      system: "FS",
      subsystem: "Eight Mansions",
      source_tool: "fs",
      source_url_or_ref: "",
      data_point: "Life Gua",
      verbatim_text: response.data.eightMansions.mingGua,
      category: "Guidance",
      subcategory: "Eight Mansions",
      direction_cardinal: "",
      direction_degrees: null,
      timing_window_start: null,
      timing_window_end: null,
      polarity: "+",
      strength: 0,
      confidence: 0.6,
      weight_system: 1,
      notes: `favourable=${response.data.eightMansions.favourableDirections.join("|")}`,
    });
  };

  const displayStars = flyingStars ?? placeholderStars;

  return (
    <SystemPageLayout
      title="Feng Shui (Flying Stars & Eight Mansions)"
      description="Generate Flying Star grids and Eight Mansions guidance via the configured Feng Shui provider."
    >
      <WarningBanner
        title={flyingStars ? "Chart computed" : "Awaiting provider"}
        description={
          flyingStars
            ? "Flying Star placements and Life Gua were generated using the configured Feng Shui provider."
            : "Provide facing degrees, period, and gender, then compute to populate the grid and directions."
        }
      />
      <section className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <div className="rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900">
          <header className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="inline-flex items-center gap-3">
              <label className="font-semibold">
                Period
                <select
                  className="ml-2 rounded border border-muted/60 bg-background p-1 text-sm"
                  value={period}
                  onChange={(event) => setPeriod(Number(event.target.value))}
                >
                  {periods.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="font-semibold">
                Facing°
                <input
                  type="number"
                  min={0}
                  max={359}
                  className="ml-2 w-20 rounded border border-muted/60 bg-background p-1 text-right text-sm"
                  value={facing ?? ""}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    setFacing(Number.isNaN(value) ? null : value);
                  }}
                />
              </label>
            </div>
            <button
              type="button"
              className="rounded-full bg-[hsl(var(--colour-accent))] px-4 py-2 text-xs font-semibold text-white shadow disabled:opacity-60"
              onClick={handleCompute}
              disabled={loading || facing == null}
            >
              {loading ? "Computing…" : "Compute chart"}
            </button>
          </header>
          {errorMessage && (
            <p className="mt-3 rounded border border-[hsl(var(--colour-conflict))]/40 bg-[hsl(var(--colour-conflict)/0.1)] px-3 py-2 text-xs text-[hsl(var(--colour-conflict))]">
              {errorMessage}
            </p>
          )}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {displayStars.map((cell) => (
              <div
                key={cell.palace}
                className="flex h-28 flex-col items-center justify-center rounded border border-muted/40 bg-background/60 text-center"
              >
                <p className="text-xs uppercase text-muted">{cell.palace}</p>
                <p className="mt-1 text-sm font-semibold">
                  {cell.star == null ? "—" : cell.star}
                </p>
                <p className="text-xs text-muted">
                  {cell.baseStar == null || cell.periodStar == null
                    ? `Period ${period}`
                    : `Base ${cell.baseStar} · Period ${cell.periodStar}`}
                </p>
              </div>
            ))}
          </div>
          {facing != null && (
            <p className="mt-3 text-xs text-muted">
              Facing marker: {facing}°. Update this after measuring the site.
            </p>
          )}
        </div>
        <div className="space-y-4">
          <div className="rounded-lg border border-muted/50 bg-white p-4 text-sm shadow-card dark:bg-slate-900">
            <h2 className="text-base font-semibold">Eight Mansions Life Gua</h2>
            <label className="mt-2 block text-sm font-semibold">
              Gender for calculation
              <select
                className="mt-1 w-full rounded border border-muted/60 bg-background p-2 text-sm"
                value={gender}
                onChange={(event) => setGender(event.target.value as typeof gender)}
              >
                <option value="unspecified">Select...</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </label>
            <p className="mt-3 rounded bg-background/60 p-3 text-sm">
              Life Gua: <span className="font-semibold">{eightMansions?.mingGua ?? "UNKNOWN"}</span>
            </p>
            {eightMansions && (
              <div className="mt-3 text-xs text-muted">
                <p>Favourable: {eightMansions.favourableDirections.join(", ") || "—"}</p>
                <p>Unfavourable: {eightMansions.unfavourableDirections.join(", ") || "—"}</p>
              </div>
            )}
          </div>
          <div className="rounded-lg border border-muted/50 bg-white p-4 text-sm shadow-card dark:bg-slate-900">
            <h2 className="text-base font-semibold">Integration notes</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Use <code>subsystem</code> to track Flying Star period (1-9).</li>
              <li>
                For paid calculators, append <code>notes:&quot;privacy:paid&quot;</code> so users can filter.
              </li>
              <li>Log conflict sets when facing/sitting outputs disagree across schools.</li>
            </ul>
          </div>
        </div>
      </section>
    </SystemPageLayout>
  );
};

export default FsPage;
