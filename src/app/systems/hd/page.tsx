"use client";

import { useMemo, useState } from "react";
import { WarningBanner } from "@/components/WarningBanner";
import { SystemPageLayout } from "@/components/SystemPageLayout";
import { useStore } from "@/store/useStore";

const centreOrder: Array<{ key: string; label: string }> = [
  { key: "head", label: "Head" },
  { key: "ajna", label: "Ajna" },
  { key: "throat", label: "Throat" },
  { key: "g", label: "G" },
  { key: "ego", label: "Heart" },
  { key: "sacral", label: "Sacral" },
  { key: "solarPlexus", label: "Solar Plexus" },
  { key: "spleen", label: "Spleen" },
  { key: "root", label: "Root" },
];

const HdPage = () => {
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

  const [bodyGraph, setBodyGraph] = useState<{
    centres: Record<string, "defined" | "undefined">;
    type?: string;
    authority?: string;
  } | null>(null);

  const loading = providerLoading.hd ?? false;
  const errorMessage = providerErrors.hd;

  const definedCentres = useMemo(() => {
    if (!bodyGraph) {
      return 0;
    }
    return Object.values(bodyGraph.centres).filter((state) => state === "defined").length;
  }, [bodyGraph]);

  const handleCompute = async () => {
    clearProviderError("hd");
    const response = await invokeProvider<
      { birthIso: string; timezone: string },
      { centres: Record<string, "defined" | "undefined">; type?: string; authority?: string }
    >("hd", {
      birthIso: `${birthDetails.birthDate}T${birthDetails.birthTime}`,
      timezone: birthDetails.timezone,
    });

    if (response.status !== 200 || !response.data) {
      return;
    }

    setBodyGraph(response.data);

    const birthIso = `${birthDetails.birthDate}T${birthDetails.birthTime}`;
    pruneRows((row) => row.system === "HD");

    appendRow({
      person_id: "default-person",
      birth_datetime_local: birthIso,
      birth_timezone: birthDetails.timezone,
      system: "HD",
      subsystem: "BodyGraph",
      source_tool: "hd",
      source_url_or_ref: "",
      data_point: "Type",
      verbatim_text: response.data.type ?? "UNKNOWN",
      category: "Personality",
      subcategory: "Type",
      direction_cardinal: "",
      direction_degrees: null,
      timing_window_start: null,
      timing_window_end: null,
    polarity: "+",
    strength: 0,
    confidence: 0.7,
    weight_system: 0.6,
    privacy: "public",
    provenance: "provider:hd",
    notes: `authority=${response.data.authority ?? "UNKNOWN"}`,
  });
  };

  return (
    <SystemPageLayout
      title="Human Design"
      description="Compute BodyGraph centre definitions, type, and authority using the configured Human Design provider."
    >
      <WarningBanner
        title={bodyGraph ? "BodyGraph computed" : "Awaiting provider"}
        description={
          bodyGraph
            ? `Centres defined: ${definedCentres}. Type ${bodyGraph.type ?? "UNKNOWN"} with ${bodyGraph.authority ?? "UNKNOWN"} authority.`
            : "Invoke the provider to derive centre states, type, and authority from birth details."
        }
      />
      <section className="rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">BodyGraph centres</h2>
          <button
            type="button"
            className="rounded-full bg-[hsl(var(--colour-accent))] px-4 py-2 text-xs font-semibold text-white shadow disabled:opacity-60"
            onClick={handleCompute}
            disabled={loading}
          >
            {loading ? "Computing…" : "Compute centres"}
          </button>
        </div>
        {errorMessage && (
          <p className="mt-3 rounded border border-[hsl(var(--colour-conflict))]/40 bg-[hsl(var(--colour-conflict)/0.1)] px-3 py-2 text-xs text-[hsl(var(--colour-conflict))]">
            {errorMessage}
          </p>
        )}
        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
          {centreOrder.map((centre) => {
            const state = bodyGraph?.centres?.[centre.key] ?? "undefined";
            return (
              <div
                key={centre.key}
                className={`rounded p-4 text-center shadow-sm ${
                  state === "defined" ? "bg-[hsl(var(--colour-accent)/0.12)]" : "bg-background/60"
                }`}
              >
                <p className="text-xs uppercase text-muted">{centre.label}</p>
                <p className="mt-2 text-sm font-semibold">{state === "defined" ? "Defined" : "Open"}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-muted">
          Weight default: 0.6. Adjust in the weights panel to emphasise or reduce Human Design contributions.
        </p>
      </section>
      {bodyGraph && (
        <section className="mt-6 rounded-lg border border-muted/50 bg-white p-4 text-sm shadow-card dark:bg-slate-900">
          <h2 className="text-base font-semibold">Summary</h2>
          <p className="mt-2">Type: {bodyGraph.type ?? "UNKNOWN"}</p>
          <p>Authority: {bodyGraph.authority ?? "UNKNOWN"}</p>
        </section>
      )}
      <section className="mt-6 rounded-lg border border-muted/50 bg-white p-4 text-sm shadow-card dark:bg-slate-900">
        <h2 className="text-base font-semibold">Integration notes</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Use <code>HDProvider.computeBodyGraph</code> to populate centres and channels.</li>
          <li>Tag paid APIs by setting <code>privacy</code> to <code>paid</code> for filter compatibility.</li>
          <li>Support VARIANT flags for Jovian vs. Genetic Matrix interpretations via <code>subsystem</code>.</li>
        </ul>
      </section>
    </SystemPageLayout>
  );
};

export default HdPage;
