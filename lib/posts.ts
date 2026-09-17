import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { locales, type Locale } from "@/lib/i18n";

const Front = z.object({
  title: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  summary: z.string().min(1),
  tags: z.array(z.string()).default([]),
});

export interface Post {
  slug: string;
  locale: Locale;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  content: string;
  availableIn: Locale[];
}

const DEFAULT_DIR = path.join(process.cwd(), "content/posts");

const parseName = (f: string) => {
  const m = /^(.+)\.(en|pt)\.mdx$/.exec(f);
  return m ? { slug: m[1], locale: m[2] as Locale } : null;
};

function read(dir: string, slug: string, locale: Locale): Post | null {
  const file = path.join(dir, `${slug}.${locale}.mdx`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const parsed = Front.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Invalid frontmatter in ${path.basename(file)}: ${parsed.error.message}`);
  }
  const availableIn = locales.filter((l) => fs.existsSync(path.join(dir, `${slug}.${l}.mdx`)));
  return { slug, locale, ...parsed.data, content, availableIn };
}

export function getPosts(locale: Locale, dir = DEFAULT_DIR): Post[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .map(parseName)
    .filter((x): x is { slug: string; locale: Locale } => !!x && x.locale === locale)
    .map((x) => read(dir, x.slug, locale)!)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(locale: Locale, slug: string, dir = DEFAULT_DIR): Post | null {
  return (
    read(dir, slug, locale) ??
    locales
      .filter((l) => l !== locale)
      .map((l) => read(dir, slug, l))
      .find(Boolean) ??
    null
  );
}

export function formatDate(iso: string, locale: Locale): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
