"use client";

import { useRef, useState } from "react";

export const HowItWorksModal = () => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [open, setOpen] = useState(false);

  const openDialog = () => {
    if (!dialogRef.current) return;
    dialogRef.current.showModal();
    setOpen(true);
  };

  const closeDialog = () => {
    if (!dialogRef.current) return;
    dialogRef.current.close();
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="rounded-full border border-muted/50 px-3 py-1 text-xs font-semibold hover:border-accent/60 hover:bg-accent/10"
      >
        How it works
      </button>
      <dialog
        ref={dialogRef}
        className="max-w-xl rounded-lg border border-muted/60 bg-background p-6 text-sm shadow-xl backdrop:bg-black/40"
        aria-labelledby="how-it-works-heading"
        onClose={() => setOpen(false)}
      >
        <h2 id="how-it-works-heading" className="text-lg font-semibold">
          MetaMap Truth Standard
        </h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed">
          <p>
            MetaMap honours multiple self-modelling traditions without invention. Data rows use the
            normalised schema, and calculators that are not yet integrated display{" "}
            <code>UNKNOWN</code>. Proprietary or paid outputs are flagged via the <code>privacy</code>
            column (set to <code>paid</code>) so you can hide them as needed.
          </p>
          <p>
            VARIANT badges appear when configurable elements—such as the Jyotiṣa ayanāṃśa or Qi Men
            Dun Jia school—differ from the default settings. These flags help collaborators
            understand contextual differences quickly.
          </p>
          <p>
            Plug-ins (Swiss Ephemeris, Chinese calendar providers, Human Design engines, and beyond)
            connect through typed interfaces. Until you wire a provider, dashboards show placeholders
            and warning banners to avoid speculative results.
          </p>
          <p className="rounded bg-[hsl(var(--colour-banner))] px-3 py-2 text-xs font-semibold text-foreground">
            Disclaimer: No medical, legal, or financial advice. Cultural systems are shown
            respectfully, and outcomes are not certainties.
          </p>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={closeDialog}
            className="rounded-full border border-muted/50 px-4 py-2 text-sm font-semibold hover:border-accent/60 hover:bg-accent/10"
          >
            Close
          </button>
        </div>
      </dialog>
      {open && <div className="pointer-events-none fixed inset-0 backdrop-blur-sm" aria-hidden="true" />}
    </>
  );
};
