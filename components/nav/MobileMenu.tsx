"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { GlassPill, Button, ScrambleText } from "@/components/ds";
import { LocaleSwitch } from "./LocaleSwitch";
import type { NavLink } from "./NavLinks";
import type { Locale } from "@/lib/i18n";
import { useLenisControls } from "@/components/SmoothScroll";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileMenu({
  links,
  locale,
  pathname,
  github,
  talkHref,
  labels,
}: {
  links: NavLink[];
  locale: Locale;
  pathname?: string;
  github: { label: string; href: string };
  talkHref: string;
  labels: { menu: string; close: string; talk: string };
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const lenis = useLenisControls();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis.stop();
    const panel = panelRef.current;
    const trigger = triggerRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const a = items[0];
      const z = items[items.length - 1];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      lenis.start();
      trigger?.focus();
    };
  }, [open, lenis]);

  return (
    <>
      <GlassPill>
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          data-scramble
          className="block px-[14px] py-[6px] text-button text-fg"
        >
          <ScrambleText text={open ? labels.close : labels.menu} />
        </button>
      </GlassPill>
      {open && (
        <div
          ref={panelRef}
          id={id}
          role="dialog"
          aria-modal="true"
          aria-label={labels.menu}
          className="fixed inset-0 z-[60] flex flex-col bg-bg px-6 pb-8 pt-[92px] text-fg"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            data-scramble
            className="absolute right-4 top-4 rounded-full border border-fg/20 px-[14px] py-[6px] text-button"
          >
            <ScrambleText text={labels.close} />
          </button>
          <ul className="flex flex-col gap-6">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setOpen(false)} data-scramble className="text-subhead">
                  <ScrambleText text={l.label} />
                </Link>
              </li>
            ))}
            <li>
              <a href={github.href} target="_blank" rel="noreferrer" data-scramble className="text-subhead">
                <ScrambleText text={github.label} />
              </a>
            </li>
          </ul>
          <div className="mt-auto flex items-center justify-between">
            <Button variant="solid" href={talkHref}>
              {labels.talk}
            </Button>
            <LocaleSwitch locale={locale} pathname={pathname} />
          </div>
        </div>
      )}
    </>
  );
}
