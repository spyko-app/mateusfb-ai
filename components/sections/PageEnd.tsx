import { Mark } from "@/components/brand";
import { getMessages, type Locale } from "@/lib/i18n";

/** Faixa de fim de conteúdo (antes do <Footer/>) nas páginas internas: linha tracejada com a marca no centro + tagline.
 *  A home não usa (o CTA já fecha a página). Sem links: nada pra embaralhar. */
export function PageEnd({ locale, className = "" }: { locale: Locale; className?: string }) {
  const m = getMessages(locale);
  return (
    <div data-testid="page-end" className={`w-full px-4 py-[120px] md:px-[30px] ${className}`}>
      <div className="relative flex items-center justify-center">
        <span aria-hidden className="absolute inset-x-0 top-1/2 border-t border-dashed border-fg/15" />
        <span className="relative bg-bg px-4 text-fg">
          <Mark size={24} />
        </span>
      </div>
      <p className="mt-6 text-center text-eyebrow text-fg/40">{m.footer.tagline.replace(/\s*\n\s*/g, " ")}</p>
    </div>
  );
}
