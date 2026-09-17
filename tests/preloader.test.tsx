import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { Preloader, PRELOADER_FLAG, PRELOADER_TIMELINE, sampleMark } from "@/components/Preloader";

describe("Preloader", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders nothing when the session flag is set", () => {
    sessionStorage.setItem(PRELOADER_FLAG, "1");
    const { container } = render(<Preloader />);
    expect(container.querySelector("[data-preloader]")).toBeNull();
  });

  it("renders the overlay with role=status and aria-label when not set, above everything", () => {
    const { container } = render(<Preloader />);
    const el = container.querySelector("[data-preloader]")!;
    expect(el).toBeTruthy();
    expect(el.getAttribute("role")).toBe("status");
    expect(el.getAttribute("aria-label")).toBe("mateusfb.ai");
    expect(el.className).toContain("fixed");
    expect(el.className).toContain("z-[60]");
    expect(document.body.style.overflow).toBe("hidden");
    expect(el.textContent).toContain("mateusfb");
  });

  it("sets the flag, unlocks scroll and calls onDone after the timeline", () => {
    const onDone = vi.fn();
    const { container } = render(<Preloader onDone={onDone} />);
    expect(sessionStorage.getItem(PRELOADER_FLAG)).toBeNull();
    act(() => {
      vi.advanceTimersByTime(PRELOADER_TIMELINE.total + 10);
    });
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem(PRELOADER_FLAG)).toBe("1");
    expect(container.querySelector("[data-preloader]")).toBeNull();
    expect(document.body.style.overflow).toBe("");
  });

  it("skips under reduced motion", () => {
    const orig = window.matchMedia;
    window.matchMedia = ((q: string) => ({ ...orig(q), matches: q.includes("reduce") })) as typeof window.matchMedia;
    const { container } = render(<Preloader />);
    expect(container.querySelector("[data-preloader]")).toBeNull();
    window.matchMedia = orig;
  });

  it("samples the three floors in order bottom → middle → top with staggered starts", () => {
    const f = sampleMark(220);
    expect(f.positions.length / 3).toBeGreaterThan(2000);
    const starts = new Set(Array.from(f.t0s).map((t) => Math.round(t * 1000)));
    expect([...starts].sort((a, b) => a - b)).toEqual([...PRELOADER_TIMELINE.planeStart]);
    // andar 0 (base) fica mais embaixo (y menor) que o topo
    let yBase = 0, nBase = 0, yTop = 0, nTop = 0;
    for (let i = 0; i < f.t0s.length; i++) {
      if (f.t0s[i] === 0) { yBase += f.positions[i * 3 + 1]; nBase++; }
      if (Math.round(f.t0s[i] * 1000) === 700) { yTop += f.positions[i * 3 + 1]; nTop++; }
    }
    expect(yBase / nBase).toBeLessThan(yTop / nTop);
  });
});
