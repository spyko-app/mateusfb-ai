import { notFound } from "next/navigation";

/** Catch-all: qualquer rota desconhecida dentro do locale cai na 404 localizada. */
export default function CatchAll() {
  notFound();
}
