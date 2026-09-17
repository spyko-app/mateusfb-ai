import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { isLocale, locales, getMessages, type Locale } from "@/lib/i18n";
import { GlassFilter } from "@/components/ds";
import { BASE_URL } from "@/lib/site";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/sections/Footer";
import "../globals.css";

export const generateStaticParams = () => locales.map((locale) => ({ locale }));

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getMessages(locale);
  return {
    title: m.meta.title,
    description: m.meta.description,
    metadataBase: new URL(BASE_URL),
    openGraph: { title: m.meta.title, description: m.meta.description, locale: locale === "pt" ? "pt_BR" : "en_US" },
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
        <SmoothScroll>
          <Nav locale={locale} />
          <main>{children}</main>
          <Footer locale={locale} />
        </SmoothScroll>
      </body>
    </html>
  );
}
