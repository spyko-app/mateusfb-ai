"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import type { ReactNode } from "react";
import type { LayerState } from "@/lib/stack-state";
import { Extrusions } from "./Extrusions";

/** Envelope motion de uma camada: x/y/opacity + linhas de extrusão nos cantos. */
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
  const opacity = useTransform(state, (v) => v.opacity);
  const extrude = useTransform(state, (v) => v.extrude);
  return (
    <motion.div className={`relative ${className}`} style={{ x, y, opacity }}>
      {children}
      <Extrusions opacity={extrude} />
    </motion.div>
  );
}
