"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { Mark } from "@/components/brand";
import { DashedCard } from "@/components/ds";
import { stackState, CELLS } from "@/lib/stack-state";
import type { Messages } from "@/lib/i18n";
import { LayerCard } from "./LayerCard";
import { StackLayer } from "./StackLayer";
import { IntegrationsRow } from "./IntegrationsRow";

type Labels = Messages["where"]["layers"];
const GAP = 10; // px entre camadas (ref.)

/** Mede a altura natural de um elemento (ResizeObserver). */
function useNaturalHeight<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [h, setH] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setH(e.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, h] as const;
}

/** Pilha guiada por scroll (desktop), fiel ao "Where we sit" do antimetal.com: projeção = skewY + escala
 *  (na referência os lados dos cartões ficam verticais e as arestas horizontais sobem ~9.6° pra direita),
 *  extrusões a 45° nos cantos, miolo entrando pela esquerda, integrações em cascata. Estado = stackState(p). */
export function StackDiagram3D({ progress, labels }: { progress: MotionValue<number>; labels: Labels }) {
  const state = useTransform(progress, stackState);
  // --dscale (CSS) escala o diagrama inteiro por breakpoint (cresce em ≥1536)
  const transform = useTransform(state, (s) => `skewY(${s.skewY}deg) scale(calc(var(--dscale, 1) * ${s.scale}))`);
  const you = useTransform(state, (s) => s.you);
  const agents = useTransform(state, (s) => s.agents);
  const kits = useTransform(state, (s) => s.kits);
  const glyph = useTransform(state, (s) => s.glyph);
  const ship = useTransform(state, (s) => s.ship);
  const intExtrude = useTransform(state, (s) => s.integrations.extrude);
  const cells = Array.from({ length: CELLS }, (_, i) => useTransform(state, (s) => s.cells[i])); // eslint-disable-line react-hooks/rules-of-hooks

  // Miolo (agents/kits/glyph): 0 quando plano → vão vazio (gap) na inclinação → altura natural quando as camadas entram.
  const [midRef, midNatural] = useNaturalHeight<HTMLDivElement>();
  const midHeight = useTransform(state, (s) => s.gap + Math.max(0, midNatural - s.gap) * s.enter);
  const midMargin = useTransform(midHeight, (h) => -GAP * (1 - Math.min(1, h / 40))); // cancela o gap da coluna quando fechado

  // Integrações: a faixa abre (altura 0 → natural) antes das células entrarem.
  const [intRef, intNatural] = useNaturalHeight<HTMLDivElement>();
  const intHeight = useTransform(state, (s) => intNatural * s.integrations.opacity);
  const intMargin = useTransform(state, (s) => -GAP * (1 - s.integrations.opacity));

  return (
    <div className="sticky top-0 hidden h-screen w-full items-center justify-center lg:flex lg:[--dscale:1] 2xl:[--dscale:1.15]" data-stack="3d">
      <motion.div
        className="flex w-full max-w-[560px] origin-center flex-col gap-[10px] [container-type:inline-size]"
        style={{ transform }}
      >
        <StackLayer state={you}>
          <LayerCard title={labels.you.title} body={labels.you.body} />
        </StackLayer>

        <motion.div className="flex flex-col justify-center overflow-visible" style={{ height: midHeight, marginTop: midMargin }}>
          <div ref={midRef} className="grid grid-cols-[minmax(0,1fr)_154px] gap-[10px]">
            <div className="flex flex-col gap-[10px]">
              <StackLayer state={agents}>
                <LayerCard title={labels.agents.title} body={labels.agents.body} />
              </StackLayer>
              <StackLayer state={kits}>
                <LayerCard title={labels.kits.title} body={labels.kits.body} />
              </StackLayer>
            </div>
            <StackLayer state={glyph}>
              <DashedCard className="flex aspect-square h-full items-center justify-center bg-bg">
                <Mark size={56} />
              </DashedCard>
            </StackLayer>
          </div>
        </motion.div>

        <motion.div className="flex flex-col justify-center" style={{ height: intHeight, marginTop: intMargin }}>
          <div ref={intRef}>
            <IntegrationsRow more={labels.more} cells={cells} extrude={intExtrude} />
          </div>
        </motion.div>

        <StackLayer state={ship}>
          <LayerCard title={labels.ship.title} body={labels.ship.body} />
        </StackLayer>
      </motion.div>
    </div>
  );
}
