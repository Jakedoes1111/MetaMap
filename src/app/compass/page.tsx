"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/store/useStore";
import type { MetaMapStore } from "@/store/useStore";
import { useStoreHydration } from "@/hooks/useStoreHydration";
import { applyFilters } from "@/lib/filters";
import { Compass } from "@/components/Compass";
import { FilterBar } from "@/components/FilterBar";

const CompassPage = () => {
  const hydrated = useStoreHydration();
  const selection: Pick<MetaMapStore, "dataset" | "filters"> = useStore(useShallow((state) => ({
    dataset: state.dataset,
    filters: state.filters,
  })));
  const { dataset, filters } = selection;

  const filteredRows = useMemo(() => applyFilters(dataset, filters), [dataset, filters]);

  if (!hydrated) {
    return null;
  }

  const directionalRows = filteredRows.filter(
    (row) => Boolean(row.direction_cardinal) || row.direction_degrees != null,
  );

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 lg:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Direction compass</h1>
          <p className="text-sm text-muted">
            Aggregate directional indicators into octants. Toggle FS/QMDJ overlays and list matching
            entries per sector.
          </p>
        </div>
        <Link href="/" className="text-sm font-semibold text-accent hover:underline">
          ← Back to overview
        </Link>
      </header>
      <FilterBar />
      <Compass rows={filteredRows} />
      {directionalRows.length === 0 && (
        <p className="rounded bg-[hsl(var(--colour-banner))] px-3 py-2 text-sm text-muted">
          No directional data found. Import rows with direction_cardinal or direction_degrees to see
          the compass heatmap.
        </p>
      )}
    </main>
  );
};

export default CompassPage;
