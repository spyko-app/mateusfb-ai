"use client";

import dynamic from "next/dynamic";
import { HeroFallback } from "./HeroFallback";
import { HeroCanvasBoundary } from "./HeroCanvasBoundary";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion";

const DitherCanvas = dynamic(() => import("./DitherCanvas"), { ssr: false, loading: () => <HeroFallback /> });

export function HeroCanvas() {
  // Servidor e 1º render do cliente rendem o mesmo (loader do canvas = fallback); reduced só troca depois do mount.
  const reduced = useReducedMotionSafe();
  if (reduced) return <HeroFallback />;
  return (
    <HeroCanvasBoundary>
      <DitherCanvas />
    </HeroCanvasBoundary>
  );
}
