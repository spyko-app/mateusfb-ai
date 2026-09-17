import type { ComponentType } from "react";
import type { Locale } from "@/lib/i18n";
import type { Demo } from "@/content/project-pages";
import Cove from "./demos/Cove";
import Monitorpilot from "./demos/Monitorpilot";
import Webai from "./demos/Webai";
import Kit from "./demos/Kit";

/**
 * Contrato do slot de demo: cada demo é um componente `default` em `components/projects/demos/<Demo>.tsx`
 * que recebe `{ locale, label }` e rende dentro de `<DemoFrame name label>` (16:9, máx. 960×540).
 * `label` = m.project.demo ("Demo"/"Demonstração"). Pode ser client component; sem fetch em runtime.
 */
export type DemoProps = { locale: Locale; label: string };

const demos: Record<Demo, ComponentType<DemoProps>> = { cove: Cove, monitorpilot: Monitorpilot, webai: Webai, kit: Kit };

export function ProjectDemo({ demo, locale, label }: { demo: Demo } & DemoProps) {
  const Cmp = demos[demo];
  return (
    <section data-project-demo={demo} className="w-full">
      <Cmp locale={locale} label={label} />
    </section>
  );
}
