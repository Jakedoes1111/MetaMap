"use client";

import { useState } from "react";
import { WarningBanner } from "@/components/WarningBanner";
import { SystemPageLayout } from "@/components/SystemPageLayout";
import { useStore } from "@/store/useStore";
import { createId } from "@/lib/id";

type Figure = [number, number, number, number];

const randomFigure = (): Figure => {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return bytes.map((value) => (value % 2 === 0 ? 0 : 1)) as Figure;
};

const addFigures = (a: Figure, b: Figure): Figure =>
  a.map((value, index) => (value + b[index]) % 2) as Figure;

const toString = (figure: Figure) => figure.map((value) => (value === 1 ? "●" : "○")).join(" ");

const figureCode = (figure: Figure) =>
  figure.reduce((acc, value, index) => acc + value * 2 ** index, 0) + 1;

const GeomancyPage = () => {
  const appendRow = useStore((state) => state.appendRow);
  const [judge, setJudge] = useState<Figure | null>(null);
  const [witnesses, setWitnesses] = useState<{ left: Figure; right: Figure } | null>(null);

  const cast = () => {
    const mothers: Figure[] = [randomFigure(), randomFigure(), randomFigure(), randomFigure()];
    const daughters: Figure[] = [0, 1, 2, 3].map((i) =>
      mothers.map((mother) => mother[i]) as Figure,
    );
    const nieces: Figure[] = [addFigures(daughters[0], daughters[1]), addFigures(daughters[2], daughters[3])];
    const rightWitness = addFigures(nieces[0], nieces[1]);
    const leftWitness = addFigures(mothers[2], mothers[3]);
    const judgeFigure = addFigures(rightWitness, leftWitness);

    setWitnesses({ left: leftWitness, right: rightWitness });
    setJudge(judgeFigure);

    const now = new Date().toISOString();
    appendRow({
      id: createId(),
      person_id: "default-person",
      birth_datetime_local: now,
      birth_timezone: "UTC",
      system: "Geomancy",
      subsystem: "Witness",
      source_tool: "MetaMap RNG",
      source_url_or_ref: "",
      data_point: `Right witness ${figureCode(rightWitness)}`,
      verbatim_text: "UNKNOWN",
      category: "Guidance",
      subcategory: "Witness",
      direction_cardinal: "",
      direction_degrees: null,
      timing_window_start: now,
      timing_window_end: now,
      polarity: "0",
      strength: 0,
      confidence: 0.5,
      weight_system: 1,
      notes: `figure:${toString(rightWitness)}`,
    });
    appendRow({
      id: createId(),
      person_id: "default-person",
      birth_datetime_local: now,
      birth_timezone: "UTC",
      system: "Geomancy",
      subsystem: "Witness",
      source_tool: "MetaMap RNG",
      source_url_or_ref: "",
      data_point: `Left witness ${figureCode(leftWitness)}`,
      verbatim_text: "UNKNOWN",
      category: "Guidance",
      subcategory: "Witness",
      direction_cardinal: "",
      direction_degrees: null,
      timing_window_start: now,
      timing_window_end: now,
      polarity: "0",
      strength: 0,
      confidence: 0.5,
      weight_system: 1,
      notes: `figure:${toString(leftWitness)}`,
    });
    appendRow({
      id: createId(),
      person_id: "default-person",
      birth_datetime_local: now,
      birth_timezone: "UTC",
      system: "Geomancy",
      subsystem: "Judge",
      source_tool: "MetaMap RNG",
      source_url_or_ref: "",
      data_point: `Judge ${figureCode(judgeFigure)}`,
      verbatim_text: "UNKNOWN",
      category: "Guidance",
      subcategory: "Judge",
      direction_cardinal: "",
      direction_degrees: null,
      timing_window_start: now,
      timing_window_end: now,
      polarity: "0",
      strength: 0,
      confidence: 0.5,
      weight_system: 1,
      notes: `figure:${toString(judgeFigure)}`,
    });
  };

  return (
    <SystemPageLayout
      title="Geomancy shield chart"
      description="Randomly generate mothers to derive witnesses and judge. Results save as UNKNOWN rows for later interpretation."
    >
      <WarningBanner
        title="Reminder"
        description="Figures are generated via crypto randomness but left uninterpreted. Add your own insight to the dataset notes."
        variant="privacy"
      />
      <section className="rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900">
        <button
          type="button"
          onClick={cast}
          className="rounded-full bg-[hsl(var(--colour-accent))] px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-90"
        >
          Cast shield chart
        </button>
        {witnesses && judge ? (
          <div className="mt-4 grid gap-3 text-sm">
            <div className="rounded bg-background/60 p-3">
              <p className="text-xs uppercase text-muted">Right witness</p>
              <p className="text-lg font-semibold">{toString(witnesses.right)}</p>
            </div>
            <div className="rounded bg-background/60 p-3">
              <p className="text-xs uppercase text-muted">Left witness</p>
              <p className="text-lg font-semibold">{toString(witnesses.left)}</p>
            </div>
            <div className="rounded bg-background/60 p-3">
              <p className="text-xs uppercase text-muted">Judge</p>
              <p className="text-lg font-semibold">{toString(judge)}</p>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">
            No chart cast yet. Tap the button to log witnesses and judge into the dataset.
          </p>
        )}
      </section>
    </SystemPageLayout>
  );
};

export default GeomancyPage;
