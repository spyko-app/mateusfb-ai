import { getMessages, type Locale } from "@/lib/i18n";
import { WhereISit as WhereISitClient } from "./where/WhereISit.client";

/** Seção 02 — "Where I sit". Wrapper server: lê as mensagens e entrega ao client. */
export default function WhereISit({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  return <WhereISitClient locale={locale} where={m.where} />;
}
