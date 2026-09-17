import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Nav } from "@/components/nav/Nav";

describe("Nav", () => {
  afterEach(cleanup);
  it("renders locale links, GitHub, talk and locale switch", () => {
    render(<Nav locale="en" pathname="/en" />);
    expect(screen.getAllByRole("link", { name: "Projects" })[0]).toHaveAttribute("href", "/en#projects");
    expect(screen.getAllByRole("link", { name: "Writing" })[0]).toHaveAttribute("href", "/en/writing");
    expect(screen.getAllByRole("link", { name: "About" })[0]).toHaveAttribute("href", "/en/about");
    expect(screen.getAllByRole("link", { name: "GitHub" })[0]).toHaveAttribute("href", "https://github.com/Mateus-fb");
    expect(screen.getAllByRole("link", { name: "Let's talk" })[0]).toHaveAttribute("href", "mailto:spykocontato@gmail.com");
    expect(screen.getAllByRole("link", { name: /PT/ })[0]).toHaveAttribute("href", "/pt");
  });

  it("locale switch keeps the path", () => {
    render(<Nav locale="en" pathname="/en/writing/foo" />);
    expect(screen.getAllByRole("link", { name: /PT/ })[0]).toHaveAttribute("href", "/pt/writing/foo");
  });

  it("home link has aria-label and center pill marker", () => {
    const { container } = render(<Nav locale="pt" pathname="/pt" />);
    expect(screen.getByRole("link", { name: "início mateusfb.ai" }) ?? screen.getByLabelText(/mateusfb\.ai/)).toBeTruthy();
    expect(container.querySelector("[data-center-pill]")).not.toBeNull();
  });
});
