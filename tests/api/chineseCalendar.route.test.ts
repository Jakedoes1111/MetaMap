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

  it("passes gender through to luck pillar scheduling", async () => {
    const basePayload = {
      birthIso: "1992-09-01T06:03:00",
      timezone: "Australia/Sydney",
    };

    const maleResponse = await POST(
      new Request("http://localhost/api/providers/chineseCalendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...basePayload, gender: "yang" }),
      }),
      { params: { provider: "chineseCalendar" } },
    );

    const femaleResponse = await POST(
      new Request("http://localhost/api/providers/chineseCalendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...basePayload, gender: "yin" }),
      }),
      { params: { provider: "chineseCalendar" } },
    );

    expect(maleResponse.status).toBe(200);
    expect(femaleResponse.status).toBe(200);

    const maleJson = await maleResponse.json();
    const femaleJson = await femaleResponse.json();

    expect(maleJson.luckPillars).toHaveLength(8);
    expect(femaleJson.luckPillars).toHaveLength(8);
    expect(femaleJson.luckPillars[0].startingAge).not.toBe(
      maleJson.luckPillars[0].startingAge,
    );
  });
});
