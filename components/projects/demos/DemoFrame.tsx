import type { ReactNode } from "react";
import { DashedCard } from "@/components/ds";

/**
 * Moldura padrão do slot de demo: 16:9, até 960×540, centralizada, tracejada.
 * As 4 demos (`Cove`, `Monitorpilot`, `Webai`, `Kit`) rendem o conteúdo DENTRO dela.
 */
export function DemoFrame({ name, label, children }: { name: string; label: string; children?: ReactNode }) {
  return (
    <DashedCard
      data-demo={name}
      className="relative mx-auto aspect-[16/9] w-full max-w-[960px] overflow-hidden"
    >
      {children ?? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2">
          <span className="text-pullquote">{name}</span>
          <span className="text-eyebrow text-fg/60">{label}</span>
        </div>
      )}
    </DashedCard>
  );
}
