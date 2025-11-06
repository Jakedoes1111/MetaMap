import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { useStore } from "@/store/useStore";

describe("useStore provider helpers", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useStore.setState({
      providerStatus: [],
      providerErrors: {},
      providerLoading: {},
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches provider status and updates state", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        providers: [
          { key: "fs", registered: false, name: "FSProvider", description: "", errorHint: "" },
        ],
      }),
    }));

    await useStore.getState().fetchProviderStatus();
    expect(useStore.getState().providerStatus[0]?.key).toBe("fs");
  });

  it("records errors when provider invocation fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: "Provider unavailable" }),
    }));

    const result = await useStore.getState().invokeProvider("fs", {});

    expect(result.status).toBe(503);
    expect(useStore.getState().providerErrors.fs).toMatch(/unavailable/i);
  });
});
