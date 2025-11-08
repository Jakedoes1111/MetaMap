"use client";

import { useState } from "react";
import { WarningBanner } from "@/components/WarningBanner";
import { SystemPageLayout } from "@/components/SystemPageLayout";
import { useStore } from "@/store/useStore";

const sphereOrder = ["Life's Work", "Evolution", "Radiance", "Purpose"];

const GkPage = () => {
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

  const [profile, setProfile] = useState<{ name: string; geneKey: number; line?: number }[] | null>(null);

  const loading = providerLoading.gk ?? false;
  const errorMessage = providerErrors.gk;

  const handleCompute = async () => {
    clearProviderError("gk");
    const response = await invokeProvider<
      { birthIso: string; timezone: string },
      { spheres: Array<{ name: string; geneKey: number; line?: number }> }
    >("gk", {
      birthIso: `${birthDetails.birthDate}T${birthDetails.birthTime}`,
      timezone: birthDetails.timezone,
    });

    if (response.status !== 200 || !response.data) {
      return;
    }

    setProfile(response.data.spheres);

    const birthIso = `${birthDetails.birthDate}T${birthDetails.birthTime}`;
    pruneRows((row) => row.system === "GK");
    response.data.spheres.forEach((sphere) => {
      appendRow({
        person_id: "default-person",
        birth_datetime_local: birthIso,
        birth_timezone: birthDetails.timezone,
        system: "GK",
        subsystem: sphere.name,
        source_tool: "gk",
        source_url_or_ref: "",
        data_point: `Gene Key ${sphere.geneKey}`,
        verbatim_text: sphere.line ? `Line ${sphere.line}` : "Line UNKNOWN",
        category: "Guidance",
        subcategory: "Sphere",
        direction_cardinal: "",
        direction_degrees: null,
        timing_window_start: null,
        timing_window_end: null,
        polarity: "+",
        strength: 0,
        confidence: 0.6,
        weight_system: 0.5,
        notes: "",
      });
    });
  };

  return (
    <SystemPageLayout
      title="Gene Keys"
      description="Generate hologenetic profile spheres via the configured Gene Keys provider."
    >
      <WarningBanner
        title={profile ? "Profile computed" : "Awaiting provider"}
        description={
          profile
            ? "Gene Key spheres populated using birth data and the configured provider."
            : "Invoke the provider to derive primary spheres for the Gene Keys sequences."
        }
      />
      <section className="rounded-lg border border-muted/50 bg-white p-4 text-sm shadow-card dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Profile overview</h2>
          <button
            type="button"
            className="rounded-full bg-[hsl(var(--colour-accent))] px-4 py-2 text-xs font-semibold text-white shadow disabled:opacity-60"
            onClick={handleCompute}
            disabled={loading}
          >
            {loading ? "Computing…" : "Compute profile"}
          </button>
        </div>
        {errorMessage && (
          <p className="mt-3 rounded border border-[hsl(var(--colour-conflict))]/40 bg-[hsl(var(--colour-conflict)/0.1)] px-3 py-2 text-xs text-[hsl(var(--colour-conflict))]">
            {errorMessage}
          </p>
        )}
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {sphereOrder.map((name) => {
            const sphere = profile?.find((item) => item.name === name);
            return (
              <div key={name} className="rounded bg-background/60 p-4 shadow-sm">
                <p className="text-xs uppercase text-muted">{name}</p>
                <p className="mt-2 text-sm font-semibold">
                  {sphere ? `Gene Key ${sphere.geneKey}` : "—"}
                </p>
                <p className="mt-1 text-xs text-muted">{sphere?.line ? `Line ${sphere.line}` : "Awaiting provider"}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted">Weight default: 0.5. Adjust using the weights panel to re-balance aggregate visuals.</p>
      </section>
      <section className="mt-6 rounded-lg border border-muted/50 bg-white p-4 text-sm shadow-card dark:bg-slate-900">
        <h2 className="text-base font-semibold">Integration notes</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Use <code>subsystem</code> to capture profile sequences (e.g. Activation, Venus).</li>
          <li>Annotate paid datasets by setting the <code>privacy</code> field to <code>paid</code>.</li>
          <li>Leverage <code>conflict_set</code> for divergent interpretations across schools.</li>
        </ul>
      </section>
    </SystemPageLayout>
  );
};

export default GkPage;
