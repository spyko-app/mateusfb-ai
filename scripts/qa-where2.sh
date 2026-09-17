#!/usr/bin/env bash
# Captura a seção 02 nos mesmos p da referência (docs/ref/am-p*.png, antimetal.com a 1280×577).
# p = (scrollY − topo da grade) / (altura da grade − vh). Uso: scripts/qa-where2.sh <baseUrl> <outDir> [sessao] [w h]
set -e
B=${1:-http://localhost:3114}; O=${2:-docs/qa/where2}; S=${3:-task14}; W=${4:-1280}; H=${5:-577}
mkdir -p "$O"; A="agent-browser --session $S"
$A set viewport "$W" "$H" >/dev/null
$A open "$B/en" >/dev/null; $A wait 2000 >/dev/null
for p in 0 0.12 0.25 0.4 0.55 0.7 0.85 1 1.15; do
  $A eval "(()=>{const s=document.querySelector('#where > div:last-child');const r=s.getBoundingClientRect();const top=r.top+window.scrollY;const h=s.offsetHeight-window.innerHeight;window.scrollTo(0,top+h*$p);})()" >/dev/null
  $A wait 900 >/dev/null; $A screenshot "$O/p$p.png" >/dev/null; echo "  p$p.png"
done
{ $A console 2>/dev/null | grep -iE "error" || true; $A errors 2>/dev/null || true; } > "$O/console-errors.txt"
echo "  $(wc -l < "$O/console-errors.txt" | tr -d ' ') erro(s) de console"
