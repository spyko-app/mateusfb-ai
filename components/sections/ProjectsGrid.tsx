"use client";

import { useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import type { RepoStats } from "@/lib/github";
import type { Project, ProjectStatus } from "@/content/projects";
import { ProjectCard } from "./ProjectCard";

export type ProjectItem = { project: Project; stats: RepoStats };

export const parseStatus = (status: string | null | undefined): ProjectStatus | undefined =>
  status === "shipped" || status === "building" ? status : undefined;

/** Grade sem filtro (fallback do Suspense: vai no HTML estático, todos os cards). */
export function ProjectsGridStatic({ items, locale }: { items: ProjectItem[]; locale: Locale }) {
  return (
    <div className="grid grid-cols-1 gap-[9px] md:grid-cols-2 xl:grid-cols-4">
      {items.map((it, i) => (
        <ProjectCard key={it.project.slug} project={it.project} stats={it.stats} locale={locale} index={i} />
      ))}
    </div>
  );
}

/** Grade filtrada no cliente por `?status=` — a página fica estática (sem searchParams no servidor). */
export function ProjectsGrid({ items, locale }: { items: ProjectItem[]; locale: Locale }) {
  const filter = parseStatus(useSearchParams().get("status"));
  const list = filter ? items.filter((it) => it.project.status === filter) : items;
  return <ProjectsGridStatic items={list} locale={locale} />;
}
