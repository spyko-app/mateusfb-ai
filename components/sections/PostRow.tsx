import Link from "next/link";
import { DashedCard, Reveal, ScrambleText } from "@/components/ds";
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
        as="article"
        className="grid grid-cols-1 gap-4 p-6 md:grid-cols-[160px_1fr_auto] md:items-baseline"
      >
        <time className="text-eyebrow text-fg/60" dateTime={post.date}>
          {formatDate(post.date, locale)}
        </time>
        <div>
          <h3 className="text-pullquote">
            <Link href={href} data-scramble>
              <ScrambleText text={plainTitle(post.title)} />
            </Link>
          </h3>
          <p className="mt-2 text-caption text-fg/60">{post.summary}</p>
        </div>
        <Link className="text-button text-fg" href={href} data-scramble>
          <ScrambleText text={m.writing.read} /> ↗
        </Link>
      </DashedCard>
    </Reveal>
  );
}
