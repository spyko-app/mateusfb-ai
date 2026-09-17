import { Mark } from "@/components/brand";
import { DashedCard } from "@/components/ds";
import type { Messages } from "@/lib/i18n";
import { LayerCard } from "./LayerCard";
import { IntegrationsRow } from "./IntegrationsRow";

type Labels = Messages["where"]["layers"];

/** Pilha final (p=1) estática: mobile e prefers-reduced-motion. Sem transforms. */
export function StackDiagramFlat({ labels, className = "" }: { labels: Labels; className?: string }) {
  return (
    <div className={`where-flat flex min-h-[min(720px,100svh)] w-full items-center ${className}`} data-stack="flat">
      <div className="flex w-full max-w-[560px] flex-col gap-[12px] [container-type:inline-size]">
        <LayerCard title={labels.you.title} body={labels.you.body} />
        <div className="where-flat-grid grid grid-cols-[minmax(0,1fr)_minmax(150px,clamp(170px,19cqw,210px))] gap-[12px]">
          <div className="flex flex-col gap-[12px]">
            <LayerCard title={labels.agents.title} body={labels.agents.body} />
            <LayerCard title={labels.kits.title} body={labels.kits.body} />
          </div>
          <DashedCard active className="where-flat-glyph flex aspect-square h-full items-center justify-center">
            <Mark size={56} className="text-bg" />
          </DashedCard>
        </div>
        <IntegrationsRow more={labels.more} />
        <LayerCard title={labels.ship.title} body={labels.ship.body} />
      </div>
    </div>
  );
}
