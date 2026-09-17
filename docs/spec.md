# mateusfb.ai — site pessoal (conteúdo + repositórios + criações) — Design

**Data:** 2026-09-17 · **Dono:** Mateus (Mateus-fb) · **Status:** aprovado pelo dono (brainstorming 17/set)
**Deploy alvo:** `https://mateusfb-ai.vercel.app` (conta Vercel `nexyocontato-2896`) · **Repo:** `github.com/spyko-app/mateusfb-ai` (público) em `/Volumes/PortableSSD/mateusfb-ai` (fora do monorepo Spyko).

## 1. Objetivo

Site em preto e branco, minimal e moderno, onde o dono publica **conteúdo (posts MDX)**, expõe os **repositórios** (web.ai, monitorpilot, cove, vibe100coding kit) e as **criações** feitas com IA. Bilíngue EN/PT. Custo R$0 (Vercel hobby, GitHub API pública, fontes open-source).

Referências (medidas via DOM/CSS computado em 17/set — replicar comportamento, não copiar fonte proprietária):
- **xmcp.dev** → hero (fundo preto, badge de versão, h1 sans centralizado, canvas WebGL com dither 1-bit Bayer, 2 botões).
- **framer.com** → interfaces/interações (pill buttons, reveals fade+blur, scroll suave, cards com borda sutil).
- **antimetal.com** → nav superior, seção **02 "Where we sit"** (integral) e rodapé.

## 2. Stack e estrutura

| Camada | Escolha | Motivo |
|---|---|---|
| Framework | Next.js 15 App Router + TypeScript | Vercel nativo, MDX, ISR |
| Estilo | Tailwind v4 + `app/tokens.css` (CSS vars) | tokens do DS em um lugar |
| Motion | `motion` (Framer Motion) + Lenis | `useScroll`, reveals, scroll suave |
| Hero WebGL | three.js (só o shader de dither) | isolado em `components/hero/DitherCanvas.tsx`, lazy, fallback estático |
| Conteúdo | MDX em `content/posts/<slug>.<locale>.mdx` + `gray-matter` + `next-mdx-remote/rsc` | R$0, versionado, "postar = push" |
| Projetos | `content/projects.ts` (fonte) + GitHub REST público com `revalidate: 3600` | stats ao vivo; fallback estático se API falhar |
| i18n | segmento `app/[locale]/` (`en` default, `pt`) + `messages/{en,pt}.json` + middleware `Accept-Language` | sem lib pesada |
| Testes | vitest (utils/i18n/conteúdo/projetos) · `next build` + `tsc --noEmit` + eslint · **agent-browser** (local e preview Vercel) | validado antes de entregar |

```
mateusfb-ai/
  app/[locale]/(site)/page.tsx            # home
  app/[locale]/projects/page.tsx          # lista
  app/[locale]/writing/page.tsx           # lista posts
  app/[locale]/writing/[slug]/page.tsx    # post MDX
  app/[locale]/about/page.tsx
  app/[locale]/layout.tsx                 # Nav + Footer + Lenis + fontes
  app/tokens.css  app/globals.css
  app/opengraph-image.tsx  app/icon.svg
  middleware.ts                           # locale redirect
  components/ds/     Eyebrow · DashedCard · CornerMarks · Pill · GlassPill · Button · Reveal · Container · SectionHeader
  components/brand/  Mark · Wordmark · Lockup · ShufflingMark
  components/nav/    Nav · NavCenterPill · NavRing · MobileMenu
  components/hero/   Hero · DitherCanvas (three) · HeroFallback
  components/sections/ Projects · WhereISit (StickyCards + StackDiagram3D + StackDiagramFlat) · Writing · CTA (NoiseCanvas) · Footer
  content/projects.ts  content/posts/*.mdx  messages/en.json  messages/pt.json
  lib/  i18n.ts · posts.ts · github.ts · motion.ts (tokens de easing)
  docs/design-system.md  docs/brand/ (svg do logo)
  public/brand/  mark.svg wordmark.svg lockup.svg (+ inverted)  og.png
  tests/  *.test.ts
```

## 3. Design system (`docs/design-system.md` + `app/tokens.css`)

**Cor (P&B estrito):** `--bg: #000` · `--fg: #fff` · escalas só por opacidade: `fg/90 fg/60 fg/40 fg/20 fg/10 fg/6`. Bordas `fg/15` tracejadas (`border-dashed`). Sem cor cromática em lugar nenhum (logos de integrações em grayscale + `opacity .58`).

**Tipografia:** `Geist` (display + corpo) · `Geist Mono` (eyebrow/metadados). Escala (desktop → mobile):
- `display` 54/59.4 ls −2px (→ 40) · `subhead` 48/52.8 ls −1px (→ 34) · `pullquote` 36/39.6 (→ 28) · `body` 24/28.8 (→ 18) · `caption` 14/21 · `button` 14/21 w500 · `eyebrow` 10 uppercase ls 1px mono.

**Espaço/grid:** container `max-w-[1512px]`, gutter `px-6 md:px-[120px]`, seção `py-[80px]`, padding do frame `p-4 md:p-[30px]`, gap de células `9px`.

**Motion tokens** (`lib/motion.ts` + CSS vars): `--ease-out-quint: cubic-bezier(.22,1,.36,1)` · `--ease-in-out: cubic-bezier(.65,0,.35,1)` · durações `200 / 360 / 600 / 700ms`. Reveal padrão: `opacity 0→1`, `translate3d(0,12px,0)→0`, 700ms out-quint, `once`, `margin -10%`. `prefers-reduced-motion` desliga transforms e canvases (mostra fallback estático).

**Primitivos:**
- `DashedCard` — `relative border border-dashed border-fg/15` + `CornerMarks` (4 `<svg 7×7>` em "L", `stroke 1.5`, posicionados `-1px` nos cantos). Prop `active` → `bg-fg text-bg` (inverte), transição de cor 200ms.
- `GlassPill` — raio 82px, `bg fg/8`, `backdrop-filter blur(2.6px) saturate(180%) brightness(110%)` + filtro SVG `feTurbulence 0.012 / feDisplacementMap 18`, borda gradiente 0.5px via mask xor, brilho diagonal `linear-gradient(122deg, fg/16 → 0 44%)`.
- `Pill`/`Button` — `solid` (fg no bg) e `outline` (borda fg/20), `rounded-full`, hover `scale 1.02` 200ms, magnetic ±6px no desktop.
- `Eyebrow`, `SectionHeader` (`NN · TÍTULO` com ponto 2px separador, h2 subhead, p body), `Reveal`, `Container`.

## 4. Marca — mateusfb.ai

**Conceito do ícone (o que foi entregue): pilha isométrica ("3D em 2D").** Três planos quadrados em projeção isométrica (losangos a 30°), empilhados com deslocamento vertical; o de cima sólido, os dois de baixo só contorno fino. Abstrai "camadas que constroem algo" (ideias → agentes → entregue) e espelha o diagrama de pilha da seção 02. Lê a 16px; versão animada = o plano de cima "respira" (8s ease-in-out); no rodapé vira `ShufflingMark` (12 vértices embaralham no hover e voltam). Substituiu o conceito inicial "núcleo + órbita". Geometria, variantes comparadas (A/B/C) e regras de uso em `docs/brand/README.md`.
- **Wordmark:** `mateusfb` em Geist Medium 500, ls −0.01em + `.ai` em Geist Mono 400, `fg/60`. **Lockup:** mark 16px + gap 8px + wordmark.
- Entregas em `public/brand/`: `mark.svg`, `mark-inverted.svg`, `wordmark.svg`, `lockup.svg`, `app/icon.svg` (favicon), `app/opengraph-image.tsx` (1200×630: lockup + tagline), `docs/brand/README.md` (uso, área de respiro = 1× diâmetro do núcleo, tamanho mínimo 16px).

## 5. Páginas e seções (todas sob `/[locale]`)

### Nav (Antimetal, P&B)
`sticky top-0 z-50 px-4 pt-4 md:px-[30px] md:pt-[30px]`, altura 46px, 3 `GlassPill` absolutas: esquerda links (`Projects · Writing · About`, `px-[14px] py-[6px] text-button fg/60 hover:fg`, highlight que desliza atrás do link hovered: `360ms out-quint`); centro pílula-logo `width min(385px, 100vw-32px)` no topo → **56px ao rolar > 40px** (`600ms in-out`), texto do wordmark colapsa via `max-width/opacity`, e um `<svg>` de **anel de progresso** (`pathLength=1`, `stroke-dashoffset = 1 - progresso`, `stroke fg 1.5`, glow `feGaussianBlur 3`) + ponto (`r 2.5`, glow `stdDeviation 5`) que percorre o contorno; direita `GitHub` (fg/60) + `Button solid` "Let's talk" (mailto `spykocontato@gmail.com`). Toggle de idioma `EN/PT` mono 10px dentro da pílula esquerda. `<lg`: só pílula central + botão menu → painel fullscreen com links.

### Hero (xmcp)
`min-h-[100svh]` centrado. Eyebrow badge tracejado: `v0.1` + `NOW BUILDING · VIBE100CODING KIT`. H1 `display` centrado, max 14ch, reveal por palavra (stagger 40ms, blur 8px→0 + y 12px). Sub `caption fg/60`. Botões: `solid` "See projects" (#projects) + `outline` "Read writing". Abaixo, `DitherCanvas` 720×500 (responsivo): three.js renderiza o **mark 3D** (torus fino + esfera + esfera satélite) girando lento com parallax de mouse (±6°), pós-processado por shader **Bayer 4×4 1-bit** (branco no preto, pixel 2px). Lazy (`dynamic`, `ssr:false`); sem WebGL/reduced-motion → `HeroFallback` (SVG do mark com dither em pattern).

### 01 · Projects
`SectionHeader("01", "PROJECTS", "Things I'm building", ...)`. Grid `1 / 2 / 4` de `DashedCard` (reveal com stagger 80ms): eyebrow linguagem · título · descrição (do `projects.ts`, EN/PT) · linha mono `★ stars · updated {relative}` · link "GitHub ↗". Card do `vibe100coding-kit` com badge `IN PROGRESS` (sem link se o repo ainda não existir — campo `repo?` opcional). Dados: `lib/github.ts` → `GET api.github.com/repos/{owner}/{repo}` com `next: { revalidate: 3600 }`; erro/rate-limit → usa `fallback` do `projects.ts` e loga no server.

### 02 · Where I sit (Antimetal, integral)
Cabeçalho: `02 · WHERE I SIT` · h2 "A person, a stack of agents, and things that ship." · p.
Grid `lg:grid-cols-2`, `pl` alinhado ao container.
- **Esquerda `StickyCards`:** wrappers 1–2 `h-screen`, wrapper 3 `min-h-[55vh]` (como na referência: o 3º card fica ativo em p=1 sem chegar a grudar), cada um com filho `sticky top-[8rem]` `DashedCard` (`p-8`, eyebrow, h3 pullquote `whitespace-pre-line`, p caption fg/60 max 480px). O card **ativo** (`data-active`) = aquele cujo wrapper cruza o centro da viewport → inverte (fg/bg). Mapeamento (igual ao antimetal.com): p 0–.25 → card 1 · p .4–.85 → card 2 · p 1 → card 3. Textos: *THE IDEA* "Ideas should\nship themselves." · *THE AGENTS* "A layer that\nowns the build." · *THE OUTPUT* "Everyone else prompts.\nI ship."
- **Direita `StackDiagram3D`** (`sticky top-0 h-screen`, `hidden lg:flex`, pilha `max-w-[442px]` encostada à direita da coluna): calibrada frame a frame nos PNGs `docs/ref/am-p*.png` (antimetal.com a 1280×577). A projeção da referência é um **skew 2D** (lados verticais, arestas horizontais sobem 9.6° pra direita) — `skewY(−9.6deg) scale(.935)`, origem no centro — não uma rotação 3D. Estado puro em `lib/stack-state.ts` (`stackState(p)`, testado), `p ∈ [0, 1.15]`: `[0,1]` = seção sticky (`useScroll` da grade, `start start → end end`) e `[1, 1.15]` = saída da seção (`end end → end 0.4`, 60vh de scroll, sem espaçador).
  - `p 0`: **plano** — `You` e `Shipped` colados (gap 10px).
  - `p .02–.14`: inclina e abre um vão de 125px entre eles; **extrusões** aparecem (3 linhas finas por card, saindo dos cantos sup-dir, inf-dir e inf-esq a 45° na tela, 60px, esvanecendo — `Extrusions.tsx`; o ângulo −40.5° é pré-compensado pro skew).
  - `p .25–.47`: `Claude Code agents` (antes) e `Spyko kits` + bloco quadrado tracejado com o mark (depois, +.05) **deslizam da esquerda (x −40%, opacity 0→1)** pro vão; o vão cresce até a altura natural.
  - `p .55–.70`: abre a faixa das integrações entre `kits` e `Shipped`.
  - `p .68–1`: as 9 células (8 logos grayscale: GitHub, Vercel, Next.js, Swift, Python, TypeScript, Claude, macOS + "+ more") entram em **cascata** esquerda → direita (`seg(p, .68+i·.03, .76+i·.03)`), cada uma com extrusão curta.
  - `p 1–1.15`: volta ao plano (skew/scale → 0/1, extrusões somem) enquanto a coluna sticky sai da tela.
  - Cada camada é `DashedCard` 442×72 (`min-h-[72px]`, padding 18/16), h3 Geist 16px w500 ls −0.02em, body 9px fg/60; miolo `grid-cols-[1fr_154px]`, gaps 10px; integrações `grid-cols-9 gap-[8px]`.
  - Easing por trecho: out-quint. QA: `scripts/qa-where2.sh` → `docs/qa/where2/p<p>.png` lado a lado com `docs/ref/am-p<p>.png`.
- **`StackDiagramFlat`** (`lg:hidden`, `min-h-[min(720px,100svh)]`): a versão final 2D estática (mesma CSS do fallback Antimetal, com container queries 760/560/500px).

### 03 · Writing
`SectionHeader("03", "WRITING", "Notes from building")`. Lista dos 3 posts mais recentes do locale: linha `DashedCard` horizontal — data mono, título pullquote, resumo caption, "Read ↗". Link "All writing →". `/writing` = lista completa; `/writing/[slug]` = MDX (`prose` do DS: h2 subhead, p body 20/30 max 68ch, code mono fg/90 em bloco fg/6, imagens `img max-w-full`), frontmatter `{title, date, summary, tags?}`; slug do arquivo; se só existir em um idioma, o outro mostra aviso "Available in EN".

### CTA + Footer (Antimetal)
- **CTA:** `section overflow-hidden` com `NoiseCanvas` (canvas 2D, grão branco animado a 12fps, opacity .35) atrás; h2 heading centrado "Building in public." · p · botões `GitHub` (solid) + `Email` (outline). Fundo `bg` (preto), texto `fg`.
- **Footer:** `p-4 md:p-[30px]`, grid `grid-cols-2 md:grid-cols-4 xl:grid-cols-[repeat(4,1fr)_2fr] gap-[9px]`; 4 `DashedCard min-h-[220px]` (eyebrow `absolute 19.5px`: PROJECTS · SITE · SOCIAL · LEGAL; links `text-body` empilhados `gap-1`) + 1 célula `col-span-2` com badges mono (`● ALL SYSTEMS NORMAL` invertido, `BUILT IN BRASIL`), tagline mono fg/60 no canto inferior esquerdo e o `ShufflingMark` (botão; clique/hover embaralha os pontos e retorna, 600ms in-out) no canto inferior direito. Linha final: `© 2026 mateusfb.ai · EN / PT`.

### `/projects`, `/about`
`/projects`: mesma grid com todos os projetos + filtro por status (`shipped / building`). `/about`: bio curta (EN/PT do `messages`), stack em `DashedCard`s, links.

## 6. Dados, erros, acessibilidade

- GitHub: fetch server-side, ISR 1h, sem token; timeout 5s; qualquer falha → fallback estático, nunca quebra build. Tests: `github.test.ts` cobre 200 / 403 rate-limit / timeout.
- MDX: `lib/posts.ts` lê `content/posts`, valida frontmatter com zod (`title`, `date` ISO, `summary`); arquivo inválido → erro de build nomeando o arquivo. Tests: parse, ordenação por data, filtro por locale, fallback de idioma.
- i18n: `lib/i18n.ts` (`locales`, `defaultLocale`, `t(key)`), dicionários tipados; chave faltando → erro de tipo. Middleware: `/` → `/en` ou `/pt` por `Accept-Language`. `<html lang>` correto, `hreflang` alternates.
- A11y: contraste ≥ 7:1 (branco/preto), foco visível (`outline 1px fg offset 4px`), `aria-label` na pílula-logo, canvases `aria-hidden`, reduced-motion respeitado, navegação por teclado no menu mobile.
- Perf: fontes via `next/font` (Geist local), three.js só no chunk do hero (`dynamic`), imagens `next/image`, meta Lighthouse alvo ≥ 90 perf / 100 a11y no preview.
- SEO: `metadata` por página e locale, OG image gerada, `sitemap.ts`, `robots.ts`.

## 7. Validação (definição de pronto)

1. `npm run lint && npm run typecheck && npm run test && npm run build` verdes, saída colada no chat.
2. **agent-browser** local (`next start`) e no preview Vercel, 1440×900 e 390×844: screenshots de hero, 02 em 4 posições de scroll (p≈0, .3, .6, 1), footer, `/pt`, `/writing/<post>`; checagens: nav colapsa ao rolar, card ativo inverte, diagrama passa pelos 3 estados, sem erro no console, links dos 4 repos respondem 200.
3. Repo `spyko-app/mateusfb-ai` público com README (como postar: criar `content/posts/slug.en.mdx` + `slug.pt.mdx`, push), projeto Vercel `mateusfb-ai` ligado ao repo, produção em `mateusfb-ai.vercel.app`.
4. `docs/design-system.md`, `docs/brand/README.md` e nota em `learnings/` (SpykoStudio) escritas.

## 8. Fora de escopo (YAGNI)
CMS, comentários, newsletter, analytics pagos, dark/light toggle (o site é preto), busca, tema de código com syntax highlight colorido (P&B), domínio próprio (fica `.vercel.app` até o dono comprar).
