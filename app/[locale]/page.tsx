import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { Hero } from "@/components/hero";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <main>
      <Hero locale={locale} />
    </main>
  );
}
