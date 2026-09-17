"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { HeroFallback } from "./HeroFallback";

type BoundaryState = { failed: boolean };

/** Se o WebGL/three quebrar, mostra o fallback estático em vez de derrubar a página. Fica fora do ParticleHero pra não puxar three.js no chunk eager. */
export class HeroCanvasBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { failed: false };
  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") console.warn("hero canvas fallback:", error, info.componentStack);
  }
  render() {
    return this.state.failed ? <HeroFallback /> : this.props.children;
  }
}
