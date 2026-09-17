import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { isLocale, getMessages, t, localePath, locales, type Locale } from "@/lib/i18n";
import { getPost, getPosts, formatDate, plainTitle, titleLines } from "@/lib/posts";
import { alternatesFor } from "@/lib/site";
import { Container, DashedCard, ScrambleText } from "@/components/ds";
import { PageEnd } from "@/components/sections/PageEnd";
import { mdxComponents } from "@/components/mdx/MdxComponents";

export function generateStaticParams() {
  return locales.flatMap((locale) => getPosts(locale).map((post) => ({ locale, slug: post.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const post = getPost(locale, slug);
  if (!post) return {};
  return { title: `${plainTitle(post.title)} · mateusfb.ai`, description: post.summary, alternates: alternatesFor(locale, `/writing/${slug}`) };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const m = getMessages(locale);
  const post = getPost(locale, slug);
  if (!post) notFound();

  return (
    <>
    <Container className="py-[80px]">
      <div className="mx-auto flex max-w-[760px] flex-col gap-10">
        <Link href={localePath(locale, "/writing")} data-scramble className="text-button text-fg/60 transition-colors duration-200 hover:text-fg">
          ← <ScrambleText text={m.post.back} />
        </Link>
        {post.locale !== locale && (
          <DashedCard className="p-6 text-caption text-fg/70">
            {t(m, "writing.onlyIn", { locale: post.locale.toUpperCase() })}
          </DashedCard>
        )}
        <header className="flex flex-col gap-4">
          <time className="text-eyebrow text-fg/60" dateTime={post.date}>
            {m.post.published} · {formatDate(post.date, post.locale as Locale)}
          </time>
          <h1 className="text-display">
            {titleLines(post.title).map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="text-body text-fg/60">{post.summary}</p>
        </header>
        <hr className="border-t border-dashed border-fg/15" />
        <article className="prose">
          <MDXRemote source={post.content} components={mdxComponents} />
        </article>
      </div>
    </Container>
    <PageEnd locale={locale} />
    </>
  );
}
