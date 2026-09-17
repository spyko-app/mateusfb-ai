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

  it("repoUrl is null only for building projects without repo", () => {
    for (const p of projects) {
      const url = repoUrl(p);
      if (p.owner && p.repo) {
        expect(url).toBe(`https://github.com/${p.owner}/${p.repo}`);
      } else {
        expect(url).toBeNull();
        expect(p.status).toBe("building");
      }
    }
  });
});
