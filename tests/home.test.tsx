import { describe, it, expect, vi, afterEach } from "vitest";
import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { render, cleanup } from "@testing-library/react";

vi.mock("next/dynamic", () => ({ default: () => () => null }));
vi.mock("@/lib/github", async (orig) => {
  const mod = await orig<typeof import("@/lib/github")>();
  return {
    ...mod,
    getRepoStats: vi.fn(async () => ({ stars: 1, pushedAt: "2026-01-01T00:00:00Z", language: "TypeScript", source: "fallback" })),
  };
});

import Page from "@/app/[locale]/page";
import en from "@/messages/en.json";

/** jsdom não roda server components async: resolve as seções assíncronas de 1º nível antes de renderizar. */
async function resolveAsync(node: ReactNode): Promise<ReactNode> {
  if (!isValidElement(node)) return node;
  const el = node as ReactElement<{ children?: ReactNode }>;
  if (typeof el.type === "function" && el.type.constructor.name === "AsyncFunction") {
    return (el.type as (p: unknown) => Promise<ReactNode>)(el.props);
  }
  const kids = await Promise.all(Children.toArray(el.props.children).map(resolveAsync));
  return kids.length ? { ...el, props: { ...el.props, children: kids } } : el;
}

describe("home", () => {
  afterEach(cleanup);
  it("renders the 5 sections in order: top · projects · where · writing · cta", async () => {
    const ui = await resolveAsync(await Page({ params: Promise.resolve({ locale: "en" }) }));
    const { container } = render(ui);
    const ids = Array.from(container.querySelectorAll("section[id]")).map((s) => s.id);
    expect(ids).toEqual(["top", "projects", "where", "writing", "cta"]);
    expect(container.querySelectorAll("#projects article").length).toBe(4);
    expect(container.textContent).toContain(en.cta.title);
    expect(container.textContent).toContain(en.projects.title);
  });
});
