"use client";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { MARK_GEOMETRY, rad, satellitePoint } from "./Mark";

/** Palco 87×70 (proporção do spec). A marca (32×32) é centrada e escalada por `scale`. */
const STAGE = { w: 87, h: 70 };
const HOLD_MS = 600;

type Dot = { x: number; y: number; r: number };

/** 7 pontos: núcleo → 3 pontos maiores; órbita → 3 amostras; satélite → 1. Coordenadas no viewBox 32×32. */
export function markDots(g = MARK_GEOMETRY): Dot[] {
  const { core, orbit } = g;
  const coreDots: Dot[] = [0, 120, 240].map((deg) => ({
    x: core.cx + core.r * 0.4 * Math.cos(rad(deg - 90)),
    y: core.cy + core.r * 0.4 * Math.sin(rad(deg - 90)),
    r: core.r * 0.65,
  }));
  const arcStart = orbit.startDeg + orbit.gapDeg;
  const arcLen = 360 - orbit.gapDeg;
  const orbitDots: Dot[] = [0.15, 0.5, 0.85].map((t) => ({
    x: orbit.cx + orbit.r * Math.cos(rad(arcStart + arcLen * t)),
    y: orbit.cy + orbit.r * Math.sin(rad(arcStart + arcLen * t)),
    r: orbit.strokeWidth * 0.9,
  }));
  const s = satellitePoint(g);
  return [...coreDots, ...orbitDots, { x: s.x, y: s.y, r: g.satellite.r }];
}

export function ShufflingMark({ size = 64, className = "" }: { size?: number; className?: string }) {
  const scale = size / 32;
  const w = STAGE.w * scale;
  const h = STAGE.h * scale;
  const ox = (STAGE.w - 32) / 2;
  const oy = (STAGE.h - 32) / 2;
  const base = markDots();
  const [pos, setPos] = useState<{ x: number; y: number }[] | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shuffle = useCallback(() => {
    setPos(base.map((d) => ({ x: d.r + Math.random() * (STAGE.w - 2 * d.r), y: d.r + Math.random() * (STAGE.h - 2 * d.r) })));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setPos(null), HOLD_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <button
      type="button"
      aria-label="mateusfb.ai"
      data-shuffled={pos ? "true" : "false"}
      onClick={shuffle}
      onMouseEnter={shuffle}
      onFocus={shuffle}
      className={`relative block cursor-pointer bg-transparent border-0 p-0 text-fg ${className}`}
      style={{ width: w, height: h }}
    >
      {base.map((d, i) => {
        const x = pos ? pos[i].x : d.x + ox;
        const y = pos ? pos[i].y : d.y + oy;
        const style: CSSProperties & Record<string, string | number> = {
          "--x": `${(x * scale).toFixed(2)}px`,
          "--y": `${(y * scale).toFixed(2)}px`,
          width: d.r * 2 * scale,
          height: d.r * 2 * scale,
          transform: "translate(calc(var(--x) - 50%), calc(var(--y) - 50%))",
          transition: `transform ${HOLD_MS}ms var(--ease-in-out)`,
        };
        return <span key={i} data-dot aria-hidden className="absolute left-0 top-0 rounded-full bg-current" style={style} />;
      })}
    </button>
  );
}
