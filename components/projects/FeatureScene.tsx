"use client";

import dynamic from "next/dynamic";
import { Component, useMemo, type ReactNode } from "react";
import { Mark } from "@/components/brand";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion";
import { shapeBuild, type Shape } from "./shapes";

const DitherScene = dynamic(() => import("@/components/hero/DitherScene"), { ssr: false, loading: () => <SceneFallback /> });

/** Fallback estático (carregando / reduced-motion / WebGL quebrou): a marca no centro. */
export function SceneFallback() {
  return (
    <div data-scene-fallback aria-hidden className="flex h-full w-full items-center justify-center text-fg/70">
      <Mark size={64} />
    </div>
  );
}

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <SceneFallback /> : this.props.children;
  }
}

/** Ilustração 3D ditherizada de uma feature (100% × 220px). Só cliente, lazy, pausa fora da tela. */
export function FeatureScene({ shape, height = 220 }: { shape: Shape; height?: number }) {
  const reduced = useReducedMotionSafe();
  const build = useMemo(() => shapeBuild(shape), [shape]);
  return (
    <div data-feature-scene={shape} className="w-full" style={{ height }}>
      {reduced ? (
        <SceneFallback />
      ) : (
        <SceneBoundary>
          <DitherScene build={build} dpr={2} intensity={2.2} />
        </SceneBoundary>
      )}
    </div>
  );
}
