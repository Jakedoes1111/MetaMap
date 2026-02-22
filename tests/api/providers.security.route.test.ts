import { beforeEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/providers/[provider]/route";
import { resetRuntimeConfigForTests } from "@/server/config/runtime";
import { resetRateLimitStoreForTests } from "@/server/security/rateLimit";

const validPayload = {
  birthIso: "1992-09-01T06:03:00",
  timezone: "Australia/Sydney",
};

describe("POST /api/providers/:provider security controls", () => {
  beforeEach(() => {
    resetRuntimeConfigForTests();
    resetRateLimitStoreForTests();
    delete process.env.ALLOWED_ORIGINS;
    delete process.env.API_MAX_BODY_BYTES;
    delete process.env.RATE_LIMIT_PROVIDER_MAX_REQUESTS;
    delete process.env.RATE_LIMIT_PROVIDER_WINDOW_MS;
  });

  it("rejects mismatched origin", async () => {
    const response = await POST(
      new Request("http://localhost/api/providers/ephemeris", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          host: "localhost",
          origin: "https://evil.example",
        },
        body: JSON.stringify(validPayload),
      }),
      { params: { provider: "ephemeris" } },
    );

    expect(response.status).toBe(403);
  });

  it("rejects oversized payloads", async () => {
    process.env.API_MAX_BODY_BYTES = "16";
    resetRuntimeConfigForTests();

    const response = await POST(
      new Request("http://localhost/api/providers/ephemeris", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          host: "localhost",
          origin: "http://localhost",
        },
        body: JSON.stringify({
          ...validPayload,
          extra: "x".repeat(200),
        }),
      }),
      { params: { provider: "ephemeris" } },
    );

    expect(response.status).toBe(413);
  });

  it("rejects unsupported content type", async () => {
    const response = await POST(
      new Request("http://localhost/api/providers/ephemeris", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          host: "localhost",
          origin: "http://localhost",
        },
        body: "hello",
      }),
      { params: { provider: "ephemeris" } },
    );

    expect(response.status).toBe(415);
  });

  it("enforces rate limits with 429", async () => {
    process.env.RATE_LIMIT_PROVIDER_MAX_REQUESTS = "1";
    process.env.RATE_LIMIT_PROVIDER_WINDOW_MS = "60000";
    resetRuntimeConfigForTests();

    const requestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        host: "localhost",
        origin: "http://localhost",
      },
      body: JSON.stringify(validPayload),
    } as const;

    const first = await POST(
      new Request("http://localhost/api/providers/ephemeris", requestInit),
      { params: { provider: "ephemeris" } },
    );
    expect(first.status).toBe(200);

    const second = await POST(
      new Request("http://localhost/api/providers/ephemeris", requestInit),
      { params: { provider: "ephemeris" } },
    );
    expect(second.status).toBe(429);
    expect(second.headers.get("Retry-After")).toBeTruthy();
  });
});
