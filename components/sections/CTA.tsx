import { Button, Container, Reveal } from "@/components/ds";
import { getMessages, type Locale } from "@/lib/i18n";
import { githubProfile, contactEmail } from "@/content/projects";
import { NoiseCanvas } from "./NoiseCanvas";

export function CTA({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  return (
    <section id="cta" className="relative w-full overflow-hidden py-[160px]">
      <div className="pointer-events-none absolute inset-0 z-0">
        <NoiseCanvas />
      </div>
      <Container className="relative z-10 flex flex-col items-center gap-10 text-center">
        <Reveal>
          <h2 className="text-subhead">{m.cta.title}</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="max-w-[560px] text-body text-fg/85">{m.cta.body}</p>
        </Reveal>
        <Reveal delay={0.2} className="flex flex-wrap justify-center gap-3">
          <Button variant="solid" href={githubProfile} magnetic>
            {m.cta.github}
          </Button>
          <Button variant="outline" href={`mailto:${contactEmail}`} magnetic>
            {m.cta.email}
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
