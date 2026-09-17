import type { ReactNode } from "react";
import { DashedCard } from "@/components/ds";

/** Cartão-camada da pilha (apresentação pura; usado no 3D e no fallback plano). */
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
    <DashedCard
      className={`flex min-h-[clamp(72px,9.5cqw,104px)] flex-col justify-center bg-bg p-[clamp(16px,2.2cqw,28px)] [transform-style:preserve-3d] ${className}`}
    >
      <h3 className="text-[clamp(20px,2.3cqw,25px)] leading-[1.05] tracking-[-0.021em]">{title}</h3>
      <p className="mt-[clamp(8px,.9cqw,12px)] text-[clamp(12px,1.25cqw,14px)] leading-[1.35] text-fg/60">{body}</p>
      {children}
    </DashedCard>
  );
}
