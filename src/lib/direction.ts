import type { DirectionCardinal } from "@/schema";

const sectors: Array<{ start: number; end: number; label: DirectionCardinal }> = [
  { start: 337.5, end: 360, label: "N" },
  { start: 0, end: 22.5, label: "N" },
  { start: 22.5, end: 67.5, label: "NE" },
  { start: 67.5, end: 112.5, label: "E" },
  { start: 112.5, end: 157.5, label: "SE" },
  { start: 157.5, end: 202.5, label: "S" },
  { start: 202.5, end: 247.5, label: "SW" },
  { start: 247.5, end: 292.5, label: "W" },
  { start: 292.5, end: 337.5, label: "NW" },
];

export const degreesToCardinal = (deg: number): DirectionCardinal => {
  if (Number.isNaN(deg)) {
    throw new Error("degreesToCardinal requires a valid number");
  }
  const normalised = ((deg % 360) + 360) % 360;
  for (const sector of sectors) {
    if (sector.start > sector.end) {
      if (normalised >= sector.start || normalised < sector.end) {
        return sector.label;
      }
    } else if (normalised >= sector.start && normalised < sector.end) {
      return sector.label;
    }
  }
  return "N";
};

export const applyDirectionCardinal = <T extends { direction_cardinal?: string; direction_degrees?: number | null }>(
  entry: T,
): T & { direction_cardinal: string } => {
  if (entry.direction_degrees != null && entry.direction_cardinal === "") {
    return {
      ...entry,
      direction_cardinal: degreesToCardinal(entry.direction_degrees),
    };
  }
  return {
    ...entry,
    direction_cardinal: entry.direction_cardinal ?? "",
  };
};
