import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashedCard, CornerMarks, Button, SectionHeader } from "@/components/ds";

describe("ds", () => {
  it("DashedCard has dashed border and 4 corners, inverts when active", () => {
    const { container, rerender } = render(<DashedCard data-testid="c">x</DashedCard>);
    const el = screen.getByTestId("c");
    expect(el.className).toMatch(/border-dashed/);
    expect(container.querySelectorAll("svg").length).toBe(4);
    rerender(
      <DashedCard data-testid="c" active>
        x
      </DashedCard>,
    );
    expect(screen.getByTestId("c").className).toMatch(/bg-fg/);
    expect(screen.getByTestId("c").dataset.active).toBe("true");
  });

  it("CornerMarks are aria-hidden", () => {
    const { container } = render(<CornerMarks />);
    container.querySelectorAll("span").forEach((s) => expect(s.getAttribute("aria-hidden")).toBe("true"));
  });

  it("Button renders anchor with href and variant classes", () => {
    render(
      <Button href="/x" variant="outline">
        go
      </Button>,
    );
    const a = screen.getByRole("link", { name: "go" });
    expect(a).toHaveAttribute("href", "/x");
    expect(a.className).toMatch(/rounded-full/);
  });

  it("Button opens a new tab only for http(s) hrefs, never mailto:/tel:", () => {
    render(
      <>
        <Button href="https://github.com/Mateus-fb">gh</Button>
        <Button href="mailto:x@y.z">mail</Button>
        <Button href="tel:+5511999999999">tel</Button>
        <Button href="/en/about">about</Button>
      </>,
    );
    const gh = screen.getByRole("link", { name: "gh" });
    expect(gh).toHaveAttribute("target", "_blank");
    expect(gh).toHaveAttribute("rel", "noreferrer");
    for (const name of ["mail", "tel", "about"]) {
      const a = screen.getByRole("link", { name });
      expect(a).not.toHaveAttribute("target");
      expect(a).not.toHaveAttribute("rel");
    }
  });

  it("Eyebrow + SectionHeader", () => {
    render(<SectionHeader num="01" eyebrow="Projects" title="T" body="B" />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("T");
    expect(screen.getByText("01")).toBeInTheDocument();
  });
});
