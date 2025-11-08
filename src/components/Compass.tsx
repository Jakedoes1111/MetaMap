"use client";

import { useMemo, useState } from "react";
import { arc } from "d3-shape";
import { degreesToCardinal } from "@/lib/direction";
import type { DatasetRow } from "@/store/useStore";

type Layer = "all" | "FS" | "QMDJ";

const sectors = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;

interface CompassProps {
  rows: DatasetRow[];
}

const computeWeight = (row: DatasetRow) => row.weight_system * Math.abs(row.strength) * row.confidence;

export const Compass = ({ rows }: CompassProps) => {
  const [layer, setLayer] = useState<Layer>("all");
  const [facing, setFacing] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (layer === "all") return rows;
    return rows.filter((row) => row.system === layer);
  }, [layer, rows]);

  const sectorSummary = useMemo(() => {
    const summary = sectors.map((sector) => ({
      sector,
      value: 0,
      rows: [] as DatasetRow[],
    }));
    filtered.forEach((row) => {
      const degrees = row.direction_degrees ?? null;
      const cardinal =
        row.direction_cardinal !== ""
          ? (row.direction_cardinal as (typeof sectors)[number])
          : degrees != null
            ? degreesToCardinal(degrees)
            : "";
      if (!cardinal) {
        return;
      }
      const target = summary.find((item) => item.sector === cardinal);
      if (target) {
        target.value += computeWeight(row);
        target.rows.push(row);
      }
    });
    const max = Math.max(...summary.map((item) => item.value), 0.0001);
    return summary.map((item) => ({
      ...item,
      ratio: item.value / max,
    }));
  }, [filtered]);

  const polarData = useMemo(() => {
    const sectorSize = (Math.PI * 2) / sectors.length;
    return sectorSummary.map((item, index) => {
      const startAngle = -Math.PI / 2 + index * sectorSize;
      const endAngle = startAngle + sectorSize;
      const arcGenerator = arc()
        .innerRadius(40)
        .outerRadius(120 * (0.4 + 0.6 * item.ratio))
        .startAngle(startAngle)
        .endAngle(endAngle);
      return {
        ...item,
        path:
          arcGenerator(
            null as unknown as Parameters<typeof arcGenerator>[0],
          ) ?? "",
        midAngle: startAngle + sectorSize / 2,
      };
    });
  }, [sectorSummary]);

  return (
    <div className="rounded-lg border border-muted/60 bg-white p-4 shadow-card dark:bg-slate-900">
      <div className="flex flex-wrap gap-4 pb-4">
        <fieldset className="flex items-center gap-3 text-sm">
          <legend className="sr-only">Compass layer</legend>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="layer"
              checked={layer === "all"}
              onChange={() => setLayer("all")}
            />
            All systems
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="layer"
              checked={layer === "FS"}
              onChange={() => setLayer("FS")}
            />
            Feng Shui (FS)
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="layer"
              checked={layer === "QMDJ"}
              onChange={() => setLayer("QMDJ")}
            />
            Qi Men Dun Jia (QMDJ)
          </label>
        </fieldset>
        {layer === "FS" && (
          <label className="flex items-center gap-2 text-sm">
            Site facing&nbsp;
            <input
              type="number"
              min={0}
              max={359}
              step={1}
              className="w-20 rounded border border-muted/80 bg-white p-1 text-right dark:bg-slate-800"
              value={facing ?? ""}
              onChange={(event) => {
                const value = Number(event.target.value);
                setFacing(Number.isNaN(value) ? null : value);
              }}
              aria-describedby="facing-helper"
            />
            <span id="facing-helper" className="text-xs text-muted">
              degrees
            </span>
          </label>
        )}
      </div>
      <div className="relative mx-auto grid place-items-center">
        <svg
          role="img"
          aria-label="Compass aggregate by sector"
          viewBox="-150 -150 300 300"
          className="max-w-full"
        >
          <circle r={45} fill="none" stroke="var(--colour-muted)" strokeDasharray="4 4" />
          <circle r={120} fill="none" stroke="var(--colour-muted)" strokeWidth={0.5} />
          {polarData.map((item) => (
            <g key={item.sector}>
              <path
                d={item.path}
                fill="var(--colour-accent)"
                fillOpacity={0.2 + 0.6 * item.ratio}
                stroke="var(--colour-accent)"
                strokeWidth={item.ratio > 0 ? 1.5 : 0.6}
              >
                <title>
                  {`${item.sector}: ${item.rows.length} rows, weighted ${item.value.toFixed(2)}`}
                </title>
              </path>
              <line
                x1={0}
                y1={0}
                x2={Math.cos(item.midAngle) * 130}
                y2={Math.sin(item.midAngle) * 130}
                stroke="var(--colour-muted)"
                strokeWidth={0.4}
              />
              <text
                x={Math.cos(item.midAngle) * 140}
                y={Math.sin(item.midAngle) * 140}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground text-sm font-semibold"
              >
                {item.sector}
              </text>
            </g>
          ))}
          {facing != null && (
            <g>
              <line
                x1={0}
                y1={0}
                x2={Math.cos((facing - 90) * (Math.PI / 180)) * 140}
                y2={Math.sin((facing - 90) * (Math.PI / 180)) * 140}
                stroke="var(--colour-conflict)"
                strokeWidth={2}
              />
              <text
                x={Math.cos((facing - 90) * (Math.PI / 180)) * 150}
                y={Math.sin((facing - 90) * (Math.PI / 180)) * 150}
                textAnchor="middle"
                className="fill-conflict text-xs font-bold"
              >
                Facing {facing}°
              </text>
            </g>
          )}
        </svg>
      </div>
      <div className="mt-4 space-y-3">
        {polarData.map((item) => (
          <details key={item.sector} className="rounded border border-muted/50 bg-background p-3">
            <summary className="cursor-pointer text-sm font-semibold">
              {item.sector} • {item.rows.length} rows • Weighted {item.value.toFixed(2)}
            </summary>
            <ul className="mt-2 space-y-1 text-sm leading-tight">
              {item.rows.map((row) => (
                <li key={row.id}>
                  <span className="font-medium">{row.system}</span> — {row.data_point}
                  {row.notes && <span className="text-muted"> ({row.notes})</span>}
                </li>
              ))}
              {item.rows.length === 0 && <li className="text-muted">No entries for this sector.</li>}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
};
