import { Mark } from "@/components/brand";

/** Fallback estático do canvas (sem WebGL / reduced-motion / carregando): mark grande + halo + trama de pontos. */
export function HeroFallback() {
  return (
    <div
      data-hero-fallback
      aria-hidden
      className="relative flex h-full w-full items-center justify-center [background:radial-gradient(circle,rgba(255,255,255,.08),transparent_60%)]"
    >
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-40" aria-hidden>
        <defs>
          <pattern id="hero-dots" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="2" height="2" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-dots)" />
      </svg>
      <Mark size={280} animated className="relative opacity-90" />
    </div>
  );
}
