import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, getMessages } from "@/lib/i18n";
import { getPosts } from "@/lib/posts";
import { Container, SectionHeader } from "@/components/ds";
import { PostRow } from "@/components/sections/PostRow";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getMessages(locale);
  return { title: `${m.writing.title} — mateusfb.ai`, description: m.writing.body };
}

export default async function WritingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const m = getMessages(locale);
  const posts = getPosts(locale);
  return (
    <Container className="flex flex-col gap-12 py-[80px]">
      <SectionHeader num={m.writing.num} eyebrow={m.writing.eyebrow} title={m.writing.title} body={m.writing.body} />
      <div className="flex flex-col gap-[9px]">
        {posts.map((post) => (
          <PostRow key={post.slug} post={post} locale={locale} messages={m} />
        ))}
      </div>
      {posts.length === 0 && <p className="text-caption text-fg/60">{m.writing.empty}</p>}
    </Container>
  );
}
