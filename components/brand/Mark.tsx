/** Marca mateusfb.ai — pilha isométrica: 3 planos quadrados (losangos 30°), topo sólido, dois de baixo em contorno. Variante A (docs/brand/README.md). */
export const MARK_GEOMETRY = {
  planes: [{ cy: 10.5 }, { cy: 16 }, { cy: 21.5 }],
  cx: 16,
  w: 10,
  h: 5,
  strokeWidth: 1.5,
  sideEdges: false,
} as const;

/** Losango isométrico de um plano quadrado centrado em (cx, cy). */
export function planePath(cx: number, cy: number, w: number, h: number): string {
  return `M ${cx} ${cy - h} L ${cx + w} ${cy} L ${cx} ${cy + h} L ${cx - w} ${cy} Z`;
}

export type MarkProps = { size?: number; animated?: boolean; className?: string; title?: string };

export function Mark({ size = 16, animated = false, className = "", title }: MarkProps) {
  const { planes, cx, w, h, strokeWidth } = MARK_GEOMETRY;
  const [top, mid, bottom] = planes;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <path d={planePath(cx, bottom.cy, w, h)} stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d={planePath(cx, mid.cy, w, h)} stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path
        d={planePath(cx, top.cy, w, h)}
        fill="currentColor"
        style={animated ? { animation: "mfb-stack 8s ease-in-out infinite" } : undefined}
      />
    </svg>
  );
}
