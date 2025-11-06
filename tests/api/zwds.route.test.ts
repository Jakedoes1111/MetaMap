import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/providers/[provider]/route";

describe("POST /api/providers/zwds", () => {
  it("returns a demo chart", async () => {
    const payload = {
      birthIso: "1992-09-01T06:03:00",
      timezone: "Australia/Sydney",
      variant: "classic",
    };

    const response = await POST(
      new Request("http://localhost/api/providers/zwds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
      { params: { provider: "zwds" } },
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(Array.isArray(json.chart)).toBe(true);
    expect(json.chart).toHaveLength(12);
    expect(json.chart[0]).toHaveProperty("stars");
  });
});
