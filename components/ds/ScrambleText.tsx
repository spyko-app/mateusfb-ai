"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/*+-_<>#";
const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
const TICK_MS = 30;
const CHAR_DELAY_MS = 35;

/**
 * Renders `text` split into per-character spans and scrambles them on pointerenter
 * of the nearest `[data-scramble]` ancestor (or the wrapper itself), settling
 * left-to-right into the real text. Reduced-motion users see plain text.
 */
export function ScrambleText({ text, className = "" }: { text: string; className?: string }) {
  const realChars = useMemo(() => Array.from(text), [text]);
  const [overrides, setOverrides] = useState<(string | null)[]>(() => realChars.map(() => null));
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<number | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const target = (wrapper.closest("[data-scramble]") as HTMLElement | null) ?? wrapper;

    const clearTimers = () => {
      if (frameRef.current !== null) {
        window.clearInterval(frameRef.current);
        frameRef.current = null;
      }
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];
    };

    const scramble = () => {
      if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }
      clearTimers();
      const chars = Array.from(text);
      const settled = new Array(chars.length).fill(false);

      frameRef.current = window.setInterval(() => {
        setOverrides((prev) =>
          prev.map((v, i) => (settled[i] ? null : chars[i] === " " ? null : randomGlyph())),
        );
      }, TICK_MS);

      chars.forEach((_, i) => {
        const id = window.setTimeout(
          () => {
            settled[i] = true;
            setOverrides((prev) => {
              const next = [...prev];
              next[i] = null;
              return next;
            });
            if (settled.every(Boolean)) clearTimers();
          },
          i * CHAR_DELAY_MS + TICK_MS,
        );
        timeoutsRef.current.push(id);
      });
    };

    target.addEventListener("pointerenter", scramble);
    return () => {
      target.removeEventListener("pointerenter", scramble);
      clearTimers();
    };
  }, [text]);

  // Agrupa por palavra (span nowrap) pra quebra de linha só acontecer entre palavras, nunca no meio de uma.
  const words: { start: number; chars: string[] }[] = [];
  realChars.forEach((c, i) => {
    if (c === " " || words.length === 0 || realChars[i - 1] === " ") words.push({ start: i, chars: [] });
    words[words.length - 1].chars.push(c);
  });

  return (
    <span ref={wrapperRef} aria-label={text} className={className}>
      {words.map((w) => (
        <span key={w.start} aria-hidden="true" className={w.chars[0] === " " ? undefined : "inline-block whitespace-nowrap"}>
          {w.chars.map((c, j) => {
            const i = w.start + j;
            const shown = overrides[i] ?? c;
            return (
              <span key={i} className="inline-block" style={{ fontVariantNumeric: "tabular-nums" }}>
                {shown === " " ? "\u00a0" : shown}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
