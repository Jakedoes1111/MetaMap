"use client";

import { useState } from "react";
import { WarningBanner } from "@/components/WarningBanner";
import { SystemPageLayout } from "@/components/SystemPageLayout";
import { useStore } from "@/store/useStore";
import type { QMDJBoard } from "@/calculators";

const schools = ["Zhi Run", "Chai Bu", "Men Dun Jia"] as const;

const palaceOrder = ["NW", "N", "NE", "W", "Center", "E", "SW", "S", "SE"];

const emptyBoard: QMDJBoard["chart"] = palaceOrder.map((palace) => ({
  palace,
  star: "UNKNOWN",
  door: "UNKNOWN",
  deity: "UNKNOWN",
}));

const QmdjPage = () => {
  const {
    birthDetails,
    invokeProvider,
    providerLoading,
    providerErrors,
    clearProviderError,
    appendRow,
    pruneRows,
  } = useStore((state) => ({
    birthDetails: state.birthDetails,
    invokeProvider: state.invokeProvider,
    providerLoading: state.providerLoading,
    providerErrors: state.providerErrors,
    clearProviderError: state.clearProviderError,
    appendRow: state.appendRow,
    pruneRows: state.pruneRows,
  }));

  const [school, setSchool] = useState<(typeof schools)[number]>("Zhi Run");
  const [arrangement, setArrangement] = useState<"yang" | "yin">("yang");
  const [board, setBoard] = useState<QMDJBoard["chart"]>(emptyBoard);

  const loading = providerLoading.qmdj ?? false;
  const errorMessage = providerErrors.qmdj;

  const handleGenerate = async () => {
    clearProviderError("qmdj");
    const response = await invokeProvider<
      { birthIso: string; timezone: string; arrangement: "yang" | "yin"; school: string },
      { board: QMDJBoard }
    >("qmdj", {
      birthIso: `${birthDetails.birthDate}T${birthDetails.birthTime}`,
      timezone: birthDetails.timezone,
      arrangement,
      school,
    });
    if (response.status === 200 && response.data) {
      setBoard(response.data.board.chart);
      const birthIso = `${birthDetails.birthDate}T${birthDetails.birthTime}`;
      pruneRows((row) => row.system === "QMDJ");
      response.data.board.chart.forEach((cell) => {
        appendRow({
          person_id: "default-person",
          birth_datetime_local: birthIso,
          birth_timezone: birthDetails.timezone,
          system: "QMDJ",
          subsystem: `${school} · ${arrangement}`,
          source_tool: "qmdj",
          source_url_or_ref: "",
          data_point: `${cell.palace} palace`,
          verbatim_text: `${cell.star} | ${cell.door} | ${cell.deity}`,
          category: "Guidance",
          subcategory: "Palace",
          direction_cardinal: "",
          direction_degrees: null,
          timing_window_start: null,
          timing_window_end: null,
          polarity: "+",
          strength: 0,
          confidence: 0.7,
          weight_system: 1,
          notes: `arrangement=${arrangement}`,
        });
      });
    }
  };

  return (
    <SystemPageLayout
      title="Qi Men Dun Jia"
      description="3×3 Lo Shu board with selectable school and arrangement populated by the configured provider."
    >
      <WarningBanner
        title={board !== emptyBoard ? "Board computed" : "Awaiting provider"}
        description={
          board !== emptyBoard
            ? "Stars, doors, and deities were generated using the configured Qi Men Dun Jia provider."
            : "Run the generator to populate the Lo Shu palaces for the selected school and arrangement."
        }
      />
      <section className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <div className="rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900">
          <header className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="inline-flex gap-2">
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  name="arrangement"
                  checked={arrangement === "yang"}
                  onChange={() => setArrangement("yang")}
                />
                Yang
              </label>
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  name="arrangement"
                  checked={arrangement === "yin"}
                  onChange={() => setArrangement("yin")}
                />
                Yin
              </label>
            </div>
            <select
              className="rounded border border-muted/60 bg-background p-2 text-sm"
              value={school}
              onChange={(event) => setSchool(event.target.value as (typeof schools)[number])}
            >
              {schools.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
            <button
              type="button"
              className="rounded-full bg-[hsl(var(--colour-accent))] px-4 py-2 text-xs font-semibold text-white shadow disabled:opacity-60"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? "Generating…" : "Generate board"}
            </button>
          </header>
          {errorMessage && (
            <p className="mt-3 rounded border border-[hsl(var(--colour-conflict))]/40 bg-[hsl(var(--colour-conflict)/0.1)] px-3 py-2 text-xs text-[hsl(var(--colour-conflict))]">
              {errorMessage}
            </p>
          )}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {board.map((cell) => (
              <div
                key={cell.palace}
                className="flex h-32 flex-col items-center justify-center rounded border border-muted/40 bg-background/60 text-center text-sm"
              >
                <p className="text-xs uppercase text-muted">{cell.palace}</p>
                <p className="mt-1 font-semibold">{cell.star}</p>
                <p className="text-xs text-muted">{cell.door} • {cell.deity}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-muted/50 bg-white p-4 text-sm shadow-card dark:bg-slate-900">
          <h2 className="text-base font-semibold">Integration checklist</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Use <code>QMDJProvider.generateBoard</code> to populate each palace cell.</li>
            <li>Different schools should be logged via the <code>subsystem</code> field.</li>
            <li>
              Respect RNG controls for activation hours and record provenance in <code>notes</code>.
            </li>
          </ul>
        </div>
      </section>
    </SystemPageLayout>
  );
};

export default QmdjPage;
