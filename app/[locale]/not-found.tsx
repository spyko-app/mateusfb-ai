"use client";

import { usePathname } from "next/navigation";
import { Button, Container, Eyebrow } from "@/components/ds";
import { defaultLocale, getMessages, isLocale, localePath, type Locale } from "@/lib/i18n";
import { PageEnd } from "@/components/sections/PageEnd";

/** 404 localizada. not-found não recebe params: lê o locale do pathname (client, sem tornar a rota dinâmica). */
export default function NotFound() {
  const pathname = usePathname() ?? "";
  const first = pathname.split("/")[1];
  const locale: Locale = isLocale(first) ? first : defaultLocale;
  const m = getMessages(locale);
  return (
    <section id="not-found" className="w-full">
      <Container className="flex min-h-[70vh] flex-col items-start justify-center gap-8 py-[80px]">
        <Eyebrow>404</Eyebrow>
        <h1 className="text-display text-fg">{m.notFound.title}</h1>
        <p className="max-w-[560px] text-body text-fg/70">{m.notFound.body}</p>
        <Button variant="solid" href={localePath(locale, "/")}>
          {m.notFound.home}
        </Button>
      </Container>
      <PageEnd locale={locale} />
    </section>
  );
}
