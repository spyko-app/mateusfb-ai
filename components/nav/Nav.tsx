import { GlassPill, Button } from "@/components/ds";
import { getMessages, localePath, type Locale } from "@/lib/i18n";
import { githubProfile, contactEmail } from "@/content/projects";
import { NavLinks, type NavLink } from "./NavLinks";
import { NavCenterPill } from "./NavCenterPill";
import { MobileMenu } from "./MobileMenu";

export function navLinks(locale: Locale): NavLink[] {
  const m = getMessages(locale);
  return [
    { label: m.nav.projects, href: `${localePath(locale, "/")}#projects` },
    { label: m.nav.writing, href: localePath(locale, "/writing") },
    { label: m.nav.about, href: localePath(locale, "/about") },
  ];
}

/** Server component: monta strings a partir das messages e entrega às partes client. */
export function Nav({ locale, pathname }: { locale: Locale; pathname?: string }) {
  const m = getMessages(locale);
  const links = navLinks(locale);
  const talkHref = `mailto:${contactEmail}`;
  return (
    <nav aria-label="Main" className="sticky top-0 z-50 px-4 pt-4 md:px-[30px] md:pt-[30px]">
      <div className="relative h-[46px]">
        <div className="absolute left-0 top-0 hidden lg:block">
          <GlassPill>
            <NavLinks links={links} locale={locale} pathname={pathname} />
          </GlassPill>
        </div>
        <div className="absolute left-1/2 top-0 -translate-x-1/2">
          <NavCenterPill href={localePath(locale, "/")} label={m.nav.home} />
        </div>
        <div className="absolute right-0 top-0 hidden lg:block">
          <GlassPill>
            <ul className="flex items-center gap-2">
              <li>
                <a
                  href={githubProfile}
                  target="_blank"
                  rel="noreferrer"
                  className="block px-[14px] py-[6px] text-button text-fg/60 transition-colors duration-200 hover:text-fg"
                >
                  {m.nav.github}
                </a>
              </li>
              <li>
                <Button variant="solid" href={talkHref} className="!py-[6px]">
                  {m.nav.talk}
                </Button>
              </li>
            </ul>
          </GlassPill>
        </div>
        <div className="absolute right-0 top-0 lg:hidden">
          <MobileMenu
            links={links}
            locale={locale}
            pathname={pathname}
            github={{ label: m.nav.github, href: githubProfile }}
            talkHref={talkHref}
            labels={{ menu: m.nav.menu, close: m.nav.close, talk: m.nav.talk }}
          />
        </div>
      </div>
    </nav>
  );
}
