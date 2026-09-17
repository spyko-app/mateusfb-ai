import { Container, SectionHeader, Button } from "@/components/ds";
import { PostRow } from "./PostRow";
import { getPosts } from "@/lib/posts";
import { getMessages, localePath, type Locale } from "@/lib/i18n";

export function Writing({ locale, limit = 3 }: { locale: Locale; limit?: number }) {
  const m = getMessages(locale);
  const posts = getPosts(locale);
  return (
    <section id="writing">
      <Container className="flex flex-col gap-12 py-[80px]">
        <SectionHeader num={m.writing.num} eyebrow={m.writing.eyebrow} title={m.writing.title} body={m.writing.body} />
        <div className="flex flex-col gap-[9px]">
          {posts.slice(0, limit).map((post) => (
            <PostRow key={post.slug} post={post} locale={locale} messages={m} />
          ))}
        </div>
        {posts.length === 0 && <p className="text-caption text-fg/60">{m.writing.empty}</p>}
        <div>
          <Button variant="outline" href={localePath(locale, "/writing")}>
            {m.writing.all}
          </Button>
        </div>
      </Container>
    </section>
  );
}
