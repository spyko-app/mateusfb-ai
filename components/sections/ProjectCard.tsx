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
  const linkProps = url ? { as: "a" as const, href: url, target: "_blank", rel: "noreferrer" } : {};
  return (
    <Reveal delay={index * 0.08}>
      <DashedCard
        {...linkProps}
        className={`flex h-full min-h-[260px] flex-col justify-between p-6 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg/60 focus-visible:ring-offset-2 ${
          url ? "cursor-pointer hover:bg-fg/[0.04] hover:border-fg/40" : ""
        }`}
      >
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
            <span className="whitespace-nowrap text-fg">
              {m.projects.open}{" "}
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                ↗
              </span>
            </span>
          )}
        </div>
      </DashedCard>
    </Reveal>
  );
}
