import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("returns service health metadata", async () => {
    const response = await GET(
      new Request("http://localhost/api/health", {
        headers: {
          "x-request-id": "health-test-request",
        },
      }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("x-request-id")).toBe("health-test-request");

    const json = await response.json();
    expect(json.status).toBe("ok");
    expect(typeof json.timestamp).toBe("string");
    expect(json.app).toBe("metamap");
    expect(json.providers.total).toBeGreaterThan(0);
    expect(json.providers.registered).toBeGreaterThan(0);
  });
});
