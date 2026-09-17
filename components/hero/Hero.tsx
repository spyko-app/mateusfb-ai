import { Button, DashedCard, Eyebrow, Reveal } from "@/components/ds";
import { getMessages, localePath, type Locale } from "@/lib/i18n";
import { HeroTitle } from "./HeroTitle";
import { HeroCanvas } from "./HeroCanvas";

export function Hero({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col items-center justify-center gap-8 px-6 pt-[120px] pb-16 text-center"
    >
      <Reveal>
        <DashedCard className="inline-flex items-center gap-3 px-3 py-[6px]">
          <span className="text-eyebrow text-fg">{m.hero.version}</span>
          <Eyebrow>{m.hero.eyebrow}</Eyebrow>
        </DashedCard>
      </Reveal>
      <HeroTitle text={m.hero.title} />
      <Reveal delay={0.3}>
        <p className="text-caption max-w-[48ch] text-fg/60">{m.hero.sub}</p>
      </Reveal>
      <Reveal delay={0.4} className="flex gap-3">
        <Button variant="solid" href={localePath(locale, "/#projects")} magnetic>
          {m.hero.primary}
        </Button>
        <Button variant="outline" href={localePath(locale, "/writing")} magnetic>
          {m.hero.secondary}
        </Button>
      </Reveal>
      <div className="relative mt-8 h-[500px] w-full max-w-[720px]">
        <HeroCanvas />
      </div>
    </section>
  );
}
