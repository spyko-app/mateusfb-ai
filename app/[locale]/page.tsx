import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { Hero } from "@/components/hero";
import { CTA } from "@/components/sections/CTA";
import WhereISit from "@/components/sections/WhereISit";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <>
      <Hero locale={locale} />
      <WhereISit locale={locale} />
      <CTA locale={locale} />
    </>
  );
}
