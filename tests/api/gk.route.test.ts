import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/providers/[provider]/route";

describe("POST /api/providers/gk", () => {
  it("returns gene keys profile", async () => {
    const response = await POST(
      new Request("http://localhost/api/providers/gk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthIso: "1992-09-01T06:03:00",
          timezone: "Australia/Sydney",
        }),
      }),
      { params: { provider: "gk" } },
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.spheres).toHaveLength(4);
    expect(json.spheres[0]).toEqual({ name: "Life's Work", geneKey: 29, line: 2 });
  });
});
