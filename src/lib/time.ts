import { DateTime, Interval } from "luxon";

export type ClosedInterval = {
  start: DateTime;
  end: DateTime;
  toISO(): { start: string; end: string };
  contains(date: DateTime): boolean;
  overlaps(other: ClosedInterval): boolean;
};

export const parseISOInZone = (value: string, zone: string): DateTime =>
  DateTime.fromISO(value, { zone, setZone: true });

export const formatISOInZone = (date: DateTime, zone: string): string =>
  date.setZone(zone, { keepLocalTime: false }).toISO({
    suppressMilliseconds: true,
    suppressSeconds: true,
  }) ?? "";

export const formatDisplayDate = (
  date: DateTime,
  zone: string,
  format = "d LLL yyyy, HH:mm ZZZZ",
): string => date.setZone(zone).toFormat(format);

export const ensureClosedInterval = (
  start?: string | null,
  end?: string | null,
  zone = "UTC",
): ClosedInterval | null => {
  if (!start && !end) {
    return null;
  }
  if (!start || !end) {
    throw new Error("Both start and end are required to form a closed interval.");
  }
  const startDt = parseISOInZone(start, zone);
  const endDt = parseISOInZone(end, zone);
  if (!startDt.isValid || !endDt.isValid) {
    throw new Error("Invalid ISO value provided for interval.");
  }
  if (endDt < startDt) {
    throw new Error("Interval end must be after or equal to start.");
  }
  const interval = Interval.fromDateTimes(startDt, endDt);
  return {
    start: startDt,
    end: endDt,
    toISO: () => ({
      start: startDt.toISO({ suppressMilliseconds: true }) ?? start,
      end: endDt.toISO({ suppressMilliseconds: true }) ?? end,
    }),
    contains: (date: DateTime) => interval.contains(date),
    overlaps: (other: ClosedInterval) =>
      interval.overlaps(Interval.fromDateTimes(other.start, other.end)),
  };
};

export const sameInstantToStartEnd = (
  date: DateTime,
  zone = "UTC",
): { start: string; end: string } => {
  const iso = formatISOInZone(date, zone);
  return { start: iso, end: iso };
};
