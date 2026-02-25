import { describe, it, expect } from "vitest";
import { parseIncident } from "@/lib/parse";

describe("parseIncident", () => {
  it("extracts timestamps and builds timeline", () => {
    const text = `
2026-02-24 12:01:02Z service=api error 503
2026-02-24 12:02:10Z service=api recovered
`;
    const p = parseIncident(text);
    expect(p.timestamps.length).toBeGreaterThan(0);
    expect(p.timeline.length).toBe(2);
    expect(p.services).toContain("api");
  });
});
