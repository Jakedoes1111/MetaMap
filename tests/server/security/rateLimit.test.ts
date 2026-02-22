import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyRateLimit, resetRateLimitStoreForTests } from "@/server/security/rateLimit";

describe("rate limiter", () => {
  beforeEach(() => {
    vi.useRealTimers();
    resetRateLimitStoreForTests();
  });

  it("allows requests within the limit and blocks after", () => {
    const first = applyRateLimit({
      key: "providers:invoke:203.0.113.7",
      maxRequests: 2,
      windowMs: 60_000,
    });
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(1);

    const second = applyRateLimit({
      key: "providers:invoke:203.0.113.7",
      maxRequests: 2,
      windowMs: 60_000,
    });
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(0);

    const third = applyRateLimit({
      key: "providers:invoke:203.0.113.7",
      maxRequests: 2,
      windowMs: 60_000,
    });
    expect(third.allowed).toBe(false);
    expect(third.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets counters after the window elapses", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    applyRateLimit({
      key: "providers:index:198.51.100.5",
      maxRequests: 1,
      windowMs: 1_000,
    });

    const blocked = applyRateLimit({
      key: "providers:index:198.51.100.5",
      maxRequests: 1,
      windowMs: 1_000,
    });
    expect(blocked.allowed).toBe(false);

    vi.setSystemTime(new Date("2026-01-01T00:00:01.100Z"));

    const allowedAgain = applyRateLimit({
      key: "providers:index:198.51.100.5",
      maxRequests: 1,
      windowMs: 1_000,
    });
    expect(allowedAgain.allowed).toBe(true);
    expect(allowedAgain.remaining).toBe(0);
  });
});
