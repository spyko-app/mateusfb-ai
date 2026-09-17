import { describe, it, expect, vi } from "vitest";
import { getRepoStats, relativeTime } from "@/lib/github";
import { projects } from "@/content/projects";

const p = projects[0];
const mk = (status: number, body: unknown) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

describe("getRepoStats", () => {
  it("maps GitHub payload", async () => {
    const s = await getRepoStats(p, mk(200, { stargazers_count: 12, pushed_at: "2026-09-10T00:00:00Z", language: "TypeScript" }));
    expect(s).toEqual({ stars: 12, pushedAt: "2026-09-10T00:00:00Z", language: "TypeScript", source: "github" });
  });
  it("falls back on 403 rate limit", async () => {
    expect((await getRepoStats(p, mk(403, {}))).source).toBe("fallback");
  });
  it("falls back on network error", async () => {
    const f = vi.fn(async () => { throw new Error("boom"); }) as unknown as typeof fetch;
    expect((await getRepoStats(p, f)).source).toBe("fallback");
  });
  it("skips fetch when project has no repo", async () => {
    const f = vi.fn() as unknown as typeof fetch;
    const noRepo = { ...projects[3], owner: undefined, repo: undefined };
    const s = await getRepoStats(noRepo, f);
    expect(f).not.toHaveBeenCalled();
    expect(s.source).toBe("fallback");
  });
});

describe("relativeTime", () => {
  const now = new Date("2026-09-17T12:00:00Z");
  it("en", () => {
    expect(relativeTime("2026-09-14T12:00:00Z", "en", now)).toBe("3 days ago");
    expect(relativeTime("2026-09-17T11:00:00Z", "en", now)).toBe("1 hour ago");
  });
  it("pt", () => {
    expect(relativeTime("2026-09-14T12:00:00Z", "pt", now)).toBe("há 3 dias");
  });
});
