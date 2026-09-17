import Link from "next/link";
import en from "@/messages/en.json";

export default function NotFound() {
  return (
    <main className="p-8">
      <h1 className="text-display">{en.notFound.title}</h1>
      <p>{en.notFound.body}</p>
      <Link href="/en">{en.notFound.home}</Link>
    </main>
  );
}
