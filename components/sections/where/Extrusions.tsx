"use client";

import { motion, type MotionValue } from "motion/react";
import { EXTRUDE_LEN } from "@/lib/stack-state";

/** Linhas de extrusão (a "caixa" projetada atrás do cartão): saem dos cantos superior-direito,
 *  inferior-direito e inferior-esquerdo, descendo pra direita. O ângulo (−40.5° a partir da vertical) é
 *  pré-compensado pra virar 45° na tela depois do skewY(−9.6°) da pilha. Esvanecem na ponta. */
const corners = ["right-0 top-0", "right-0 top-full", "left-0 top-full"] as const;

export function Extrusions({
  opacity,
  len = EXTRUDE_LEN,
  tone = "from-fg/30",
}: {
  opacity: MotionValue<number>;
  len?: number;
  tone?: string;
}) {
  return (
    <>
      {corners.map((c) => (
        <motion.span
          key={c}
          aria-hidden
          className={`pointer-events-none absolute w-px origin-top rotate-[-40.5deg] bg-gradient-to-b to-transparent ${tone} ${c}`}
          style={{ height: len, opacity }}
        />
      ))}
    </>
  );
}
