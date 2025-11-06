import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/providers/[provider]/route";

describe("POST /api/providers/hd", () => {
  it("returns body graph metadata", async () => {
    const response = await POST(
      new Request("http://localhost/api/providers/hd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthIso: "1992-09-01T06:03:00",
          timezone: "Australia/Sydney",
        }),
      }),
      { params: { provider: "hd" } },
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.type).toBe("Manifesting Generator");
    expect(json.authority).toBe("Sacral");
    expect(json.centres.throat).toBe("defined");
  });
});
