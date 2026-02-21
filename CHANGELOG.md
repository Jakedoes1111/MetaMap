# Changelog

All notable changes to this project are documented in this file.

## [0.2.0] - 2026-02-21

### Added
- Added `GET /api/health` for runtime/container health checks.
- Added production CI pipeline with `type-check`, lint, unit tests, build, and Playwright E2E.
- Added `.env.example` with provider/runtime configuration defaults.
- Added `vercel.json` deployment target configuration.

### Changed
- Upgraded Next.js to `16.1.6` and aligned `eslint-config-next`.
- Hardened Docker image to standalone output, non-root runtime user, and healthcheck probes.
- Converted unstable object-shaped Zustand selectors to shallow selectors in client routes/components.
- Updated Playwright config to auto-start the app (`webServer`) for both local and CI runs.
- Stabilized E2E import/export fixture and download handling.

### Fixed
- Fixed hydration mismatch caused by server/client `hasHydrated` initial state divergence.
- Fixed CSV/JSON parsing to normalize blank timing fields to `null` and trim key enum inputs.
- Removed external Google font dependency from app layout to avoid build-time network coupling.

### Security
- Production dependency audit now reports `0` vulnerabilities (`npm audit --omit=dev`).
