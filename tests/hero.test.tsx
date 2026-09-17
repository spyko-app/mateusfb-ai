import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("next/dynamic", () => ({ default: () => () => null }));

import { HeroTitle } from "@/components/hero/HeroTitle";
import { Hero } from "@/components/hero/Hero";
import en from "@/messages/en.json";

describe("hero", () => {
  afterEach(cleanup);
  it("HeroTitle splits words into aria-hidden spans and labels the wrapper", () => {
    const text = "Building tools\nwith AI.";
    const { container } = render(<HeroTitle text={text} />);
    const words = container.querySelectorAll("span[data-word]");
    expect(words.length).toBe(4);
    const joined = Array.from(words).map((w) => w.textContent?.replace(/ /g, " ").trim()).join(" ");
    expect(joined).toBe(text.replace(/\n/g, " "));
    words.forEach((w) => expect(w.getAttribute("aria-hidden")).toBe("true"));
    expect(container.querySelector("h1")!.getAttribute("aria-label")).toBe(text.replace(/\n/g, " "));
  });

  it("Hero renders h1, two CTAs and the version badge", () => {
    render(<Hero locale="en" />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.getAttribute("aria-label")).toBe(en.hero.title.replace(/\n/g, " "));
    expect(screen.getByRole("link", { name: en.hero.primary }).getAttribute("href")).toBe("/en#projects");
    expect(screen.getByRole("link", { name: en.hero.secondary }).getAttribute("href")).toBe("/en/writing");
    expect(screen.getByText("v0.1")).toBeTruthy();
    expect(document.querySelector("section#top")).toBeTruthy();
  });
});
