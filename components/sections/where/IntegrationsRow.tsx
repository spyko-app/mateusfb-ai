import { DashedCard } from "@/components/ds";
import { integrations } from "./integrations";

/** Linha de 8 células quadradas com glifos em cinza + célula "+ more" (9ª). */
export function IntegrationsRow({ more, className = "" }: { more: string; className?: string }) {
  return (
    <div className={`where-integrations grid grid-cols-9 gap-[12px] [transform-style:preserve-3d] ${className}`}>
      {integrations.map((it) => (
        <DashedCard key={it.id} className="flex aspect-square items-center justify-center bg-bg" title={it.label}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/integrations/${it.id}.svg`}
            alt={it.label}
            width={24}
            height={24}
            className="h-[clamp(25px,4cqw,42px)] w-[clamp(25px,4cqw,42px)] object-contain opacity-[.58] grayscale"
          />
        </DashedCard>
      ))}
      <DashedCard className="flex aspect-square items-center justify-center bg-bg">
        <span className="text-eyebrow text-center text-fg/60">{more}</span>
      </DashedCard>
    </div>
  );
}
