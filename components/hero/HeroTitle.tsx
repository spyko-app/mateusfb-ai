"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT_QUINT, DUR } from "@/lib/motion";

const h1Class = "text-display text-center max-w-[14ch] mx-auto";

export function HeroTitle({ text }: { text: string }) {
  const reduced = useReducedMotion();
  const words = text.split(/\s+/).filter(Boolean);

  if (reduced) {
    return (
      <h1 className={h1Class} aria-label={text}>
        {words.map((w, i) => (
          <span key={i} data-word aria-hidden className="inline-block">
            {w}&nbsp;
          </span>
        ))}
      </h1>
    );
  }

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
          transition={{ duration: DUR[700], ease: [...EASE_OUT_QUINT], delay: i * 0.04 }}
        >
          {w}&nbsp;
        </motion.span>
      ))}
    </h1>
  );
}
