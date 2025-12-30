"use client";

import { useCallback, useMemo, useState } from "react";
import { useStore } from "@/store/useStore";
import { WarningBanner } from "@/components/WarningBanner";
import { SystemPageLayout } from "@/components/SystemPageLayout";
import type { EphemerisBody, EphemerisResponse } from "@/lib/ephemeris";
import { persistEphemerisResults } from "./actions";

const WaHaPage = () => {
  const { birthDetails, setBirthDetails, dataset, addRows, invokeProvider } = useStore((state) => ({
    birthDetails: state.birthDetails,
    setBirthDetails: state.setBirthDetails,
    dataset: state.dataset,
    addRows: state.addRows,
    invokeProvider: state.invokeProvider,
  }));

  const [isComputing, setIsComputing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ephemeris, setEphemeris] = useState<EphemerisResponse | null>(null);

  const ephemerisRows = useMemo(
    () => dataset.filter((row) => row.system === "WA" || row.system === "HA"),
    [dataset],
  );

  const handleCompute = useCallback(async () => {
    setIsComputing(true);
    setError(null);

    const birthIso = `${birthDetails.birthDate}T${birthDetails.birthTime}`;

    try {
      const response = await invokeProvider<
        {
          birthIso: string;
          timezone: string;
          coordinates: { latitude: number; longitude: number };
          options: { zodiac: "tropical" | "sidereal"; ayanamsa?: string; houseSystem?: string };
        },
        EphemerisResponse
      >("ephemeris", {
        birthIso,
        timezone: birthDetails.timezone,
        coordinates: {
          latitude: birthDetails.latitude ?? 0,
          longitude: birthDetails.longitude ?? 0,
        },
        options: {
          zodiac: birthDetails.zodiac === "Sidereal" ? "sidereal" : "tropical",
          ayanamsa: birthDetails.ayanamsa,
          houseSystem: birthDetails.houseSystem,
        },
      });

      if (response.status !== 200) {
        const message =
          response.data && typeof response.data === "object" && "error" in response.data
            ? String((response.data as { error?: unknown }).error ?? "Ephemeris request failed")
            : `Ephemeris request failed (${response.status})`;
        setError(message);
        return;
      }

      const ephemerisResponse = (response.data as { ephemeris?: EphemerisResponse } | null)?.ephemeris;

      if (!ephemerisResponse) {
        setError("Ephemeris provider returned an empty payload.");
        return;
      }

      setEphemeris(ephemerisResponse);

      const persisted = await persistEphemerisResults({
        personId: "default-person",
        birth: {
          date: birthDetails.birthDate,
          time: birthDetails.birthTime,
          timezone: birthDetails.timezone,
        },
        options: {
          zodiac: birthDetails.zodiac,
          houseSystem: birthDetails.houseSystem,
          ayanamsa: birthDetails.ayanamsa,
        },
        coordinates: {
          latitude: birthDetails.latitude ?? null,
          longitude: birthDetails.longitude ?? null,
        },
        positions: ephemerisResponse.bodies as EphemerisBody[],
        provider: "ephemeris",
      });

      if (persisted.length > 0) {
        addRows(persisted);
      }
    } catch (computeError) {
      const message =
        computeError instanceof Error
          ? computeError.message
          : "Unexpected error while computing ephemeris.";
      setError(message);
    } finally {
      setIsComputing(false);
    }
  }, [
    addRows,
    birthDetails.ayanamsa,
    birthDetails.birthDate,
    birthDetails.birthTime,
    birthDetails.houseSystem,
    birthDetails.latitude,
    birthDetails.longitude,
    birthDetails.timezone,
    birthDetails.zodiac,
    invokeProvider,
  ]);

  return (
    <SystemPageLayout
      title="Western / Hellenistic Astrology"
      description="Compute tropical or sidereal longitudes using the configured ephemeris provider and persist the results into the dataset."
    >
      <WarningBanner
        title={ephemeris ? "Ephemeris ready" : "Provider required"}
        description={
          ephemeris
            ? `Positions calculated with ${ephemeris.metadata.provider} (${ephemeris.metadata.options.zodiac}).`
            : "Configure birth details then run the computation to generate natal positions and houses."
        }
      />
      <section className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
        <div className="rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900">
          <h2 className="text-base font-semibold">Angles & houses</h2>
          {ephemeris ? (
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold">Angles</h3>
                <ul className="mt-2 space-y-1 text-sm">
                  {ephemeris.angles.map((angle) => (
                    <li key={angle.id} className="flex items-center justify-between rounded border border-muted/40 px-3 py-2">
                      <span className="font-medium uppercase">{angle.id}</span>
                      <span>{angle.longitude.toFixed(2)}°</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold">House cusps</h3>
                <ul className="mt-2 space-y-1 text-sm">
                  {ephemeris.houses.map((house) => (
                    <li key={house.index} className="flex items-center justify-between rounded border border-muted/40 px-3 py-2">
                      <span>House {house.index}</span>
                      <span>{house.cusp.toFixed(2)}°</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">
              Run the computation to populate ascendant, midheaven, and house cusps.
            </p>
          )}
        </div>
        <form className="rounded-lg border border-muted/50 bg-white p-4 text-sm shadow-card dark:bg-slate-900">
          <fieldset className="mb-4">
            <legend className="text-sm font-semibold">Zodiac</legend>
            <label className="mt-2 flex items-center gap-2">
              <input
                type="radio"
                name="zodiac"
                checked={birthDetails.zodiac === "Tropical"}
                onChange={() => setBirthDetails({ zodiac: "Tropical" })}
              />
              Tropical
            </label>
            <label className="mt-2 flex items-center gap-2">
              <input
                type="radio"
                name="zodiac"
                checked={birthDetails.zodiac === "Sidereal"}
                onChange={() => setBirthDetails({ zodiac: "Sidereal" })}
              />
              Sidereal
            </label>
          </fieldset>
          <fieldset className="mb-4">
            <legend className="text-sm font-semibold">House system</legend>
            <select
              value={birthDetails.houseSystem}
              onChange={(event) =>
                setBirthDetails({ houseSystem: event.target.value as typeof birthDetails.houseSystem })
              }
              className="mt-2 w-full rounded border border-muted/60 bg-background p-2"
            >
              {["Placidus", "Whole Sign", "Equal", "Koch", "Porphyry", "Regiomontanus"].map((house) => (
                <option key={house} value={house}>
                  {house}
                </option>
              ))}
            </select>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-semibold">Ayanāṃśa (for sidereal)</legend>
            <input
              type="text"
              value={birthDetails.ayanamsa}
              onChange={(event) => setBirthDetails({ ayanamsa: event.target.value })}
              className="mt-2 w-full rounded border border-muted/60 bg-background p-2"
            />
            <p className="mt-2 text-xs text-muted">
              Applies when sidereal zodiac is selected. Providers should surface the chosen value in
              generated rows.
            </p>
          </fieldset>
          <button
            type="button"
            onClick={handleCompute}
            disabled={isComputing}
            className="mt-4 w-full rounded-full bg-[hsl(var(--colour-accent))] px-4 py-2 text-sm font-semibold text-white shadow disabled:bg-muted disabled:text-muted"
          >
            {isComputing ? "Computing…" : "Compute & persist ephemeris"}
          </button>
          {error && (
            <p className="mt-2 rounded bg-[hsl(var(--colour-conflict)/0.12)] px-3 py-2 text-xs font-semibold text-[hsl(var(--colour-conflict))]">
              {error}
            </p>
          )}
        </form>
      </section>
      <section className="mt-6 rounded-lg border border-muted/50 bg-white p-4 text-sm shadow-card dark:bg-slate-900">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-base font-semibold">Persisted ephemeris rows</h2>
          <span className="text-xs text-muted">{ephemerisRows.length} entries</span>
        </div>
        {ephemerisRows.length === 0 ? (
          <p className="mt-3 text-xs text-muted">
            Run the ephemeris computation to append WA/HA dataset rows with provenance metadata.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-muted">
                  <th className="pb-2">Body</th>
                  <th className="pb-2">Details</th>
                  <th className="pb-2">System</th>
                  <th className="pb-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {ephemerisRows.map((row) => (
                  <tr key={row.id} className="border-t border-muted/30">
                    <td className="py-2 font-medium">{row.data_point}</td>
                    <td className="py-2 text-xs text-muted">{row.verbatim_text}</td>
                    <td className="py-2 text-xs">{row.system}</td>
                    <td className="py-2 text-xs text-muted">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {ephemeris && (
        <section className="mt-6 rounded-lg border border-muted/50 bg-white p-4 text-sm shadow-card dark:bg-slate-900">
          <h2 className="text-base font-semibold">Current planetary positions</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-muted">
                  <th className="pb-2">Body</th>
                  <th className="pb-2">Longitude</th>
                  <th className="pb-2">Latitude</th>
                  <th className="pb-2">House</th>
                  <th className="pb-2">Motion</th>
                </tr>
              </thead>
              <tbody>
                {ephemeris.bodies.map((body) => (
                  <tr key={body.id} className="border-t border-muted/30">
                    <td className="py-2 font-medium">{body.name}</td>
                    <td className="py-2">{body.longitude.toFixed(2)}°</td>
                    <td className="py-2">{body.latitude.toFixed(2)}°</td>
                    <td className="py-2">{body.house ?? "—"}</td>
                    <td className="py-2 text-xs text-muted">{body.retrograde ? "Retrograde" : "Direct"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </SystemPageLayout>
  );
};

export default WaHaPage;
