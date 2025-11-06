"use client";

import { useMemo, useState } from "react";
import { WarningBanner } from "@/components/WarningBanner";
import { SystemPageLayout } from "@/components/SystemPageLayout";
import { useStore } from "@/store/useStore";
import { createId } from "@/lib/id";

const featureOptions = ["Heart line", "Head line", "Life line", "Mount of Venus", "Mount of Jupiter"];

const PalmistryPage = () => {
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
      system: "Palmistry",
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
      notes: `privacy:local; annotation:${notes || "none"}`,
    });
    setNotes("");
  };

  return (
    <SystemPageLayout
      title="Palmistry log"
      description="Secure, local-only image placeholders with manual feature tagging. No diagnostic claims."
    >
      <WarningBanner
        title="No diagnostics"
        description="Palmistry annotations are recorded for personal reflection only. No medical, legal, or financial advice."
      />
      <section className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <div className="rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900">
          <label className="flex flex-col items-center justify-center rounded border border-dashed border-muted/60 bg-background/60 p-6 text-sm font-semibold text-muted">
            {hasImage ? "Replace image" : "Select palm image (stored locally)"}
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
                alt="Palm preview"
                className="mt-4 max-h-72 w-full rounded object-contain"
              />
            </>
          )}
          <p className="mt-3 text-xs text-muted">
            Images are not uploaded: they remain in your browser session. Clear or refresh to remove.
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
              placeholder="Ridge pattern, marking, etc."
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

export default PalmistryPage;



