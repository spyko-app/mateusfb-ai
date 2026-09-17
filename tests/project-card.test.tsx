import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { projects } from "@/content/projects";

const webAi = projects.find((p) => p.slug === "web-ai")!;
const building = projects.find((p) => p.slug === "vibe100coding-kit")!;

describe("ProjectCard", () => {
  afterEach(cleanup);
  it("shows name, language, stars and GitHub link", () => {
    render(
      <ProjectCard
        project={webAi}
        stats={{ stars: 12, pushedAt: "2026-09-10T00:00:00Z", language: "TypeScript", source: "github" }}
        locale="en"
        index={0}
      />,
    );
    expect(screen.getByText("web.ai")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText(/12/)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /GitHub/ });
    expect(link).toHaveAttribute("href", "https://github.com/spyko-app/web.ai");
  });

  it("shows In progress badge AND the GitHub link since the repo now exists", () => {
    render(
      <ProjectCard
        project={building}
        stats={{ stars: 0, pushedAt: "2026-09-17T00:00:00Z", language: "Markdown", source: "fallback" }}
        locale="en"
        index={1}
      />,
    );
    expect(screen.getByText("In progress")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /GitHub/ });
    expect(link).toHaveAttribute("href", "https://github.com/spyko-app/vibe100coding-kit");
  });
});
