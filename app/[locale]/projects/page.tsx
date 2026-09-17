import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, getMessages } from "@/lib/i18n";
import { Container, SectionHeader } from "@/components/ds";
import { projects, type ProjectStatus } from "@/content/projects";
import { getRepoStats } from "@/lib/github";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { ProjectsFilter } from "@/components/sections/ProjectsFilter";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getMessages(locale);
  return { title: `${m.nav.projects} — mateusfb.ai` };
}

export default async function ProjectsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { status } = await searchParams;
  const m = getMessages(locale);

  const filter = status === "shipped" || status === "building" ? (status as ProjectStatus) : undefined;
  const list = filter ? projects.filter((p) => p.status === filter) : projects;
  const stats = await Promise.all(list.map((p) => getRepoStats(p)));

  return (
    <Container className="py-[80px] flex flex-col gap-12">
      <SectionHeader num={m.projects.num} eyebrow={m.projects.eyebrow} title={m.projects.title} body={m.projects.body} />
      <ProjectsFilter messages={m} />
      <div className="grid grid-cols-1 gap-[9px] md:grid-cols-2 xl:grid-cols-4">
        {list.map((p, i) => (
          <ProjectCard key={p.slug} project={p} stats={stats[i]} locale={locale} index={i} />
        ))}
      </div>
    </Container>
  );
}
