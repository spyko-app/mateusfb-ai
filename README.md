# mateusfb.ai

**Live:** https://mateusfb-ai.vercel.app · **Repo:** https://github.com/spyko-app/mateusfb-ai

Personal portfolio and blog for Mateus Ferreira Bandeira. Black-and-white,
Next.js (App Router) + Tailwind v4, Geist typeface, MDX content.

## Development

```bash
npm run dev      # dev server on http://localhost:3000
npm run build    # production build
npm run check    # lint + typecheck + test (must be green before commit)
```

## Design system

Design tokens live in `app/tokens.css` (`--bg`, `--fg`, easings, durations,
layout constants) and are wired into Tailwind's `@theme` in `app/globals.css`.
Motion tokens (`EASE_OUT_QUINT`, `EASE_IN_OUT`, `DUR`, `revealVariants`) live
in `lib/motion.ts`. The full design spec is at `docs/spec.md`.

## Adding a blog post

Create `content/posts/<slug>.en.mdx` and `content/posts/<slug>.pt.mdx` with
frontmatter:

```md
---
title: "Post title"
date: "2026-01-01"
summary: "One-line summary."
---

Post body in MDX.
```

## Adding a project

Add an entry to `content/projects.ts`.
