"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import type { ReactNode } from "react";
import type { LayerState } from "@/lib/stack-state";
import { DEPTH_STEP } from "@/lib/stack-state";

const corners = ["left-0 top-0", "right-0 top-0", "left-0 bottom-0", "right-0 bottom-0"] as const;

/** Envelope motion de uma camada: x/y/z/opacity + 4 linhas de extrusão tracejadas nos cantos. */
export function StackLayer({
  state,
  className = "",
  children,
}: {
  state: MotionValue<LayerState>;
  className?: string;
  children: ReactNode;
}) {
  const x = useTransform(state, (v) => `${v.x}%`);
  const y = useTransform(state, (v) => v.y);
  const z = useTransform(state, (v) => v.z);
  const opacity = useTransform(state, (v) => v.opacity);
  const extrude = useTransform(state, (v) => v.extrude);
  return (
    <motion.div className={`relative [transform-style:preserve-3d] ${className}`} style={{ x, y, z, opacity }}>
      {children}
      {corners.map((c) => (
        <motion.span
          key={c}
          aria-hidden
          className={`pointer-events-none absolute w-px origin-top border-l border-dashed border-fg/35 ${c}`}
          style={{ height: DEPTH_STEP, transform: "rotateX(-90deg)" /* pende pra -z: até a camada de baixo */, opacity: extrude }}
        />
      ))}
    </motion.div>
  );
}
