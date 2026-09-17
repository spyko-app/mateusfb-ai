"use client";

import dynamic from "next/dynamic";
import { HeroFallback } from "./HeroFallback";
import { HeroCanvasBoundary } from "./HeroCanvasBoundary";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion";

const ParticleHero = dynamic(() => import("./ParticleHero"), { ssr: false, loading: () => <HeroFallback /> });

export function HeroCanvas() {
  // Servidor e 1º render do cliente rendem o mesmo (loader do canvas = fallback); reduced só troca depois do mount.
  // Reduced-motion ainda mostra o campo de partículas, só que parado (sem cintilação/deriva).
  const reduced = useReducedMotionSafe();
  return (
    <HeroCanvasBoundary>
      <ParticleHero reduced={reduced} />
    </HeroCanvasBoundary>
  );
}
