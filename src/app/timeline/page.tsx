/** Timeline route */
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/store/useStore";
import type { MetaMapStore } from "@/store/useStore";
import { useStoreHydration } from "@/hooks/useStoreHydration";
import { applyFilters } from "@/lib/filters";
import { Timeline } from "@/components/Timeline";
import { FilterBar } from "@/components/FilterBar";

const TimelinePage = () => {
  const hydrated = useStoreHydration();
  const selection: Pick<MetaMapStore, "dataset" | "filters" | "birthDetails"> = useStore(
    useShallow((state) => ({
      dataset: state.dataset,
      filters: state.filters,
      birthDetails: state.birthDetails,
    })),
  );
  const { dataset, filters, birthDetails } = selection;

  const filteredRows = useMemo(() => applyFilters(dataset, filters), [dataset, filters]);

  if (!hydrated) {
    return (
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 lg:px-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Timing timeline</h1>
            <p className="text-sm text-muted">Restoring your local data snapshot…</p>
          </div>
          <Link href="/" className="text-sm font-semibold text-accent hover:underline">
            ← Back to overview
          </Link>
        </header>
        <p className="rounded bg-[hsl(var(--colour-banner))] px-3 py-2 text-sm text-muted">
          Loading timeline data...
        </p>
      </main>
    );
  }
  const timingRows = filteredRows.filter(
    (row) => row.timing_window_start && row.timing_window_end,
  );

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 lg:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Timing timeline</h1>
          <p className="text-sm text-muted">
            Closed-interval entries plotted per system. Hover for tooltips; export filtered subsets
            from the overview.
          </p>
        </div>
        <Link href="/" className="text-sm font-semibold text-accent hover:underline">
          ← Back to overview
        </Link>
      </header>
      <FilterBar />
      <Timeline rows={filteredRows} timezone={birthDetails.timezone} />
      {timingRows.length === 0 && (
        <p className="rounded bg-[hsl(var(--colour-banner))] px-3 py-2 text-sm text-muted">
          No rows contain timing windows. Import profections, dashā, or pillar data to activate the
          Gantt chart.
        </p>
      )}
    </main>
  );
};

export default TimelinePage;
