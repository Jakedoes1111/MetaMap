# MetaMap Completion Plan

This document captures the implementation roadmap for finishing the MetaMap Next.js application. It is written for the follow‑up engineer who will execute the work. Each phase is ordered; complete the tasks in the sequence listed whenever dependencies allow.

---

## 1. Current State Snapshot

- **Working features:** CSV/JSON import & export (Zod validated), weighted dataset store persisted via Zustand, overview dashboard (heatmap, compass, timeline), RNG tooling (Tarot, I Ching, Geomancy), numerology calculator, filter controls, system dashboard scaffolds.
- **Tech stack:** Next.js App Router (`src/app/*`), React 19 client components, TypeScript strict, TailwindCSS, Zustand (persist in localStorage), Luxon, D3, Vitest + Playwright, Docker (Node 20 Alpine).
- **Data shape:** enforced by `src/schema.ts` (Zod). Normalisation pipeline (`src/lib/normalise.ts`) dedupes rows, applies cardinal directions, flags conflicts. Default dataset is numerology-only placeholders.
- **Outstanding gaps:** Most system dashboards show `UNKNOWN` placeholders because calculator providers are not implemented. Some routes/components contain TODO notes (Ephemeris, Chinese calendar, etc). `src/app/systems/bazi/page.tsx` is missing (a copy exists in `bazi - Copy`). Hydration hook contains escaped `\n` artifacts. Seed/test data sparse.

---

## 2. Immediate Fixes & Hygiene (Phase 0 – before feature work)

1. **Restore BaZi route**
   - Move `src/app/systems/bazi - Copy/page.tsx` to `src/app/systems/bazi/page.tsx`.
   - Delete the stray `bazi - Copy` directory once moved.
   - Smoke-test `/systems/bazi`.

2. **Fix hydration hook artefacts**
   - Clean `src/hooks/useStoreHydration.ts` so the `useEffect` body uses real newlines (remove literal `\n` text).
   - Verify client hydration works (dataset persists across reloads).

3. **Git hygiene**
   - Add `/test-results/` and `/.next/` to `.gitignore` if Playwright output is meant to stay local.
   - Remove already-generated `.next/` and `test-results/` directories from the repo history/worktree (delete locally; do not commit generated artefacts).

4. **Enrich sample data**
   - Populate `public/sample.csv` with 3–5 representative rows covering different systems, directions, timing windows, and `privacy:paid` note usage.
   - Update README import instructions to reference the richer sample.

5. **Add basic smoke tests**
   - Extend existing Vitest/RTL coverage for `DataImporter`, `Timeline`, `Compass` (snapshot/behavioural tests) to protect refactors.

Estimated effort: ~1 day.

---

## 3. Core Goals for Completion

- Integrate real calculator providers for each `UNKNOWN` system (ephemeris, Chinese calendar, Zi Wei Dou Shu, Qi Men Dun Jia, Feng Shui, Human Design, Gene Keys).
- Persist calculator outputs into the dataset via a consistent interface (with provenance, subsystem tagging, `privacy:paid` annotations).
- Provide UI feedback states (loading, error, variant indicators) once real data is produced.
- Expand testing to cover calculators, normalisation edge cases, and E2E flows.
- Prepare deployment artefacts (Docker image, CI pipeline) and documentation for operators/users.

---

## 4. Work Breakdown Structure

### Phase 1 – Data & Store Enhancements

1. **Introduce Provider Context**
   - Create `src/providers/ProviderRegistry.ts` exporting functions to register concrete calculators (EphemerisProvider, ChineseCalendarProvider, etc).
   - At build/startup, detect available providers (env-based or dynamic import). Fall back to stubs that reject with descriptive errors.
   - Expose async helpers (e.g. `getEphemerisProvider()`).

2. **Server execution layer**
   - Add `/src/app/api/providers/*` route handlers or server actions that invoke providers with birth details, returning structured payloads. Keep heavy libraries server-side.
   - Handle rate limiting, caching (optional), and error translation (`UNKNOWN` fallback with actionable messages).

3. **Zustand store upgrades**
   - Extend `MetaMapStore` with async actions like `computeSystemData(system: System)`.
   - When recalculating numerology seed rows or provider outputs, ensure `reweight` runs.
   - Add ability to mark rows as `pending` or `error` for UI messaging (possibly via separate metadata map keyed by row id/system).

4. **Config persist**
   - Move calculator-specific settings (e.g. Ayanāṃśa, FS period, QMDJ school) into store slices so provider requests can reference persisted choices.
   - Ensure `persist` partialization covers new slices without storing transient loading flags.

5. **Validation enhancements**
   - Augment `parseCsv/parseJson` to surface row-level warnings (e.g. auto-clamped strength, defaulted weights).
   - Update `normaliseRows` to better merge conflicting notes (avoid duplicate `merged:` tags).

### Phase 2 – Calculator Integrations

> Implement in sub-phases; each follows the pattern: choose library/API → wrap in provider interface → add API route → connect UI → write tests.

#### 2.1 Ephemeris (WA/HA & JA)
1. Choose an ephemeris source (e.g. **Swiss Ephemeris** via `swisseph` npm module, license permitting).
2. Implement `src/providers/ephemeris/SwissEphemerisProvider.ts` fulfilling `EphemerisProvider`.
3. Update WA/HA page to request positions (houses, ASC/MC) and render actual wheel segments. Use Canvas/SVG to show planets.
4. Enhance JA page to compute nakṣatra (Moon sidereal longitude) and populate dashā sequences (Parāśara default). Honour ayanāṃśa selection.
5. Log outputs into dataset with proper categories/subsystems (e.g. `Nakshatra`, `Mahadasha`).
6. Tests: unit test provider math (mock ephemeris), integration tests for `ensureClosedInterval` with provider outputs, Playwright scenario verifying WA/HA displays data when provider available.

#### 2.2 Chinese Calendar (BaZi)
1. Select library (e.g. `@lunisolar/lunar` or integrate HKO API if licensing ok).
2. Implement `ChineseCalendarProvider` to compute four pillars + decadal luck pillars.
3. Update BaZi page: show stems/branches, add “Regenerate” button reading gender/timezone from store.
4. Persist rows per pillar (`system: "BaZi"`, `category: "Timing"` or `Guidance` as appropriate).
5. Tests: provider deterministic outputs; UI snapshot verifying pillars render; dataset logs appended.

#### 2.3 Zi Wei Dou Shu (ZWDS)
1. Integrate or wrap an existing library (if none, define algorithm placeholder with stub data but mark to plug licensed provider).
2. Implement `ZWDSProvider.computeChart`.
3. Update page to render stars per palace, highlight conflicts, allow variant selection.
4. Persist results with subsystem = school, notes containing star list.
5. Add fallback message when provider absent.

#### 2.4 Qi Men Dun Jia (QMDJ)
1. Identify provider (maybe open-source calculators exist; otherwise design stub hooking to external API).
2. Implement board generation; support hour/day toggle and school variant.
3. Add UI loading indicator and ability to log board snapshot into dataset (one row per palace or aggregated? decide; prefer per-palace entries).

#### 2.5 Feng Shui (FS)
1. Implement `FSProvider` for Flying Stars + Eight Mansions. Could use open-source formulas.
2. Update FS page to display real star numbers, base/per period star. Add ability to export to dataset.
3. Align Life Gua calculation with provider results to avoid duplication.

#### 2.6 Human Design (HD)
1. Integrate BodyGraph provider (likely requires 3rd-party API: Jovian Archive, Genetic Matrix). Respect licensing; add `privacy:paid`.
2. Update UI to show defined centres, type, authority. Consider dynamic SVG.
3. Since data may be sensitive/licensed, gate behind configuration flag.

#### 2.7 Gene Keys (GK)
1. Implement provider computing spheres & lines, ideally piggyback on HD gate data.
2. Display sequences with gating data; allow export into dataset.

For each provider:
- Add error handling UI (toast or inline) when API fails. Provide manual “Log UNKNOWN placeholder” fallback.
- Ensure dataset rows include `source_tool` describing provider and include `privacy:` notes where applicable.
- Update README with integration instructions, required env vars/API keys, licensing disclaimers.

### Phase 3 – UI & UX Enhancements

1. **Loading & error states**
   - Introduce shared components (`<SystemLoader>`, `<SystemError notice>`) to show while provider responses pending/failed.
   - Add skeleton placeholders to major visualisations when dataset empty but request in-flight.

2. **Conflict visual cues**
   - In `DatasetList` and `Timeline`, add icons for `merged_from` and `conflict_set`.
   - Provide tooltip summarising merge/conflict provenance.

3. **Accessibility & internationalisation**
   - Audit components with axe; ensure forms have labels, ARIA attributes.
   - Externalise user-facing strings to a constants file to prepare for translations (even if only en-AU now).

4. **Responsive tuning**
   - Improve timeline/compass readability on mobile (reduce min width, adjust font sizes).
   - Add “Quick export” button in header for small screens.

5. **Documentation surface**
   - Add `/docs` route or in-app modal summarising schema, provider availability, privacy policy.

### Phase 4 – Testing & Quality Assurance

1. **Unit tests**
   - Cover new provider adapters with deterministic fixtures.
   - Test store actions (mock providers, ensure dataset updates & weights recalc).
   - Add tests for `applyFilters` edge cases (conflict only, hide privacy).

2. **Integration tests**
   - With Vitest + MSW or similar to mock API routes, verify UI flows (e.g., hitting “Compute BaZi” updates dataset and heatmap).

3. **Playwright scenarios**
   - Extend `tests/e2e` to cover timeline navigation, provider toggles, RNG flows.
   - Add accessibility snapshot (axe-core integration) if feasible.

4. **Performance baseline**
   - Measure initial load (Lighthouse). Optimise bundling (code-splitting heavy SVG libs, memoisation).

5. **Static analysis**
   - Ensure `npm run lint` and `npm run test` run in CI. Consider `tsc --noEmit` check (currently Next handles TS).

### Phase 5 – DevOps & Release

1. **Environment configuration**
   - Document required env vars (API keys, provider endpoints) in `.env.example`.
   - Update Dockerfile/docker-compose to inject secrets securely.

2. **CI pipeline**
   - Configure GitHub Actions (or equivalent) to run lint, test, build, Playwright (headed false) on push/PR.
   - Cache npm dependencies, reuse Playwright browsers via `npx playwright install-deps`.

3. **Deployment**
   - Decide hosting (Vercel vs self-host). For Vercel, review Next 16 compatibility.
   - Provide `npm run build && npm run start` instructions in README; include container build instructions.

4. **Monitoring**
   - Integrate error monitoring (Sentry/LogRocket) behind env flag.
   - Add simple health check route `/api/health`.

5. **Release checklist**
   - Write release notes template covering provider availability, licensing notes, testing evidence.

---

## 5. Implementation Notes & Risks

- **Licensing:** Several providers (Swiss Ephemeris, HD, GK) may require paid licenses. Honour `privacy:paid` flags and document limitations.
- **Timezones:** Ensure providers operate with consistent timezone conversions. Prefer using Luxon `DateTime` objects across server and client.
- **Performance:** Heavy libraries (ephemeris) should stay server-side; client components should fetch via API to avoid bloating bundles.
- **Security:** Sanitise inputs coming from dataset (notes may contain user text). When exporting, guard against CSV injection (prefix `'` if first char is `=`, `+`, etc.).
- **Determinism:** RNG features rely on `crypto.getRandomValues` which differs between Node and browser—limit RNG usage to client to avoid hydration mismatches.
- **Hydration:** After fixing `useStoreHydration`, confirm persisted state doesn’t cause React 19 warnings (`useSyncExternalStore` would be ideal long-term).

---

## 6. Suggested Workflow for the Next Engineer

1. Checkout a fresh branch (`feature/providers-phase1`).
2. Execute Phase 0 fixes, open PR for quick review.
3. For each provider integration, create dedicated feature branches (e.g. `feature/ephemeris-wa`), merge sequentially.
4. After each phase, run `npm run lint && npm run test`. For UI changes, run `npm run test:e2e`.
5. Keep README and docs updated as integrations land.
6. Prior to release, produce a final QA report (test matrix, Lighthouse numbers, outstanding TODOs).

---

## 7. Verification Commands

```bash
# Install deps
npm install

# Type, lint, unit tests
npm run lint
npm run test

# Build & serve
npm run build
npm run start

# Playwright (start dev server in another terminal)
npm run dev
npm run test:e2e
```

Keep this file updated if the roadmap shifts.

