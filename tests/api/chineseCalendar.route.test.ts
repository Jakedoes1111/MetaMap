import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/providers/[provider]/route";

describe("POST /api/providers/chineseCalendar", () => {
  it("returns pillars and luck pillars from demo provider", async () => {
    const payload = {
      birthIso: "1992-09-01T06:03:00",
      timezone: "Australia/Sydney",
      gender: "yang",
    };

    const response = await POST(
      new Request("http://localhost/api/providers/chineseCalendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
      { params: { provider: "chineseCalendar" } },
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(Array.isArray(json.pillars)).toBe(true);
    expect(json.pillars).toHaveLength(4);
    expect(json.luckPillars).toHaveLength(8);
  });
});
