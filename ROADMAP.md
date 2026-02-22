# MetaMap Roadmap

Last updated: 2026-02-22

## Current State
- Project health: stable and deployable.
- Quality gates: `type-check`, `lint`, unit tests, E2E tests, and production dependency audit are passing.
- Runtime hardening: environment validation, request limits, origin checks, rate limiting, security headers, request IDs, structured logs, and uptime workflow are implemented.
- Deployment readiness: Docker standalone runtime is aligned (port + healthcheck), CI workflows are active, and documentation covers required env setup.

## Progression So Far

### Phase 1: Core Product Build (Completed)
- Built multi-system UI and dataset workflow (import, normalize, filter, visualize, export).
- Implemented provider registry and API surface for system computations.
- Added key system pages: WA/HA, BaZi, QMDJ, FS, HD, GK, ZWDS, Numerology, IChing, Tarot, Geomancy, Palmistry, MianXiang, JA.

### Phase 2: Production Hardening (Completed)
- Fixed standalone runtime and SSR hydration gaps.
- Removed forced ephemeris stubbing and enabled production-safe native module handling.
- Added robust `/api/health` versioning and telemetry.
- Added runtime env contract validation with production fail-fast behavior.
- Added API protections:
  - payload size limits
  - content-type enforcement
  - same-origin/allowlist origin checks
  - per-IP rate limiting
  - request ID propagation
- Added CI quality matrix and scheduled uptime checks.
- Added security/dependency maintenance baseline (`npm audit --omit=dev`, Dependabot config).

### Phase 3: Regression Coverage (Completed)
- Added tests for:
  - runtime env validation edge cases
  - HTTP/origin/body-limit helpers
  - rate limiter behavior
  - provider route security responses (403/413/415/429)

## What Is Left To Build Out

### Priority A: Provider Maturity (Next)
- Replace demo/placeholder provider logic with licensed or production-grade engines where required.
- Finalize integration depth for systems that still intentionally emit `UNKNOWN` placeholders for interpretation workflows.
- Add explicit provider capability matrix in docs (production-grade vs demo vs placeholder).

### Priority B: Operational Readiness (Next)
- Configure real production values:
  - `ALLOWED_ORIGINS`
  - uptime and error alert webhooks
  - optional Swiss Ephemeris/JPL licensed paths/keys
- Add dashboards/alerts around API error rates and 429 rates.
- Add rollout checklist for each environment (staging -> production).

### Priority C: Security and Compliance (Near Term)
- Add integration tests for origin allowlist and rate limiting in a deployed-like environment (reverse proxy headers).
- Add threat-model notes for public API exposure and abuse handling.
- Add secret-scanning + branch protection guidance to repo docs.

### Priority D: Product Enhancements (Backlog)
- Expand system-specific UX and explainability for interpreted outputs.
- Improve data provenance and confidence workflows at row level.
- Add richer admin/ops views for provider health and SLA tracking.

## Exit Criteria for “Fully Production Complete”
- All required production providers integrated (or clearly scoped as intentional placeholders).
- Runtime secrets and domain allowlists configured in target deployment.
- Uptime + error alerting wired and validated with test incidents.
- CI checks required on protected branches with green baseline.
- Runbook available for deploy, rollback, and incident response.
