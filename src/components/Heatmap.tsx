import { useMemo } from "react";
import type { DatasetRow } from "@/store/useStore";
import { CategoryValues, SystemValues } from "@/schema";

interface HeatmapProps {
  rows: DatasetRow[];
}

const colourForRatio = (ratio: number) =>
  `color-mix(in srgb, hsl(var(--colour-accent)) ${Math.round(20 + ratio * 60)}%, hsl(var(--colour-background)) 30%)`;

export const Heatmap = ({ rows }: HeatmapProps) => {
  const matrix = useMemo(() => {
    const totals: Record<string, number> = {};
    rows.forEach((row) => {
      const key = `${row.system}-${row.category}`;
      const weighted = row.weight_system * Math.abs(row.strength) * row.confidence;
      totals[key] = (totals[key] ?? 0) + weighted;
    });
    const max = Math.max(...Object.values(totals), 0.0001);
    return {
      totals,
      max,
    };
  }, [rows]);

  return (
    <div className="overflow-x-auto rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 bg-background p-2 text-left font-semibold">System</th>
            {CategoryValues.map((category) => (
              <th key={category} className="px-2 py-1 text-left font-medium text-muted">
                {category}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SystemValues.map((system) => (
            <tr key={system} className="border-t border-muted/40">
              <th className="sticky left-0 bg-background p-2 text-left font-semibold">{system}</th>
              {CategoryValues.map((category) => {
                const key = `${system}-${category}`;
                const value = matrix.totals[key] ?? 0;
                const ratio = Math.min(1, value / matrix.max);
                return (
                  <td
                    key={category}
                    className="h-12 w-24 rounded-sm text-center align-middle"
                    style={{
                      background: colourForRatio(ratio),
                    }}
                    aria-label={`${system} ${category} weighted total ${value.toFixed(2)}`}
                  >
                    <span className="text-xs font-semibold text-foreground/80">
                      {value > 0 ? value.toFixed(1) : "—"}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
