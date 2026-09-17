import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, getMessages, localePath, locales } from "@/lib/i18n";
import { alternatesFor } from "@/lib/site";
import { Button, Container, DashedCard, Eyebrow, Reveal, SectionHeader } from "@/components/ds";
import { projects, repoUrl } from "@/content/projects";
import { getProjectPage, projectPageSlugs } from "@/content/project-pages";
import { ProjectDemo } from "@/components/projects/ProjectDemo";
import { FeatureGrid } from "@/components/projects/FeatureGrid";
import { Steps } from "@/components/projects/Steps";
import { PageEnd } from "@/components/sections/PageEnd";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => projectPageSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const project = projects.find((p) => p.slug === slug);
  const page = getProjectPage(slug);
  if (!project || !page) return {};
  return { title: `${project.name} · mateusfb.ai`, description: page.tagline[locale], alternates: alternatesFor(locale, `/projects/${slug}`) };
}

export default async function ProjectPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const project = projects.find((p) => p.slug === slug);
  const page = getProjectPage(slug);
  if (!project || !page) notFound();
  const m = getMessages(locale);
  const url = repoUrl(project);

  return (
    <>
      <Container className="flex flex-col gap-[120px] py-[80px]">
        <section data-project-hero className="flex flex-col items-center gap-5 pt-10 text-center">
          <Reveal>
            <DashedCard className="inline-flex items-center gap-3 px-3 py-[6px]">
              <span className="text-eyebrow text-fg">{project.language}</span>
              <Eyebrow>{m.project.status[project.status]}</Eyebrow>
            </DashedCard>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="text-display">{project.name}</h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="max-w-[60ch] text-body text-fg/70">{page.tagline[locale]}</p>
          </Reveal>
          <Reveal delay={0.3} className="flex flex-wrap justify-center gap-3">
            {url && (
              <Button variant="solid" href={url} magnetic>
                {m.project.openRepo}
              </Button>
            )}
            <Button variant="outline" href={localePath(locale, "/projects")} magnetic>
              {m.project.back}
            </Button>
          </Reveal>
        </section>

        <ProjectDemo demo={page.demo} locale={locale} label={m.project.demo} />

        <section id="features" className="flex flex-col gap-12">
          <SectionHeader num="01" eyebrow={m.project.features} title={m.project.featuresTitle} body={m.project.featuresBody} />
          <FeatureGrid features={page.features} locale={locale} />
        </section>

        <section id="get-started" className="flex flex-col gap-12">
          <SectionHeader num="02" eyebrow={m.project.getStarted} title={m.project.stepsTitle} body={m.project.stepsBody} />
          <Steps steps={page.steps} locale={locale} />
        </section>
      </Container>
      <PageEnd locale={locale} />
    </>
  );
}
