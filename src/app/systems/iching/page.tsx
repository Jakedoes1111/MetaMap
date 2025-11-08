"use client";

import { useMemo, useState } from "react";
import { WarningBanner } from "@/components/WarningBanner";
import { SystemPageLayout } from "@/components/SystemPageLayout";
import { useStore } from "@/store/useStore";
import { createId } from "@/lib/id";

type Method = "coins" | "yarrow";

const castCoins = (): number[] => {
  const lines: number[] = [];
  for (let i = 0; i < 6; i += 1) {
    const bytes = new Uint8Array(3);
    crypto.getRandomValues(bytes);
    const toss = Array.from(bytes).map((value) => (value % 2 === 0 ? 2 : 3));
    const sum = toss.reduce((acc, value) => acc + value, 0);
    lines.push(sum);
  }
  return lines;
};

const castYarrow = (): number[] => {
  const lines: number[] = [];
  for (let i = 0; i < 6; i += 1) {
    const bytes = new Uint32Array(2);
    crypto.getRandomValues(bytes);
    const total = (bytes[0] % 4) + (bytes[1] % 4) + 6; // approximation
    const value = total === 6 ? 6 : total === 7 ? 7 : total === 8 ? 8 : 9;
    lines.push(value);
  }
  return lines;
};

const deriveHexagramNumber = (lines: number[]) => {
  const binary = lines
    .map((line) => (line % 2 === 1 ? 1 : 0))
    .map((bit, index) => bit << index)
    .reduce((acc, value) => acc + value, 0);
  return binary + 1;
};

const lineDescription = (value: number) => {
  switch (value) {
    case 6:
      return "Old Yin (6)";
    case 7:
      return "Young Yang (7)";
    case 8:
      return "Young Yin (8)";
    case 9:
      return "Old Yang (9)";
    default:
      return value.toString();
  }
};

const IchingPage = () => {
  const appendRow = useStore((state) => state.appendRow);
  const [method, setMethod] = useState<Method>("coins");
  const [recentCast, setRecentCast] = useState<number[] | null>(null);

  const cast = () => {
    const lines = method === "coins" ? castCoins() : castYarrow();
    setRecentCast(lines);
    const hexNumber = deriveHexagramNumber(lines);
    const now = new Date().toISOString();

    appendRow({
      id: createId(),
      person_id: "default-person",
      birth_datetime_local: now,
      birth_timezone: "UTC",
      system: "IChing",
      subsystem: method === "coins" ? "Three coins" : "Yarrow stalk (approx)",
      source_tool: "MetaMap RNG",
      source_url_or_ref: "",
      data_point: `Hexagram ${hexNumber}`,
      verbatim_text: "UNKNOWN",
      category: "Guidance",
      subcategory: "Casting",
      direction_cardinal: "",
      direction_degrees: null,
      timing_window_start: now,
      timing_window_end: now,
    polarity: "0",
    strength: 0,
    confidence: 0.5,
    weight_system: 1,
    privacy: "internal",
    provenance: `rng:iching:${method}`,
    notes: `lookup:lines=${lines.join("-")}; method:${method}`,
  });
  };

  const derivedHexagram = useMemo(
    () => (recentCast ? deriveHexagramNumber(recentCast) : null),
    [recentCast],
  );

  return (
    <SystemPageLayout
      title="I Ching casting"
      description="Use crypto-secure RNG to record coin or yarrow casts. Results persist in the dataset with UNKNOWN interpretations."
    >
      <WarningBanner
        title="Reminder"
        description="MetaMap stores the raw casting pattern but does not interpret hexagrams. Add your own notes after consulting a trusted translation."
        variant="privacy"
      />
      <section className="rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900">
        <header className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="inline-flex items-center gap-3">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="method"
                checked={method === "coins"}
                onChange={() => setMethod("coins")}
              />
              3-coin method
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="method"
                checked={method === "yarrow"}
                onChange={() => setMethod("yarrow")}
              />
              Yarrow approximation
            </label>
          </div>
          <button
            type="button"
            onClick={cast}
            className="rounded-full bg-[hsl(var(--colour-accent))] px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-90"
          >
            Cast hexagram
          </button>
        </header>
        {recentCast ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <ul className="space-y-2 rounded bg-background/60 p-3 text-sm">
              {recentCast.map((value, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>Line {index + 1}</span>
                  <span className="font-semibold">{lineDescription(value)}</span>
                </li>
              ))}
            </ul>
            <div className="rounded bg-background/60 p-3 text-sm">
              <p className="text-xs uppercase text-muted">Hexagram number</p>
              <p className="mt-2 text-3xl font-semibold">{derivedHexagram}</p>
              <p className="mt-2 text-xs text-muted">
                Lines stored bottom (first cast) to top (last cast). Update notes with your own
                commentary.
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">
            Cast to generate a new hexagram and log it into the dataset.
          </p>
        )}
      </section>
    </SystemPageLayout>
  );
};

export default IchingPage;
