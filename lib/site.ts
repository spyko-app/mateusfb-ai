import { localePath, type Locale } from "@/lib/i18n";

/** Origem canônica do site (usada em metadataBase, robots, sitemap). */
export const BASE_URL = "https://mateusfb-ai.vercel.app";

/** `alternates` de metadata por página: canonical no locale atual + hreflang en/pt/x-default (x-default = en). */
export function alternatesFor(locale: Locale, path: string) {
  return {
    canonical: localePath(locale, path),
    languages: {
      en: localePath("en", path),
      pt: localePath("pt", path),
      "x-default": localePath("en", path),
    },
  };
}
