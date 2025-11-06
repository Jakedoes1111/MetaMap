"use client";

import { useState } from "react";
import { DateTime } from "luxon";
import { WarningBanner } from "@/components/WarningBanner";
import { SystemPageLayout } from "@/components/SystemPageLayout";
import { useStore } from "@/store/useStore";

const nakshatraList = [
  "Aśvinī",
  "Bharanī",
  "Kṛttikā",
  "Rohiṇī",
  "Mṛgaśīrṣa",
  "Ārdrā",
  "Punarvasu",
  "Puṣya",
  "Āśleṣā",
  "Maghā",
  "Pūrva Phalgunī",
  "Uttara Phalgunī",
  "Hasta",
  "Chitrā",
  "Svātī",
  "Viśākhā",
  "Anurādhā",
  "Jyeṣṭhā",
  "Mūla",
  "Pūrva Aṣāḍhā",
  "Uttara Aṣāḍhā",
  "Śravaṇā",
  "Dhaniṣṭhā",
  "Śatabhiṣā",
  "Pūrva Bhādrapadā",
  "Uttara Bhādrapadā",
  "Revatī",
];

const dashaOrder = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
const dashaDurations = [7, 20, 6, 10, 7, 18, 16, 19, 17];
const nakshatraToDashaIndex = [0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 1, 2, 3, 4, 5, 6, 7, 8];

const JaPage = () => {
  const {
    birthDetails,
    invokeProvider,
    providerLoading,
    providerErrors,
    clearProviderError,
    setBirthDetails,
    appendRow,
    pruneRows,
  } = useStore((state) => ({
    birthDetails: state.birthDetails,
    invokeProvider: state.invokeProvider,
    providerLoading: state.providerLoading,
    providerErrors: state.providerErrors,
    clearProviderError: state.clearProviderError,
    setBirthDetails: state.setBirthDetails,
    appendRow: state.appendRow,
    pruneRows: state.pruneRows,
  }));

  const [nakshatra, setNakshatra] = useState<string | null>(null);
  const [dashas, setDashas] = useState<
    Array<{ sequence: string; lord: string; start: string; finish: string }>
  >([]);

  const loading = providerLoading.ephemeris ?? false;
  const errorMessage = providerErrors.ephemeris;

  const handleCompute = async () => {
    clearProviderError("ephemeris");
    const response = await invokeProvider<
      {
        birthIso: string;
        timezone: string;
        coordinates: { latitude: number; longitude: number };
        options: { zodiac: "tropical" | "sidereal"; ayanamsa?: string; houseSystem?: string };
      },
      { ephemeris: { bodies: Array<{ id: string; longitude: number }> } }
    >("ephemeris", {
      birthIso: `${birthDetails.birthDate}T${birthDetails.birthTime}`,
      timezone: birthDetails.timezone,
      coordinates: { latitude: birthDetails.latitude ?? 0, longitude: birthDetails.longitude ?? 0 },
      options: {
        zodiac: "sidereal",
        ayanamsa: birthDetails.ayanamsa,
        houseSystem: birthDetails.houseSystem,
      },
    });

    const ephemeris = response.data?.ephemeris;
    if (response.status !== 200 || !ephemeris) {
      return;
    }

    const moon = ephemeris.bodies.find((body) => body.id === "moon");
    if (!moon) {
      return;
    }

    const segment = 360 / 27;
    const index = Math.max(0, Math.min(nakshatraList.length - 1, Math.floor(moon.longitude / segment)));
    const selectedNakshatra = nakshatraList[index];
    setNakshatra(selectedNakshatra);

    const birthDateTime = DateTime.fromISO(`${birthDetails.birthDate}T${birthDetails.birthTime}`, {
      zone: birthDetails.timezone,
    });

    if (!birthDateTime.isValid) {
      return;
    }

    const startIndex = nakshatraToDashaIndex[index];
    const span = segment;
    const offsetWithinNakshatra = moon.longitude - index * span;
    const proportionElapsedRaw = span === 0 ? 0 : offsetWithinNakshatra / span;
    const proportionElapsed = Math.min(Math.max(proportionElapsedRaw, 0), 1);
    const remainingYearsCurrent = (1 - proportionElapsed) * dashaDurations[startIndex];

    let cursor = birthDateTime;
    const generatedDashas = Array.from({ length: dashaOrder.length }).map((_, offset) => {
      const orderIndex = (startIndex + offset) % dashaOrder.length;
      const durationYears = offset === 0 ? remainingYearsCurrent : dashaDurations[orderIndex];
      const start = cursor;
      const finish = start.plus({ years: durationYears });
      cursor = finish;
      return {
        sequence: dashaOrder[orderIndex],
        lord: dashaOrder[orderIndex],
        start: start.toISODate() ?? "",
        finish: finish.toISODate() ?? "",
      };
    });

    setDashas(generatedDashas);

    const birthIso = `${birthDetails.birthDate}T${birthDetails.birthTime}`;
    pruneRows((row) => row.system === "JA");
    appendRow({
      person_id: "default-person",
      birth_datetime_local: birthIso,
      birth_timezone: birthDetails.timezone,
      system: "JA",
      subsystem: birthDetails.ayanamsa,
      source_tool: "ja",
      source_url_or_ref: "",
      data_point: `Nakṣatra ${selectedNakshatra}`,
      verbatim_text: `Moon longitude ${moon.longitude.toFixed(2)}°`,
      category: "Timing",
      subcategory: "Nakṣatra",
      direction_cardinal: "",
      direction_degrees: null,
      timing_window_start: null,
      timing_window_end: null,
      polarity: "+",
      strength: 0,
      confidence: 0.8,
      weight_system: 1,
      notes: "",
    });

    generatedDashas.forEach((dasha) => {
      appendRow({
        person_id: "default-person",
        birth_datetime_local: birthIso,
        birth_timezone: birthDetails.timezone,
        system: "JA",
        subsystem: `${birthDetails.ayanamsa} dashā`,
        source_tool: "ja",
        source_url_or_ref: "",
        data_point: `${dasha.sequence} mahādashā`,
        verbatim_text: `Starts ${dasha.start}`,
        category: "Timing",
        subcategory: "Mahādashā",
        direction_cardinal: "",
        direction_degrees: null,
        timing_window_start: dasha.start,
        timing_window_end: dasha.finish,
        polarity: "+",
        strength: 0,
        confidence: 0.7,
        weight_system: 1,
        notes: "",
      });
    });
  };

  return (
    <SystemPageLayout
      title="Jyotiṣa (Ja)"
      description="Derive nakṣatra and dashā sequences using the sidereal ephemeris provider."
    >
      <WarningBanner
        title={nakshatra ? "Nakṣatra computed" : "Awaiting provider"}
        description={
          nakshatra
            ? `Moon resides in ${nakshatra}. Mahādashā sequence generated using ${birthDetails.ayanamsa} ayanāṃśa.`
            : "Invoke the provider to resolve the lunar mansion and dashā timeline."
        }
      />
      <section className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
        <div className="rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Nakṣatra</h2>
            <button
              type="button"
              className="rounded-full bg-[hsl(var(--colour-accent))] px-4 py-2 text-xs font-semibold text-white shadow disabled:opacity-60"
              onClick={handleCompute}
              disabled={loading}
            >
              {loading ? "Computing…" : "Compute nakṣatra"}
            </button>
          </div>
          {errorMessage && (
            <p className="mt-3 rounded border border-[hsl(var(--colour-conflict))]/40 bg-[hsl(var(--colour-conflict)/0.1)] px-3 py-2 text-xs text-[hsl(var(--colour-conflict))]">
              {errorMessage}
            </p>
          )}
          <p className="mt-4 rounded bg-background/60 p-4 text-sm font-semibold">
            {nakshatra ?? "Awaiting provider"}
          </p>
        </div>
        <div className="rounded-lg border border-muted/50 bg-white p-4 text-sm shadow-card dark:bg-slate-900">
          <h2 className="text-base font-semibold">Ayanāṃśa variant</h2>
          <select
            className="mt-2 w-full rounded border border-muted/60 bg-background p-2 text-sm"
            value={birthDetails.ayanamsa}
            onChange={(event) => setBirthDetails({ ayanamsa: event.target.value })}
          >
            {["Lahiri", "Krishnamurti", "Raman", "Fagan/Bradley", "Yukteswar"].map((variant) => (
              <option key={variant} value={variant}>
                {variant}
              </option>
            ))}
          </select>
        </div>
      </section>
      <section className="mt-6 rounded-lg border border-muted/50 bg-white p-4 text-sm shadow-card dark:bg-slate-900">
        <h2 className="text-base font-semibold">Mahādashā timeline</h2>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-muted">
              <th className="pb-2">Sequence</th>
              <th className="pb-2">Start</th>
              <th className="pb-2">Finish</th>
            </tr>
          </thead>
          <tbody>
            {dashas.length > 0 ? (
              dashas.map((dasha) => (
                <tr key={dasha.sequence} className="border-t border-muted/30">
                  <td className="py-2 font-medium">{dasha.sequence}</td>
                  <td className="py-2">{dasha.start}</td>
                  <td className="py-2">{dasha.finish}</td>
                </tr>
              ))
            ) : (
              <tr className="border-t border-muted/30">
                <td className="py-2" colSpan={3}>
                  Mahādashā sequence will appear after computing the nakṣatra.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </SystemPageLayout>
  );
};

export default JaPage;
