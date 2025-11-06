export const Legend = () => (
  <section className="rounded-lg border border-muted/60 bg-white p-4 shadow-card dark:bg-slate-900">
    <h2 className="text-base font-semibold">Legend</h2>
    <ul className="mt-3 space-y-2 text-sm">
      <li>
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--colour-positive))] align-middle text-[10px] font-bold text-background">
          +
        </span>{" "}
        Favourable polarity
      </li>
      <li>
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--colour-negative))] align-middle text-[10px] font-bold text-background">
          −
        </span>{" "}
        Unfavourable polarity
      </li>
      <li>
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-dashed border-[hsl(var(--colour-conflict))] text-[10px] font-bold text-[hsl(var(--colour-conflict))]">
          !
        </span>{" "}
        conflict_set highlights
      </li>
      <li>
        <span className="rounded bg-[hsl(var(--colour-banner))] px-2 py-1 text-xs font-semibold">
          UNKNOWN
        </span>{" "}
        Calculators not yet integrated
      </li>
    </ul>
  </section>
);
