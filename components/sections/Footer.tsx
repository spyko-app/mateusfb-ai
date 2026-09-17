import Link from "next/link";
import { DashedCard, Eyebrow, ScrambleText } from "@/components/ds";
import { ShufflingMark } from "@/components/brand";
import { getMessages, localePath, type Locale } from "@/lib/i18n";
import { projects, repoUrl, githubProfile, contactEmail } from "@/content/projects";
import { LocaleSwitch } from "@/components/nav/LocaleSwitch";

export const LICENSE_URL = "https://github.com/spyko-app/mateusfb-ai/blob/main/LICENSE";

type Item = { label: string; href: string; external?: boolean };

function Col({ title, items }: { title: string; items: Item[] }) {
  return (
    <DashedCard className="min-h-[220px] px-[19.5px] pt-[64px] pb-[19.5px]">
      <Eyebrow className="absolute left-[19.5px] top-[19.5px]">{title}</Eyebrow>
      <ul className="flex flex-col gap-1 text-body">
        {items.map((it) => (
          <li key={it.href + it.label}>
            {it.external ? (
              <a href={it.href} target="_blank" rel="noreferrer" data-scramble className="text-fg/70 transition-colors duration-200 hover:text-fg">
                <ScrambleText text={it.label} />
              </a>
            ) : (
              <Link href={it.href} data-scramble className="text-fg/70 transition-colors duration-200 hover:text-fg">
                <ScrambleText text={it.label} />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </DashedCard>
  );
}

export function Footer({ locale, pathname }: { locale: Locale; pathname?: string }) {
  const m = getMessages(locale);
  const p = (path: string) => localePath(locale, path);
  const cols: { title: string; items: Item[] }[] = [
    {
      title: m.footer.projects,
      items: projects.map((pr) => {
        const url = repoUrl(pr);
        return url ? { label: pr.name, href: url, external: true } : { label: pr.name, href: p("/projects") };
      }),
    },
    {
      title: m.footer.site,
      items: [
        { label: m.nav.projects, href: `${p("/")}#projects` },
        { label: m.nav.writing, href: p("/writing") },
        { label: m.nav.about, href: p("/about") },
      ],
    },
    {
      title: m.footer.social,
      items: [
        { label: m.nav.github, href: githubProfile, external: true },
        { label: m.cta.email, href: `mailto:${contactEmail}`, external: true },
      ],
    },
    {
      title: m.footer.legal,
      items: [
        { label: m.footer.privacy, href: p("/about#privacy") },
        { label: m.footer.license, href: LICENSE_URL, external: true },
      ],
    },
  ];

  return (
    <footer className="relative w-full pb-[100px] xl:pb-0">
      <div className="w-full p-4 md:p-[30px]">
        <div className="grid w-full grid-cols-2 gap-[9px] md:grid-cols-4 xl:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,2fr)]">
          {cols.map((c) => (
            <Col key={c.title} title={c.title} items={c.items} />
          ))}
          <DashedCard className="relative col-span-2 min-h-[220px] p-[19.5px] xl:col-span-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 bg-fg px-2 py-1 text-eyebrow text-bg">
                <span aria-hidden className="h-[6px] w-[6px] rounded-full bg-bg" />
                {m.footer.status}
              </span>
              <span className="border border-fg/20 px-2 py-1 text-eyebrow">{m.footer.built}</span>
            </div>
            <p className="absolute bottom-[19.5px] left-[19.5px] max-w-[60%] whitespace-pre-line text-eyebrow text-fg/60">
              {m.footer.tagline}
            </p>
            <div className="absolute bottom-[19.5px] right-[19.5px]">
              <ShufflingMark size={72} />
            </div>
          </DashedCard>
        </div>
        <div className="flex justify-between pt-[10px] text-eyebrow text-fg/40">
          <span>{m.footer.rights}</span>
          <LocaleSwitch locale={locale} pathname={pathname} className="!text-fg/40 hover:!text-fg" />
        </div>
      </div>
    </footer>
  );
}
