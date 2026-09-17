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
  it("renders link, date and heading", () => {
    render(<PostRow post={post} locale="en" messages={getMessages("en")} />);
    const readLink = screen.getByRole("link", { name: /Read/ });
    expect(readLink.getAttribute("href")).toBe("/en/writing/a");
    expect(screen.getByText(/2026/).tagName.toLowerCase()).toBe("time");
    expect(screen.getByRole("heading", { name: "T: U" })).toBeTruthy();
    expect(readLink).toHaveAttribute("data-scramble");
  });
});
