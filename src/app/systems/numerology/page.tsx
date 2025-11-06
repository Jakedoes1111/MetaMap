"use client";

import { useState } from "react";
import { WarningBanner } from "@/components/WarningBanner";
import { SystemPageLayout } from "@/components/SystemPageLayout";
import { useStore } from "@/store/useStore";
import { computeLifePath, computeBirthNumber, computeNameNumber } from "@/lib/numerology";
import { createId } from "@/lib/id";

const NumerologyPage = () => {
  const { birthDetails, appendRow } = useStore((state) => ({
    birthDetails: state.birthDetails,
    appendRow: state.appendRow,
  }));
  const [fullName, setFullName] = useState("Sample Name");

  const lifePath = computeLifePath(birthDetails.birthDate);
  const birthNumber = computeBirthNumber(birthDetails.birthDate);
  const namePythagorean = computeNameNumber(fullName, "pythagorean");
  const nameChaldean = computeNameNumber(fullName, "chaldean");

  const logRow = (system: "Numerology_Pythagorean" | "Numerology_Chaldean", dataPoint: string) => {
    appendRow({
      id: createId(),
      person_id: "default-person",
      birth_datetime_local: `${birthDetails.birthDate}T${birthDetails.birthTime}`,
      birth_timezone: birthDetails.timezone,
      system,
      subsystem: "",
      source_tool: "MetaMap numerology",
      source_url_or_ref: "",
      data_point: dataPoint,
      verbatim_text: "UNKNOWN",
      category: "Personality",
      subcategory: system === "Numerology_Pythagorean" ? "Life Path" : "Birth Number",
      direction_cardinal: "",
      direction_degrees: null,
      timing_window_start: null,
      timing_window_end: null,
      polarity: "+",
      strength: 1,
      confidence: 0.6,
      weight_system: 1,
      notes: `auto-calculated:${system}`,
    });
  };

  return (
    <SystemPageLayout
      title="Numerology"
      description="Deterministic calculations for birth date and name. Persistence logged as UNKNOWN to allow personal interpretation."
    >
      <WarningBanner
        title="Deterministic"
        description="Numerology calculations are mathematical and transparent. Add your own interpretive notes if desired."
      />
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900">
          <h2 className="text-base font-semibold">Birth date numbers</h2>
          <p className="text-xs text-muted">
            Using Australian English format: {birthDetails.birthDate.split("-").reverse().join(" / ")}
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="rounded bg-background/60 p-3">
              <p className="text-xs uppercase text-muted">Life Path</p>
              <p className="text-lg font-semibold">
                {lifePath.compound} → {lifePath.reduced}
              </p>
              <button
                type="button"
                className="mt-2 rounded-full border border-muted/60 px-3 py-1 text-xs font-semibold"
                onClick={() =>
                  logRow(
                    "Numerology_Pythagorean",
                    `Life Path ${lifePath.compound}/${lifePath.reduced}`,
                  )
                }
              >
                Log Life Path
              </button>
            </li>
            <li className="rounded bg-background/60 p-3">
              <p className="text-xs uppercase text-muted">Birth number</p>
              <p className="text-lg font-semibold">{birthNumber.compound}</p>
              <button
                type="button"
                className="mt-2 rounded-full border border-muted/60 px-3 py-1 text-xs font-semibold"
                onClick={() =>
                  logRow(
                    "Numerology_Chaldean",
                    `Birth number ${birthNumber.compound}`,
                  )
                }
              >
                Log Birth Number
              </button>
            </li>
          </ul>
        </div>
        <div className="rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900">
          <h2 className="text-base font-semibold">Name numbers</h2>
          <label className="text-sm font-semibold">
            Full name
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="mt-1 w-full rounded border border-muted/60 bg-background p-2 text-sm"
            />
          </label>
          <div className="mt-3 grid gap-3 text-sm">
            <div className="rounded bg-background/60 p-3">
              <p className="text-xs uppercase text-muted">Pythagorean</p>
              <p className="text-lg font-semibold">
                {namePythagorean.compound} → {namePythagorean.reduced}
              </p>
            </div>
            <div className="rounded bg-background/60 p-3">
              <p className="text-xs uppercase text-muted">Chaldean</p>
              <p className="text-lg font-semibold">
                {nameChaldean.compound} → {nameChaldean.reduced}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            Logging options focus on deterministic outputs; interpretations remain at the user&apos;s
            discretion.
          </p>
        </div>
      </section>
    </SystemPageLayout>
  );
};

export default NumerologyPage;
