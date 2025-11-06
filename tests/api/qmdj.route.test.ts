import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/providers/[provider]/route";

describe("POST /api/providers/qmdj", () => {
  it("returns a board for the supplied arrangement and school", async () => {
    const payload = {
      birthIso: "1992-09-01T06:03:00",
      timezone: "Australia/Sydney",
      arrangement: "yang" as const,
      school: "Zhi Run",
    };

    const response = await POST(
      new Request("http://localhost/api/providers/qmdj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
      { params: { provider: "qmdj" } },
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.board).toBeTruthy();
    expect(Array.isArray(json.board.chart)).toBe(true);
    expect(json.board.chart).toHaveLength(9);
    expect(json.board.chart[0]).toHaveProperty("door");
  });
});
