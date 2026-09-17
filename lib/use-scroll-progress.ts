"use client";

import { useState } from "react";
import { useMotionValueEvent, useScroll, type MotionValue } from "motion/react";

/** Progresso 0..1 do documento inteiro. */
export function useScrollProgress(): MotionValue<number> {
  const { scrollYProgress } = useScroll();
  return scrollYProgress;
}

/** `true` quando `scrollY > threshold` (default 40px). */
export function useScrolled(threshold = 40): boolean {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > threshold));
  return scrolled;
}
