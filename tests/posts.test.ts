import { describe, it, expect } from "vitest";
import path from "node:path";
import { getPosts, getPost } from "@/lib/posts";

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
  it("real content dir has both locales for every post", () => {
    const en = getPosts("en");
    const pt = getPosts("pt");
    expect(en.map((p) => p.slug).sort()).toEqual(pt.map((p) => p.slug).sort());
    expect(en.length).toBeGreaterThanOrEqual(2);
  });
});
