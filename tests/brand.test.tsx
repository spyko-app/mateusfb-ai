import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Mark, Wordmark, Lockup, ShufflingMark, MARK_GEOMETRY, orbitPath } from "@/components/brand";

describe("brand", () => {
  it("mark: core circle, orbit path, satellite circle in 32 viewBox using currentColor", () => {
    const { container } = render(<Mark size={16} />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("viewBox")).toBe("0 0 32 32");
    expect(svg.getAttribute("width")).toBe("16");
    expect(container.querySelectorAll("circle").length).toBe(2);
    expect(container.querySelectorAll("path").length).toBe(1);
    expect(svg.innerHTML).not.toMatch(/#[0-9a-f]{3,6}/i);
    expect(svg.getAttribute("aria-hidden")).toBe("true");
  });
  it("mark with title is an img", () => {
    const { container } = render(<Mark title="mateusfb.ai" />);
    expect(container.querySelector("svg")!.getAttribute("role")).toBe("img");
    expect(container.querySelector("title")!.textContent).toBe("mateusfb.ai");
  });
  it("orbit gap ≥ 60°", () => { expect(MARK_GEOMETRY.orbit.gapDeg).toBeGreaterThanOrEqual(60); });
  it("orbit path is a single large arc", () => { expect(orbitPath()).toMatch(/^M [\d. ]+ A 12.5 12.5 0 1 1 [\d. ]+$/); });
  it("wordmark text", () => { const { container } = render(<Wordmark />); expect(container.textContent).toBe("mateusfb.ai"); });
  it("lockup contains mark and wordmark", () => {
    const { container } = render(<Lockup />);
    expect(container.querySelector("svg")).toBeTruthy();
    expect(container.textContent).toContain("mateusfb");
  });
  it("shuffling mark: button with 7 dots, shuffles on click", () => {
    const { container } = render(<ShufflingMark />);
    const btn = container.querySelector("button")!;
    expect(btn.getAttribute("aria-label")).toBe("mateusfb.ai");
    const dots = btn.querySelectorAll("[data-dot]");
    expect(dots.length).toBe(7);
    expect(btn.getAttribute("data-shuffled")).toBe("false");
    fireEvent.click(btn);
    expect(btn.getAttribute("data-shuffled")).toBe("true");
  });
});
