"use client";

import { WarningBanner } from "@/components/WarningBanner";
import { SystemPageLayout } from "@/components/SystemPageLayout";

const centres = ["Head", "Ajna", "Throat", "G", "Heart", "Sacral", "Solar Plexus", "Spleen", "Root"];

const HdPage = () => (
  <SystemPageLayout
    title="Human Design"
    description="BodyGraph placeholders referencing weight default 0.6. Awaiting HDProvider for gate/channel data."
  >
    <WarningBanner
      title="UNKNOWN"
      description="HD centres and channels are not computed without a licensed provider. Rows remain UNKNOWN to comply with the truth standard."
    />
    <section className="rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900">
      <h2 className="text-base font-semibold">BodyGraph scaffold</h2>
      <p className="text-xs text-muted">Centres will display defined/undefined states once integrated.</p>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        {centres.map((centre) => (
          <div key={centre} className="rounded bg-background/60 p-4 text-center shadow-sm">
            <p className="text-xs uppercase text-muted">{centre}</p>
            <p className="mt-2 text-sm font-semibold">UNKNOWN</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">
        Weight default: 0.6. Adjust in the weights panel to emphasise or reduce HD contributions.
      </p>
    </section>
    <section className="rounded-lg border border-muted/50 bg-white p-4 text-sm shadow-card dark:bg-slate-900">
      <h2 className="text-base font-semibold">Integration notes</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Use <code>HDProvider.computeBodyGraph</code> to populate centres and channels.</li>
        <li>Tag paid APIs with <code>notes:&quot;privacy:paid&quot;</code> for filter compatibility.</li>
        <li>Support VARIANT flags for Jovian vs. Genetic Matrix interpretations via <code>subsystem</code>.</li>
      </ul>
    </section>
  </SystemPageLayout>
);

export default HdPage;
