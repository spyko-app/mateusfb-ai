import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/site";
import { locales, localePath, type Locale } from "@/lib/i18n";
import { getPosts } from "@/lib/posts";


function alternates(path: string) {
  return {
    languages: Object.fromEntries(locales.map((l) => [l, `${BASE_URL}${localePath(l, path)}`])),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["/", "/projects", "/writing", "/about"];
  const entries: MetadataRoute.Sitemap = [];

  for (const path of staticPaths) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}${localePath(locale, path)}`,
        alternates: alternates(path),
      });
    }
  }

  for (const locale of locales) {
    for (const post of getPosts(locale as Locale)) {
      const path = `/writing/${post.slug}`;
      entries.push({
        url: `${BASE_URL}${localePath(locale, path)}`,
        lastModified: post.date,
        alternates: alternates(path),
      });
    }
  }

  return entries;
}
