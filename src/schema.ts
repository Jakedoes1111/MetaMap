import { DateTime } from "luxon";
import { getTimeZones } from "@vvo/tzdb";
import { z } from "zod";

export const SystemValues = [
  "WA",
  "HA",
  "JA",
  "BaZi",
  "ZWDS",
  "QMDJ",
  "FS",
  "IChing",
  "Tarot",
  "Numerology_Pythagorean",
  "Numerology_Chaldean",
  "Geomancy",
  "Palmistry",
  "MianXiang",
  "HD",
  "GK",
] as const;

export const CategoryValues = [
  "Personality",
  "Career",
  "Wealth",
  "Relationships",
  "Health",
  "Creativity",
  "Family",
  "Reputation",
  "Legal",
  "Spirituality",
  "Guidance",
  "Timing",
  "Direction",
  "Property",
  "Learning",
] as const;

export const DirectionCardinalValues = [
  "",
  "N",
  "NE",
  "E",
  "SE",
  "S",
  "SW",
  "W",
  "NW",
] as const;

export const PolarityValues = ["+", "0", "−"] as const;

export type System = (typeof SystemValues)[number];
export type Category = (typeof CategoryValues)[number];
export type DirectionCardinal = (typeof DirectionCardinalValues)[number];
export type Polarity = (typeof PolarityValues)[number];

const TIMEZONE_SET = new Set(getTimeZones().map((tz) => tz.name));

const isoValidation = (value: string) =>
  DateTime.fromISO(value, { setZone: true }).isValid;

const directionDegreesSchema = z
  .number()
  .int()
  .min(0)
  .max(359)
  .optional()
  .nullable();

const timingField = z
  .string()
  .min(1)
  .optional()
  .nullable()
  .refine((val) => !val || isoValidation(val), {
    message: "Timing fields must be an ISO 8601 string",
  });

export const DataRowSchema = z
  .object({
    id: z.string().uuid(),
    person_id: z.string().min(1, "person_id is required"),
    birth_datetime_local: z
      .string()
      .min(1)
      .refine(isoValidation, "birth_datetime_local must be ISO 8601"),
    birth_timezone: z
      .string()
      .refine((value) => TIMEZONE_SET.has(value), "Unknown time zone"),
    system: z.enum(SystemValues),
    subsystem: z.string().optional().default(""),
    source_tool: z.string().optional().default(""),
    source_url_or_ref: z.string().optional().default(""),
    data_point: z.string().min(1, "data_point is required"),
    verbatim_text: z.string().min(1, "verbatim_text is required"),
    category: z.enum(CategoryValues),
    subcategory: z.string().optional().default(""),
    direction_cardinal: z.enum(DirectionCardinalValues).optional().default(""),
    direction_degrees: directionDegreesSchema,
    timing_window_start: timingField,
    timing_window_end: timingField,
    polarity: z.enum(PolarityValues),
    strength: z.number().int().min(-2).max(2),
    confidence: z.number().min(0).max(1),
    weight_system: z.number().positive(),
    notes: z.string().optional().default(""),
  })
  .superRefine((value, ctx) => {
    const { timing_window_start: start, timing_window_end: end } = value;
    if ((start && !end) || (!start && end)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Both timing_window_start and timing_window_end are required",
        path: ["timing_window_start"],
      });
    }
    if (start && end) {
      const startDt = DateTime.fromISO(start);
      const endDt = DateTime.fromISO(end);
      if (!startDt.isValid || !endDt.isValid || endDt < startDt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Timing window must be a closed interval (start <= end)",
          path: ["timing_window_end"],
        });
      }
    }
    if (value.direction_degrees != null && Number.isNaN(value.direction_degrees)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "direction_degrees must be an integer between 0 and 359",
        path: ["direction_degrees"],
      });
    }
  });

export type DataRow = z.infer<typeof DataRowSchema>;

export const CSV_HEADERS = [
  "person_id",
  "birth_datetime_local",
  "birth_timezone",
  "system",
  "subsystem",
  "source_tool",
  "source_url_or_ref",
  "data_point",
  "verbatim_text",
  "category",
  "subcategory",
  "direction_cardinal",
  "direction_degrees",
  "timing_window_start",
  "timing_window_end",
  "polarity",
  "strength",
  "confidence",
  "weight_system",
  "notes",
] as const satisfies ReadonlyArray<keyof Omit<DataRow, "id">>;

export const WeightDefaults: Record<System, number> = Object.freeze({
  WA: 1,
  HA: 1,
  JA: 1,
  BaZi: 1,
  ZWDS: 1,
  QMDJ: 1,
  FS: 1,
  IChing: 1,
  Tarot: 1,
  Numerology_Pythagorean: 1,
  Numerology_Chaldean: 1,
  Geomancy: 1,
  Palmistry: 1,
  MianXiang: 1,
  HD: 0.6,
  GK: 0.5,
});

export const PolarityDescriptions: Record<Polarity, "favourable" | "neutral" | "unfavourable"> =
  {
    "+": "favourable",
    "0": "neutral",
    "−": "unfavourable",
  };

export const UNKNOWN_TOKEN = "UNKNOWN";
