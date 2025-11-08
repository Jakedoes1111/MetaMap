"use server";

import { insertDatasetRows } from "@/server/datasets";
import { createId } from "@/lib/id";
import type { EphemerisBody } from "@/lib/ephemeris";
import type { ProviderKey } from "@/providers";
import type { DataRow, System } from "@/schema";

const normaliseDegrees = (value: number): number => {
  const wrapped = Math.round(value) % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
};

const buildVerbatimText = (position: EphemerisBody): string => {
  const longitude = position.longitude.toFixed(2);
  const houseLabel = position.house != null ? ` (house ${position.house})` : "";
  return `${position.name} @ ${longitude}\u00B0${houseLabel}`;
};

const buildBaseRow = (
  personId: string,
  birthIso: string,
  birthTimezone: string,
  system: System,
  subsystem: string,
  sourceTool: ProviderKey,
  position: EphemerisBody,
): DataRow => ({
  id: createId(),
  person_id: personId,
  birth_datetime_local: birthIso,
  birth_timezone: birthTimezone,
  system,
  subsystem,
  source_tool: sourceTool,
  source_url_or_ref: "",
  data_point: position.name,
  verbatim_text: buildVerbatimText(position),
  category: "Guidance",
  subcategory: "Ephemeris",
  direction_cardinal: "",
  direction_degrees: normaliseDegrees(position.longitude),
  timing_window_start: null,
  timing_window_end: null,
  polarity: "0",
  strength: 0,
  confidence: 0.85,
  weight_system: 1,
  privacy: "paid",
  provenance: "",
  notes: `longitude=${position.longitude.toFixed(2)}${
    position.house != null ? `;house=${position.house}` : ""
  }`,
});

export interface PersistEphemerisPayload {
  personId: string;
  birth: { date: string; time: string; timezone: string };
  options: { zodiac: "Tropical" | "Sidereal"; houseSystem: string; ayanamsa: string };
  coordinates: { latitude: number | null; longitude: number | null };
  positions: EphemerisBody[];
  provider: ProviderKey;
}

export const persistEphemerisResults = async (
  payload: PersistEphemerisPayload,
): Promise<DataRow[]> => {
  if (payload.positions.length === 0) {
    return [];
  }

  const timestamp = new Date().toISOString();
  const birthIso = `${payload.birth.date}T${payload.birth.time}`;
  const system: System = payload.options.zodiac === "Sidereal" ? "HA" : "WA";
  const subsystem = `${payload.options.zodiac} · ${payload.options.houseSystem}`;

  const rows = payload.positions.map((position) =>
    buildBaseRow(
      payload.personId,
      birthIso,
      payload.birth.timezone,
      system,
      subsystem,
      payload.provider,
      position,
    ),
  );

  const inserted = insertDatasetRows(rows, {
    provider: payload.provider,
    timestamp,
    config: {
      zodiac: payload.options.zodiac,
      houseSystem: payload.options.houseSystem,
      ayanamsa: payload.options.ayanamsa,
      coordinates: payload.coordinates,
    },
  });

  return inserted.map((record) => ({ ...record.row }));
};
