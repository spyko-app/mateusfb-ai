import { describe, it, expect } from "vitest";
import { EASE_OUT_QUINT, EASE_IN_OUT, DUR, revealVariants } from "@/lib/motion";

describe("motion tokens", () => {
  it("matches spec easings", () => {
    expect(EASE_OUT_QUINT).toEqual([0.22, 1, 0.36, 1]);
    expect(EASE_IN_OUT).toEqual([0.65, 0, 0.35, 1]);
  });
  it("durations in seconds", () => {
    expect(DUR).toEqual({ 200: 0.2, 360: 0.36, 600: 0.6, 700: 0.7 });
  });
  it("reveal goes from y12/opacity0 to y0/opacity1 in 700ms out-quint", () => {
    expect(revealVariants.hidden).toEqual({ opacity: 0, y: 12 });
    expect(revealVariants.visible).toMatchObject({
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    });
  });
});
