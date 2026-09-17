"use client";

import Link from "next/link";
import { useRef, useState, type MouseEvent } from "react";
import { LocaleSwitch } from "./LocaleSwitch";
import { ScrambleText } from "@/components/ds";
import type { Locale } from "@/lib/i18n";

export type NavLink = { label: string; href: string };

export function NavLinks({ links, locale, pathname }: { links: NavLink[]; locale: Locale; pathname?: string }) {
  const listRef = useRef<HTMLUListElement>(null);
  const [hl, setHl] = useState({ x: 0, w: 0, h: 0, o: 0 });

  const onEnter = (e: MouseEvent<HTMLLIElement>) => {
    const li = e.currentTarget;
    setHl({ x: li.offsetLeft, w: li.offsetWidth, h: li.offsetHeight, o: 1 });
  };
  const onLeave = () => setHl((s) => ({ ...s, o: 0 }));

  return (
    <ul ref={listRef} onMouseLeave={onLeave} className="relative flex items-center gap-2 whitespace-nowrap">
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-1/2 rounded-full bg-fg/[0.06]"
        style={{
          transform: `translate(${hl.x}px, -50%)`,
          width: hl.w,
          height: hl.h,
          opacity: hl.o,
          transition:
            "transform 360ms var(--ease-out-quint), width 360ms var(--ease-out-quint), height 360ms var(--ease-out-quint), opacity 200ms ease",
        }}
      />
      {links.map((l) => (
        <li key={l.href} onMouseEnter={onEnter} className="relative">
          <Link
            href={l.href}
            data-scramble
            className="block px-[14px] py-[6px] text-button text-fg/60 transition-colors duration-200 hover:text-fg"
          >
            <ScrambleText text={l.label} />
          </Link>
        </li>
      ))}
      <li onMouseEnter={onEnter} className="relative">
        <LocaleSwitch locale={locale} pathname={pathname} className="block px-[14px] py-[6px]" />
      </li>
    </ul>
  );
}
