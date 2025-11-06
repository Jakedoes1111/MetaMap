"use client";

import { useMemo, useState } from "react";
import { DateTime } from "luxon";
import { WarningBanner } from "@/components/WarningBanner";
import { SystemPageLayout } from "@/components/SystemPageLayout";
import { useStore } from "@/store/useStore";
import { computeLifePath } from "@/lib/numerology";

const nakshatraList = [
  "Aśvinī",
  "Bharanī",
  "Kṛttikā",
  "Rohiṇī",
  "Mṛgaśīrṣa",
  "Ārdrā",
  "Punarvasu",
  "Puṣya",
  "Āśleṣā",
  "Maghā",
  "Pūrva Phalgunī",
  "Uttara Phalgunī",
  "Hasta",
  "Chitrā",
  "Svātī",
  "Viśākhā",
  "Anurādhā",
  "Jyeṣṭhā",
  "Mūla",
  "Pūrva Aṣāḍhā",
  "Uttara Aṣāḍhā",
  "Śravaṇā",
  "Dhaniṣṭhā",
  "Śatabhiṣā",
  "Pūrva Bhādrapadā",
  "Uttara Bhādrapadā",
  "Revatī",
];

const ayanamsaVariants = ["Lahiri", "Krishnamurti", "Raman", "Fagan/Bradley", "Yukteswar"];

const JaPage = () => {
  const { birthDetails, setBirthDetails } = useStore((state) => ({
    birthDetails: state.birthDetails,
    setBirthDetails: state.setBirthDetails,
  }));

  const [selectedNakshatra, setSelectedNakshatra] = useState<string | null>(null);

  const variantNote = useMemo(
    () =>
      birthDetails.ayanamsa !== "Lahiri"
        ? `VARIANT: ${birthDetails.ayanamsa} ayanāṃśa selected`
        : null,
    [birthDetails.ayanamsa],
  );

  const placeholderDashas = useMemo(() => {
    const lifePath = computeLifePath(birthDetails.birthDate);
    return [
      { sequence: "Mahādashā", lord: "UNKNOWN", start: "UNKNOWN", finish: "UNKNOWN" },
      {
        sequence: "Seeded example",
        lord: "Birth number influence",
        start: lifePath.compound.toString(),
        finish: lifePath.reduced.toString(),
      },
    ];
  }, [birthDetails.birthDate]);

  return (
    <SystemPageLayout
      title="Jyotiṣa (Ja)"
      description="Configure ayanāṃśa variants and review dashā placeholders. Calculations remain UNKNOWN until a provider is attached."
    >
      <WarningBanner
        title="UNKNOWN"
        description="Nakṣatra and dashā values require an ephemeris-backed Jyotiṣa calculator. Until then, MetaMap records UNKNOWN without fabricating results."
      />
      {variantNote && (
        <div className="rounded bg-[hsl(var(--colour-conflict)/0.12)] px-4 py-2 text-xs font-semibold text-[hsl(var(--colour-conflict))]">
          {variantNote}
        </div>
      )}
      <section className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
        <div className="rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900">
          <h2 className="text-base font-semibold">Nakṣatra finder (stub)</h2>
          <p className="text-xs text-muted">
            Select a nakṣatra to log a placeholder row. Once a provider is connected, this interface
            will resolve the lunar mansion based on the Moon&apos;s sidereal longitude.
          </p>
          <div className="mt-4 grid gap-3">
            <label className="text-sm font-semibold">
              Ayanāṃśa variant
              <select
                className="mt-1 w-full rounded border border-muted/60 bg-background p-2 text-sm"
                value={birthDetails.ayanamsa}
                onChange={(event) => setBirthDetails({ ayanamsa: event.target.value })}
              >
                {ayanamsaVariants.map((variant) => (
                  <option key={variant} value={variant}>
                    {variant}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Nakṣatra
              <select
                className="mt-1 w-full rounded border border-muted/60 bg-background p-2 text-sm"
                value={selectedNakshatra ?? ""}
                onChange={(event) => setSelectedNakshatra(event.target.value || null)}
              >
                <option value="">Select...</option>
                {nakshatraList.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={!selectedNakshatra}
              className="rounded-full bg-[hsl(var(--colour-accent))] px-4 py-2 text-sm font-semibold text-white shadow disabled:bg-muted disabled:text-muted"
            >
              Log UNKNOWN nakṣatra row
            </button>
            <p className="rounded bg-[hsl(var(--colour-banner))] px-3 py-2 text-xs text-muted">
              Logging will add a dataset row with <code>verbatim_text=&quot;UNKNOWN&quot;</code> and
              <code>notes=&quot;TODO: integrate calculator&quot;</code>. Replace once you connect a provider.
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-muted/50 bg-white p-4 text-sm shadow-card dark:bg-slate-900">
          <h2 className="text-base font-semibold">Dashā preview</h2>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-muted">
                <th className="pb-2">Sequence</th>
                <th className="pb-2">Lord</th>
                <th className="pb-2">Start</th>
                <th className="pb-2">Finish</th>
              </tr>
            </thead>
            <tbody>
              {placeholderDashas.map((dashā) => (
                <tr key={dashā.sequence} className="border-t border-muted/30">
                  <td className="py-2 font-medium">{dashā.sequence}</td>
                  <td className="py-2">{dashā.lord}</td>
                  <td className="py-2">{dashā.start}</td>
                  <td className="py-2">{dashā.finish}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="rounded-lg border border-muted/50 bg-white p-4 text-sm shadow-card dark:bg-slate-900">
        <h2 className="text-base font-semibold">Notes for integrators</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>Use the EphemerisProvider interface to retrieve sidereal lunar longitude.</li>
          <li>
            Tag paid services with <code>notes:&quot;privacy:paid&quot;</code> and expose toggles in the UI.
          </li>
          <li>Provide multiple school variants (Parāśara, KP, Jaimini) by extending subsystem.</li>
        </ul>
        <p className="mt-3 text-xs text-muted">
          Birth date preview:{" "}
          {DateTime.fromISO(`${birthDetails.birthDate}T${birthDetails.birthTime}`, {
            zone: birthDetails.timezone,
          }).toFormat("d LLL yyyy HH:mm ZZZZ")}
        </p>
      </section>
    </SystemPageLayout>
  );
};

export default JaPage;
