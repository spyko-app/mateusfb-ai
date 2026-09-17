"use client";

import { motion } from "motion/react";
import { EASE_OUT_QUINT, DUR } from "@/lib/motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion";

const h1Class = "text-display text-[clamp(40px,4.2vw,54px)] text-center mx-auto";
const lineClass = "block max-w-[20ch] mx-auto md:whitespace-nowrap";

export function HeroTitle({ text }: { text: string }) {
  // Mesma árvore com e sem reduced-motion: em reduced a transição vira instantânea.
  const reduced = useReducedMotionSafe();
  const lines = text.split("\n");
  const ariaLabel = text.replace(/\n/g, " ");
  let wordIndex = 0;

  return (
    <h1 className={h1Class} aria-label={ariaLabel}>
      {lines.map((line, li) => (
        <span key={li} className={lineClass}>
          {line
            .split(/\s+/)
            .filter(Boolean)
            .map((w) => {
              const i = wordIndex++;
              return (
                <motion.span
                  key={i}
                  data-word
                  aria-hidden
                  className="inline-block will-change-transform"
                  initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={
                    reduced ? { duration: 0 } : { duration: DUR[700], ease: [...EASE_OUT_QUINT], delay: i * 0.04 }
                  }
                >
                  {w}&nbsp;
                </motion.span>
              );
            })}
        </span>
      ))}
    </h1>
  );
}
