"use client";

import { useMemo, useState } from "react";
import { WarningBanner } from "@/components/WarningBanner";
import { SystemPageLayout } from "@/components/SystemPageLayout";
import { useStore } from "@/store/useStore";
import { createId } from "@/lib/id";

const featureOptions = ["Forehead (career)", "Eyebrows (siblings)", "Eyes (spirit)", "Nose (wealth)", "Mouth (relationships)"];

const MianXiangPage = () => {
  const appendRow = useStore((state) => state.appendRow);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [feature, setFeature] = useState(featureOptions[0]);
  const [notes, setNotes] = useState("");

  const hasImage = useMemo(() => Boolean(imagePreview), [imagePreview]);

  const handleFile = (file: File | null) => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    if (!file) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const logFeature = () => {
    const now = new Date().toISOString();
    appendRow({
      id: createId(),
      person_id: "default-person",
      birth_datetime_local: now,
      birth_timezone: "UTC",
      system: "MianXiang",
      subsystem: "Manual observation",
      source_tool: "Local upload",
      source_url_or_ref: "",
      data_point: feature,
      verbatim_text: "UNKNOWN",
      category: "Guidance",
      subcategory: "Observation",
      direction_cardinal: "",
      direction_degrees: null,
      timing_window_start: now,
      timing_window_end: now,
      polarity: "0",
      strength: 0,
      confidence: 0.4,
      weight_system: 1,
      privacy: "internal",
      provenance: "local:mianxiang",
      notes: `annotation:${notes || "none"}`,
    });
    setNotes("");
  };

  return (
    <SystemPageLayout
      title="Miàn Xiàng face map"
      description="Local-only face mapping tool for cultural facial feature tracking. No diagnostic outcomes."
    >
      <WarningBanner
        title="No diagnostics"
        description="Face annotations remain private to your browser session. Interpretations are not generated."
      />
      <section className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <div className="rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900">
          <label className="flex flex-col items-center justify-center rounded border border-dashed border-muted/60 bg-background/60 p-6 text-sm font-semibold text-muted">
            {hasImage ? "Replace image" : "Select face image (stored locally)"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
            />
          </label>
          {imagePreview && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Face preview"
                className="mt-4 max-h-72 w-full rounded object-contain"
              />
            </>
          )}
          <p className="mt-3 text-xs text-muted">
            Images never leave this device. Refresh the page to clear the preview.
          </p>
        </div>
        <div className="rounded-lg border border-muted/50 bg-white p-4 text-sm shadow-card dark:bg-slate-900">
          <h2 className="text-base font-semibold">Annotate feature</h2>
          <label className="mt-3 block text-sm font-semibold">
            Feature
            <select
              className="mt-1 w-full rounded border border-muted/60 bg-background p-2 text-sm"
              value={feature}
              onChange={(event) => setFeature(event.target.value)}
            >
              {featureOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="mt-3 block text-sm font-semibold">
            Notes
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="mt-1 w-full rounded border border-muted/60 bg-background p-2 text-sm"
              rows={4}
              placeholder="e.g. mole position, tone"
            />
          </label>
          <button
            type="button"
            onClick={logFeature}
            className="mt-4 w-full rounded-full bg-[hsl(var(--colour-accent))] px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-90"
          >
            Log observation
          </button>
        </div>
      </section>
    </SystemPageLayout>
  );
};

export default MianXiangPage;

