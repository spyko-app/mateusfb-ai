"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useScroll, type MotionValue } from "motion/react";

/** Progresso 0..1 do documento inteiro. */
export function useScrollProgress(): MotionValue<number> {
  const { scrollYProgress } = useScroll();
  return scrollYProgress;
}

/**
 * `true` quando `scrollY > threshold` (default 40px).
 * useSyncExternalStore: no servidor/hidratação é `false`; no cliente lê o valor atual na hora
 * (reload no meio da página já mostra o pill recolhido) e segue os "change" do MotionValue.
 */
export function useScrolled(threshold = 40): boolean {
  const { scrollY } = useScroll();
  const subscribe = useCallback((cb: () => void) => scrollY.on("change", cb), [scrollY]);
  return useSyncExternalStore(
    subscribe,
    () => scrollY.get() > threshold,
    () => false,
  );
}
