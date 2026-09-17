import { describe, it, expect } from "vitest";
import { stackState, seg, clamp01, easeOutQuint } from "@/lib/stack-state";

describe("stackState", () => {
  it("p=0: flat, only you+ship visible, middle offscreen", () => {
    const s = stackState(0);
    expect(s.rotateX).toBe(0);
    expect(s.rotateZ).toBe(0);
    expect(s.tilt).toBe(0);
    expect(s.scale).toBe(1);
    expect(s.you.opacity).toBe(1);
    expect(s.ship.opacity).toBe(1);
    expect(s.agents.opacity).toBe(0);
    expect(s.agents.x).toBe(-40);
    expect(s.integrations.opacity).toBe(0);
    expect(s.gap).toBeGreaterThan(0);
  });
  it("p=0.35: isometric with middle layers entering and extrusion", () => {
    const s = stackState(0.35);
    expect(s.rotateX).toBeCloseTo(55, 0);
    expect(s.rotateZ).toBeCloseTo(-38, 0);
    expect(s.agents.opacity).toBeGreaterThan(0.9);
    expect(s.agents.x).toBeCloseTo(0, 0);
    expect(s.agents.extrude).toBeGreaterThan(0.9);
    // pilha: "You" no topo (maior z), cada camada abaixo desce um degrau
    expect(s.you.z).toBeGreaterThan(s.agents.z);
    expect(s.agents.z).toBeGreaterThan(s.kits.z);
    expect(s.kits.z).toBeGreaterThan(s.ship.z);
    expect(s.scale).toBeLessThan(1);
  });
  it("p=0.85: flat again, integrations visible, no extrusion", () => {
    const s = stackState(0.85);
    expect(s.rotateX).toBeCloseTo(0, 1);
    expect(s.rotateZ).toBeCloseTo(0, 1);
    expect(s.integrations.opacity).toBeCloseTo(1, 1);
    expect(s.agents.extrude).toBeCloseTo(0, 1);
    expect(s.agents.opacity).toBe(1);
    expect(s.gap).toBeCloseTo(0, 1);
  });
  it("clamps", () => {
    expect(stackState(-1)).toEqual(stackState(0));
    expect(stackState(2)).toEqual(stackState(1));
  });
  it("seg is monotonic and clamped", () => {
    expect(seg(0.1, 0.15, 0.5)).toBe(0);
    expect(seg(0.5, 0.15, 0.5)).toBe(1);
    expect(seg(0.3, 0.15, 0.5)).toBeGreaterThan(seg(0.2, 0.15, 0.5));
  });
  it("helpers", () => {
    expect(clamp01(-3)).toBe(0);
    expect(clamp01(3)).toBe(1);
    expect(easeOutQuint(0)).toBe(0);
    expect(easeOutQuint(1)).toBe(1);
  });
});
