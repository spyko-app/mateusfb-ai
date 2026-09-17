# Design system — mateusfb.ai

Sandbox visual em `/en/ds` (ou `/pt/ds`). Este doc é a referência escrita; o código é a fonte da verdade.

## Color

Estritamente preto e branco. `--bg: #000`, `--fg: #fff` (`app/tokens.css`). Tons de cinza só via opacidade de `fg` (`text-fg/60`, `border-fg/15`, etc.) — nunca uma cor nova. `bg-fg`/`text-bg` invertem pra estados ativos.

## Type scale

Utilities em `app/globals.css`, aplicadas como `className`.

| Utility | Tamanho | Line-height | Letter-spacing | Peso |
|---|---|---|---|---|
| `text-display` | 54px | 1.1 | -2px | 400 |
| `text-subhead` | 48px | 1.1 | -1px | 400 |
| `text-pullquote` | 36px | 1.1 | -.5px | 400 |
| `text-body` | 24px | 1.2 | — | 400 |
| `text-caption` | 14px | 1.5 | — | 400 |
| `text-button` | 14px | 1.5 | — | 500 |
| `text-eyebrow` | 10px | 1 | 1px | mono, uppercase |

## Spacing / grid

- `--container: 1512px` — largura máxima do conteúdo.
- `--gutter: 120px` — padding lateral em desktop (`px-6` no mobile).
- `--frame: 30px`, `--cell-gap: 9px`, `--nav-h: 46px`.
- `Container` aplica `mx-auto w-full max-w-[var(--container)] px-6 md:px-[var(--gutter)]`.

## Motion tokens

De `lib/motion.ts`:

- `EASE_OUT_QUINT = [0.22, 1, 0.36, 1]`, `EASE_IN_OUT = [0.65, 0, 0.35, 1]`.
- `DUR = { 200, 360, 600, 700 }` (segundos).
- `revealVariants` — `hidden: {opacity:0, y:12}` → `visible: {opacity:1, y:0}` com `duration: DUR[700]`, `ease: EASE_OUT_QUINT`.
- `REVEAL_VIEWPORT = { once: true, margin: "-10% 0px -10% 0px" }`.

## Primitives

### `Container`
`mx-auto w-full max-w-[var(--container)] px-6 md:px-[var(--gutter)]`.
```tsx
<Container><h1>...</h1></Container>
```

### `Eyebrow`
`text-eyebrow text-fg/60`. Aceita `as` pra trocar a tag.
```tsx
<Eyebrow>01 · PROJECTS</Eyebrow>
```

### `CornerMarks`
4 marcas em L nos cantos (SVG, `aria-hidden`), posicionadas absolutas. Uso interno do `DashedCard`, mas exportado à parte se precisar em outro container relativo.

### `DashedCard`
Borda tracejada + 4 `CornerMarks`. `active` inverte pra `bg-fg text-bg`. Aceita `as` (polimórfico) e repassa `data-*`/demais props.
```tsx
<DashedCard active className="p-8">conteúdo</DashedCard>
```

### `GlassPill`
Superfície glass arredondada (`rounded-[82px]`) com blur + filtro SVG de deslocamento (`GlassFilter`) + borda em gradiente. Usada pra nav pill / CTAs flutuantes sobre fundo escuro.
```tsx
<GlassPill className="px-4 py-2"><a href="#">Work</a></GlassPill>
```

### `GlassFilter`
Renderiza **uma vez por página** (já está em `app/[locale]/layout.tsx`) o `<svg><filter id="mfb-liquid-glass">`, referenciado pelo `backdropFilter` do `GlassPill`.

### `Button`
`variant="solid"|"outline"`. Renderiza `<Link>` (href interno), `<a target="_blank">` (href externo) ou `<button>`. `magnetic` puxa o botão em direção ao cursor (±6px), desabilitado com `prefers-reduced-motion` ou `(hover: none)`.
```tsx
<Button variant="solid" href="/work" magnetic>Ver projetos</Button>
```

### `Reveal`
`motion.div` com `revealVariants` + `whileInView` (`REVEAL_VIEWPORT`, dispara uma vez). Com `prefers-reduced-motion`, renderiza uma `div` plana (sem animação). Client component.
```tsx
<Reveal delay={0.1}><p>Conteúdo que entra ao rolar.</p></Reveal>
```

### `SectionHeader`
Linha `num · eyebrow` + `h2.text-subhead` + `p.text-body`, envolvido em `Reveal`.
```tsx
<SectionHeader num="01" eyebrow="Projects" title="Título" body="Descrição." />
```

## Do / Don't

- ✅ Cinza só via opacidade de `fg`. ❌ Nunca introduzir cor cromática.
- ✅ Fontes do projeto (Geist via `geist/font`). ❌ Nunca Google Fonts.
- ✅ Copy só em `messages/en.json` / `messages/pt.json` fora do styleguide. ❌ String hardcoded em página de produto.
- ✅ `Reveal` dispara uma vez (`REVEAL_VIEWPORT.once: true`). ❌ Não re-animar ao rolar pra cima e descer de novo.
- ✅ Motion tokens de `lib/motion.ts`. ❌ Easing/duração inventados ad-hoc.
- ✅ `GlassFilter` uma vez por página (no layout). ❌ Duplicar o `<filter>` em cada `GlassPill`.
