"use client";

import { useMemo, useState } from "react";
import { WarningBanner } from "@/components/WarningBanner";
import { SystemPageLayout } from "@/components/SystemPageLayout";
import { useStore } from "@/store/useStore";
import { createId } from "@/lib/id";

const majorArcana = [
  "The Fool",
  "The Magician",
  "The High Priestess",
  "The Empress",
  "The Emperor",
  "The Hierophant",
  "The Lovers",
  "The Chariot",
  "Strength",
  "The Hermit",
  "Wheel of Fortune",
  "Justice",
  "The Hanged Man",
  "Death",
  "Temperance",
  "The Devil",
  "The Tower",
  "The Star",
  "The Moon",
  "The Sun",
  "Judgement",
  "The World",
];

const celticCrossPositions = [
  "Significator",
  "Crossing",
  "Above",
  "Below",
  "Behind",
  "Before",
  "Self",
  "Environment",
  "Hopes/Fears",
  "Outcome",
];

const shuffleDeck = <T,>(deck: T[]): T[] => {
  const result = deck.slice();
  const randomBytes = new Uint32Array(result.length);
  crypto.getRandomValues(randomBytes);
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = randomBytes[i] % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const TarotPage = () => {
  const appendRow = useStore((state) => state.appendRow);
  const [spread, setSpread] = useState<"celtic" | "three">("celtic");
  const [draw, setDraw] = useState<string[]>([]);

  const positions = useMemo(
    () => (spread === "celtic" ? celticCrossPositions : ["Past", "Present", "Future"]),
    [spread],
  );

  const performDraw = () => {
    const deck = shuffleDeck(majorArcana);
    const cards = deck.slice(0, positions.length);
    setDraw(cards);
    const now = new Date().toISOString();
    cards.forEach((card, index) =>
      appendRow({
        id: createId(),
        person_id: "default-person",
        birth_datetime_local: now,
        birth_timezone: "UTC",
        system: "Tarot",
        subsystem: spread === "celtic" ? "Celtic Cross" : "Three card",
        source_tool: "MetaMap RNG",
        source_url_or_ref: "",
        data_point: card,
        verbatim_text: "UNKNOWN",
        category: "Guidance",
        subcategory: positions[index],
        direction_cardinal: "",
        direction_degrees: null,
        timing_window_start: now,
        timing_window_end: now,
        polarity: "0",
        strength: 0,
        confidence: 0.5,
        weight_system: 1,
        privacy: "internal",
        provenance: "rng:tarot",
        notes: `spread:${spread}; position:${positions[index]}`,
      }),
    );
  };

  return (
    <SystemPageLayout
      title="Tarot spread builder"
      description="Shuffle the Major Arcana with crypto randomness. Logs card draws as UNKNOWN until you add your own notes."
    >
      <WarningBanner
        title="Reminder"
        description="Tarot draws are stored without interpretations. Add personal notes or plug a provider via the calculators interface."
        variant="privacy"
      />
      <section className="rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900">
        <header className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="inline-flex items-center gap-3">
            <label className="inline-flex items-center gap-1">
              <input
                type="radio"
                name="spread"
                checked={spread === "celtic"}
                onChange={() => setSpread("celtic")}
              />
              Celtic Cross (10)
            </label>
            <label className="inline-flex items-center gap-1">
              <input
                type="radio"
                name="spread"
                checked={spread === "three"}
                onChange={() => setSpread("three")}
              />
              3-card
            </label>
          </div>
          <button
            type="button"
            onClick={performDraw}
            className="rounded-full bg-[hsl(var(--colour-accent))] px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-90"
          >
            Draw cards
          </button>
        </header>
        {draw.length > 0 ? (
          <ol className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {draw.map((card, index) => (
              <li key={card} className="rounded bg-background/60 p-3 shadow-sm">
                <p className="text-xs uppercase text-muted">{positions[index]}</p>
                <p className="mt-1 text-sm font-semibold">{card}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-sm text-muted">Shuffle the deck to generate a spread.</p>
        )}
      </section>
    </SystemPageLayout>
  );
};

export default TarotPage;
