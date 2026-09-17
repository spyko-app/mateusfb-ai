import Link from "next/link";
import { DashedCard, Reveal } from "@/components/ds";
import { formatDate, plainTitle, type Post } from "@/lib/posts";
import { localePath, type Locale, type Messages } from "@/lib/i18n";

export function PostRow({
  post,
  locale,
  messages: m,
}: {
  post: Post;
  locale: Locale;
  messages: Messages;
}) {
  const href = localePath(locale, `/writing/${post.slug}`);
  return (
    <Reveal>
      <DashedCard
        as={Link}
        href={href}
        className="grid cursor-pointer grid-cols-1 gap-4 p-6 transition-colors duration-200 hover:border-fg/40 hover:bg-fg/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg/60 focus-visible:ring-offset-2 md:grid-cols-[160px_1fr_auto] md:items-baseline"
      >
        <time className="text-eyebrow text-fg/60" dateTime={post.date}>
          {formatDate(post.date, locale)}
        </time>
        <div>
          <h3 className="text-pullquote text-fg">{plainTitle(post.title)}</h3>
          <p className="mt-2 text-caption text-fg/60 transition-colors duration-200 group-hover:text-fg/80">
            {post.summary}
          </p>
        </div>
        <span className="text-button text-fg/60 transition-colors duration-200 group-hover:text-fg">
          {m.writing.read}{" "}
          <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            ↗
          </span>
        </span>
      </DashedCard>
    </Reveal>
  );
}
