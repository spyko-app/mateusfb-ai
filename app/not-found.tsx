import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Button, Container, Eyebrow } from "@/components/ds";
import { defaultLocale, getMessages, localePath } from "@/lib/i18n";
import "./globals.css";

/** 404 raiz (fora de /en|/pt — o proxy redireciona quase tudo pro locale). Sem <html>/<body> próprios (o Next já monta o root); as vars de fonte vão no <main>. */
export default function NotFound() {
  const m = getMessages(defaultLocale);
  return (
    <main className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <section id="not-found" className="w-full">
        <Container className="flex min-h-[70vh] flex-col items-start justify-center gap-8 py-[80px]">
          <Eyebrow>404</Eyebrow>
          <h1 className="text-display text-fg">{m.notFound.title}</h1>
          <p className="max-w-[560px] text-body text-fg/70">{m.notFound.body}</p>
          <Button variant="solid" href={localePath(defaultLocale, "/")}>
            {m.notFound.home}
          </Button>
        </Container>
      </section>
    </main>
  );
}
