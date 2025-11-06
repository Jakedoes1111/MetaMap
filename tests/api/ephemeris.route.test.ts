import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/providers/[provider]/route";

describe("POST /api/providers/ephemeris", () => {
  it("returns deterministic positions from demo provider", async () => {
    const payload = {
      birthIso: "1992-09-01T06:03:00",
      timezone: "Australia/Sydney",
      coordinates: { latitude: -33.8688, longitude: 151.2093 },
      options: { zodiac: "tropical", houseSystem: "Placidus" },
    };

    const response = await POST(
      new Request("http://localhost/api/providers/ephemeris", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }),
      { params: { provider: "ephemeris" } },
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(Array.isArray(json.positions)).toBe(true);
    expect(json.positions.length).toBeGreaterThan(0);
    expect(json.positions[0]).toHaveProperty("longitude");
    expect(json).toHaveProperty("cusps");
    expect(Array.isArray(json.cusps)).toBe(true);
    expect(json.cusps[0]).toHaveProperty("house");
    expect(json).toHaveProperty("angles.ascendant");
  });
});
