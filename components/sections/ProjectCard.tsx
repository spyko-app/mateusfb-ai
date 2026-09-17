import { DashedCard, Eyebrow, Reveal } from "@/components/ds";
import { getMessages, type Locale } from "@/lib/i18n";
import { relativeTime, type RepoStats } from "@/lib/github";
import { repoUrl, type Project } from "@/content/projects";

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
  const url = repoUrl(project);
  const building = project.status === "building";
  return (
    <Reveal delay={index * 0.08}>
      <DashedCard as="article" className="flex h-full min-h-[260px] flex-col justify-between p-6">
        <div className="flex items-center justify-between gap-3">
          <Eyebrow>{stats.language ?? project.language}</Eyebrow>
          {building ? (
            <span className="text-eyebrow bg-fg text-bg px-2 py-1">{m.projects.building}</span>
          ) : null}
        </div>
        <div>
          <h3 className="text-pullquote mt-6">{project.name}</h3>
          <p className="text-caption text-fg/60 mt-3">{project.description[locale]}</p>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-eyebrow text-fg/60">
          <span className="whitespace-nowrap">
            ★ {stats.stars} · {m.projects.updated} {relativeTime(stats.pushedAt, locale)}
          </span>
          {url && (
            <a href={url} target="_blank" rel="noreferrer" className="whitespace-nowrap text-fg hover:underline">
              {m.projects.open} ↗
            </a>
          )}
        </div>
      </DashedCard>
    </Reveal>
  );
}
