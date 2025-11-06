import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/providers/[provider]/route";

describe("POST /api/providers/fs", () => {
  it("returns flying stars and eight mansions guidance", async () => {
    const response = await POST(
      new Request("http://localhost/api/providers/fs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sittingDegrees: 180,
          facingDegrees: 0,
          period: 8,
          birthYear: 1992,
          gender: "male",
        }),
      }),
      { params: { provider: "fs" } },
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.flyingStars).toHaveLength(9);
    expect(json.flyingStars[4]).toMatchObject({ palace: "Centre", star: 8 });
    expect(json.eightMansions.mingGua).toBe("6");
  });
});
