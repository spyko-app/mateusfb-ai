import { describe, it, expect } from "vitest";
import { projects, repoUrl } from "@/content/projects";

describe("projects", () => {
  it("has 4 projects", () => {
    expect(projects).toHaveLength(4);
  });

  it("has unique slugs", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every project has non-empty en and pt descriptions", () => {
    for (const p of projects) {
      expect(p.description.en.length).toBeGreaterThan(0);
      expect(p.description.pt.length).toBeGreaterThan(0);
    }
  });

  it("all 4 projects have a GitHub repo url", () => {
    for (const p of projects) {
      expect(p.owner).toBeTruthy();
      expect(p.repo).toBeTruthy();
      expect(repoUrl(p)).toBe(`https://github.com/${p.owner}/${p.repo}`);
    }
  });
});
