"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { DashedCard, Eyebrow } from "@/components/ds";
import type { Messages } from "@/lib/i18n";

type Card = Messages["where"]["cards"][number];

/** Coluna esquerda: 3 wrappers h-screen, cada um com um cartão sticky; ativo = wrapper cruzando o meio da viewport. */
export function StickyCards({ cards, onActive }: { cards: readonly Card[]; onActive?: (i: number) => void }) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const { scrollY } = useScroll();

  const compute = () => {
    if (typeof window === "undefined") return;
    const mid = window.innerHeight * 0.5;
    let next = active;
    refs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) next = i;
    });
    if (next !== active) {
      setActive(next);
      onActive?.(next);
    }
  };

  useMotionValueEvent(scrollY, "change", compute);
  useEffect(() => {
    // estado inicial (página pode abrir já rolada); no rAF, fora do corpo do efeito
    const id = requestAnimationFrame(compute);
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-[4rem] pb-[4rem]" data-sticky-cards>
      {cards.map((c, i) => (
        <div
          key={c.eyebrow}
          className="h-screen"
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <div className="sticky top-[8rem]">
            <DashedCard active={active === i} className="p-8">
              <Eyebrow className={active === i ? "text-bg/60!" : "text-fg/60"}>{c.eyebrow}</Eyebrow>
              <h3 className="mt-6 whitespace-pre-line text-pullquote">{c.title}</h3>
              <p className="mt-4 max-w-[480px] text-caption opacity-60">{c.body}</p>
            </DashedCard>
          </div>
        </div>
      ))}
    </div>
  );
}
