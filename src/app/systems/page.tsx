"use client";

import Link from "next/link";
import { useStore } from "@/store/useStore";
import { SystemCards } from "@/components/SystemCards";

const SystemsIndexPage = () => {
  const birthDetails = useStore((state) => state.birthDetails);
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">System dashboards</h1>
          <p className="text-sm text-muted">
            Select a tradition to configure its plug-ins, note VARIANT settings, or enter manual
            observations.
          </p>
        </div>
        <Link href="/" className="text-sm font-semibold text-accent hover:underline">
          ← Back to overview
        </Link>
      </header>
      <SystemCards birthDetails={birthDetails} />
    </main>
  );
};

export default SystemsIndexPage;
