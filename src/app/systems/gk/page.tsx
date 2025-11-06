"use client";

import { WarningBanner } from "@/components/WarningBanner";
import { SystemPageLayout } from "@/components/SystemPageLayout";

const sequences = ["Activation", "Venus", "Pearl"];

const GkPage = () => (
  <SystemPageLayout
    title="Gene Keys"
    description="Hologenetic profile placeholders respecting weight default 0.5. Awaiting GKProvider."
  >
    <WarningBanner
      title="UNKNOWN"
      description="Gene Key spheres and sequences are not generated without a licensed profile provider. Outputs remain UNKNOWN by default."
    />
    <section className="rounded-lg border border-muted/50 bg-white p-4 text-sm shadow-card dark:bg-slate-900">
      <h2 className="text-base font-semibold">Profile overview</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {sequences.map((sequence) => (
          <div key={sequence} className="rounded bg-background/60 p-4 shadow-sm">
            <p className="text-xs uppercase text-muted">{sequence} sequence</p>
            <p className="mt-2 text-sm font-semibold">UNKNOWN</p>
            <p className="mt-1 text-xs text-muted">Spheres logged after provider integration.</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">
        Weight default: 0.5. Adjust using the weights panel to re-balance aggregate visuals.
      </p>
    </section>
    <section className="rounded-lg border border-muted/50 bg-white p-4 text-sm shadow-card dark:bg-slate-900">
      <h2 className="text-base font-semibold">Integration notes</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Use <code>subsystem</code> to capture profile sequences (e.g. Activation, Venus).</li>
        <li>Annotate paid datasets with <code>notes:&quot;privacy:paid&quot;</code>.</li>
        <li>Leverage <code>conflict_set</code> for divergent interpretations across schools.</li>
      </ul>
    </section>
  </SystemPageLayout>
);

export default GkPage;
