export const EASE_OUT_QUINT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;
export const DUR = { 200: 0.2, 360: 0.36, 600: 0.6, 700: 0.7 } as const;
export const revealVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR[700], ease: [...EASE_OUT_QUINT] },
  },
} as const;
export const REVEAL_VIEWPORT = { once: true, margin: "-10% 0px -10% 0px" } as const;
