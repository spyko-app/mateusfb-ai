export function GlassFilter() {
  return (
    <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
      <defs>
        <filter id="mfb-liquid-glass">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.012" numOctaves={2} seed={3} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="18" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}
