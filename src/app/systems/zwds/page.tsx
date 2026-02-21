"use client";

import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { WarningBanner } from "@/components/WarningBanner";
import { SystemPageLayout } from "@/components/SystemPageLayout";
import { useStore } from "@/store/useStore";
import type { ZWDSPalaceReading } from "@/calculators";

const ZwdsPage = () => {
  const {
    birthDetails,
    invokeProvider,
    providerLoading,
    providerErrors,
    clearProviderError,
    appendRow,
  } = useStore(useShallow((state) => ({
    birthDetails: state.birthDetails,
    invokeProvider: state.invokeProvider,
    providerLoading: state.providerLoading,
    providerErrors: state.providerErrors,
    clearProviderError: state.clearProviderError,
    appendRow: state.appendRow,
  })));

  const [chart, setChart] = useState<ZWDSPalaceReading[] | null>(null);
  const [variant, setVariant] = useState("classic");

  const loading = providerLoading.zwds ?? false;
  const errorMessage = providerErrors.zwds;

  const computeChart = async () => {
    clearProviderError("zwds");
    const response = await invokeProvider<
      { birthIso: string; timezone: string; variant: string },
      { chart: ZWDSPalaceReading[] }
    >("zwds", {
      birthIso: `${birthDetails.birthDate}T${birthDetails.birthTime}`,
      timezone: birthDetails.timezone,
      variant,
    });
    if (response.status === 200 && response.data) {
      setChart(response.data.chart);
      const birthIso = `${birthDetails.birthDate}T${birthDetails.birthTime}`;
      response.data.chart.forEach((palace) => {
        appendRow({
          person_id: "default-person",
          birth_datetime_local: birthIso,
          birth_timezone: birthDetails.timezone,
          system: "ZWDS",
          subsystem: variant,
          source_tool: "zwds",
          source_url_or_ref: "",
          data_point: `${palace.palace} palace`,
          verbatim_text: palace.stars.join(", "),
          category: "Guidance",
          subcategory: "Palace",
          direction_cardinal: "",
          direction_degrees: null,
          timing_window_start: null,
          timing_window_end: null,
          polarity: "+",
          strength: 0,
          confidence: 0.75,
          weight_system: 1,
          notes: palace.notes ?? "",
        });
      });
    }
  };

  return (
    <SystemPageLayout
      title="Zi Wei Dou Shu"
      description="Twelve palace grid populated by the configured ZWDS provider."
    >
      <WarningBanner
        title={chart ? "Chart computed" : "Awaiting provider"}
        description={
          chart
            ? "Twelve palaces populated using the configured Zi Wei Dou Shu provider."
            : "Invoke the provider to derive palace stars and notes from the birth data."
        }
      />
      <section className="rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900">
        <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Twelve palaces</h2>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <label className="inline-flex items-center gap-1">
              Variant
              <select
                className="rounded border border-muted/60 bg-background p-1 text-xs"
                value={variant}
                onChange={(event) => setVariant(event.target.value)}
              >
                <option value="classic">Classic</option>
                <option value="flying">Flying Star</option>
              </select>
            </label>
            <button
              type="button"
              className="rounded-full bg-[hsl(var(--colour-accent))] px-3 py-1 text-xs font-semibold text-white shadow disabled:opacity-60"
              onClick={computeChart}
              disabled={loading}
            >
              {loading ? "Computing…" : "Compute chart"}
            </button>
          </div>
        </header>
        {errorMessage && (
          <p className="mb-3 rounded border border-[hsl(var(--colour-conflict))]/40 bg-[hsl(var(--colour-conflict)/0.1)] px-3 py-2 text-xs text-[hsl(var(--colour-conflict))]">
            {errorMessage}
          </p>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(chart ?? []).map((palace) => (
            <div
              key={palace.palace}
              className="flex min-h-[120px] flex-col justify-between rounded border border-muted/40 bg-background/60 p-3"
            >
              <div>
                <p className="text-xs uppercase text-muted">{palace.palace}</p>
                <p className="mt-2 text-sm font-semibold">{palace.stars.join(", ")}</p>
              </div>
              <p className="text-xs text-muted">{palace.notes ?? "—"}</p>
            </div>
          ))}
          {!chart &&
            [
              "Life",
              "Wealth",
              "Travel",
              "Career",
              "Health",
              "Children",
              "Spouse",
              "Siblings",
              "Parents",
              "Property",
              "Friends",
              "Servants",
            ].map((palace) => (
              <div
                key={palace}
                className="flex min-h-[120px] flex-col justify-between rounded border border-muted/40 bg-background/60 p-3"
              >
                <div>
                  <p className="text-xs uppercase text-muted">{palace}</p>
                  <p className="mt-2 text-sm font-semibold text-muted">UNKNOWN</p>
                </div>
                <p className="text-xs text-muted">Stars: pending provider</p>
              </div>
            ))}
        </div>
      </section>
      <section className="rounded-lg border border-muted/50 bg-white p-4 text-sm shadow-card dark:bg-slate-900">
        <h2 className="text-base font-semibold">Integration notes</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Map palace outputs to <code>subsystem</code> for school variants.</li>
          <li>Use <code>notes:&quot;privacy:paid&quot;</code> for proprietary star libraries.</li>
          <li>Log conflicting interpretations via <code>conflict_set</code>.</li>
        </ul>
      </section>
    </SystemPageLayout>
  );
};

export default ZwdsPage;
