"use client";

import { useRef } from "react";
import { useScroll, useTransform } from "motion/react";
import { Container, SectionHeader } from "@/components/ds";
import type { Locale, Messages } from "@/lib/i18n";
import { StickyCards } from "./StickyCards";
import { StackDiagram3D } from "./StackDiagram3D";
import { StackDiagramFlat } from "./StackDiagramFlat";

const pad = "lg:pl-[max(120px,calc((100vw-1512px)/2+120px))] lg:pr-[max(120px,calc((100vw-1512px)/2+120px))]";

export function WhereISit({ where }: { locale: Locale; where: Messages["where"] }) {
  const ref = useRef<HTMLDivElement>(null);
  // p ∈ [0,1] enquanto a coluna sticky segura; o trecho 1→1.15 (volta ao plano) roda enquanto a seção sai da
  // tela (o fim da grade sobe de 100vh pra 40vh = 60vh de scroll), sem espaçador extra entre as seções.
  const { scrollYProgress: pIn } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const { scrollYProgress: pOut } = useScroll({ target: ref, offset: ["end end", "end 0.4"] });
  const progress = useTransform([pIn, pOut], ([a, b]: number[]) => a + 0.15 * b);

  return (
    <section id="where" className="relative w-full">
      <Container className="py-[80px]">
        <SectionHeader num={where.num} eyebrow={where.eyebrow} title={where.title} body={where.body} />
      </Container>
      <div ref={ref} className={`grid grid-cols-1 gap-8 px-6 lg:grid-cols-2 ${pad}`}>
        <StickyCards cards={where.cards} />
        <div className="relative">
          {/* Reduced-motion via CSS (não via JS) pra árvore ser idêntica no servidor e no cliente. */}
          <StackDiagramFlat
            labels={where.layers}
            className="lg:hidden motion-reduce:lg:sticky motion-reduce:lg:top-0 motion-reduce:lg:flex motion-reduce:lg:h-screen"
          />
          <div className="contents motion-reduce:hidden">
            <StackDiagram3D progress={progress} labels={where.layers} />
          </div>
        </div>
      </div>
    </section>
  );
}
