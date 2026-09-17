import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Mark, Wordmark, Lockup, ShufflingMark, MARK_GEOMETRY, planePath } from "@/components/brand";

describe("brand", () => {
  it("mark: three isometric planes (paths, no circles) in 32 viewBox using currentColor", () => {
    const { container } = render(<Mark size={16} />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("viewBox")).toBe("0 0 32 32");
    expect(svg.getAttribute("width")).toBe("16");
    expect(container.querySelectorAll("circle").length).toBe(0);
    expect(container.querySelectorAll("path").length).toBe(3);
    expect(svg.innerHTML).not.toMatch(/#[0-9a-f]{3,6}/i);
    expect(svg.innerHTML).toContain("currentColor");
    expect(svg.getAttribute("aria-hidden")).toBe("true");
  });
  it("mark with title is an img", () => {
    const { container } = render(<Mark title="mateusfb.ai" />);
    expect(container.querySelector("svg")!.getAttribute("role")).toBe("img");
    expect(container.querySelector("title")!.textContent).toBe("mateusfb.ai");
  });
  it("geometry: 3 planes, 30° iso (h = w/2), evenly offset", () => {
    expect(MARK_GEOMETRY.planes.length).toBe(3);
    expect(MARK_GEOMETRY.h).toBe(MARK_GEOMETRY.w / 2);
    const [a, b, c] = MARK_GEOMETRY.planes.map((p) => p.cy);
    expect(b - a).toBeCloseTo(c - b);
  });
  it("planePath builds the rhombus", () => {
    expect(planePath(16, 16, 10, 5)).toBe("M 16 11 L 26 16 L 16 21 L 6 16 Z");
  });
  it("wordmark text", () => { const { container } = render(<Wordmark />); expect(container.textContent).toBe("mateusfb.ai"); });
  it("lockup contains mark and wordmark", () => {
    const { container } = render(<Lockup />);
    expect(container.querySelector("svg")).toBeTruthy();
    expect(container.textContent).toContain("mateusfb");
  });
  it("shuffling mark: button with 12 dots, shuffles on click", () => {
    const { container } = render(<ShufflingMark />);
    const btn = container.querySelector("button")!;
    expect(btn.getAttribute("aria-label")).toBe("mateusfb.ai");
    const dots = btn.querySelectorAll("[data-dot]");
    expect(dots.length).toBe(12);
    expect(btn.getAttribute("data-shuffled")).toBe("false");
    fireEvent.click(btn);
    expect(btn.getAttribute("data-shuffled")).toBe("true");
  });
});
