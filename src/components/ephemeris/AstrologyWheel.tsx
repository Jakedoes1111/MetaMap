import type { FC } from "react";
import clsx from "clsx";
import type { EphemerisAngles, EphemerisMetadata, HouseCusp } from "@/lib/ephemeris";

const radius = 120;
const labelRadius = radius - 30;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const wrapDegrees = (degrees: number) => {
  const normalised = degrees % 360;
  return normalised < 0 ? normalised + 360 : normalised;
};

const midpoint = (start: number, end: number) => {
  const startWrapped = wrapDegrees(start);
  const endWrapped = wrapDegrees(end);
  let delta = endWrapped - startWrapped;
  if (delta <= 0) {
    delta += 360;
  }
  return wrapDegrees(startWrapped + delta / 2);
};

const polarToCartesian = (deg: number, r: number) => {
  const radians = toRadians(deg);
  return {
    x: Math.cos(radians) * r,
    y: Math.sin(radians) * r,
  };
};

export interface AstrologyWheelProps {
  cusps: HouseCusp[];
  angles: EphemerisAngles;
  metadata?: EphemerisMetadata;
  className?: string;
}

export const AstrologyWheel: FC<AstrologyWheelProps> = ({ cusps, angles, metadata, className }) => {
  if (cusps.length === 0) {
    return (
      <div className={clsx("flex h-full items-center justify-center rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900", className)}>
        <p className="text-sm text-muted">No cusp data available.</p>
      </div>
    );
  }

  const sortedCusps = [...cusps].sort((a, b) => a.house - b.house);
  const zodiacLabel = metadata?.zodiac === "sidereal"
    ? "Sidereal"
    : metadata?.zodiac === "tropical"
      ? "Tropical"
      : "Zodiac";

  return (
    <div
      className={clsx(
        "rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900",
        className,
      )}
    >
      <h2 className="text-base font-semibold">Wheel preview</h2>
      <p className="text-xs text-muted">
        Cusps and angles sourced from the registered ephemeris provider.
      </p>
      <svg viewBox="-150 -150 300 300" className="mt-4 h-[280px] w-full" role="img" aria-label="Astrology wheel">
        <circle r={radius} fill="none" stroke="var(--colour-muted)" strokeWidth={2} />
        {sortedCusps.map((cusp, index) => {
          const nextCusp = sortedCusps[(index + 1) % sortedCusps.length];
          const labelAngle = midpoint(cusp.longitude, nextCusp.longitude);
          const { x, y } = polarToCartesian(cusp.longitude, radius);
          const label = polarToCartesian(labelAngle, labelRadius);
          return (
            <g key={cusp.house}>
              <line
                data-testid={`cusp-${cusp.house}`}
                data-longitude={cusp.longitude}
                x1={0}
                y1={0}
                x2={Number(x.toFixed(2))}
                y2={Number(y.toFixed(2))}
                stroke="var(--colour-muted)"
                strokeDasharray="4 2"
              />
              <text
                x={Number(label.x.toFixed(2))}
                y={Number(label.y.toFixed(2))}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-muted"
              >
                {cusp.label ?? cusp.house}
              </text>
            </g>
          );
        })}
        <circle r={radius - 20} fill="none" stroke="var(--colour-muted)" strokeWidth={1} opacity={0.4} />
        <circle r={radius - 60} fill="none" stroke="var(--colour-muted)" strokeWidth={1} opacity={0.2} />
        <g className="text-[10px] font-semibold fill-foreground">
          <text x={0} y={-radius - 10} textAnchor="middle">
            Asc {angles.ascendant.toFixed(1)}°
          </text>
          <text x={0} y={radius + 20} textAnchor="middle">
            MC {angles.midheaven.toFixed(1)}°
          </text>
        </g>
        <text
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm font-semibold fill-foreground"
        >
          {zodiacLabel}
          {metadata?.houseSystem ? ` · ${metadata.houseSystem}` : ""}
        </text>
      </svg>
    </div>
  );
};
