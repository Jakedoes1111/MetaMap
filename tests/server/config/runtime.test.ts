import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getRuntimeConfig, resetRuntimeConfigForTests } from "@/server/config/runtime";

const ORIGINAL_ENV = { ...process.env };

describe("runtime config", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    resetRuntimeConfigForTests();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    resetRuntimeConfigForTests();
  });

  it("fails fast in production without APP_VERSION", () => {
    process.env = { ...process.env, NODE_ENV: "production" };
    delete process.env.APP_VERSION;
    process.env.NEXT_PUBLIC_ENABLE_DEMO_PROVIDERS = "false";

    expect(() => getRuntimeConfig()).toThrow(/APP_VERSION is required/i);
  });

  it("requires JPL file when JPL engine is selected", () => {
    process.env = { ...process.env, NODE_ENV: "test" };
    process.env.SWISS_EPHEMERIS_ENGINE = "jpl";
    delete process.env.SWISS_EPHEMERIS_JPL_FILE;

    expect(() => getRuntimeConfig()).toThrow(/SWISS_EPHEMERIS_JPL_FILE is required/i);
  });

  it("parses positive integer controls and origin allowlist", () => {
    process.env = { ...process.env, NODE_ENV: "test" };
    process.env.API_MAX_BODY_BYTES = "1024";
    process.env.RATE_LIMIT_PROVIDER_WINDOW_MS = "5000";
    process.env.RATE_LIMIT_PROVIDER_MAX_REQUESTS = "42";
    process.env.ALLOWED_ORIGINS = "https://app.example.com, https://admin.example.com";
    process.env.NEXT_PUBLIC_ENABLE_DEMO_PROVIDERS = "true";

    const config = getRuntimeConfig();
    expect(config.apiMaxBodyBytes).toBe(1024);
    expect(config.providerRateLimitWindowMs).toBe(5000);
    expect(config.providerRateLimitMaxRequests).toBe(42);
    expect(config.allowedOrigins).toEqual([
      "https://app.example.com",
      "https://admin.example.com",
    ]);
    expect(config.enableDemoProviders).toBe(true);
  });

  it("rejects malformed boolean-style flags", () => {
    process.env = { ...process.env, NODE_ENV: "test" };
    process.env.NEXT_PUBLIC_ENABLE_DEMO_PROVIDERS = "maybe";

    expect(() => getRuntimeConfig()).toThrow(/boolean-like value/i);
  });
});
