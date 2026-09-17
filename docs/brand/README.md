# Marca mateusfb.ai

## Conceito — pilha isométrica ("3D em 2D")
Três **planos quadrados** desenhados em projeção isométrica (losangos a 30°), empilhados com deslocamento vertical. Desenho 2D que lê como 3D. O **plano de cima é sólido**; os dois de baixo são só contorno fino. Abstrai "camadas que constroem algo" (ideias → agentes → entregue) e espelha o diagrama de pilha da seção 02 do site. Sem letras, sem círculos — pedido do dono: mais abstrato, "meio 3D só que em 2D", mais quadrado que redondo. Substitui a marca anterior (núcleo + órbita).

## Variante escolhida: **A**
Comparação em `variants.html` / `variants.png` (A/B/C a 16/32/128, branco-no-preto e preto-no-branco).
- **A** (offset 5,5 · w 10 · stroke 1,5): os três planos ficam distintos a 32 px e ainda separáveis a 16 px; stroke 1,5 tem peso pra aguentar o downscale; silhueta quase quadrada (20×21 no viewBox).
- **B** (offset 4,5 · w 11 · stroke 1,25): planos mais colados e traço mais fino — a 16 px os dois contornos viram uma mancha só; ganha largura mas perde altura (silhueta mais achatada, menos "quadrada").
- **C** (A + arestas laterais): as verticais cruzam o plano do meio e a 32 px viram uma gaiola; a 16 px o miolo entope. O 3D já lê pelo empilhamento — as arestas não somam.

`MARK_GEOMETRY` (viewBox 32×32): planos `cy = 10,5 / 16 / 21,5` · `cx 16` · `w 10`, `h 5` · stroke 1,5 · `sideEdges: false`. `planePath(cx, cy, w, h)` = `M cx cy-h L cx+w cy L cx cy+h L cx-w cy Z`.

## Regras
- **Área de respiro:** 1× a altura de um plano (10 unidades no viewBox) em volta.
- **Tamanho mínimo:** 16 px.
- **Cor:** só preto/branco via `currentColor`. Nunca cor, gradiente ou sombra.
- **Animação:** só `animated` — o plano de cima "respira" (sobe 1,5 px e volta, 8 s ease-in-out, `@keyframes mfb-stack`). Não rotacionar, não inclinar.
- **Não:** mudar a proporção 2:1 do losango, preencher os planos de baixo, adicionar arestas laterais, esticar, combinar com o "M".
- Wordmark: `mateusfb` Geist Sans 500 + `.ai` Geist Mono 400 a 60%. Nota: `.ai` usa `opacity-60` (não `text-fg/60`) pra manter 60% em fundos tanto pretos como invertidos (branco).

## Arquivos
- `components/brand/` — `Mark` (inline SVG, 3 `<path>`, `MARK_GEOMETRY`, `planePath`), `Wordmark`, `Lockup`, `ShufflingMark` (client, 12 pontos = 4 vértices × 3 planos, os do topo maiores; embaralham no hover/click e voltam em 600 ms).
- `public/brand/mark.svg` (branco) · `mark-inverted.svg` (preto) · `wordmark.svg` · `lockup.svg` — os dois últimos usam `<text font-family="Geist">`: precisa da fonte instalada pra renderizar fiel; senão cai em system-ui.
- `public/brand/lockup.png` — 512 px, screenshot de `variants.html`.
- `app/icon.svg` — favicon: marca em quadrado preto `rx 6`.
- `app/[locale]/opengraph-image.tsx` — OG 1200×630, lockup 64 px + descrição (Geist Medium/Regular lidos de `node_modules/geist`, fallback sans-serif). Marca inline com `#fff` explícito (Satori não suporta `currentColor`).
- `app/[locale]/brand` — página de QA (`docs/qa/brand.png`).
