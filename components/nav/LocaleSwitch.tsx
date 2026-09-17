"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeLabel, otherLocale, type Locale } from "@/lib/i18n";
import { ScrambleText } from "@/components/ds/ScrambleText";

/** Mesmo caminho no outro idioma. `pathname` opcional (server passa; senão usa usePathname). */
export function switchPath(locale: Locale, pathname: string) {
  const other = otherLocale(locale);
  const rest = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), "");
  return `/${other}${rest === "/" ? "" : rest}`;
}

export function LocaleSwitch({ locale, pathname, className = "" }: { locale: Locale; pathname?: string; className?: string }) {
  const current = usePathname();
  const path = pathname ?? current ?? `/${locale}`;
  const other = otherLocale(locale);
  return (
    <Link
      href={switchPath(locale, path)}
      hrefLang={other}
      lang={other}
      data-scramble
      className={`text-eyebrow text-fg/60 transition-colors duration-200 hover:text-fg ${className}`}
    >
      <ScrambleText text={localeLabel[other]} />
    </Link>
  );
}
