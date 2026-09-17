"use client";

import { useEffect, useRef } from "react";
import { createDitherRig, type DitherBuild } from "./dither-rig";

export type DitherSceneProps = {
  /** descreve a cena: recebe `scene`, o namespace `THREE` e o rig (world, luzes, unitsPerPx); devolve `{ update(t, mouse), dispose?, fit? }` */
  build: DitherBuild;
  /** tamanho fixo em px CSS; sem `size` ocupa 100% da largura do host e a altura do host (default 220px) */
  size?: { w: number; h: number };
  /** pixel ratio (2 = partícula de meio px, mais fina) */
  dpr?: number;
  /** exposição do tone mapping (1.9 = hero) */
  intensity?: number;
  /** fundo volumétrico (glow + "X"); nas cenas pequenas costuma ficar melhor desligado */
  background?: boolean;
  className?: string;
};

/**
 * Cena three.js pequena passada pelo mesmo dither estocástico do hero.
 * Só cliente (carregue com `dynamic(..., { ssr: false })`); pausa fora da tela; 1 WebGLRenderer por canvas, descartado no unmount.
 * `build` e `size` fazem parte das deps do effect: memoize (`useMemo`) pra não recriar o renderer a cada render.
 */
export default function DitherScene({ build, size, dpr = 2, intensity = 1.9, background = false, className = "" }: DitherSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    return createDitherRig(host, {
      dpr,
      exposure: intensity,
      background,
      spotRadius: 0,
      fitMargin: 0.62,
      mouseScope: "host",
      size: (h) => size ?? { w: Math.max(1, h.clientWidth), h: Math.max(1, h.clientHeight || 220) },
      build,
    });
  }, [build, dpr, intensity, background, size]);

  return (
    <div
      ref={hostRef}
      data-dither-scene
      aria-hidden
      className={`h-full w-full overflow-hidden [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full [&>canvas]:[image-rendering:pixelated] ${className}`.trim()}
    />
  );
}
