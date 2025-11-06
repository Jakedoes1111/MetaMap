"use client";

import { useMemo } from "react";
import { WeightDefaults, SystemValues, type System } from "@/schema";
import { useStore } from "@/store/useStore";

const formatWeight = (value: number) => value.toFixed(2);

export const WeightsPanel = () => {
  const weights = useStore((state) => state.weights);
  const setWeights = useStore((state) => state.setWeights);
  const reset = useStore((state) => state.resetWeights);

  const totalWeight = useMemo(
    () =>
      Object.entries(weights).reduce(
        (acc, [, value]) => acc + value,
        0,
      ),
    [weights],
  );

  return (
    <section className="rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900">
      <header className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">System weights</h2>
          <p className="text-xs text-muted">
            Influence calculations for heatmap, network, and compass. Hold Shift for finer control.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-muted/50 px-3 py-1 text-xs font-semibold hover:border-transparent hover:bg-accent/10"
        >
          Reset defaults
        </button>
      </header>
      <ul className="grid gap-3 md:grid-cols-2">
        {SystemValues.map((system) => {
          const current = weights[system] ?? WeightDefaults[system];
          const defaultValue = WeightDefaults[system];
          const changed = Math.abs(current - defaultValue) > 0.001;
          return (
            <li key={system} className="flex flex-col gap-1 rounded bg-background/60 p-3">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>{system}</span>
                <span className={changed ? "text-accent" : "text-muted"}>
                  {formatWeight(current)}
                  {changed && (
                    <button
                      type="button"
                      className="ml-2 rounded px-1 py-0.5 text-[10px] uppercase tracking-wide text-muted hover:bg-foreground/10"
                      onClick={() => setWeights({ [system]: defaultValue } as Partial<Record<System, number>>)}
                    >
                      Default {formatWeight(defaultValue)}
                    </button>
                  )}
                </span>
              </div>
              <input
                type="range"
                min={0.2}
                max={1.5}
                step={0.05}
                value={current}
                aria-label={`${system} weight`}
                onChange={(event) =>
                  setWeights({
                    [system]: Number.parseFloat(event.target.value),
                  } as Partial<Record<System, number>>)
                }
              />
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-muted">Total weighting sum: {formatWeight(totalWeight)}</p>
    </section>
  );
};
