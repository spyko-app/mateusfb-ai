# Marca mateusfb.ai

## Conceito — núcleo + órbita
Um **núcleo** (a pessoa/direção), uma **órbita aberta** (o loop de agentes que constrói — aberta porque nunca fecha, sempre em produção) e um **satélite** (o que é lançado: repositório, app, conteúdo). Abstrato por decisão do dono: **não é um "M"**, não é logo de planeta genérico (a órbita tem abertura ≥ 60°). Só o satélite pode girar (`animated`).

## Variante escolhida: **B** (ajustada)
Comparação em `variants.html` / `variants.png` (A/B/C a 16/32/128, branco-no-preto e preto-no-branco).
- **A** (gap 80° a 45°, satélite a 225°): a 16/32 px o satélite funde com a órbita — perde o terceiro elemento.
- **C** (gap 60° a 90°, satélite a 270° na borda do gap): lê como ícone de "power"/alvo; satélite some no arco.
- **B** (gap 110° a 300°, satélite a 120°): os três elementos ficam distintos até 16 px, assimetria dá movimento, abertura pro alto-direita não lê como letra.

Ajuste feito: **stroke da órbita 1,5 → 1,75** (a 16 px o 1,5 afinava demais). Resto igual ao brief.

`MARK_GEOMETRY` (viewBox 32×32): core r 4,5 @ (16,16) · órbita r 12,5, stroke 1,75, gap 110°, início 300° · satélite r 2,75 @ 120°.

## Regras
- **Área de respiro:** 1× diâmetro do núcleo (9 unidades no viewBox) em volta.
- **Tamanho mínimo:** 16 px.
- **Cor:** só preto/branco via `currentColor`. Nunca cor, gradiente ou sombra.
- **Não:** rotacionar a marca (só o satélite anima), contornar o núcleo, mudar o gap, esticar, combinar com o "M".
- Wordmark: `mateusfb` Geist Sans 500 + `.ai` Geist Mono 400 a 60%.

## Arquivos
- `components/brand/` — `Mark` (inline SVG, `MARK_GEOMETRY`, `orbitPath`, `satellitePoint`), `Wordmark`, `Lockup`, `ShufflingMark` (client, 7 pontos que embaralham no hover/click e voltam em 600 ms).
- `public/brand/mark.svg` (branco) · `mark-inverted.svg` (preto) · `wordmark.svg` · `lockup.svg` — os dois últimos usam `<text font-family="Geist">`: precisa da fonte instalada pra renderizar fiel; senão cai em system-ui.
- `public/brand/lockup.png` — 512 px, screenshot de `variants.html`.
- `app/icon.svg` — favicon: marca em quadrado preto `rx 6`.
- `app/[locale]/opengraph-image.tsx` — OG 1200×630, lockup 64 px + descrição (Geist Medium/Regular lidos de `node_modules/geist`, fallback sans-serif).
- `app/[locale]/brand` — página de QA (`docs/qa/brand.png`).
