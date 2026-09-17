import { describe, it, expect } from "vitest";
import { BASE_URL, alternatesFor } from "@/lib/site";

describe("site", () => {
  it("BASE_URL is the canonical https origin without trailing slash", () => {
    expect(BASE_URL).toMatch(/^https:\/\/[^/]+$/);
  });
  it("alternatesFor: canonical in current locale + hreflang en/pt/x-default (x-default = en)", () => {
    expect(alternatesFor("pt", "/about")).toEqual({
      canonical: "/pt/about",
      languages: { en: "/en/about", pt: "/pt/about", "x-default": "/en/about" },
    });
    expect(alternatesFor("en", "/")).toEqual({
      canonical: "/en",
      languages: { en: "/en", pt: "/pt", "x-default": "/en" },
    });
  });
});
