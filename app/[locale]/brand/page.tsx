import type { Metadata } from "next";
import { Mark, Wordmark, Lockup, ShufflingMark } from "@/components/brand";
import { PageEnd } from "@/components/sections/PageEnd";
import { defaultLocale, isLocale } from "@/lib/i18n";

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <section className="flex items-center gap-12 border-t border-fg/15 py-8">
    <span className="text-eyebrow w-40 shrink-0 text-fg/60">{label}</span>
    <div className="flex flex-wrap items-center gap-12">{children}</div>
  </section>
);

/** Página de dev — fora do índice. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function BrandPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <main className="min-h-screen bg-bg px-12 py-16 text-fg">
      <h1 className="text-subhead mb-10">Brand</h1>
      <Row label="Mark · static">
        <Mark size={16} /><Mark size={32} /><Mark size={128} />
      </Row>
      <Row label="Mark · animated">
        <Mark size={16} animated /><Mark size={32} animated /><Mark size={128} animated />
      </Row>
      <Row label="Wordmark"><Wordmark className="text-body" /></Row>
      <Row label="Lockup"><Lockup size={16} /><Lockup size={24} className="text-body" /></Row>
      <Row label="Inverted">
        <span className="inline-flex items-center gap-4 bg-fg p-4 text-bg"><Mark size={32} /><Lockup size={16} /></span>
      </Row>
      <Row label="ShufflingMark"><ShufflingMark size={64} /></Row>
      <PageEnd locale={isLocale(locale) ? locale : defaultLocale} />
    </main>
  );
}
