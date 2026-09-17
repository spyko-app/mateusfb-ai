"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { GlassPill } from "@/components/ds";
import { Mark, Wordmark } from "@/components/brand";
import { useScrolled, useScrollProgress } from "@/lib/use-scroll-progress";
import { NavRing } from "./NavRing";

const RING_H = 40;

export function NavCenterPill({ href, label }: { href: string; label: string }) {
  const scrolled = useScrolled(40);
  const progress = useScrollProgress();
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 385, h: RING_H });

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: Math.round(width), h: Math.round(height) || RING_H });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-center-pill
      data-scrolled={scrolled ? "true" : "false"}
      className="relative"
      style={{ width: scrolled ? 56 : "min(385px, calc(100vw - 200px))", transition: "width 600ms var(--ease-in-out)" }}
    >
      <GlassPill>
        <Link href={href} aria-label={label} className="flex items-center justify-center py-[6px] text-fg" style={{ gap: scrolled ? 0 : 8, transition: "gap 600ms var(--ease-in-out)" }}>
          <Mark size={16} className="shrink-0" />
          <span
            className="overflow-hidden whitespace-nowrap text-button"
            style={{
              maxWidth: scrolled ? 0 : 200,
              opacity: scrolled ? 0 : 1,
              transition: "max-width 600ms var(--ease-in-out), opacity 600ms var(--ease-in-out)",
            }}
          >
            <Wordmark />
          </span>
        </Link>
      </GlassPill>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: scrolled ? 1 : 0, transition: "opacity 600ms var(--ease-in-out)" }}>
        <NavRing width={size.w} height={size.h} progress={progress} />
      </div>
    </div>
  );
}
