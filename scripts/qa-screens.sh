#!/usr/bin/env bash
# Screenshots de QA: nav (topo/scrollado), footer e mobile. Uso: scripts/qa-screens.sh <baseUrl> <outDir>
set -e; B=${1:-http://localhost:3000}; O=${2:-docs/qa}; mkdir -p "$O"; A=agent-browser
$A set viewport 1440 900 >/dev/null; $A open "$B/en" >/dev/null; $A wait 2500; $A screenshot "$O/home-top.png"
$A eval "window.scrollTo(0,600)" >/dev/null; $A wait 1200; $A screenshot "$O/home-scrolled-nav.png"
$A eval "document.querySelector('[data-center-pill]').getBoundingClientRect().width"
$A eval "window.scrollTo(0,document.body.scrollHeight)" >/dev/null; $A wait 1500; $A screenshot "$O/footer.png"
$A eval "JSON.stringify({errors: (window.__errs||[]).length})"
$A set viewport 390 844 >/dev/null; $A open "$B/pt" >/dev/null; $A wait 2000; $A screenshot "$O/mobile-pt.png"
