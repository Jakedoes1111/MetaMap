import { z } from "zod";

const BOOLEAN_PATTERN = /^(true|1|yes|on|false|0|no|off)$/i;
const TRUE_PATTERN = /^(true|1|yes|on)$/i;

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (!value) {
    return fallback;
  }
  return TRUE_PATTERN.test(value.trim());
};

const parsePositiveInteger = (value: string | undefined, fallback: number) => {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const EnvironmentSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    APP_VERSION: z.preprocess(
      (value) => (typeof value === "string" && value.trim().length === 0 ? undefined : value),
      z.string().optional(),
    ),
    NEXT_PUBLIC_ENABLE_DEMO_PROVIDERS: z.string().optional(),
    SWISS_EPHEMERIS_ENABLED: z.string().optional(),
    SWISS_EPHEMERIS_ENGINE: z.enum(["swiss", "moshier", "jpl"]).optional(),
    SWISS_EPHEMERIS_JPL_FILE: z.string().optional(),
    API_MAX_BODY_BYTES: z.string().optional(),
    RATE_LIMIT_PROVIDER_WINDOW_MS: z.string().optional(),
    RATE_LIMIT_PROVIDER_MAX_REQUESTS: z.string().optional(),
    ALLOWED_ORIGINS: z.string().optional(),
    ERROR_WEBHOOK_URL: z.preprocess(
      (value) => (typeof value === "string" && value.trim().length === 0 ? undefined : value),
      z.string().url().optional(),
    ),
  })
  .superRefine((env, context) => {
    if (env.NODE_ENV === "production" && !env.APP_VERSION?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["APP_VERSION"],
        message: "APP_VERSION is required in production deployments.",
      });
    }

    if (
      env.NEXT_PUBLIC_ENABLE_DEMO_PROVIDERS &&
      !BOOLEAN_PATTERN.test(env.NEXT_PUBLIC_ENABLE_DEMO_PROVIDERS.trim())
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["NEXT_PUBLIC_ENABLE_DEMO_PROVIDERS"],
        message: "NEXT_PUBLIC_ENABLE_DEMO_PROVIDERS must be a boolean-like value.",
      });
    }

    if (
      env.SWISS_EPHEMERIS_ENABLED &&
      !BOOLEAN_PATTERN.test(env.SWISS_EPHEMERIS_ENABLED.trim())
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["SWISS_EPHEMERIS_ENABLED"],
        message: "SWISS_EPHEMERIS_ENABLED must be a boolean-like value.",
      });
    }

    if (env.SWISS_EPHEMERIS_ENGINE === "jpl" && !env.SWISS_EPHEMERIS_JPL_FILE?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["SWISS_EPHEMERIS_JPL_FILE"],
        message: "SWISS_EPHEMERIS_JPL_FILE is required when SWISS_EPHEMERIS_ENGINE=jpl.",
      });
    }

    if (
      env.NODE_ENV === "production" &&
      parseBoolean(env.NEXT_PUBLIC_ENABLE_DEMO_PROVIDERS, false)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["NEXT_PUBLIC_ENABLE_DEMO_PROVIDERS"],
        message: "Demo providers must be disabled in production.",
      });
    }

    for (const [key, value] of [
      ["API_MAX_BODY_BYTES", env.API_MAX_BODY_BYTES],
      ["RATE_LIMIT_PROVIDER_WINDOW_MS", env.RATE_LIMIT_PROVIDER_WINDOW_MS],
      ["RATE_LIMIT_PROVIDER_MAX_REQUESTS", env.RATE_LIMIT_PROVIDER_MAX_REQUESTS],
    ] as const) {
      if (value == null || value.trim().length === 0) {
        continue;
      }
      const parsed = Number.parseInt(value, 10);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${key} must be a positive integer.`,
        });
      }
    }
  });

export interface RuntimeConfig {
  nodeEnv: "development" | "test" | "production";
  appVersion?: string;
  enableDemoProviders: boolean;
  swissEphemerisEnabled: boolean;
  swissEphemerisEngine: "swiss" | "moshier" | "jpl";
  apiMaxBodyBytes: number;
  providerRateLimitWindowMs: number;
  providerRateLimitMaxRequests: number;
  allowedOrigins: string[];
  errorWebhookUrl?: string;
}

let runtimeConfigCache: RuntimeConfig | null = null;

export const resetRuntimeConfigForTests = () => {
  runtimeConfigCache = null;
};

export const getRuntimeConfig = (): RuntimeConfig => {
  if (runtimeConfigCache) {
    return runtimeConfigCache;
  }

  const parsed = EnvironmentSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    throw new Error(`Invalid runtime environment configuration: ${details.join("; ")}`);
  }

  const env = parsed.data;
  runtimeConfigCache = {
    nodeEnv: env.NODE_ENV,
    appVersion: env.APP_VERSION?.trim() || undefined,
    enableDemoProviders: parseBoolean(
      env.NEXT_PUBLIC_ENABLE_DEMO_PROVIDERS,
      env.NODE_ENV !== "production",
    ),
    swissEphemerisEnabled: parseBoolean(env.SWISS_EPHEMERIS_ENABLED, false),
    swissEphemerisEngine: env.SWISS_EPHEMERIS_ENGINE ?? "swiss",
    apiMaxBodyBytes: parsePositiveInteger(env.API_MAX_BODY_BYTES, 256 * 1024),
    providerRateLimitWindowMs: parsePositiveInteger(env.RATE_LIMIT_PROVIDER_WINDOW_MS, 60_000),
    providerRateLimitMaxRequests: parsePositiveInteger(
      env.RATE_LIMIT_PROVIDER_MAX_REQUESTS,
      120,
    ),
    allowedOrigins: (env.ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0),
    errorWebhookUrl: env.ERROR_WEBHOOK_URL?.trim() || undefined,
  };

  return runtimeConfigCache;
};
