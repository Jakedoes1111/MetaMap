## MetaMap

MetaMap is a TypeScript + React (Next.js 14 App Router) web application for exploring multiple self-model systems (astrology, human design, numerology, and more) using a single normalised dataset. It emphasises verifiable inputs, configurable weighting, and secure placeholders while you integrate proprietary calculators.

### Highlights

- ✅ **Normalised schema** enforced via Zod with CSV/JSON import/export.
- ✅ **Visualisations** (timeline, compass, network, heatmap) powered by D3 and CSS variable palettes.
- ✅ **Adjustable weights** (default HD 0.6, GK 0.5, others 1.0) stored in localStorage.
- ✅ **RNG tools** for I Ching, Tarot, and Geomancy using `crypto.getRandomValues`.
- ✅ **Live calculator demos** for ephemeris, Chinese calendar, Zi Wei Dou Shu, Qi Men Dun Jia, Feng Shui, Human Design, and Gene Keys.
- ✅ **Plug-in ready calculators** with TypeScript interfaces under `src/calculators`.
- ✅ **Accessibility & responsiveness** (WCAG AA focus styles, prefers-reduced-motion support).

---

## Getting started

```bash
npm ci --ignore-scripts
npx playwright install --with-deps   # optional: required for Playwright e2e
npm run dev
```

Open http://localhost:3010 and confirm the “MetaMap” overview loads.

### Scripts

| Command              | Description                                           |
|----------------------|-------------------------------------------------------|
| `npm run dev`        | Start the Next.js development server                  |
| `npm run build`      | Production build                                      |
| `npm run start`      | Start production build                                |
| `npm run lint`       | ESLint (TypeScript + React + jsx-a11y)                |
| `npm run test`       | Vitest unit tests with jsdom                          |
| `npm run test:ci`    | Vitest with coverage                                  |
| `npm run test:e2e`   | Playwright E2E (expects `npm run dev` in another tab) |
| `npm run format`     | Prettier                                               |

Docker users can run `docker compose up --build` for a Node 20 Alpine environment.

### Provider registry

The app ships with demo providers for Ephemeris, Chinese calendar, Zi Wei Dou Shu, Qi Men Dun Jia, Feng Shui, Human Design, and Gene Keys when `NEXT_PUBLIC_ENABLE_DEMO_PROVIDERS=true` (enabled by default in non-production). Register licensed providers by calling `registerProvider` in `src/providers/bootstrap.ts` or supplying your own bootstrap module. Production builds should disable the demo flag.

### Testing in CI

Vitest covers utilities, provider APIs, and core components. In headless environments run:

```bash
npm ci --ignore-scripts
npx vitest run
```

Playwright end-to-end specs are optional; install browsers first with `npx playwright install --with-deps`.

---

## Data schema

Schema lives in `src/schema.ts` (Zod + inferred TypeScript types). CSV column order:

```
person_id,birth_datetime_local,birth_timezone,system,subsystem,
source_tool,source_url_or_ref,data_point,verbatim_text,category,
subcategory,direction_cardinal,direction_degrees,timing_window_start,
timing_window_end,polarity,strength,confidence,weight_system,privacy,
provenance,notes
```

Core enum sets: `System`, `Category`, `DirectionCardinal`, `Polarity`. Validation rules:

- ISO 8601 datetime strings, closed intervals only (`start <= end`).
- `direction_degrees` integer 0–359; auto-derives cardinal if missing.
- `strength` integer −2…+2, `confidence` between 0…1.
- `weight_system > 0` (defaults: HD 0.6, GK 0.5, others 1.0).
- `privacy` values: `public`, `internal`, `paid`. Use `provenance` to track provider+timestamp metadata.
- Timezone must be an IANA tzdb identifier.

Utility helpers (`src/lib`) cover intervals, direction mapping, CSV serialization, deduplication, and numerology math.

---

## Import & export

1. Prepare CSV or JSON matching the schema header.
2. Use the **Import data** panel on the overview (`/`) to append or replace rows. Zod validates every line and surfaces row-level errors.
3. **Export data** downloads the currently filtered dataset to CSV/JSON, maintaining schema ordering and ISO timestamps.

Sample starter file lives at `public/sample.csv` with representative rows spanning natal astrology, Jyotiṣa, Feng Shui, BaZi, Qi Men Dun Jia, Human Design, Gene Keys, numerology, and Tarot—including entries flagged with `privacy=paid` and `privacy=internal` for filter testing.

---

## Calculators & plug-ins

Interfaces live in `src/calculators/`:

- `EphemerisProvider` – Swiss Ephemeris/JPL-compatible natal positions.
- `ChineseCalendarProvider` – BaZi pillars, luck cycles, sexagenary conversions.
- `ZWDSProvider`, `QMDJProvider`, `FSProvider`, `HDProvider`, `GKProvider`.

Inject your implementation into the relevant system route (under `app/systems/**`). When a provider is absent, UI components surface `UNKNOWN` banners. Mark paid or private sources by setting the `privacy` field to `paid` or `internal` so collaborators can filter them out.

Until a calculator is integrated, MetaMap never invents WA/HA/JA/BaZi/ZWDS/QMDJ/FS/HD/GK results—only deterministic math (e.g., numerology) is pre-filled.

---

## Truth standard & privacy

- **No invention:** UNKNOWN placeholders remain until verified calculators are connected.
- **VARIANT flags:** Displayed whenever settings deviate from defaults (e.g., non-Lahiri ayanāṃśa).
- **Local media only:** Palmistry and Miàn Xiàng uploads stay in the browser.
- **Disclaimers:** “No medical, legal or financial advice. Cultural systems shown respectfully; outcomes are not certainties.”

Relevant references:

- [IANA tzdb](https://www.iana.org/time-zones) for timezone validation.
- [Swiss Ephemeris documentation](https://www.astro.com/swisseph/) (licensing applies).
- [Hong Kong Observatory Chinese Calendar](https://www.hko.gov.hk/en/gts/time/calendar_info.htm) for BaZi derivations.

---

## Testing

- **Unit tests:** `vitest` under `tests/*.test.ts`.
- **E2E:** Playwright spec in `tests/e2e/roundtrip.spec.ts` checks CSV import/export. Start the dev server separately (`npm run dev`) before running `npm run test:e2e`.

---

## Project structure

```
app/                    # Next.js App Router routes
  timeline/             # Timeline Gantt view
  compass/              # Direction compass view
  overlap/              # Network overlap view
  systems/...           # System dashboards (WA/HA, JA, BaZi, etc.)
src/
  components/           # Reusable UI pieces & visualisations
  lib/                  # Utilities (time, direction, CSV, numerology, filters, stats)
  calculators/          # Provider interfaces (stubs)
  store/                # Zustand state with persistence
  schema.ts             # Normalisation spec (Zod + types)
tests/                  # Vitest unit tests + Playwright e2e
```

---

## Licensing

Released under the [MIT License](LICENSE). Review third-party calculator licenses before integration; annotate privacy notes where required.
