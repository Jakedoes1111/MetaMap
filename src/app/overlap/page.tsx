"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import { applyFilters } from "@/lib/filters";
import { Network } from "@/components/Network";
import { FilterBar } from "@/components/FilterBar";

const OverlapPage = () => {
  const { dataset, filters } = useStore((state) => ({
    dataset: state.dataset,
    filters: state.filters,
  }));

  const filteredRows = useMemo(() => applyFilters(dataset, filters), [dataset, filters]);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 lg:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Overlap network</h1>
          <p className="text-sm text-muted">
            Visualise how systems overlap on shared data points and where conflict sets arise.
            Select a node to inspect contributing rows.
          </p>
        </div>
        <Link href="/" className="text-sm font-semibold text-accent hover:underline">
          ← Back to overview
        </Link>
      </header>
      <FilterBar />
      <Network rows={filteredRows} />
    </main>
  );
};

export default OverlapPage;
