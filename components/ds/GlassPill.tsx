import type { CSSProperties, ReactNode } from "react";

export function GlassPill({
  className = "",
  style,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[82px] p-[6px] ${className}`}
      style={{
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(2.6px) saturate(180%) brightness(110%) url(#mfb-liquid-glass)",
        WebkitBackdropFilter: "blur(2.6px) saturate(180%) brightness(110%)",
        boxShadow: "inset 0 0 10px 0 rgba(255,255,255,0.08), 0 6px 24px rgba(0,0,0,0)",
        ...style,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[82px]"
        style={{
          padding: "0.5px",
          background: "linear-gradient(122deg, rgba(255,255,255,.9) 0%, rgba(255,255,255,.35) 40%, rgba(255,255,255,.05) 78%)",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[82px]"
        style={{ background: "linear-gradient(122deg, rgba(255,255,255,.16) 0%, rgba(255,255,255,0) 44%)" }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
