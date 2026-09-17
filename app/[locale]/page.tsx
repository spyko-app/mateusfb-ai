import { isLocale, getMessages } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { CTA } from "@/components/sections/CTA";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const m = getMessages(locale);
  return (
    <>
      <div className="p-8">
        <h1 className="text-display">{m.hero.title}</h1>
      </div>
      <CTA locale={locale} />
    </>
  );
}
