"use client";

import { motion } from "motion/react";
import type { ElementType, ReactNode } from "react";
import { revealVariants, REVEAL_VIEWPORT } from "@/lib/motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion";

export function Reveal({
  as = "div",
  delay = 0,
  className = "",
  children,
}: {
  as?: ElementType;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  // Mesma árvore com e sem reduced-motion (sem mismatch de hidratação): só a transição muda.
  const reduced = useReducedMotionSafe();
  const MotionTag = motion[as as "div"] ?? motion.div;

  return (
    <MotionTag
      className={className}
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={REVEAL_VIEWPORT}
      transition={reduced ? { duration: 0 } : { ...revealVariants.visible.transition, delay }}
    >
      {children}
    </MotionTag>
  );
}
