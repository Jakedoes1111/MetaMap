import { describe, expect, it } from "vitest";
import { HumanDesignGateProvider } from "@/providers/hd/HumanDesignGateProvider";

const provider = new HumanDesignGateProvider();

describe("HumanDesignGateProvider", () => {
  it("marks defined centres and derives type/authority", async () => {
    const graph = await provider.computeBodyGraph({
      birthDateTime: "1992-09-01T06:03:00",
      timezone: "Australia/Sydney",
    });

    expect(graph.centres.throat).toBe("defined");
    expect(graph.centres.sacral).toBe("defined");
    expect(graph.centres.root).toBe("defined");
    expect(graph.type).toBe("Manifesting Generator");
    expect(graph.authority).toBe("Sacral");
  });
});
