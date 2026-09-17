"use client";

import { useRef } from "react";
import { useReducedMotion, useScroll } from "motion/react";
import { Container, SectionHeader } from "@/components/ds";
import type { Locale, Messages } from "@/lib/i18n";
import { StickyCards } from "./StickyCards";
import { StackDiagram3D } from "./StackDiagram3D";
import { StackDiagramFlat } from "./StackDiagramFlat";

const pad = "lg:pl-[max(120px,calc((100vw-1512px)/2+120px))] lg:pr-[max(120px,calc((100vw-1512px)/2+120px))]";

export function WhereISit({ where }: { locale: Locale; where: Messages["where"] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section id="where" className="relative w-full">
      <Container className="py-[80px]">
        <SectionHeader num={where.num} eyebrow={where.eyebrow} title={where.title} body={where.body} />
      </Container>
      <div ref={ref} className={`grid grid-cols-1 gap-8 px-6 lg:grid-cols-2 ${pad}`}>
        <StickyCards cards={where.cards} />
        <div className="relative">
          {reduced ? (
            <StackDiagramFlat labels={where.layers} className="lg:sticky lg:top-0 lg:h-screen" />
          ) : (
            <>
              <StackDiagramFlat labels={where.layers} className="lg:hidden" />
              <StackDiagram3D progress={scrollYProgress} labels={where.layers} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
