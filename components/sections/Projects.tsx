import { Button, Container, SectionHeader } from "@/components/ds";
import { getMessages, localePath, type Locale } from "@/lib/i18n";
import { projects } from "@/content/projects";
import { getRepoStats } from "@/lib/github";
import { ProjectCard } from "./ProjectCard";

export async function Projects({ locale, limit }: { locale: Locale; limit?: number }) {
  const m = getMessages(locale);
  const list = limit ? projects.slice(0, limit) : projects;
  const stats = await Promise.all(list.map((p) => getRepoStats(p)));
  return (
    <section id="projects" className="w-full">
      <Container className="py-[80px] flex flex-col gap-12">
        <SectionHeader num={m.projects.num} eyebrow={m.projects.eyebrow} title={m.projects.title} body={m.projects.body} />
        <div className="grid grid-cols-1 gap-[9px] md:grid-cols-2 xl:grid-cols-4">
          {list.map((p, i) => (
            <ProjectCard key={p.slug} project={p} stats={stats[i]} locale={locale} index={i} />
          ))}
        </div>
        <div>
          <Button variant="outline" href={localePath(locale, "/projects")}>
            {m.projects.all}
          </Button>
        </div>
      </Container>
    </section>
  );
}
