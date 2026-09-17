import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("next/dynamic", () => ({ default: () => () => null }));

import Page from "@/app/[locale]/projects/[slug]/page";
import { projectPages } from "@/content/project-pages";

describe("/en/projects/cove", () => {
  afterEach(cleanup);
  it("renders h1 'cove', the demo slot, the features grid and the steps", async () => {
    const ui = await Page({ params: Promise.resolve({ locale: "en", slug: "cove" }) });
    const { container } = render(ui);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("cove");
    expect(container.querySelector("[data-project-demo='cove']")).not.toBeNull();
    const cards = container.querySelectorAll("[data-features-grid] [data-feature-scene]");
    expect(cards.length).toBe(projectPages.cove.features.length);
    expect(container.querySelectorAll("[data-steps] ol li").length).toBe(4);
    expect(screen.getByRole("link", { name: "Open on GitHub" })).toHaveAttribute("href", "https://github.com/spyko-app/cove");
    expect(screen.getByRole("link", { name: "Back to projects" })).toHaveAttribute("href", "/en/projects");
  });
});
