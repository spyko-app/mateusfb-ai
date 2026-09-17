import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Footer } from "@/components/sections/Footer";
import { getMessages } from "@/lib/i18n";
import { projects } from "@/content/projects";

afterEach(cleanup);

describe("Footer", () => {
  it("wraps every column link and the locale switch in a scramble target", () => {
    const m = getMessages("en");
    render(<Footer locale="en" pathname="/en/writing" />);
    const labels = [
      ...projects.map((p) => p.name),
      m.nav.projects,
      m.nav.writing,
      m.nav.about,
      m.nav.github,
      m.cta.email,
      m.footer.privacy,
      m.footer.license,
      "PT",
    ];
    for (const label of labels) {
      const link = screen.getByRole("link", { name: label });
      expect(link, label).toHaveAttribute("data-scramble");
      expect(link.querySelector(`[aria-label="${label}"]`), `ScrambleText for ${label}`).not.toBeNull();
    }
    // rights text stays plain
    expect(screen.getByText(m.footer.rights).querySelector("[aria-label]")).toBeNull();
  });
});
