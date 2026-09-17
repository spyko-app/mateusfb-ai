"use client";

import { motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { DashedCard } from "@/components/ds";
import { integrations } from "./integrations";
import { Extrusions } from "./Extrusions";

/** Linha de 8 células quadradas com glifos em cinza + célula "+ more" (9ª).
 *  `cells` (opcional) = opacidade por célula (cascata guiada por scroll); `extrude` = extrusões por célula. */
export function IntegrationsRow({
  more,
  className = "",
  cells,
  extrude,
}: {
  more: string;
  className?: string;
  cells?: MotionValue<number>[];
  extrude?: MotionValue<number>;
}) {
  const items = [
    ...integrations.map((it) => ({
      key: it.id,
      title: it.label,
      node: (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/integrations/${it.id}.svg`}
          alt={it.label}
          width={20}
          height={20}
          className="h-[clamp(16px,4.5cqw,22px)] w-[clamp(16px,4.5cqw,22px)] object-contain opacity-[.58] grayscale"
        />
      ),
    })),
    { key: "more", title: more, node: <span className="whitespace-nowrap text-[8px] uppercase tracking-[0.08em] text-fg/60">{more}</span> },
  ];
  return (
    <div className={`where-integrations grid grid-cols-9 gap-[8px] ${className}`}>
      {items.map((it, i) => (
        <Cell key={it.key} opacity={cells?.[i]} extrude={extrude} title={it.title}>
          {it.node}
        </Cell>
      ))}
    </div>
  );
}

function Cell({
  opacity,
  extrude,
  title,
  children,
}: {
  opacity?: MotionValue<number>;
  extrude?: MotionValue<number>;
  title: string;
  children: React.ReactNode;
}) {
  const one = useMotionValue(1);
  const op = opacity ?? one;
  const x = useTransform(op, (o) => -6 * (1 - o));
  const ex = useTransform([op, extrude ?? one], ([a, b]: number[]) => a * b);
  return (
    <motion.div className="relative" style={opacity ? { opacity, x } : undefined} title={title}>
      <DashedCard className="flex aspect-square items-center justify-center bg-bg">{children}</DashedCard>
      {extrude && <Extrusions opacity={ex} len={16} tone="from-fg/18" />}
    </motion.div>
  );
}
