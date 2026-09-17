import { describe, it, expect } from "vitest";
import { projectPages, projectPageSlugs } from "@/content/project-pages";
import { projects } from "@/content/projects";
import { SHAPES } from "@/components/projects/shapes";
import en from "@/messages/en.json";
import pt from "@/messages/pt.json";

describe("project pages data", () => {
  it("covers exactly the 4 project slugs", () => {
    expect(projectPageSlugs.sort()).toEqual(projects.map((p) => p.slug).sort());
  });

  it.each(Object.keys(projectPages))("%s: tagline, 3..6 features, 4 steps, valid shapes, both locales", (slug) => {
    const page = projectPages[slug];
    for (const loc of ["en", "pt"] as const) expect(page.tagline[loc].length).toBeGreaterThan(20);
    expect(page.features.length).toBeGreaterThanOrEqual(3);
    expect(page.features.length).toBeLessThanOrEqual(6);
    expect(new Set(page.features.map((f) => f.id)).size).toBe(page.features.length);
    for (const f of page.features) {
      expect(SHAPES).toContain(f.shape);
      for (const loc of ["en", "pt"] as const) {
        expect(f.title[loc].length).toBeGreaterThan(0);
        expect(f.body[loc].length).toBeGreaterThan(0);
      }
    }
    expect(page.steps).toHaveLength(4);
    for (const s of page.steps) {
      expect(s.title.en.length).toBeGreaterThan(0);
      expect(s.title.pt.length).toBeGreaterThan(0);
      expect(s.code?.length ?? 0).toBeGreaterThan(0);
    }
    expect(["cove", "monitorpilot", "webai", "kit"]).toContain(page.demo);
  });

  it("page chrome strings exist in both locales with parity", () => {
    const keys = ["features", "getStarted", "back", "demo", "openRepo"] as const;
    for (const k of keys) {
      expect(typeof en.project[k]).toBe("string");
      expect(typeof pt.project[k]).toBe("string");
    }
    expect(Object.keys(en.project).sort()).toEqual(Object.keys(pt.project).sort());
  });
});
