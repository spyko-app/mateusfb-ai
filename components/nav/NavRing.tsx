"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";

/** Retângulo arredondado (raio = h/2) começando no topo-centro, sentido horário. */
export function ringPath(w: number, h: number) {
  const r = h / 2;
  const cx = w / 2;
  return `M ${cx} 0 L ${w - r} 0 A ${r} ${r} 0 0 1 ${w} ${r} L ${w} ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h} L ${r} ${h} A ${r} ${r} 0 0 1 0 ${h - r} L 0 ${r} A ${r} ${r} 0 0 1 ${r} 0 L ${cx} 0`;
}

export function NavRing({ width, height, progress }: { width: number; height: number; progress: MotionValue<number> }) {
  const d = ringPath(width, height);
  const pathRef = useRef<SVGPathElement>(null);
  const [dot, setDot] = useState({ x: width / 2, y: 0 });
  const dashOffset = useTransform(progress, (p) => 1 - p);

  const place = (p: number) => {
    const el = pathRef.current;
    if (!el || typeof el.getPointAtLength !== "function") return;
    const len = el.getTotalLength();
    const pt = el.getPointAtLength(Math.min(Math.max(p, 0), 1) * len);
    setDot({ x: pt.x, y: pt.y });
  };
  useMotionValueEvent(progress, "change", place);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => place(progress.get()), [d]);

  return (
    <svg
      aria-hidden
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      overflow="visible"
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
    >
      <defs>
        <filter id="mfb-ring-blur-s" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id="mfb-ring-blur-l" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      {/* trilha oculta para medir */}
      <path ref={pathRef} d={d} fill="none" stroke="none" />
      <path d={d} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <motion.path
        d={d}
        fill="none"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1"
        style={{ strokeDashoffset: dashOffset }}
        filter="url(#mfb-ring-blur-s)"
      />
      <motion.path
        d={d}
        fill="none"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1"
        style={{ strokeDashoffset: dashOffset }}
      />
      <circle cx={dot.x} cy={dot.y} r={5} fill="#fff" filter="url(#mfb-ring-blur-l)" />
      <circle cx={dot.x} cy={dot.y} r={2.5} fill="#fff" />
    </svg>
  );
}
