import { DashedCard, Eyebrow, Reveal, ScrambleText } from "@/components/ds";
import Link from "next/link";
import { getMessages, localePath, type Locale } from "@/lib/i18n";
import { relativeTime, type RepoStats } from "@/lib/github";
import type { Project } from "@/content/projects";

export function ProjectCard({
  project,
  stats,
  locale,
  index = 0,
}: {
  project: Project;
  stats: RepoStats;
  locale: Locale;
  index?: number;
}) {
  const m = getMessages(locale);
  // O card inteiro é um link INTERNO pra página do projeto; o "GitHub ↗" mora na página de detalhe (sem <a> aninhado).
  const href = localePath(locale, `/projects/${project.slug}`);
  const building = project.status === "building";
  return (
    <Reveal delay={index * 0.08}>
      <DashedCard
        as={Link}
        href={href}
        data-scramble=""
        className="flex h-full min-h-[260px] cursor-pointer flex-col justify-between p-6 transition-colors duration-200 hover:border-fg/40 hover:bg-fg/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg/60 focus-visible:ring-offset-2"
      >
        <div className="h-6 flex items-center justify-between gap-3">
          <Eyebrow>{stats.language ?? project.language}</Eyebrow>
          {building ? (
            <span className="text-eyebrow bg-fg text-bg px-2 py-1">{m.projects.building}</span>
          ) : null}
        </div>
        <div>
          <h3 className="text-pullquote xl:text-[clamp(22px,1.9vw,30px)] mt-6 h-[1.1em] leading-[1.1] whitespace-nowrap overflow-hidden text-ellipsis">
            {project.name}
          </h3>
          <p className="text-caption text-fg/60 mt-3">{project.description[locale]}</p>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-eyebrow text-fg/60">
          <span className="whitespace-nowrap">
            ★ {stats.stars} · {m.projects.updated} {relativeTime(stats.pushedAt, locale)}
          </span>
          <span className="whitespace-nowrap text-fg">
            <ScrambleText text={m.projects.view} />{" "}
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              →
            </span>
          </span>
        </div>
      </DashedCard>
    </Reveal>
  );
}
