"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import type { MetaMapStore } from "@/store/useStore";
import { useStoreHydration } from "@/hooks/useStoreHydration";
import { applyFilters } from "@/lib/filters";
import { conflictCount, systemCount, totalRows, unknownShare } from "@/lib/stats";
import { BirthDetailsCard } from "@/components/forms/BirthDetailsCard";
import { DataImporter } from "@/components/DataImporter";
import { DataExporter } from "@/components/DataExporter";
import { FilterBar } from "@/components/FilterBar";
import { Heatmap } from "@/components/Heatmap";
import { Legend } from "@/components/Legend";
import { SystemCards } from "@/components/SystemCards";
import { Timeline } from "@/components/Timeline";
import { Compass } from "@/components/Compass";
import { HowItWorksModal } from "@/components/modals/HowItWorksModal";
import { WeightsPanel } from "@/components/WeightsPanel";
import { DatasetList } from "@/components/DatasetList";
import { ProviderStatusPanel } from "@/components/ProviderStatusPanel";

export default function Home() {
  const hydrated = useStoreHydration();
  const selection: Pick<
    MetaMapStore,
    "dataset" | "filters" | "tzdbVersion" | "birthDetails"
  > = useStore((state) => ({
    dataset: state.dataset,
    filters: state.filters,
    tzdbVersion: state.tzdbVersion,
    birthDetails: state.birthDetails,
  }));
  const { dataset, filters, tzdbVersion, birthDetails } = selection;

  if (!hydrated) {
    return null;
  }

  const filteredRows = useMemo(() => applyFilters(dataset, filters), [dataset, filters]);

  const stats = useMemo(
    () => ({
      total: totalRows(filteredRows),
      systems: systemCount(filteredRows),
      unknownPercent: unknownShare(filteredRows),
      conflicts: conflictCount(filteredRows),
    }),
    [filteredRows],
  );

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">MetaMap</h1>
          <p className="text-sm text-muted">
            Explore cross-system self-model data with normalised structure, adjustable weights, and
            plug-in ready dashboards.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/timeline"
            className="rounded-full border border-accent/60 px-4 py-2 text-sm font-semibold hover:bg-accent/10"
          >
            Open Timeline
          </Link>
          <Link
            href="/compass"
            className="rounded-full border border-accent/60 px-4 py-2 text-sm font-semibold hover:bg-accent/10"
          >
            Open Compass
          </Link>
          <Link
            href="/overlap"
            className="rounded-full border border-accent/60 px-4 py-2 text-sm font-semibold hover:bg-accent/10"
          >
            Open Overlap
          </Link>
          <HowItWorksModal />
        </div>
      </header>

      {!birthDetails.timezoneConfirmed && (
        <p className="rounded-lg border border-[hsl(var(--colour-conflict))]/40 bg-[hsl(var(--colour-conflict)/0.08)] px-4 py-3 text-sm font-semibold text-[hsl(var(--colour-conflict))]">
          Reminder: Confirm the timezone to avoid DST boundary errors. Current timezone:{" "}
          {birthDetails.timezone}.
        </p>
      )}

      <section className="grid gap-4 rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900 md:grid-cols-2 lg:grid-cols-4">
        <article className="rounded bg-background/60 p-3">
          <p className="text-xs uppercase tracking-wide text-muted">Rows</p>
          <p className="text-2xl font-semibold">{stats.total}</p>
        </article>
        <article className="rounded bg-background/60 p-3">
          <p className="text-xs uppercase tracking-wide text-muted">Systems present</p>
          <p className="text-2xl font-semibold">{stats.systems}</p>
        </article>
        <article className="rounded bg-background/60 p-3">
          <p className="text-xs uppercase tracking-wide text-muted">% UNKNOWN</p>
          <p className="text-2xl font-semibold">{stats.unknownPercent.toFixed(1)}%</p>
        </article>
        <article className="rounded bg-background/60 p-3">
          <p className="text-xs uppercase tracking-wide text-muted">Conflict rows</p>
          <p className="text-2xl font-semibold">{stats.conflicts}</p>
        </article>
        <article className="rounded bg-background/60 p-3 md:col-span-2 lg:col-span-4">
          <p className="text-xs uppercase tracking-wide text-muted">tzdb version</p>
          <p className="text-sm font-semibold">{tzdbVersion}</p>
        </article>
      </section>

      <BirthDetailsCard />
      <WeightsPanel />
      <FilterBar />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Heatmap rows={filteredRows} />
        <Legend />
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <Timeline rows={filteredRows} timezone={birthDetails.timezone} />
        <Compass rows={filteredRows} />
      </section>

      <DatasetList rows={filteredRows} />

      <div className="grid gap-6 lg:grid-cols-2">
        <DataImporter />
        <DataExporter rows={filteredRows} />
      </div>

      <ProviderStatusPanel />

      <SystemCards birthDetails={birthDetails} />
    </main>
  );
}
