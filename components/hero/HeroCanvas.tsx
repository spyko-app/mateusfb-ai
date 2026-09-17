"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";
import { HeroFallback } from "./HeroFallback";
import { HeroCanvasBoundary } from "./HeroCanvasBoundary";

const DitherCanvas = dynamic(() => import("./DitherCanvas"), { ssr: false, loading: () => <HeroFallback /> });

export function HeroCanvas() {
  const reduced = useReducedMotion();
  if (reduced) return <HeroFallback />;
  return (
    <HeroCanvasBoundary>
      <DitherCanvas />
    </HeroCanvasBoundary>
  );
}
