"use client";

import Link from "next/link";
import { useRef } from "react";
import type { MouseEvent, PointerEvent, ReactNode } from "react";

type Variant = "solid" | "outline";

const base =
  "inline-flex items-center justify-center whitespace-nowrap rounded-full px-5 py-[10px] text-button transition-transform duration-200 hover:scale-[1.02]";
const variants: Record<Variant, string> = {
  solid: "bg-fg text-bg",
  outline: "border border-fg/20 text-fg hover:border-fg/60",
};

const isHttp = (href: string) => /^https?:\/\//.test(href);
/** Sai do <Link> do Next: http(s) externo, mailto:, tel:. Só http(s) abre em nova aba. */
const isExternal = (href: string) => isHttp(href) || href.startsWith("mailto:") || href.startsWith("tel:");

export function Button({
  variant = "solid",
  href,
  onClick,
  magnetic = false,
  className = "",
  children,
}: {
  variant?: Variant;
  href?: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  magnetic?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const classes = `${base} ${variants[variant]} ${className}`;

  const handlePointerMove = (e: PointerEvent<HTMLElement>) => {
    if (!magnetic) return;
    if (typeof window !== "undefined") {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (window.matchMedia("(hover: none)").matches) return;
    }
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = Math.max(-6, Math.min(6, (e.clientX - cx) * 0.25));
    const dy = Math.max(-6, Math.min(6, (e.clientY - cy) * 0.25));
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  const handlePointerLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "";
  };

  const magneticProps = magnetic
    ? { onPointerMove: handlePointerMove, onPointerLeave: handlePointerLeave }
    : {};

  if (href) {
    if (isExternal(href)) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          {...(isHttp(href) ? { target: "_blank", rel: "noreferrer" } : {})}
          className={classes}
          onClick={onClick}
          {...magneticProps}
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={classes}
        onClick={onClick}
        {...magneticProps}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      className={classes}
      onClick={onClick}
      {...magneticProps}
    >
      {children}
    </button>
  );
}
