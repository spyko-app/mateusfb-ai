"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { GlassPill, Button } from "@/components/ds";
import { LocaleSwitch } from "./LocaleSwitch";
import type { NavLink } from "./NavLinks";
import type { Locale } from "@/lib/i18n";

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

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
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
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <GlassPill>
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="block px-[14px] py-[6px] text-button text-fg"
        >
          {open ? labels.close : labels.menu}
        </button>
      </GlassPill>
      {open && (
        <div
          ref={panelRef}
          id={id}
          role="dialog"
          aria-modal="true"
          aria-label={labels.menu}
          className="fixed inset-0 z-[60] flex flex-col bg-bg/95 px-6 pb-8 pt-[92px] text-fg"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 rounded-full border border-fg/20 px-[14px] py-[6px] text-button"
          >
            {labels.close}
          </button>
          <ul className="flex flex-col gap-6">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setOpen(false)} className="text-subhead">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={github.href} target="_blank" rel="noreferrer" className="text-subhead">
                {github.label}
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
