import type { Project } from "@/content/projects";
import type { Locale } from "@/lib/i18n";

export interface RepoStats {
  stars: number;
  pushedAt: string;
  language: string | null;
  source: "github" | "fallback";
}

const fallbackOf = (p: Project): RepoStats => ({
  stars: p.fallback.stars,
  pushedAt: p.fallback.pushedAt,
  language: p.language,
  source: "fallback",
});

export async function getRepoStats(p: Project, fetchImpl: typeof fetch = fetch): Promise<RepoStats> {
  if (!p.owner || !p.repo) return fallbackOf(p);
  try {
    const res = await fetchImpl(`https://api.github.com/repos/${p.owner}/${p.repo}`, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "mateusfb.ai" },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 3600 },
    } as RequestInit);
    if (!res.ok) throw new Error(`github ${res.status}`);
    const j = (await res.json()) as { stargazers_count: number; pushed_at: string; language: string | null };
    return { stars: j.stargazers_count, pushedAt: j.pushed_at, language: j.language, source: "github" };
  } catch (e) {
    console.warn(`[github] fallback for ${p.slug}:`, (e as Error).message);
    return fallbackOf(p);
  }
}

export function relativeTime(iso: string, locale: Locale, now: Date = new Date()): string {
  const diff = (new Date(iso).getTime() - now.getTime()) / 1000;
  const abs = Math.abs(diff);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  const [unit, secs] = units.find(([, s]) => abs >= s) ?? ["minute", 60];
  const value = Math.round(diff / secs);
  return new Intl.RelativeTimeFormat(locale === "pt" ? "pt-BR" : "en", { numeric: "always" }).format(value, unit);
}
