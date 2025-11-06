"use client";

import { useMemo, useState } from "react";
import { WarningBanner } from "@/components/WarningBanner";
import { SystemPageLayout } from "@/components/SystemPageLayout";
import { useStore } from "@/store/useStore";

const periods = Array.from({ length: 9 }, (_, index) => index + 1);

const floorGrid = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "Centre"];

const computeLifeGua = (year: number, gender: "female" | "male" | "unspecified") => {
  const yearDigits = year
    .toString()
    .split("")
    .reduce((acc, digit) => acc + Number(digit), 0);
  const reduce = (value: number): number => {
    let result = value;
    while (result > 9) {
      result = result
        .toString()
        .split("")
        .reduce((acc, digit) => acc + Number(digit), 0);
    }
    return result;
  };
  const base = reduce(yearDigits);
  if (gender === "unspecified") return "UNKNOWN";
  if (gender === "male") {
    const gua = 10 - base;
    return gua === 5 ? "2" : gua.toString();
  }
  const gua = base + 5;
  const reduced = gua > 9 ? gua - 9 : gua;
  return reduced === 5 ? "8" : reduced.toString();
};

const FsPage = () => {
  const birthDetails = useStore((state) => state.birthDetails);
  const [period, setPeriod] = useState(8);
  const [facing, setFacing] = useState<number | null>(null);
  const [gender, setGender] = useState<"female" | "male" | "unspecified">("unspecified");

  const lifeGua = useMemo(() => {
    const year = Number(birthDetails.birthDate.split("-")[0]);
    if (Number.isNaN(year)) return "UNKNOWN";
    return computeLifeGua(year, gender);
  }, [birthDetails.birthDate, gender]);

  return (
    <SystemPageLayout
      title="Feng Shui (Flying Stars & Eight Mansions)"
      description="Configure Flying Star placeholders and compute Life Gua values. Awaiting FSProvider for live calculations."
    >
      <WarningBanner
        title="UNKNOWN"
        description="Flying Star coordinates require an FSProvider. Until available, cells remain UNKNOWN to avoid invented interpretations."
      />
      <section className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <div className="rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900">
          <header className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="inline-flex items-center gap-3">
              <label className="font-semibold">
                Period
                <select
                  className="ml-2 rounded border border-muted/60 bg-background p-1 text-sm"
                  value={period}
                  onChange={(event) => setPeriod(Number(event.target.value))}
                >
                  {periods.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="font-semibold">
                Facing°
                <input
                  type="number"
                  min={0}
                  max={359}
                  className="ml-2 w-20 rounded border border-muted/60 bg-background p-1 text-right text-sm"
                  value={facing ?? ""}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    setFacing(Number.isNaN(value) ? null : value);
                  }}
                />
              </label>
            </div>
          </header>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {floorGrid.map((label) => (
              <div
                key={label}
                className="flex h-28 flex-col items-center justify-center rounded border border-muted/40 bg-background/60 text-center"
              >
                <p className="text-xs uppercase text-muted">{label}</p>
                <p className="mt-1 text-sm font-semibold">UNKNOWN</p>
                <p className="text-xs text-muted">Period {period}</p>
              </div>
            ))}
          </div>
          {facing != null && (
            <p className="mt-3 text-xs text-muted">
              Facing marker: {facing}°. Update this after measuring the site.
            </p>
          )}
        </div>
        <div className="space-y-4">
          <div className="rounded-lg border border-muted/50 bg-white p-4 text-sm shadow-card dark:bg-slate-900">
            <h2 className="text-base font-semibold">Eight Mansions Life Gua</h2>
            <label className="mt-2 block text-sm font-semibold">
              Gender for calculation
              <select
                className="mt-1 w-full rounded border border-muted/60 bg-background p-2 text-sm"
                value={gender}
                onChange={(event) => setGender(event.target.value as typeof gender)}
              >
                <option value="unspecified">Select...</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </label>
            <p className="mt-3 rounded bg-background/60 p-3 text-sm">
              Life Gua: <span className="font-semibold">{lifeGua}</span>
            </p>
            <p className="text-xs text-muted">
              When integrating an FSProvider, write the computed gua number into the dataset with{" "}
              <code>system=&quot;FS&quot;</code> and <code>category=&quot;Direction&quot;</code>.
            </p>
          </div>
          <div className="rounded-lg border border-muted/50 bg-white p-4 text-sm shadow-card dark:bg-slate-900">
            <h2 className="text-base font-semibold">Integration notes</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Use <code>subsystem</code> to track Flying Star period (1-9).</li>
              <li>
                For paid calculators, append <code>notes:&quot;privacy:paid&quot;</code> so users can filter.
              </li>
              <li>Log conflict sets when facing/sitting outputs disagree across schools.</li>
            </ul>
          </div>
        </div>
      </section>
    </SystemPageLayout>
  );
};

export default FsPage;
