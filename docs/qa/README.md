# QA visual — o que cada screenshot prova

Gerado por `scripts/qa-screens.sh <baseUrl> <outDir> [sessao]` com agent-browser (Chromium headless).
Última rodada local: `next build && next start -p 3111` → `docs/qa/local/` (1440×900 e 390×844).
Checklist de origem: `docs/spec.md` §7.

| Arquivo | O que prova |
|---|---|
| `home-top.png` | Hero na primeira dobra: nav de 3 pílulas (links · marca · GitHub/Let's talk), badge `v0.1`, título por palavra, 2 CTAs e a pilha dither (three.js) visível sem rolar. |
| `home-scrolled-nav.png` | Ao rolar, a pílula central colapsa para **56px** (o script imprime a largura medida) com o anel de progresso; seção 01 com **4 cards** de projeto e stats (★, "updated", link GitHub). |
| `home-writing.png` | Seção 03: linhas de post (data · título · resumo · "Read"), botão "All writing" com largura natural, início do CTA com ruído. |
| `footer.png` | CTA com canvas de ruído + 2 botões; rodapé com **5 células** tracejadas (Projects · Site · Social · Legal · badges), badges "All systems normal"/"Built in Brasil", marca embaralhando; anel do nav completo no fim da página. |
| `where-0.05.png` | Seção 02 estado 1 (p≈0): card "The idea" ativo (invertido, branco); diagrama plano com camadas espaçadas. |
| `where-0.35.png` | Seção 02 estado 2 (p≈.35): card "The agents" ativo; pilha em **isométrico 3D** com o mark. |
| `where-0.65.png` | Seção 02 transição 2→3 (p≈.65): card "The output" chegando; pilha quase plana (montagem). |
| `where-0.95.png` | Seção 02 estado 3 (p≈.95): card "The output" ativo; pilha assentada (You · agents · kits · logos · products). |
| `projects-en.png` | `/en/projects`: cabeçalho, filtro All/Shipped/Building e os 4 cards. |
| `projects-en-building.png` | `/en/projects?status=building`: filtro "Building" ativo (invertido) e só o card em progresso. |
| `home-pt.png` | `/pt`: toda a copy da home vem de `messages/pt.json` (nav, hero, seções). |
| `post-en.png` | `/en/writing/hello-world`: voltar, data, título, resumo e corpo MDX (negrito, h2, code). |
| `about-en.png` | `/en/about`: bio, cards Stack/Contact, nota de privacidade. |
| `notfound-en.png` | `/en/nope` → **404** com layout do site (nav + rodapé), copy `notFound` EN, botão "Go home" → `/en`. |
| `notfound-pt.png` | `/pt/nope` → 404 localizada em PT ("Não encontrado", "Ir pro início" → `/pt`). |
| `mobile-home-en.png` | 390×844: nav reduzida (marca + "Menu"), hero empilhado, canvas presente. |
| `mobile-menu.png` | Menu mobile aberto: overlay, links grandes, "Close", "Let's talk" + troca de idioma no rodapé do menu. |
| `mobile-pt.png` | 390×844 em PT. |
| `console-errors.txt` | Saída de `agent-browser console` (filtrada por error) + `agent-browser errors` após percorrer todas as páginas — **deve estar vazia**. |

Screenshots das tasks anteriores (hero, ds, brand, og, where-reduced-motion, where-mobile) ficam na raiz de `docs/qa/`.

## Checagens fora de screenshot
- `curl -s localhost:3111/en | wc -c` → ~153 KB (< 250 KB).
- three.js só aparece num chunk lazy (`grep -l three .next/static/chunks/*.js` → 1 arquivo, que **não** está na lista de scripts do HTML de `/en`).
- Links dos 4 repositórios respondem 200. `LICENSE` (MIT) foi adicionado ao repo para o link do rodapé resolver quando o repositório for publicado.

## Seção 02 × antimetal.com (`docs/qa/where2/`)

Gerado por `scripts/qa-where2.sh <baseUrl> <outDir> [sessao] [w h]`: captura `/en` nos mesmos `p` da referência `docs/ref/am-p<p>.png` (antimetal.com a 1280×577; `p = (scrollY − topo da grade) / (altura da grade − vh)`), em `p = 0 · .12 · .25 · .4 · .55 · .7 · .85 · 1 · 1.15`. `1440/` = mesma rodada a 1440×900. `console-errors.txt` deve estar vazio.
