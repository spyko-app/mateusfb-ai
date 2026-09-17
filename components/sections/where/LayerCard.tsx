import type { ReactNode } from "react";
import { DashedCard } from "@/components/ds";

/** Cartão-camada da pilha (apresentação pura; usado no 3D e no fallback plano).
 *  Medidas da referência (antimetal.com a 1280): 442×72, padding 18/16, título 16px, corpo 9px. */
export function LayerCard({
  title,
  body,
  className = "",
  children,
}: {
  title: string;
  body: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <DashedCard className={`flex min-h-[72px] flex-col justify-center bg-bg px-[18px] py-[16px] ${className}`}>
      <h3 className="text-[16px] font-medium leading-[1.05] tracking-[-0.02em]">{title}</h3>
      <p className="mt-[3px] text-[9px] leading-[1.3] text-fg/60">{body}</p>
      {children}
    </DashedCard>
  );
}
