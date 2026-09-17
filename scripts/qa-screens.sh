#!/usr/bin/env bash
# Screenshots de QA local. Uso: scripts/qa-screens.sh <baseUrl> <outDir> [sessao]
# Cobre: nav (topo/scrollado), 4 estados da seção 02, footer, /projects (+filtro), /pt, post, about, 404, mobile.
# No fim imprime os erros de console/página (devem ser 0) em <outDir>/console-errors.txt.
set -e
B=${1:-http://localhost:3000}; O=${2:-docs/qa}; S=${3:-qa}
mkdir -p "$O"; A="agent-browser --session $S"

shot() { # shot <arquivo> [ms]
  $A wait "${2:-1500}" >/dev/null; $A screenshot "$O/$1.png" >/dev/null; echo "  $1.png"
}
goto() { $A open "$1" >/dev/null; }

echo "== desktop 1440x900"
$A set viewport 1440 900 >/dev/null
goto "$B/en";            shot home-top 2500
$A eval "window.scrollTo(0,600)" >/dev/null; shot home-scrolled-nav 1200
echo "  center pill width: $($A eval "document.querySelector('[data-center-pill]').getBoundingClientRect().width")"
$A eval "window.scrollTo(0,document.body.scrollHeight)" >/dev/null; shot footer

# seção 02: 4 posições do scroll dentro de #where (p≈.05 .35 .65 .95)
for p in 0.05 0.35 0.65 0.95; do
  $A eval "(()=>{const s=document.querySelector('#where > div:last-child');const r=s.getBoundingClientRect();const top=r.top+window.scrollY;const h=s.offsetHeight-window.innerHeight;window.scrollTo(0,top+h*$p);})()" >/dev/null
  shot "where-$p" 1200
done

goto "$B/en";
$A eval "document.querySelector('#writing').scrollIntoView()" >/dev/null; shot home-writing 1200
goto "$B/en/projects";                 shot projects-en
goto "$B/en/projects?status=building"; shot projects-en-building
goto "$B/pt";                          shot home-pt 2500
goto "$B/en/writing/hello-world";      shot post-en
goto "$B/en/about";                    shot about-en
goto "$B/en/nope";                     shot notfound-en
goto "$B/pt/nope";                     shot notfound-pt

echo "== mobile 390x844"
$A set viewport 390 844 >/dev/null
goto "$B/en";            shot mobile-home-en 2500
$A eval "document.querySelector('nav button[aria-expanded]')?.click()" >/dev/null; shot mobile-menu 800
goto "$B/pt";            shot mobile-pt 2000

echo "== console/page errors"
{ $A console 2>/dev/null | grep -iE "error" || true; $A errors 2>/dev/null || true; } > "$O/console-errors.txt"
echo "  $(wc -l < "$O/console-errors.txt" | tr -d ' ') linha(s) em $O/console-errors.txt"
