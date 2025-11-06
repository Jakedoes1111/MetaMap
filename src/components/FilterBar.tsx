"use client";

import { useCallback } from "react";
import { CategoryValues, PolarityValues, SystemValues } from "@/schema";
import { useStore } from "@/store/useStore";

export const FilterBar = () => {
  const filters = useStore((state) => state.filters);
  const setFilters = useStore((state) => state.setFilters);
  const resetFilters = useStore((state) => state.resetFilters);

  const toggleItem = useCallback(
    <T extends string>(key: "systems" | "categories", value: T) => {
      const current = new Set(filters[key]);
      if (current.has(value)) {
        current.delete(value);
      } else {
        current.add(value);
      }
      setFilters({ [key]: Array.from(current) } as Partial<typeof filters>);
    },
    [filters, setFilters],
  );

  return (
    <section className="rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-base font-semibold">Filters</h2>
        <button
          type="button"
          onClick={resetFilters}
          className="rounded-full border border-muted/50 px-3 py-1 text-xs font-semibold hover:border-transparent hover:bg-accent/10"
        >
          Clear filters
        </button>
      </header>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <fieldset>
          <legend className="text-sm font-semibold">Systems</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {SystemValues.map((system) => (
              <label key={system} className="inline-flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={filters.systems.includes(system)}
                  onChange={() => toggleItem("systems", system)}
                />
                {system}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-sm font-semibold">Categories</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {CategoryValues.map((category) => (
              <label key={category} className="inline-flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category)}
                  onChange={() => toggleItem("categories", category)}
                />
                {category}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Subsystem search
            <input
              type="text"
              value={filters.subsystem}
              onChange={(event) => setFilters({ subsystem: event.target.value })}
              className="rounded border border-muted/60 bg-background p-2 text-sm"
            />
          </label>
          <div className="mt-3 text-sm">
            <span className="font-semibold">Polarity</span>
            <div className="mt-1 flex flex-wrap gap-2 text-xs">
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  name="polarity"
                  checked={filters.polarity === null}
                  onChange={() => setFilters({ polarity: null })}
                />
                All
              </label>
              {PolarityValues.map((polarity) => (
                <label key={polarity} className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    name="polarity"
                    checked={filters.polarity === polarity}
                    onChange={() => setFilters({ polarity })}
                  />
                  {polarity}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Confidence</h3>
          <div className="mt-1 flex items-center gap-2 text-xs">
            <label className="flex flex-col gap-1">
              Min
              <input
                type="number"
                step={0.05}
                min={0}
                max={filters.confidenceRange[1]}
                value={filters.confidenceRange[0]}
                onChange={(event) =>
                  setFilters({
                    confidenceRange: [Number(event.target.value), filters.confidenceRange[1]],
                  })
                }
                className="w-20 rounded border border-muted/60 p-1"
              />
            </label>
            <label className="flex flex-col gap-1">
              Max
              <input
                type="number"
                step={0.05}
                min={filters.confidenceRange[0]}
                max={1}
                value={filters.confidenceRange[1]}
                onChange={(event) =>
                  setFilters({
                    confidenceRange: [filters.confidenceRange[0], Number(event.target.value)],
                  })
                }
                className="w-20 rounded border border-muted/60 p-1"
              />
            </label>
          </div>
          <h3 className="mt-3 text-sm font-semibold">Strength</h3>
          <div className="mt-1 flex items-center gap-2 text-xs">
            <label className="flex flex-col gap-1">
              Min
              <input
                type="number"
                min={-2}
                max={filters.strengthRange[1]}
                value={filters.strengthRange[0]}
                onChange={(event) =>
                  setFilters({
                    strengthRange: [Number(event.target.value), filters.strengthRange[1]],
                  })
                }
                className="w-20 rounded border border-muted/60 p-1"
              />
            </label>
            <label className="flex flex-col gap-1">
              Max
              <input
                type="number"
                min={filters.strengthRange[0]}
                max={2}
                value={filters.strengthRange[1]}
                onChange={(event) =>
                  setFilters({
                    strengthRange: [filters.strengthRange[0], Number(event.target.value)],
                  })
                }
                className="w-20 rounded border border-muted/60 p-1"
              />
            </label>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Timing window</h3>
          <div className="mt-1 flex flex-col gap-2 text-xs">
            <label className="flex flex-col gap-1">
              Start
              <input
                type="datetime-local"
                value={filters.timeRange[0] ?? ""}
                onChange={(event) =>
                  setFilters({ timeRange: [event.target.value || null, filters.timeRange[1]] })
                }
                className="rounded border border-muted/60 p-1"
              />
            </label>
            <label className="flex flex-col gap-1">
              End
              <input
                type="datetime-local"
                value={filters.timeRange[1] ?? ""}
                onChange={(event) =>
                  setFilters({ timeRange: [filters.timeRange[0], event.target.value || null] })
                }
                className="rounded border border-muted/60 p-1"
              />
            </label>
          </div>
          <div className="mt-3 flex flex-col gap-2 text-xs">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.showConflictsOnly}
                onChange={(event) => setFilters({ showConflictsOnly: event.target.checked })}
              />
              Show only conflicts
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.hideUnknown}
                onChange={(event) => setFilters({ hideUnknown: event.target.checked })}
              />
              Hide UNKNOWN
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.hidePrivacyPaid}
                onChange={(event) => setFilters({ hidePrivacyPaid: event.target.checked })}
              />
              Hide privacy:paid notes
            </label>
          </div>
        </div>
      </div>
    </section>
  );
};
