import { describe, it, expect } from "vitest";
import path from "node:path";
import { getPosts, getPost, plainTitle, titleLines } from "@/lib/posts";

const dir = path.join(__dirname, "fixtures/posts");
const badDir = path.join(__dirname, "fixtures/posts-bad");

describe("posts", () => {
  it("lists locale posts newest first", () => {
    expect(getPosts("en", dir).map((p) => p.slug)).toEqual(["b", "a"]);
  });
  it("marks availability", () => {
    expect(getPost("en", "b", dir)?.availableIn).toEqual(["en", "pt"]);
    expect(getPost("en", "a", dir)?.availableIn).toEqual(["en"]);
  });
  it("falls back to other locale", () => {
    const p = getPost("pt", "a", dir);
    expect(p?.locale).toBe("en");
    expect(p?.slug).toBe("a");
  });
  it("returns null for unknown", () => {
    expect(getPost("en", "zzz", dir)).toBeNull();
  });
  it("throws naming the bad file", () => {
    expect(() => getPost("en", "bad", badDir)).toThrow(/bad\.en\.mdx/);
  });
  it("splits a title on \\n for the h1 and flattens it for lists", () => {
    expect(titleLines("A:\nB")).toEqual(["A:", "B"]);
    expect(plainTitle("A:\nB")).toBe("A: B");
    expect(titleLines("Single")).toEqual(["Single"]);
  });
  it("building-with-agents has a two-line title in both locales", () => {
    expect(titleLines(getPost("en", "building-with-agents")!.title)).toEqual(["Building with agents:", "spec first, then let it run"]);
    expect(titleLines(getPost("pt", "building-with-agents")!.title)).toEqual(["Construindo com agentes:", "spec primeiro, depois deixa rodar"]);
    expect(titleLines(getPost("en", "hello-world")!.title)).toHaveLength(1);
  });
  it("real content dir has both locales for every post", () => {
    const en = getPosts("en");
    const pt = getPosts("pt");
    expect(en.map((p) => p.slug).sort()).toEqual(pt.map((p) => p.slug).sort());
    expect(en.length).toBeGreaterThanOrEqual(2);
  });
});
