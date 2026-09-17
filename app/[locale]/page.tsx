import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { Hero } from "@/components/hero";
import { Projects } from "@/components/sections/Projects";
import { Writing } from "@/components/sections/Writing";
import { CTA } from "@/components/sections/CTA";
import WhereISit from "@/components/sections/WhereISit";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <>
      <Hero locale={locale} />
      <Projects locale={locale} />
      <WhereISit locale={locale} />
      <Writing locale={locale} />
      <CTA locale={locale} />
    </>
  );
}
