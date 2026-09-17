import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { isLocale, locales, getMessages, type Locale } from "@/lib/i18n";
import { GlassFilter } from "@/components/ds";
import "../globals.css";

export const generateStaticParams = () => locales.map((locale) => ({ locale }));

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getMessages(locale);
  return {
    title: m.meta.title,
    description: m.meta.description,
    metadataBase: new URL("https://mateusfb-ai.vercel.app"),
    alternates: { languages: { en: "/en", pt: "/pt" } },
    openGraph: { title: m.meta.title, description: m.meta.description, locale },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale as Locale} className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body>
        <GlassFilter />
        {children}
      </body>
    </html>
  );
}
