import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const DASHES = /[\u2014\u2013]/; // em dash, en dash

const files = [
  "messages/en.json",
  "messages/pt.json",
  "content/projects.ts",
  ...fs
    .readdirSync(path.join(root, "content/posts"))
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => `content/posts/${f}`),
];

describe("copy has no em/en dashes", () => {
  it.each(files)("%s", (file) => {
    const text = fs.readFileSync(path.join(root, file), "utf8");
    const bad = text.split("\n").filter((line) => DASHES.test(line));
    expect(bad, `dash found in ${file}:\n${bad.join("\n")}`).toEqual([]);
  });
});
