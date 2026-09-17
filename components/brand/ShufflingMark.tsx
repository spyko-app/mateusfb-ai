"use client";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { MARK_GEOMETRY } from "./Mark";

/** Palco 87×70 (proporção do spec). A marca (32×32) é centrada e escalada por `scale`. */
const STAGE = { w: 87, h: 70 };
const HOLD_MS = 600;

type Dot = { x: number; y: number; r: number };

/** 12 pontos: os 4 vértices de cada um dos 3 losangos. Os do plano de cima (sólido) são maiores. Coordenadas no viewBox 32×32. */
export function markDots(g = MARK_GEOMETRY): Dot[] {
  const { planes, cx, w, h, strokeWidth } = g;
  return planes.flatMap(({ cy }, i) => {
    const r = i === 0 ? strokeWidth * 1.4 : strokeWidth * 0.9;
    return [
      { x: cx, y: cy - h, r },
      { x: cx + w, y: cy, r },
      { x: cx, y: cy + h, r },
      { x: cx - w, y: cy, r },
    ];
  });
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
