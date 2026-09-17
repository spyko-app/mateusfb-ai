import { describe, it, expect } from "vitest";
import { locales, defaultLocale, isLocale, getMessages, t, localePath, otherLocale } from "@/lib/i18n";
import en from "@/messages/en.json";
import pt from "@/messages/pt.json";
const keys = (o: unknown, p = ""): string[] => typeof o === "object" && o !== null && !Array.isArray(o)
  ? Object.entries(o).flatMap(([k, v]) => keys(v, p ? `${p}.${k}` : k)) : [p];
describe("i18n", () => {
  it("locales", () => { expect(locales).toEqual(["en", "pt"]); expect(defaultLocale).toBe("en"); expect(isLocale("pt")).toBe(true); expect(isLocale("fr")).toBe(false); });
  it("en and pt have identical key sets", () => { expect(keys(pt).sort()).toEqual(keys(en).sort()); });
  it("t resolves nested keys", () => { expect(t(getMessages("pt"), "nav.projects")).toBe("Projetos"); });
  it("t interpolates", () => { expect(t(getMessages("en"), "writing.onlyIn", { locale: "PT" })).toBe("This post is only available in PT."); });
  it("localePath/otherLocale", () => { expect(localePath("pt", "/writing")).toBe("/pt/writing"); expect(localePath("en", "/")).toBe("/en"); expect(otherLocale("en")).toBe("pt"); });
});
