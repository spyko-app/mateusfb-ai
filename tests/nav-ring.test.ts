import { describe, it, expect } from "vitest";
import { ringPath } from "@/components/nav/NavRing";

describe("ringPath", () => {
  it("rounded rect starting at top center", () => {
    const d = ringPath(385, 40);
    expect(d.startsWith("M 192.5 0")).toBe(true);
    expect(d).toContain("A 20 20");
    expect(d.trim().endsWith("L 192.5 0")).toBe(true);
  });
  it("collapsed pill is a circle-ish path", () => {
    expect(ringPath(56, 40)).toContain("A 20 20");
  });
});
