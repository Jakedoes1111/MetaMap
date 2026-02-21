"use client";

import { DateTime } from "luxon";
import { useMemo } from "react";
import { getTimeZones } from "@vvo/tzdb";
import { useShallow } from "zustand/react/shallow";
import type { BirthDetails } from "@/store/useStore";
import { useStore } from "@/store/useStore";

const houseSystems = [
  "Placidus",
  "Whole Sign",
  "Equal",
  "Koch",
  "Porphyry",
  "Regiomontanus",
] as const;

const zodiacs = ["Tropical", "Sidereal"] as const;

const timeZoneOptions = getTimeZones();

export const BirthDetailsCard = () => {
  const { birthDetails, setBirthDetails, confirmTimezone } = useStore(useShallow((state) => ({
    birthDetails: state.birthDetails,
    setBirthDetails: state.setBirthDetails,
    confirmTimezone: state.confirmTimezone,
  })));

  const dateTimePreview = useMemo(() => {
    const iso = `${birthDetails.birthDate}T${birthDetails.birthTime}`;
    const dt = DateTime.fromISO(iso, { zone: birthDetails.timezone });
    return {
      valid: dt.isValid,
      display: dt.isValid ? dt.toLocaleString(DateTime.DATETIME_FULL) : "Invalid date/time",
      isDst: dt.isValid ? dt.isInDST : false,
    };
  }, [birthDetails.birthDate, birthDetails.birthTime, birthDetails.timezone]);

  return (
    <section className="rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">Birth details</h2>
          <p className="text-xs text-muted">
            Defaults populate import calculations. Stored locally for your browser only.
          </p>
        </div>
        <div className="text-xs font-semibold">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={birthDetails.timezoneConfirmed}
              onChange={(event) => confirmTimezone(event.target.checked)}
            />
            Timezone confirmed
          </label>
        </div>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Birth date
          <input
            type="date"
            value={birthDetails.birthDate}
            onChange={(event) =>
              setBirthDetails({
                birthDate: event.target.value,
              })
            }
            className="rounded border border-muted/60 bg-background p-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Birth time
          <input
            type="time"
            value={birthDetails.birthTime}
            onChange={(event) =>
              setBirthDetails({
                birthTime: event.target.value,
              })
            }
            className="rounded border border-muted/60 bg-background p-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold md:col-span-2">
          Timezone
          <select
            value={birthDetails.timezone}
            onChange={(event) => setBirthDetails({ timezone: event.target.value })}
            className="rounded border border-muted/60 bg-background p-2 text-sm"
          >
            {timeZoneOptions.map((zone) => (
              <option key={zone.name} value={zone.name}>
                {zone.name} — UTC {zone.currentTimeFormat}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Latitude
          <input
            type="number"
            value={birthDetails.latitude ?? ""}
            onChange={(event) =>
              setBirthDetails({
                latitude: event.target.value === "" ? null : Number(event.target.value),
              })
            }
            placeholder="-33.8688"
            className="rounded border border-muted/60 bg-background p-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Longitude
          <input
            type="number"
            value={birthDetails.longitude ?? ""}
            onChange={(event) =>
              setBirthDetails({
                longitude: event.target.value === "" ? null : Number(event.target.value),
              })
            }
            placeholder="151.2093"
            className="rounded border border-muted/60 bg-background p-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          House system
          <select
            value={birthDetails.houseSystem}
            onChange={(event) => setBirthDetails({ houseSystem: event.target.value as BirthDetails["houseSystem"] })}
            className="rounded border border-muted/60 bg-background p-2 text-sm"
          >
            {houseSystems.map((system) => (
              <option key={system} value={system}>
                {system}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Zodiac
          <select
            value={birthDetails.zodiac}
            onChange={(event) =>
              setBirthDetails({
                zodiac: event.target.value as BirthDetails["zodiac"],
              })
            }
            className="rounded border border-muted/60 bg-background p-2 text-sm"
          >
            {zodiacs.map((zodiac) => (
              <option key={zodiac} value={zodiac}>
                {zodiac}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          JA ayanāṃśa
          <input
            type="text"
            value={birthDetails.ayanamsa}
            onChange={(event) => setBirthDetails({ ayanamsa: event.target.value })}
            className="rounded border border-muted/60 bg-background p-2 text-sm"
          />
        </label>
      </div>
      <footer className="mt-4 rounded bg-background/60 p-3 text-xs">
        <p>
          Local time preview:{" "}
          <span className="font-semibold text-foreground">
            {dateTimePreview.display}
            {dateTimePreview.isDst && " (Daylight Saving Time)"}
          </span>
        </p>
        {!birthDetails.timezoneConfirmed && (
          <p className="mt-2 text-[11px] text-[hsl(var(--colour-conflict))]">
            Please confirm the timezone, especially near DST transitions. Unconfirmed zones show a
            reminder banner.
          </p>
        )}
      </footer>
    </section>
  );
};
