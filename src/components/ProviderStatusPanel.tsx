"use client";

import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/store/useStore";

export const ProviderStatusPanel = () => {
  const { providerStatus, fetchProviderStatus, providerErrors, providerLoading } = useStore(
    useShallow((state) => ({
      providerStatus: state.providerStatus,
      fetchProviderStatus: state.fetchProviderStatus,
      providerErrors: state.providerErrors,
      providerLoading: state.providerLoading,
    })),
  );

  useEffect(() => {
    void fetchProviderStatus();
  }, [fetchProviderStatus]);

  return (
    <section className="rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Provider health</h2>
          <p className="text-xs text-muted">
            Register calculator providers via the registry API to unlock live data outputs.
          </p>
        </div>
        <button
          type="button"
          className="rounded-full border border-muted/50 px-3 py-1 text-xs font-semibold hover:border-transparent hover:bg-accent/10"
          onClick={() => fetchProviderStatus()}
          disabled={Object.values(providerLoading).some(Boolean)}
        >
          Refresh
        </button>
      </header>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {providerStatus.map((status) => (
          <article
            key={status.key}
            className="rounded border border-muted/40 bg-background/60 p-3 text-sm shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{status.name}</h3>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  status.registered
                    ? "bg-[hsl(var(--colour-positive)/0.12)] text-[hsl(var(--colour-positive))]"
                    : "bg-[hsl(var(--colour-conflict)/0.12)] text-[hsl(var(--colour-conflict))]"
                }`}
              >
                {status.registered ? "Registered" : "Missing"}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted">{status.description}</p>
            {!status.registered && (
              <p className="mt-2 text-xs text-[hsl(var(--colour-conflict))]">
                {status.errorHint}
              </p>
            )}
            {providerErrors[status.key] && (
              <p className="mt-2 text-xs text-[hsl(var(--colour-conflict))]">
                Error: {providerErrors[status.key]}
              </p>
            )}
          </article>
        ))}
        {providerStatus.length === 0 && (
          <p className="rounded border border-dashed border-muted/50 bg-background/60 p-3 text-sm text-muted">
            No provider metadata available yet. Ensure the API route responds and refresh.
          </p>
        )}
      </div>
    </section>
  );
};
