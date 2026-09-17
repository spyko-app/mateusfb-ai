"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { Mark } from "@/components/brand";
import { DashedCard } from "@/components/ds";
import { stackState, FLAT_GAP } from "@/lib/stack-state";
import type { Messages } from "@/lib/i18n";
import { LayerCard } from "./LayerCard";
import { StackLayer } from "./StackLayer";
import { IntegrationsRow } from "./IntegrationsRow";

type Labels = Messages["where"]["layers"];

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

/** Pilha 3D guiada por scroll (desktop). O estado vem da função pura stackState(progress). */
export function StackDiagram3D({ progress, labels }: { progress: MotionValue<number>; labels: Labels }) {
  const state = useTransform(progress, stackState);
  const rotateX = useTransform(state, (s) => s.rotateX);
  const rotateZ = useTransform(state, (s) => s.rotateZ);
  const scale = useTransform(state, (s) => s.scale);
  const you = useTransform(state, (s) => s.you);
  const agents = useTransform(state, (s) => s.agents);
  const kits = useTransform(state, (s) => s.kits);
  const glyph = useTransform(state, (s) => s.glyph);
  const integrations = useTransform(state, (s) => s.integrations);
  const ship = useTransform(state, (s) => s.ship);

  // Miolo (agents/kits/glyph): colapsa até FLAT_GAP quando plano (p=0) e cresce até a altura natural
  // conforme as camadas entram — assim o estado inicial é só "You" + vão + "Shipped".
  const [midRef, midNatural] = useNaturalHeight<HTMLDivElement>();
  const midHeight = useTransform(state, (s) => {
    const t = 1 - s.gap / FLAT_GAP; // 0 plano → 1 aberto
    return midNatural ? FLAT_GAP + (midNatural - FLAT_GAP) * t : undefined;
  });

  // Integrações: altura acompanha a opacidade (0 enquanto ocultas, pra não empurrar o "Shipped" na fase inclinada).
  const [intRef, intNatural] = useNaturalHeight<HTMLDivElement>();
  const intHeight = useTransform(state, (s) => (intNatural ? intNatural * s.integrations.opacity : undefined));
  const intMargin = useTransform(state, (s) => -12 * (1 - s.integrations.opacity)); // cancela o gap da coluna

  return (
    <div
      className="sticky top-0 hidden h-screen w-full items-center justify-center lg:flex"
      // sem perspective: projeção ortográfica = isométrico de verdade (sem fuga/distorção)
      data-stack="3d"
    >
      <motion.div
        className="flex w-full max-w-[560px] flex-col gap-[var(--stack-gap,12px)] [container-type:inline-size] [transform-style:preserve-3d]"
        style={{ rotateX, rotateZ, scale }}
      >
        <StackLayer state={you}>
          <LayerCard title={labels.you.title} body={labels.you.body} />
        </StackLayer>

        <motion.div className="flex flex-col justify-end [transform-style:preserve-3d]" style={{ height: midHeight }}>
          <div
            ref={midRef}
            className="grid grid-cols-[minmax(0,1fr)_minmax(150px,clamp(170px,19cqw,210px))] gap-[12px] [transform-style:preserve-3d]"
          >
            <div className="flex flex-col gap-[12px] [transform-style:preserve-3d]">
              <StackLayer state={agents}>
                <LayerCard title={labels.agents.title} body={labels.agents.body} />
              </StackLayer>
              <StackLayer state={kits}>
                <LayerCard title={labels.kits.title} body={labels.kits.body} />
              </StackLayer>
            </div>
            <StackLayer state={glyph}>
              <DashedCard active className="flex aspect-square h-full items-center justify-center">
                <Mark size={56} className="text-bg" />
              </DashedCard>
            </StackLayer>
          </div>
        </motion.div>

        <motion.div className="[transform-style:preserve-3d]" style={{ height: intHeight, marginTop: intMargin }}>
          <StackLayer state={integrations}>
            <div ref={intRef}>
              <IntegrationsRow more={labels.more} />
            </div>
          </StackLayer>
        </motion.div>

        <StackLayer state={ship}>
          <LayerCard title={labels.ship.title} body={labels.ship.body} />
        </StackLayer>
      </motion.div>
    </div>
  );
}
