"use client";

import { useMemo } from "react";
import { DateTime } from "luxon";
import { scaleBand, scaleTime } from "d3-scale";
import { extent } from "d3-array";
import { useElementSize } from "@/hooks/useElementSize";
import type { DatasetRow } from "@/store/useStore";

interface TimelineProps {
  rows: DatasetRow[];
  timezone: string;
}

const polarityFill = (polarity: DatasetRow["polarity"]) => {
  switch (polarity) {
    case "+":
      return "var(--colour-positive)";
    case "−":
      return "var(--colour-negative)";
    default:
      return "var(--colour-neutral)";
  }
};

const laneHeight = 28;
const lanePadding = 6;

export const Timeline = ({ rows, timezone }: TimelineProps) => {
  const { ref, size } = useElementSize<HTMLDivElement>();

  const data = useMemo(() => rows.filter((row) => row.timing_window_start && row.timing_window_end), [rows]);

  const systems = useMemo(
    () => Array.from(new Set(data.map((row) => row.system))),
    [data],
  );

  const [domainStart, domainEnd] = useMemo(() => {
    if (data.length === 0) {
      const now = new Date();
      return [now, now];
    }
    const ext = extent(data.flatMap((row) => [row.timing_window_start!, row.timing_window_end!]));
    const start = DateTime.fromISO(ext[0] ?? DateTime.now().toISO(), { zone: timezone });
    const end = DateTime.fromISO(ext[1] ?? DateTime.now().toISO(), { zone: timezone });
    return [start.toJSDate(), end.toJSDate()];
  }, [data, timezone]);

  const height = systems.length * (laneHeight + lanePadding) + lanePadding * 2 + 24;
  const width = Math.max(size.width, 600);

  const x = useMemo(
    () => scaleTime().domain([domainStart, domainEnd]).range([0, width - 120]).nice(),
    [domainStart, domainEnd, width],
  );
  const y = useMemo(
    () => scaleBand<string>().domain(systems).range([24, height]).paddingInner(0.2),
    [systems, height],
  );

  return (
    <div ref={ref} className="w-full overflow-x-auto rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900">
      <svg
        viewBox={`0 0 ${width} ${height + 32}`}
        role="img"
        aria-label="Timing Gantt chart by system"
        className="min-w-full text-sm"
      >
        <g transform="translate(100, 24)">
          {systems.map((system) => {
            const bandY = y(system) ?? 0;
            return (
              <g key={system} transform={`translate(0, ${bandY})`}>
                <text
                  x={-8}
                  y={y.bandwidth() / 2}
                  dominantBaseline="middle"
                  textAnchor="end"
                  className="fill-foreground font-medium"
                >
                  {system}
                </text>
                {data
                  .filter((row) => row.system === system)
                  .map((row) => {
                    const start = DateTime.fromISO(row.timing_window_start!, { zone: timezone }).toJSDate();
                    const end = DateTime.fromISO(row.timing_window_end!, { zone: timezone }).toJSDate();
                    const xStart = x(start);
                    const xEnd = x(end);
                    const rectWidth = Math.max(xEnd - xStart, 4);
                    return (
                      <g key={row.id}>
                        <rect
                          x={xStart}
                          y={0}
                          width={rectWidth}
                          height={y.bandwidth()}
                          rx={4}
                          fill={polarityFill(row.polarity)}
                          fillOpacity={Math.min(0.85, 0.4 + row.confidence)}
                          stroke="var(--colour-foreground)"
                          strokeWidth={row.conflict_set ? 1.5 : 0.5}
                          strokeDasharray={row.conflict_set ? "4 2" : "none"}
                        >
                          <title>
                            {`${row.data_point}
Subsystem: ${row.subsystem || "—"}
Start: ${DateTime.fromJSDate(start).toISO({
                              suppressMilliseconds: true,
                            })}
End: ${DateTime.fromJSDate(end).toISO({
                              suppressMilliseconds: true,
                            })}
Confidence: ${row.confidence}
Notes: ${row.notes || "—"}`}
                          </title>
                        </rect>
                        <text
                          x={xStart + 6}
                          y={y.bandwidth() / 2}
                          dominantBaseline="middle"
                          className="pointer-events-none fill-white text-xs font-semibold drop-shadow"
                        >
                          {row.data_point}
                        </text>
                      </g>
                    );
                  })}
              </g>
            );
          })}
          <line
            x1={0}
            x2={width - 120}
            y1={height}
            y2={height}
            stroke="var(--colour-muted)"
            strokeDasharray="4 2"
          />
          <g transform={`translate(0, ${height})`}>
            {x.ticks(6).map((tick) => (
              <g key={tick.getTime()} transform={`translate(${x(tick)}, 0)`}>
                <line y1={0} y2={6} stroke="var(--colour-muted)" />
                <text y={18} textAnchor="middle" className="fill-foreground text-xs">
                  {DateTime.fromJSDate(tick).setZone(timezone).toFormat("d LLL yyyy")}
                </text>
              </g>
            ))}
          </g>
        </g>
      </svg>
      {data.length === 0 && (
        <p className="mt-4 text-sm text-muted">
          No timing windows available. Import data containing timing_window_start and timing_window_end to activate the Gantt view.
        </p>
      )}
    </div>
  );
};
