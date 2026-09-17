/** Marca mateusfb.ai — núcleo + órbita aberta + satélite. Variante B (docs/brand/README.md). */
export const MARK_GEOMETRY = {
  core: { cx: 16, cy: 16, r: 4.5 },
  orbit: { cx: 16, cy: 16, r: 12.5, strokeWidth: 1.75, gapDeg: 110, startDeg: 300 },
  satellite: { angleDeg: 120, r: 2.75 },
} as const;

export const rad = (d: number) => (d * Math.PI) / 180;

export function orbitPath(g: typeof MARK_GEOMETRY.orbit = MARK_GEOMETRY.orbit) {
  const a0 = rad(g.startDeg + g.gapDeg);
  const a1 = rad(g.startDeg + 360);
  const p = (a: number) => `${(g.cx + g.r * Math.cos(a)).toFixed(3)} ${(g.cy + g.r * Math.sin(a)).toFixed(3)}`;
  const large = 360 - g.gapDeg > 180 ? 1 : 0;
  return `M ${p(a0)} A ${g.r} ${g.r} 0 ${large} 1 ${p(a1)}`;
}

export function satellitePoint(g = MARK_GEOMETRY) {
  const a = rad(g.satellite.angleDeg);
  return { x: g.orbit.cx + g.orbit.r * Math.cos(a), y: g.orbit.cy + g.orbit.r * Math.sin(a) };
}

export type MarkProps = { size?: number; animated?: boolean; className?: string; title?: string };

export function Mark({ size = 16, animated = false, className = "", title }: MarkProps) {
  const { core, orbit, satellite } = MARK_GEOMETRY;
  const s = satellitePoint();
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
      <circle cx={core.cx} cy={core.cy} r={core.r} fill="currentColor" />
      <path d={orbitPath(orbit)} stroke="currentColor" strokeWidth={orbit.strokeWidth} strokeLinecap="round" />
      <g style={animated ? { transformOrigin: "16px 16px", animation: "mfb-orbit 8s linear infinite" } : undefined}>
        <circle cx={s.x.toFixed(3)} cy={s.y.toFixed(3)} r={satellite.r} fill="currentColor" />
      </g>
    </svg>
  );
}
