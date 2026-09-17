"use client";

import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import Lenis from "lenis";

type LenisControls = { stop: () => void; start: () => void };
const LenisContext = createContext<LenisControls>({ stop: () => {}, start: () => {} });

/** Trava/destrava o scroll suave (ex.: menu mobile aberto). No-op quando o Lenis está desligado. */
export const useLenisControls = () => useContext(LenisContext);

/** Scroll suave (Lenis). Desligado em prefers-reduced-motion. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const controls = useMemo<LenisControls>(
    () => ({ stop: () => lenisRef.current?.stop(), start: () => lenisRef.current?.start() }),
    [],
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenisRef.current = lenis;
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);
  return <LenisContext.Provider value={controls}>{children}</LenisContext.Provider>;
}
