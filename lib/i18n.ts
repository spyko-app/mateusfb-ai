import en from "@/messages/en.json";
import pt from "@/messages/pt.json";
export const locales = ["en", "pt"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export type Messages = typeof en;
export const isLocale = (x: string): x is Locale => (locales as readonly string[]).includes(x);
export const getMessages = (locale: Locale): Messages => (locale === "pt" ? (pt as Messages) : en);
export const otherLocale = (l: Locale): Locale => (l === "en" ? "pt" : "en");
export const localePath = (l: Locale, path: string) => `/${l}${path === "/" ? "" : path}`;
export function t(m: Messages, key: string, vars: Record<string, string | number> = {}): string {
  const v = key.split(".").reduce<unknown>((acc, k) => (acc as Record<string, unknown> | undefined)?.[k], m);
  if (typeof v !== "string") throw new Error(`i18n: missing key "${key}"`);
  return v.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
export const localeLabel: Record<Locale, string> = { en: "EN", pt: "PT" };
