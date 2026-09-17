"use client";

import { motion } from "motion/react";
import { EASE_OUT_QUINT, DUR } from "@/lib/motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion";

const h1Class = "text-display text-center max-w-[14ch] mx-auto";

export function HeroTitle({ text }: { text: string }) {
  // Mesma árvore com e sem reduced-motion: em reduced a transição vira instantânea.
  const reduced = useReducedMotionSafe();
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <h1 className={h1Class} aria-label={text}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          data-word
          aria-hidden
          className="inline-block will-change-transform"
          initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={reduced ? { duration: 0 } : { duration: DUR[700], ease: [...EASE_OUT_QUINT], delay: i * 0.04 }}
        >
          {w}&nbsp;
        </motion.span>
      ))}
    </h1>
  );
}
