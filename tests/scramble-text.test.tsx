import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { ScrambleText } from "@/components/ds/ScrambleText";

describe("ScrambleText", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders the exact text with an aria-label", () => {
    render(<ScrambleText text="Let's talk" />);
    const el = screen.getByLabelText("Let's talk");
    expect(el).toHaveAttribute("aria-label", "Let's talk");
    // spaces render as   internally so they don't collapse across per-char spans
    expect(el.textContent?.replace(/ /g, " ")).toBe("Let's talk");
  });

  it("settles back to the original text after a pointerenter scramble", () => {
    render(
      <div data-scramble>
        <ScrambleText text="GitHub" />
      </div>,
    );
    const el = screen.getByLabelText("GitHub");
    fireEvent.pointerEnter(el.parentElement as Element);
    vi.advanceTimersByTime(1000);
    expect(el.textContent).toBe("GitHub");
  });
});
