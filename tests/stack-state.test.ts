import { describe, it, expect } from "vitest";
import { stackState, seg, clamp01, easeOutQuint, P_MAX, TILT, CELLS } from "@/lib/stack-state";

describe("stackState (timeline calibrada em docs/ref/am-p*.png)", () => {
  it("p=0: flat, You+Shipped colados, miolo fora, sem integrações", () => {
    const s = stackState(0);
    expect(s.skewY).toBe(0);
    expect(s.tilt).toBe(0);
    expect(s.scale).toBe(1);
    expect(s.gap).toBe(0);
    expect(s.you.opacity).toBe(1);
    expect(s.ship.opacity).toBe(1);
    expect(s.you.extrude).toBe(0);
    expect(s.agents.opacity).toBe(0);
    expect(s.agents.x).toBe(-40);
    expect(s.integrations.opacity).toBe(0);
    expect(s.cells).toHaveLength(CELLS);
    expect(s.cells.every((c) => c === 0)).toBe(true);
  });
  it("p=0.12: inclinado com vão aberto, miolo ainda fora", () => {
    const s = stackState(0.12);
    expect(s.tilt).toBeGreaterThan(0.95);
    expect(s.gap).toBeGreaterThan(100);
    expect(s.you.extrude).toBeGreaterThan(0.95);
    expect(s.agents.opacity).toBe(0);
  });
  it("p=0.4: inclinado, agents dentro antes de kits (stagger)", () => {
    const s = stackState(0.4);
    expect(s.skewY).toBeCloseTo(TILT.skewY, 1);
    expect(s.scale).toBeCloseTo(TILT.scale, 2);
    expect(s.agents.opacity).toBeGreaterThan(0.95);
    expect(s.agents.x).toBeCloseTo(0, 0);
    expect(s.kits.opacity).toBeGreaterThan(0.8);
    expect(s.kits.opacity).toBeLessThan(s.agents.opacity);
    expect(s.glyph.opacity).toBe(s.kits.opacity);
    expect(s.agents.extrude).toBeGreaterThan(0.9);
    expect(s.integrations.opacity).toBe(0);
  });
  it("p=0.7: inclinado, faixa das integrações aberta, primeiras células visíveis e a última não", () => {
    const s = stackState(0.7);
    expect(s.tilt).toBe(1);
    expect(s.integrations.opacity).toBeCloseTo(1, 1);
    expect(s.cells[0]).toBeGreaterThan(0);
    expect(s.cells[CELLS - 1]).toBe(0);
  });
  it("p=0.85: cascata esquerda → direita (monótona decrescente)", () => {
    const s = stackState(0.85);
    for (let i = 1; i < CELLS; i++) expect(s.cells[i]).toBeLessThanOrEqual(s.cells[i - 1]);
    expect(s.cells[0]).toBe(1);
    expect(s.cells[CELLS - 1]).toBe(0);
  });
  it("p=1: ainda inclinado, tudo presente, todas as células", () => {
    const s = stackState(1);
    expect(s.tilt).toBe(1);
    expect(s.skewY).toBeCloseTo(TILT.skewY, 1);
    expect(s.cells.every((c) => c === 1)).toBe(true);
    expect(s.agents.opacity).toBe(1);
    expect(s.kits.opacity).toBe(1);
    expect(s.integrations.opacity).toBe(1);
  });
  it("p=1.15: volta ao plano, sem extrusões, conteúdo permanece", () => {
    const s = stackState(P_MAX);
    expect(s.skewY).toBe(0);
    expect(s.scale).toBe(1);
    expect(s.tilt).toBe(0);
    expect(s.you.extrude).toBe(0);
    expect(s.agents.extrude).toBe(0);
    expect(s.agents.opacity).toBe(1);
    expect(s.cells.every((c) => c === 1)).toBe(true);
  });
  it("clamps em [0, P_MAX]", () => {
    expect(stackState(-1)).toEqual(stackState(0));
    expect(stackState(2)).toEqual(stackState(P_MAX));
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
