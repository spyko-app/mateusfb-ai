import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { isLocale, getMessages } from "@/lib/i18n";
import { alternatesFor } from "@/lib/site";
import { Container, SectionHeader } from "@/components/ds";
import { projects } from "@/content/projects";
import { getRepoStats } from "@/lib/github";
import { ProjectsFilter } from "@/components/sections/ProjectsFilter";
import { ProjectsGrid, ProjectsGridStatic } from "@/components/sections/ProjectsGrid";
import { PageEnd } from "@/components/sections/PageEnd";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getMessages(locale);
  return { title: `${m.nav.projects} · mateusfb.ai`, alternates: alternatesFor(locale, "/projects") };
}

/** Estática: rende os 4 cards; o filtro `?status=` é aplicado no cliente (useSearchParams, em Suspense). */
export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const m = getMessages(locale);
  const stats = await Promise.all(projects.map((p) => getRepoStats(p)));
  const items = projects.map((project, i) => ({ project, stats: stats[i] }));

  return (
    <>
    <Container className="py-[80px] flex flex-col gap-12">
      <SectionHeader num={m.projects.num} eyebrow={m.projects.eyebrow} title={m.projects.title} body={m.projects.body} />
      <Suspense fallback={<ProjectsGridStatic items={items} locale={locale} />}>
        <ProjectsFilter messages={m} />
        <ProjectsGrid items={items} locale={locale} />
      </Suspense>
    </Container>
    <PageEnd locale={locale} />
    </>
  );
}
