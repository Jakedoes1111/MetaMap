import { describe, expect, it } from "vitest";
import {
  createRequestId,
  getClientIp,
  isOriginAllowed,
  parseJsonBodyWithLimit,
} from "@/server/security/http";

describe("http security helpers", () => {
  it("uses x-request-id when provided", () => {
    const request = new Request("http://localhost/api/providers", {
      headers: {
        "x-request-id": "req-123",
      },
    });
    expect(createRequestId(request)).toBe("req-123");
  });

  it("extracts client ip from x-forwarded-for", () => {
    const request = new Request("http://localhost/api/providers", {
      headers: {
        "x-forwarded-for": "203.0.113.8, 10.0.0.1",
      },
    });
    expect(getClientIp(request)).toBe("203.0.113.8");
  });

  it("allows same-origin requests by host", () => {
    const request = new Request("http://localhost/api/providers", {
      headers: {
        host: "localhost",
        origin: "http://localhost",
      },
    });
    expect(isOriginAllowed(request, [])).toBe(true);
  });

  it("rejects mismatched origin", () => {
    const request = new Request("http://localhost/api/providers", {
      headers: {
        host: "localhost",
        origin: "https://evil.example",
      },
    });
    expect(isOriginAllowed(request, [])).toBe(false);
  });

  it("allows origin from explicit allowlist", () => {
    const request = new Request("http://localhost/api/providers", {
      headers: {
        origin: "https://app.example.com",
      },
    });
    expect(isOriginAllowed(request, ["https://app.example.com"])).toBe(true);
  });

  it("rejects non-json content types", async () => {
    const request = new Request("http://localhost/api/providers/ephemeris", {
      method: "POST",
      headers: {
        "content-type": "text/plain",
      },
      body: "hello",
    });
    const result = await parseJsonBodyWithLimit(request, 256);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(415);
    }
  });

  it("rejects invalid json payload", async () => {
    const request = new Request("http://localhost/api/providers/ephemeris", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: "{oops",
    });
    const result = await parseJsonBodyWithLimit(request, 256);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
    }
  });

  it("rejects oversized payloads", async () => {
    const body = JSON.stringify({ value: "x".repeat(200) });
    const request = new Request("http://localhost/api/providers/ephemeris", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-length": String(Buffer.byteLength(body, "utf8")),
      },
      body,
    });
    const result = await parseJsonBodyWithLimit(request, 32);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(413);
    }
  });

  it("accepts valid json payloads", async () => {
    const request = new Request("http://localhost/api/providers/ephemeris", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ ok: true }),
    });
    const result = await parseJsonBodyWithLimit<{ ok: boolean }>(request, 1024);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload).toEqual({ ok: true });
    }
  });
});
