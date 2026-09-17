import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, getMessages } from "@/lib/i18n";
import { Container, DashedCard, Button } from "@/components/ds";

const STACK = ["Swift/SwiftUI", "TypeScript/Next.js", "Python", "Claude Code", "Vercel", "macOS"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getMessages(locale);
  return { title: `${m.about.title} — mateusfb.ai`, description: m.about.body };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const m = getMessages(locale);

  return (
    <Container className="flex flex-col gap-16 py-[80px]">
      <div className="flex flex-col gap-6">
        <h1 className="text-subhead">{m.about.title}</h1>
        <p className="max-w-[68ch] text-body text-fg/70">{m.about.body}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <DashedCard className="flex flex-col gap-4 p-6">
          <h2 className="text-eyebrow text-fg/60">{m.about.stack}</h2>
          <ul className="flex flex-col gap-2 text-body">
            {STACK.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </DashedCard>
        <DashedCard className="flex flex-col gap-4 p-6">
          <h2 className="text-eyebrow text-fg/60">{m.about.contact}</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" href="mailto:hello@mateusfb.ai">
              {m.cta.email}
            </Button>
            <Button variant="outline" href="https://github.com/mateusfb">
              {m.cta.github}
            </Button>
          </div>
        </DashedCard>
      </div>

      <section id="privacy" className="flex flex-col gap-3">
        <h2 className="text-eyebrow text-fg/60">{m.about.privacyTitle}</h2>
        <p className="max-w-[68ch] text-caption text-fg/60">{m.about.privacyBody}</p>
      </section>
    </Container>
  );
}
