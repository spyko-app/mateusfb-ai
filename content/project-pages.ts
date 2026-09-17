import type { Locale } from "@/lib/i18n";
import type { Shape } from "@/components/projects/shapes";

export type { Shape };
export type Demo = "cove" | "monitorpilot" | "webai" | "kit";

export interface ProjectFeature {
  id: string;
  title: Record<Locale, string>;
  body: Record<Locale, string>;
  shape: Shape;
}

export interface ProjectStep {
  title: Record<Locale, string>;
  code?: string;
}

export interface ProjectPage {
  tagline: Record<Locale, string>;
  features: ProjectFeature[];
  steps: ProjectStep[];
  demo: Demo;
}

/** Conteúdo por slug (de `content/projects.ts`), tirado dos READMEs em github.com/spyko-app. Sem travessões. */
export const projectPages: Record<string, ProjectPage> = {
  cove: {
    tagline: {
      en: "A Dynamic Island for the Mac notch. Now playing, system HUDs, a file shelf, clipboard history and droplets, 100% Swift/SwiftUI, no Electron, no subscriptions.",
      pt: "Uma Dynamic Island pro notch do Mac. Now playing, HUDs do sistema, shelf de arquivos, histórico de clipboard e droplets, 100% Swift/SwiftUI, sem Electron, sem assinatura.",
    },
    features: [
      {
        id: "now-playing",
        shape: "island",
        title: { en: "Now playing", pt: "Now playing" },
        body: {
          en: "Title, artist and artwork from any app via MediaRemote, with play, skip, shuffle and synced lyrics inside the island.",
          pt: "Título, artista e capa de qualquer app via MediaRemote, com play, skip, shuffle e letra sincronizada dentro da ilha.",
        },
      },
      {
        id: "huds",
        shape: "display",
        title: { en: "System HUDs", pt: "HUDs do sistema" },
        body: {
          en: "Volume, brightness, battery, Bluetooth, Focus and lock drawn in the island. The native HUD is suppressed, only Cove draws.",
          pt: "Volume, brilho, bateria, Bluetooth, Foco e bloqueio desenhados na ilha. O HUD nativo é suprimido, só o Cove desenha.",
        },
      },
      {
        id: "shelf",
        shape: "stack",
        title: { en: "Shelf and clipboard", pt: "Shelf e clipboard" },
        body: {
          en: "Drag files into the island and drop them anywhere later. Searchable clipboard history with pins, images and paste at cursor.",
          pt: "Arraste arquivos pra ilha e solte em qualquer lugar depois. Histórico de clipboard com busca, pins, imagens e colar no cursor.",
        },
      },
      {
        id: "droplets",
        shape: "grid",
        title: { en: "Droplets", pt: "Droplets" },
        body: {
          en: "Pages you open from the island: apps, notes, emoji, converter, terminal, stats, notifications mirror and tools.",
          pt: "Páginas que abrem a partir da ilha: apps, notas, emoji, conversor, terminal, stats, espelho de notificações e ferramentas.",
        },
      },
      {
        id: "captures",
        shape: "pages",
        title: { en: "Captures and voice memos", pt: "Capturas e memos de voz" },
        body: {
          en: "Screenshot and recording with an annotation editor and OCR. Voice memos with on-device transcription.",
          pt: "Screenshot e gravação com editor de anotação e OCR. Memos de voz com transcrição no próprio aparelho.",
        },
      },
      {
        id: "multi-display",
        shape: "flow",
        title: { en: "Lock screen and multi-display", pt: "Tela de bloqueio e multi-display" },
        body: {
          en: "One island per screen, real notch geometry on built-ins and a capsule on external displays. Stays on the lock screen with tinted widgets.",
          pt: "Uma ilha por tela, geometria real do notch nos built-in e cápsula nos displays externos. Fica na tela de bloqueio com widgets tingidos.",
        },
      },
    ],
    steps: [
      {
        title: { en: "Download the DMG", pt: "Baixe o DMG" },
        code: "# Releases page\nopen https://github.com/spyko-app/cove/releases\n# drag Cove onto Applications, then right-click > Open (once)",
      },
      {
        title: { en: "Or build from source", pt: "Ou compile do código" },
        code: "git clone https://github.com/spyko-app/cove.git\ncd cove\n./scripts/make-app.sh   # release build > build/Cove.app\nopen build/Cove.app",
      },
      {
        title: { en: "Grant only what you use", pt: "Conceda só o que usar" },
        code: "# all optional, asked on first use\nAccessibility      suppress native HUD, media keys, paste at cursor\nScreen Recording   captures, notification mirror\nAutomation         shuffle / repeat in Music and Spotify\nCalendars          next event, create reminders",
      },
      {
        title: { en: "Hover the notch", pt: "Passe o mouse no notch" },
        code: "swift build && .build/debug/Cove   # dev loop\nswift test                         # 400+ unit tests",
      },
    ],
    demo: "cove",
  },

  monitorpilot: {
    tagline: {
      en: "Menu-bar and CLI control for every display on your Mac: DDC/CI brightness, HiDPI, XDR boost, virtual displays, mirroring and PIP. Native Swift, no drivers, no kernel extensions.",
      pt: "Controle por menu-bar e CLI de todo display do Mac: brilho DDC/CI, HiDPI, XDR boost, displays virtuais, espelhamento e PIP. Swift nativo, sem drivers, sem extensões de kernel.",
    },
    features: [
      {
        id: "brightness",
        shape: "display",
        title: { en: "One brightness slider", pt: "Um slider de brilho" },
        body: {
          en: "Software dimming, then hardware DDC/CI over I2C, then XDR boost, in one combined slider with a configurable switch point.",
          pt: "Dimmer por software, depois DDC/CI por I2C, depois XDR boost, num slider único com ponto de troca configurável.",
        },
      },
      {
        id: "ddc",
        shape: "chain",
        title: { en: "DDC/CI that never guesses", pt: "DDC/CI que nunca chuta" },
        body: {
          en: "Per-port mapping on Apple Silicon resolves which I2C port serves which monitor. Ambiguous mapping refuses the write.",
          pt: "Mapeamento por porta no Apple Silicon resolve qual porta I2C serve qual monitor. Mapeamento ambíguo recusa a escrita.",
        },
      },
      {
        id: "hidpi",
        shape: "grid",
        title: { en: "HiDPI and virtual displays", pt: "HiDPI e displays virtuais" },
        body: {
          en: "HiDPI on any monitor through a virtual display mirrored into the physical one. Create and destroy virtual displays, layout restored.",
          pt: "HiDPI em qualquer monitor via display virtual espelhado no físico. Cria e destrói displays virtuais, layout restaurado.",
        },
      },
      {
        id: "cli",
        shape: "flow",
        title: { en: "Same binary, full CLI", pt: "Mesmo binário, CLI completa" },
        body: {
          en: "list, get, set, ddc, modes, hdr, mirror, pip, stream. Selectors accept an id, a name fragment or nothing for the main display.",
          pt: "list, get, set, ddc, modes, hdr, mirror, pip, stream. Seletores aceitam id, fragmento de nome ou nada pro display principal.",
        },
      },
      {
        id: "pip",
        shape: "stack",
        title: { en: "PIP and streaming", pt: "PIP e streaming" },
        body: {
          en: "Picture in picture of another screen or stream a screen into a virtual display, both through ScreenCaptureKit.",
          pt: "Picture in picture de outra tela ou stream de uma tela pra um display virtual, os dois via ScreenCaptureKit.",
        },
      },
      {
        id: "config",
        shape: "pages",
        title: { en: "Plain JSON config", pt: "Config em JSON puro" },
        body: {
          en: "Everything lives in ~/.config/monitorpilot/config.json, so it is versionable and scriptable. Graceful shutdown undoes mirrors and virtual displays.",
          pt: "Tudo mora em ~/.config/monitorpilot/config.json, versionável e scriptável. Encerramento limpo desfaz espelhos e displays virtuais.",
        },
      },
    ],
    steps: [
      {
        title: { en: "Install the app", pt: "Instale o app" },
        code: "# Releases page\nopen https://github.com/spyko-app/monitorpilot/releases\n# drag MonitorPilot onto Applications, right-click > Open (once)",
      },
      {
        title: { en: "Add the CLI to your shell", pt: "Adicione a CLI ao shell" },
        code: "alias monitorpilot=/Applications/MonitorPilot.app/Contents/MacOS/MonitorPilot\nmonitorpilot list          # id  name  size  tags",
      },
      {
        title: { en: "Set brightness", pt: "Ajuste o brilho" },
        code: "monitorpilot set brightness 80% LG      # Apple > DDC > software\nmonitorpilot ddc get brightness LG      # raw VCP 0x10\nmonitorpilot ddc ports                  # which I2C port serves which monitor",
      },
      {
        title: { en: "Modes, mirror, PIP", pt: "Modos, espelho, PIP" },
        code: "monitorpilot modes LG && monitorpilot set mode 967 LG\nmonitorpilot mirror DELL LG\nmonitorpilot pip LG --of \"Built-in\"\nmonitorpilot stream LG --to virtual",
      },
    ],
    demo: "monitorpilot",
  },

  "web-ai": {
    tagline: {
      en: "Elementor engine: converts a static design or site into a native, editable Elementor page. Deterministic DOM to Elementor JSON, four transport routes into WordPress, fidelity verified by computed-style diff.",
      pt: "Motor Elementor: converte um design ou site estático em página Elementor nativa e editável. DOM pra JSON Elementor determinístico, quatro rotas de transporte pro WordPress, fidelidade verificada por diff de estilo computado.",
    },
    features: [
      {
        id: "deterministic",
        shape: "flow",
        title: { en: "No AI in the layout path", pt: "Sem IA no caminho do layout" },
        body: {
          en: "Extraction, compilation, transport and verification are deterministic. Same URL, same JSON, every time. AI only labels class names and alt text.",
          pt: "Extração, compilação, transporte e verificação são determinísticos. Mesma URL, mesmo JSON, sempre. IA só rotula classes e alt text.",
        },
      },
      {
        id: "editable",
        shape: "grid",
        title: { en: "Native, editable widgets", pt: "Widgets nativos e editáveis" },
        body: {
          en: "The point is not pretty, it is editable. Two production sites at 90% and 94% native Elementor widgets the client can change alone.",
          pt: "O diferencial não é bonito, é editável. Dois sites em produção com 90% e 94% de widgets nativos que o cliente mexe sozinho.",
        },
      },
      {
        id: "transport",
        shape: "chain",
        title: { en: "Four transport routes", pt: "Quatro rotas de transporte" },
        body: {
          en: "Editor, import, save_builder or REST straight into _elementor_data, with an application password and a cache flush after.",
          pt: "Editor, import, save_builder ou REST direto em _elementor_data, com application password e limpeza de cache depois.",
        },
      },
      {
        id: "fidelity",
        shape: "display",
        title: { en: "Fidelity by measurement", pt: "Fidelidade por medição" },
        body: {
          en: "Computed-style diff against the original: 20 of 21 elements identical on the first site. A number, not an opinion.",
          pt: "Diff de estilo computado contra o original: 20 de 21 elementos idênticos no primeiro site. Um número, não uma opinião.",
        },
      },
      {
        id: "pitfalls",
        shape: "pages",
        title: { en: "19 documented pitfalls", pt: "19 armadilhas documentadas" },
        body: {
          en: "The moat is the knowledge: a real schema extracted from exports and 19 Elementor behaviors that each cost an afternoon to find.",
          pt: "O fosso é o conhecimento: schema real extraído de exports e 19 comportamentos do Elementor que custaram uma tarde cada.",
        },
      },
    ],
    steps: [
      {
        title: { en: "Clone and install", pt: "Clone e instale" },
        code: "git clone https://github.com/spyko-app/web.ai.git\ncd web.ai\nnpm install\nnode --test testes/motor.test.js   # 24 tests",
      },
      {
        title: { en: "Describe the page", pt: "Descreva a página" },
        code: "// sites/<slug>/site.js\nmodule.exports = {\n  sections: [\n    { type: \"hero\", widgets: [/* heading, text, button */] },\n  ],\n};",
      },
      {
        title: { en: "Compile and validate", pt: "Compile e valide" },
        code: "npm run cli -- build <slug>      # sites/<slug>/page.json\nnpm run cli -- validate <slug>   # schema check",
      },
      {
        title: { en: "Transport and prove", pt: "Transporte e prove" },
        code: "# REST into _elementor_data with an Application Password\ncurl -u user:app-pass -X POST https://site/wp-json/wp/v2/pages/<id> \\\n  -d @sites/<slug>/page.json\ncurl -u user:app-pass -X DELETE https://site/wp-json/elementor/v1/cache\n# then: computed-style diff against the original (docs/05)",
      },
    ],
    demo: "webai",
  },

  "vibe100coding-kit": {
    tagline: {
      en: "The full workflow for coding with agents without losing control: hooks that enforce the task cycle, gates that prove they prove, parallel subagent waves and rebase-then-validate integration.",
      pt: "O workflow completo pra programar com agentes sem perder o controle: hooks que impõem o ciclo de tarefa, gates que provam que provam, ondas paralelas de subagentes e integração com rebase antes de validar.",
    },
    features: [
      {
        id: "hooks",
        shape: "chain",
        title: { en: "Four hooks as rails", pt: "Quatro hooks como trilhos" },
        body: {
          en: "No edits on main, no stacking on finished tasks, the right skill suggested per prompt and a reminder to integrate when commits sit idle.",
          pt: "Sem edição na main, sem empilhar em tarefa concluída, a skill certa sugerida a cada prompt e lembrete de integrar com commits parados.",
        },
      },
      {
        id: "cycle",
        shape: "flow",
        title: { en: "Open, build, prove, publish", pt: "Abrir, construir, provar, publicar" },
        body: {
          en: "One worktree per task, a branch marked open or done, and the next task starts from a fresh tree. Red gate sends you back to build.",
          pt: "Um worktree por tarefa, branch marcada aberta ou concluída, e a próxima tarefa nasce de uma árvore nova. Gate vermelho devolve pra construir.",
        },
      },
      {
        id: "gates",
        shape: "grid",
        title: { en: "Gates and the meta-gate", pt: "Gates e o meta-gate" },
        body: {
          en: "All gates run in parallel and accumulate failures. The meta-gate injects the real defect: a gate that never turned red proved nothing.",
          pt: "Todos os gates rodam em paralelo acumulando falhas. O meta-gate injeta o defeito real: gate que nunca ficou vermelho não provou nada.",
        },
      },
      {
        id: "waves",
        shape: "stack",
        title: { en: "Parallel subagent waves", pt: "Ondas paralelas de subagentes" },
        body: {
          en: "Rules for waves with disjoint file sets, explicit model tiers and an investigation wave before code.",
          pt: "Regras pra ondas com conjuntos de arquivos disjuntos, camadas de modelo explícitas e onda de investigação antes do código.",
        },
      },
      {
        id: "integrate",
        shape: "display",
        title: { en: "Rebase, then validate", pt: "Rebase, depois valida" },
        body: {
          en: "A per-machine FIFO queue: fetch, rebase, gates on the new base, push. A conflict aborts and hands the task back.",
          pt: "Fila FIFO por máquina: fetch, rebase, gates sobre a base nova, push. Conflito aborta e devolve a tarefa.",
        },
      },
      {
        id: "templates",
        shape: "pages",
        title: { en: "Templates and the learning law", pt: "Templates e a lei do aprendizado" },
        body: {
          en: "CLAUDE.md, REGRA.md, a brain file, decisions and learnings. Every non-trivial problem ends with a note a weaker model can replay.",
          pt: "CLAUDE.md, REGRA.md, cérebro do agente, decisões e learnings. Todo problema não trivial termina numa nota que um modelo mais fraco repete.",
        },
      },
    ],
    steps: [
      {
        title: { en: "Install in your project", pt: "Instale no seu projeto" },
        code: "cd my-project\nnpx github:spyko-app/vibe100coding-kit init\n# additive: never overwrites an existing .claude/",
      },
      {
        title: { en: "Describe it in kit.json", pt: "Descreva em kit.json" },
        code: "{\n  \"nome\": \"MyProject\",\n  \"branchPrincipal\": \"main\",\n  \"pastasLimpas\": [\"src\"],\n  \"regras\": [\"WHAT IT IS: one sentence.\"]\n}",
      },
      {
        title: { en: "Prove the gates prove", pt: "Prove que os gates provam" },
        code: "npm run meta-gate   # each gate turns red with the injected defect\nnpm run gates       # all green\nnpx github:spyko-app/vibe100coding-kit doctor",
      },
      {
        title: { en: "Open a task, close the cycle", pt: "Abra uma tarefa, feche o ciclo" },
        code: "npm run sessao -- feature/first-task   # worktree + branch marked OPEN\n# ... build, gates green, commit ...\nnpm run integrar                       # queue > rebase > gates > push\nnpm run tarefa -- concluir",
      },
    ],
    demo: "kit",
  },
};

export const projectPageSlugs = Object.keys(projectPages);
export const getProjectPage = (slug: string): ProjectPage | undefined => projectPages[slug];
