# Learning: Production Hardening Session (2026-02-22)

## Context
This session focused on taking MetaMap from feature-complete to production-ready by closing runtime, security, and operability gaps.

## Key Learnings

1. Native Node modules in Next.js/Turbopack need explicit externalization.
- `swisseph` must be treated as a server external package to avoid bundling/runtime resolution failures.
- Lazy-loading server adapters avoids startup/build coupling when optional native providers are disabled.

2. Runtime config needs a validated contract, not ad-hoc env reads.
- Centralized Zod validation catches deployment misconfiguration early.
- Production-specific constraints (like `APP_VERSION` presence and demo-provider disablement) should fail fast.

3. Security controls are most effective when centralized and reusable.
- Origin checks, body size limits, content-type enforcement, request IDs, and rate limiting became reliable once moved into shared server utilities.
- Response headers (`x-request-id`, rate-limit headers) improve incident debugging and client-side resilience.

4. Observability should be built into route handlers, not bolted on later.
- Structured JSON logs with request metadata made behavior visible across tests and local runs.
- Unified exception capture path enables future drop-in integrations (Sentry/webhooks/etc.) without rewriting routes.

5. Regression tests must include operational and security behavior.
- Added tests for 403/413/415/429 scenarios and runtime env validation.
- Exposing minimal test-reset hooks for caches/stores keeps tests deterministic without affecting production flow.

6. CI security checks need practical scope.
- Auditing production dependencies (`--omit=dev`) avoids false blocking on dev-toolchain vulnerabilities while keeping deployment risk checks strict.
- Dependabot plus CI gates is a better long-term pattern than one-off manual audit fixes.

## Follow-Up Application
- Keep `ROADMAP.md` synced with provider maturity status (demo vs production vs placeholder).
- Treat any new API route as incomplete until it has:
  - shared security middleware/helpers
  - structured logging
  - error capture
  - regression tests for abuse/invalid input paths
