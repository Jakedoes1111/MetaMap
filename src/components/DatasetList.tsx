"use client";
/* @react-compiler-disable */

import { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { DatasetRow } from "@/store/useStore";
import { UNKNOWN_TOKEN } from "@/schema";

interface DatasetListProps {
  rows: DatasetRow[];
}

export const DatasetList = ({ rows }: DatasetListProps) => {
  const parentRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 8,
  });

  const items = virtualizer.getVirtualItems();

  const empty = useMemo(() => rows.length === 0, [rows]);

  return (
    <section className="rounded-lg border border-muted/50 bg-white shadow-card dark:bg-slate-900">
      <header className="flex items-center justify-between border-b border-muted/40 px-4 py-3">
        <h2 className="text-base font-semibold">Dataset preview</h2>
        <span className="text-xs text-muted">{rows.length} rows</span>
      </header>
      {empty ? (
        <p className="px-4 py-6 text-sm text-muted">
          No rows match the current filters. Import data or adjust the Filter Bar.
        </p>
      ) : (
        <div ref={parentRef} className="h-72 overflow-auto">
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              position: "relative",
            }}
          >
            {items.map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <article
                  key={row.id}
                  className="absolute left-0 right-0 border-b border-muted/30 px-4 py-3 text-sm"
                  aria-label={`${row.system} ${row.data_point}`}
                  style={{
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">
                        {row.system} · {row.data_point}
                      </p>
                      <p className="text-xs text-muted">
                        {row.category}
                        {row.subcategory ? ` • ${row.subcategory}` : ""} • Confidence {row.confidence}
                      </p>
                    </div>
                    <span className="rounded-full bg-background/80 px-2 py-1 text-xs">
                      Strength {row.strength}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    {row.verbatim_text === UNKNOWN_TOKEN ? "UNKNOWN" : row.verbatim_text}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Privacy: {row.privacy}
                    {row.provenance ? ` • Provenance: ${row.provenance}` : ""}
                  </p>
                  {row.notes && <p className="mt-1 text-xs text-muted">Notes: {row.notes}</p>}
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
