import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PostRow } from "@/components/sections/PostRow";
import { getMessages } from "@/lib/i18n";
import type { Post } from "@/lib/posts";

const post: Post = {
  slug: "a",
  locale: "en",
  title: "T:\nU",
  date: "2026-09-17",
  summary: "S",
  tags: [],
  content: "",
  availableIn: ["en"],
};

describe("PostRow", () => {
  it("renders the whole row as a single link, with no scramble on its text", () => {
    const { container } = render(
      <PostRow post={post} locale="en" messages={getMessages("en")} />
    );
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("href")).toBe("/en/writing/a");
    expect(screen.getByText(/2026/).tagName.toLowerCase()).toBe("time");
    expect(screen.getByRole("heading", { name: "T: U" })).toBeTruthy();
    expect(screen.getByText(/Read/)).toBeTruthy();
    expect(container.querySelector("[data-scramble]")).toBeNull();
  });
});
