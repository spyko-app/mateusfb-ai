"use client";

import { useEffect, useRef } from "react";

const DENSITY = 0.08;
const FPS = 12;
const MAX_DPR = 1.5;

/** Ruído branco em canvas (12fps). Para quando a aba está oculta; desligado em reduced-motion. */
export function NoiseCanvas({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let img: ImageData | null = null;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      canvas.width = w;
      canvas.height = h;
      img = ctx.createImageData(w, h);
    };
    const draw = () => {
      if (!img || document.hidden) return;
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const on = Math.random() < DENSITY;
        d[i] = d[i + 1] = d[i + 2] = 255;
        d[i + 3] = on ? 255 : 0;
      }
      ctx.putImageData(img, 0, 0);
    };
    resize();
    draw();
    const timer = setInterval(draw, 1000 / FPS);
    window.addEventListener("resize", resize);
    return () => {
      clearInterval(timer);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={`absolute inset-0 h-full w-full opacity-35 ${className}`} />;
}
