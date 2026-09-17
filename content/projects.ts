import type { Locale } from "@/lib/i18n";

export type ProjectStatus = "shipped" | "building";

export interface Project {
  slug: string;
  name: string;
  owner?: string;
  repo?: string;
  language: string;
  status: ProjectStatus;
  description: Record<Locale, string>;
  fallback: { stars: number; pushedAt: string };
}

export const projects: Project[] = [
  {
    slug: "web-ai",
    name: "web.ai",
    owner: "spyko-app",
    repo: "web.ai",
    language: "TypeScript",
    status: "shipped",
    description: {
      en: "Elementor engine: converts a design or site into a native, editable Elementor page, with measured fidelity.",
      pt: "Motor Elementor: converte design/site em página Elementor nativa e editável, com fidelidade verificada por medição.",
    },
    fallback: { stars: 0, pushedAt: "2026-09-17T00:00:00Z" },
  },
  {
    slug: "monitorpilot",
    name: "monitorpilot",
    owner: "spyko-app",
    repo: "monitorpilot",
    language: "Swift",
    status: "shipped",
    description: {
      en: "Menu-bar + CLI display control for macOS: DDC/CI brightness, HiDPI, XDR boost, virtual displays, mirroring, PIP.",
      pt: "Controle de displays no macOS por menu-bar + CLI: brilho DDC/CI, HiDPI, XDR boost, displays virtuais, espelhamento, PIP.",
    },
    fallback: { stars: 0, pushedAt: "2026-09-17T00:00:00Z" },
  },
  {
    slug: "cove",
    name: "cove",
    owner: "spyko-app",
    repo: "cove",
    language: "Swift",
    status: "shipped",
    description: {
      en: "Dynamic Island for the Mac notch: now playing, system HUDs, shelf, clipboard, droplets. 100% Swift/SwiftUI.",
      pt: "Dynamic Island pro notch do Mac: now playing, HUDs do sistema, shelf, clipboard, droplets. 100% Swift/SwiftUI.",
    },
    fallback: { stars: 0, pushedAt: "2026-09-17T00:00:00Z" },
  },
  {
    slug: "vibe100coding-kit",
    name: "vibe100coding kit",
    owner: "spyko-app",
    repo: "vibe100coding-kit",
    language: "Markdown",
    status: "building",
    description: {
      en: "A kit of skills, plans and workflows to go from idea to shipped product with coding agents.",
      pt: "Um kit de skills, planos e fluxos pra ir da ideia ao produto entregue com agentes de código.",
    },
    fallback: { stars: 0, pushedAt: "2026-09-17T00:00:00Z" },
  },
];

export const githubProfile = "https://github.com/Mateus-fb";
export const contactEmail = "spykocontato@gmail.com";
export const repoUrl = (p: Project) => (p.owner && p.repo ? `https://github.com/${p.owner}/${p.repo}` : null);
