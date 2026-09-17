/** Integrações da pilha (glifos monocromáticos autorais em public/integrations/). */
export const integrations = [
  { id: "github", label: "GitHub" },
  { id: "vercel", label: "Vercel" },
  { id: "nextjs", label: "Next.js" },
  { id: "swift", label: "Swift" },
  { id: "python", label: "Python" },
  { id: "typescript", label: "TypeScript" },
  { id: "claude", label: "Claude" },
  { id: "macos", label: "macOS" },
] as const;
export type IntegrationId = (typeof integrations)[number]["id"];
