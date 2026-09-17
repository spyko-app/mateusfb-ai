"use client";

import { useCallback, useEffect, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { DashedCard, ScrambleText } from "@/components/ds";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion";
import { EASE_OUT_QUINT } from "@/lib/motion";
import { DemoFrame } from "./DemoFrame";
import type { DemoProps } from "../ProjectDemo";

/**
 * Demo do "vibe100coding kit": pipeline do ciclo de tarefa.
 * Spec → Plan → Waves → Gates → Integrate (+ Learn). Cada estágio anima o painel principal;
 * auto-avança a cada ~2,4 s (pausa no hover, não roda em reduced-motion). ←/→ trocam de estágio.
 */

const STAGES = ["spec", "plan", "waves", "gates", "integrate", "learn"] as const;
type Stage = (typeof STAGES)[number];
const AUTO_MS = 2400;
const STEP_MS = 280;
const EASE: [number, number, number, number] = [...EASE_OUT_QUINT];

const T = {
  en: {
    spec: "Spec", plan: "Plan", waves: "Waves", gates: "Gates", integrate: "Integrate", learn: "Learn",
    specTitle: "spec.md", specLines: ["what it is: one sentence", "done when: gates green, pasted", "out of scope: new deps", "risk: i18n keys drift"],
    planTitle: "tasks.md", ownership: "file ownership",
    running: "running", merged: "merged: disjoint files, no conflict",
    pending: "pending", green: "green", red: "red as expected", inject: "inject defect", restore: "restored",
    metaGate: "meta-gate",
    queue: "fifo queue", rebase: "rebase main", validate: "validate on new base", push: "push",
    learnTitle: "learnings/2026-09-17-gates-provam.md",
    learnLines: ["problem: a gate that never turned red", "approach: inject the real defect first", "rule: red is data, not failure"],
    hooks: "hooks", branch: "branch", queueLbl: "queue",
  },
  pt: {
    spec: "Spec", plan: "Plano", waves: "Ondas", gates: "Gates", integrate: "Integrar", learn: "Aprender",
    specTitle: "spec.md", specLines: ["o que é: uma frase", "pronto quando: gates verdes, colados", "fora de escopo: deps novas", "risco: chaves i18n divergem"],
    planTitle: "tasks.md", ownership: "dono do arquivo",
    running: "rodando", merged: "mesclado: arquivos disjuntos, sem conflito",
    pending: "pendente", green: "verde", red: "vermelho como esperado", inject: "injeta defeito", restore: "restaurado",
    metaGate: "meta-gate",
    queue: "fila fifo", rebase: "rebase main", validate: "valida na base nova", push: "push",
    learnTitle: "learnings/2026-09-17-gates-provam.md",
    learnLines: ["problema: gate que nunca ficou vermelho", "abordagem: injetar o defeito real antes", "regra: vermelho é dado, não falha"],
    hooks: "hooks", branch: "branch", queueLbl: "fila",
  },
} as const;
type Dict = (typeof T)["en"] | (typeof T)["pt"];

const TASKS = [
  ["T1", "lib/i18n.ts"],
  ["T2", "components/nav/*"],
  ["T3", "app/[locale]/page.tsx"],
  ["T4", "tests/nav.test.tsx"],
] as const;
const AGENTS = [
  { name: "agent 1", files: ["lib/i18n.ts", "lib/copy.ts"] },
  { name: "agent 2", files: ["components/nav/*"] },
  { name: "agent 3", files: ["tests/nav.test.tsx"] },
] as const;
const GATES = ["lint", "typecheck", "tests", "visual"] as const;

/** Relógio de sub-passos: 0..max, avança a cada `ms`. Em reduced-motion devolve `max` direto.
 *  Os painéis remontam a cada troca de estágio (key do AnimatePresence), então o relógio nasce zerado. */
function useSteps(max: number, ms: number, instant: boolean) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (instant) return;
    const id = window.setInterval(() => {
      setStep((s) => {
        if (s + 1 >= max) window.clearInterval(id);
        return Math.min(max, s + 1);
      });
    }, ms);
    return () => window.clearInterval(id);
  }, [max, ms, instant]);
  return instant ? max : step;
}

const fade = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: EASE },
};

const Mono = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <span className={`font-mono text-[12px] leading-[1.7] @lg:text-[14px] ${className}`}>{children}</span>
);

function SpecPanel({ t, instant }: { t: Dict; instant: boolean }) {
  const step = useSteps(t.specLines.length, STEP_MS, instant);
  return (
    <div className="flex flex-col gap-2">
      <span className="text-eyebrow text-fg/60">{t.specTitle}</span>
      <ul className="flex flex-col gap-1 @lg:gap-2">
        {t.specLines.map((line, i) => (
          <li key={line} className="flex items-baseline gap-2">
            <Mono className={i < step ? "text-fg" : "text-fg/30"}>{i < step ? "[x]" : "[ ]"}</Mono>
            <Mono className={i < step ? "text-fg" : "text-fg/30"}>{line}</Mono>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlanPanel({ t, instant }: { t: Dict; instant: boolean }) {
  const step = useSteps(TASKS.length, STEP_MS, instant);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between">
        <span className="text-eyebrow text-fg/60">{t.planTitle}</span>
        <span className="text-eyebrow text-fg/40">{t.ownership}</span>
      </div>
      <ul className="flex flex-col gap-1 @lg:gap-2">
        {TASKS.slice(0, step).map(([id, file]) => (
          <motion.li key={id} {...fade} className="flex items-center gap-2">
            <Mono className="w-6 text-fg">{id}</Mono>
            <span className="border border-dashed border-fg/25 px-2 py-0.5 font-mono text-[10px] text-fg/80 @lg:text-[12px]">{file}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function WavesPanel({ t, instant }: { t: Dict; instant: boolean }) {
  const step = useSteps(6, STEP_MS, instant);
  const pct = Math.min(1, step / 5);
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        {AGENTS.map((a, i) => (
          <DashedCard key={a.name} className="flex min-w-0 flex-col gap-1.5 overflow-hidden p-1.5 @lg:gap-2 @lg:p-3">
            <div className="flex items-center justify-between">
              <span className="text-eyebrow">{a.name}</span>
              <span className="text-eyebrow text-fg/40">{step >= 5 ? "ok" : t.running}</span>
            </div>
            <div className="h-px w-full bg-fg/15">
              <motion.div
                className="h-px bg-fg"
                initial={false}
                animate={{ width: `${Math.round(Math.min(1, pct * (1 + i * 0.08)) * 100)}%` }}
                transition={{ duration: 0.3, ease: EASE }}
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {a.files.map((f) => (
                <span key={f} className="max-w-full truncate border border-dashed border-fg/25 px-1 py-px font-mono text-[8px] text-fg/70 @lg:px-1.5 @lg:text-[11px]">{f}</span>
              ))}
            </div>
          </DashedCard>
        ))}
      </div>
      <AnimatePresence>
        {step >= 6 && (
          <motion.div {...fade} className="text-eyebrow text-fg">
            {"> "}{t.merged}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GatesPanel({ t, instant }: { t: Dict; instant: boolean }) {
  // 0..4 gates ficam verdes; 5 injeta; 6 vermelho; 7 restaura
  const step = useSteps(7, STEP_MS, instant);
  const injected = step === 5 || step === 6;
  const state = (i: number) => {
    if (injected && i === 1) return step === 6 ? "red" : "pending";
    return i < step ? "green" : "pending";
  };
  return (
    <div className="flex flex-col gap-2" data-gates-state={injected ? "injected" : step >= 7 ? "restored" : "running"}>
      <ul className="flex flex-col gap-1 @lg:gap-2">
        {GATES.map((g, i) => {
          const s = state(i);
          return (
            <li key={g} className="flex items-center gap-2">
              <Mono className={s === "green" ? "text-fg" : "text-fg/50"}>{s === "green" ? "●" : "◌"}</Mono>
              <Mono className={s === "pending" ? "text-fg/40" : "text-fg"}>{g}</Mono>
              <Mono className={`ml-auto ${s === "red" ? "text-fg" : "text-fg/40"}`}>
                {s === "green" ? t.green : s === "red" ? t.red : t.pending}
              </Mono>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center gap-2 border-t border-dashed border-fg/15 pt-2">
        <Mono className="text-fg">{step >= 5 ? "◆" : "◇"}</Mono>
        <Mono>{t.metaGate}</Mono>
        <Mono className="ml-auto text-fg/60">
          {step < 5 ? t.pending : step < 7 ? `${t.inject} → typecheck` : `typecheck: ${t.red} → ${t.restore}`}
        </Mono>
      </div>
    </div>
  );
}

function IntegratePanel({ t, instant }: { t: Dict; instant: boolean }) {
  const step = useSteps(4, STEP_MS + 80, instant);
  const rows = [t.queue, t.rebase, t.validate, t.push];
  return (
    <div className="grid grid-cols-[1fr_auto] items-start gap-3">
      <ul className="flex flex-col gap-1 @lg:gap-2">
        {rows.map((r, i) => (
          <li key={r} className="flex items-center gap-2">
            <Mono className={i < step ? "text-fg" : "text-fg/30"}>{i < step ? "●" : "◌"}</Mono>
            <Mono className={i < step ? "text-fg" : "text-fg/40"}>{r}</Mono>
            {i === 0 && <Mono className="text-fg/40">[task-3]</Mono>}
          </li>
        ))}
      </ul>
      <svg width="96" height="112" viewBox="0 0 72 84" fill="none" aria-hidden="true" className="text-fg">
        <motion.path d="M16 8V76" stroke="currentColor" strokeDasharray="3 3" initial={{ pathLength: instant ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: EASE }} />
        <motion.path
          d="M16 52 C16 40 52 50 52 38 V22"
          stroke="currentColor"
          initial={{ pathLength: instant ? 1 : 0, opacity: instant ? 1 : 0 }}
          animate={{ pathLength: step >= 2 ? 1 : 0, opacity: step >= 2 ? 1 : 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        />
        <motion.path
          d="M52 22 C52 8 16 20 16 8"
          stroke="currentColor"
          initial={{ pathLength: instant ? 1 : 0, opacity: instant ? 1 : 0 }}
          animate={{ pathLength: step >= 4 ? 1 : 0, opacity: step >= 4 ? 1 : 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        />
        {[76, 52, 28].map((y) => <circle key={y} cx="16" cy={y} r="3" fill="currentColor" />)}
        <motion.circle cx="52" cy="22" r="3" fill="currentColor" animate={{ opacity: step >= 2 ? 1 : 0.2 }} />
        <motion.circle cx="16" cy="8" r="3" fill="currentColor" animate={{ opacity: step >= 4 ? 1 : 0.2 }} />
      </svg>
    </div>
  );
}

function LearnPanel({ t }: { t: Dict }) {
  return (
    <motion.div initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4, ease: EASE }}>
      <DashedCard className="flex flex-col gap-1.5 p-3">
        <span className="text-eyebrow text-fg/60">{t.learnTitle}</span>
        {t.learnLines.map((l) => (
          <Mono key={l} className="block text-fg/80">{l}</Mono>
        ))}
      </DashedCard>
    </motion.div>
  );
}

const STATUS: Record<Stage, { branch: string; queue: number }> = {
  spec: { branch: "task-3", queue: 0 },
  plan: { branch: "task-3", queue: 0 },
  waves: { branch: "task-3", queue: 0 },
  gates: { branch: "task-3", queue: 0 },
  integrate: { branch: "task-3", queue: 1 },
  learn: { branch: "main", queue: 0 },
};

export default function KitDemo({ locale, label }: DemoProps) {
  const t = T[locale] ?? T.en;
  const reduced = useReducedMotionSafe();
  const [stage, setStage] = useState<Stage>("spec");
  const [paused, setPaused] = useState(false);
  const move = useCallback((dir: 1 | -1) => {
    setStage((s) => STAGES[(STAGES.indexOf(s) + dir + STAGES.length) % STAGES.length]);
  }, []);

  // auto-avanço: reinicia a contagem a cada troca (clique/teclado), pausa no hover, desligado em reduced-motion
  useEffect(() => {
    if (reduced || paused) return;
    const id = window.setInterval(() => move(1), AUTO_MS);
    return () => window.clearInterval(id);
  }, [reduced, paused, stage, move]);
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") { e.preventDefault(); move(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); move(-1); }
  };

  const panel =
    stage === "spec" ? <SpecPanel t={t} instant={reduced} /> :
    stage === "plan" ? <PlanPanel t={t} instant={reduced} /> :
    stage === "waves" ? <WavesPanel t={t} instant={reduced} /> :
    stage === "gates" ? <GatesPanel t={t} instant={reduced} /> :
    stage === "integrate" ? <IntegratePanel t={t} instant={reduced} /> :
    <LearnPanel t={t} />;

  return (
    <DemoFrame name="vibe100coding kit" label={label}>
      <div
        data-kit-demo
        data-stage={stage}
        tabIndex={0}
        role="group"
        aria-label={label}
        onKeyDown={onKey}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        className="@container flex h-full w-full flex-col outline-none"
      >
        <div className="flex min-h-0 flex-1 flex-col @lg:flex-row">
          {/* trilho de estagios */}
          <nav aria-label="stages" className="relative flex shrink-0 gap-1.5 overflow-x-auto p-2 [scrollbar-width:none] @lg:w-[150px] @lg:flex-col @lg:gap-2 @lg:border-r @lg:border-dashed @lg:border-fg/15 @lg:p-4">
            <span aria-hidden="true" className="pointer-events-none absolute left-[18px] top-4 hidden h-[calc(100%-32px)] border-l border-dashed border-fg/35 @lg:block" />
            {STAGES.map((s, i) => {
              const small = s === "learn";
              return (
                <DashedCard
                  key={s}
                  as="button"
                  type="button"
                  data-scramble
                  data-stage-btn={s}
                  active={stage === s}
                  aria-pressed={stage === s}
                  onClick={() => setStage(s)}
                  className={`relative z-[1] flex shrink-0 items-center gap-2 px-2 text-left ${small ? "py-1" : "py-1.5"} ${small && stage !== s ? "opacity-70" : ""} ${stage === s ? "bg-fg" : "bg-bg"}`}
                >
                  <span className="font-mono text-[9px] opacity-60">{small ? "+" : i + 1}</span>
                  <ScrambleText text={t[s]} className="text-eyebrow" />
                </DashedCard>
              );
            })}
          </nav>
          {/* painel principal */}
          <div className="relative min-h-0 flex-1 overflow-hidden">
            {/* sem mode="wait": o painel que sai fica absoluto e some sozinho, o novo entra por cima (nunca trava vazio) */}
            <AnimatePresence initial={false}>
              <motion.div
                key={stage}
                initial={reduced ? false : { opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduced ? undefined : { opacity: 0, x: -10, transition: { duration: 0.15 } }}
                transition={{ duration: 0.28, ease: EASE }}
                className="absolute inset-0 p-2 @lg:p-6"
              >
                {panel}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        {/* barra de status */}
        <div data-kit-status className="flex shrink-0 items-center gap-3 border-t border-dashed border-fg/15 px-3 py-2 text-eyebrow text-fg/60 @lg:px-4">
          <span>{t.hooks}: on</span>
          <span aria-hidden="true">&middot;</span>
          <span>{t.branch}: {STATUS[stage].branch}</span>
          <span aria-hidden="true">&middot;</span>
          <span>{t.queueLbl}: {STATUS[stage].queue}</span>
          <span className="ml-auto hidden text-fg/40 @lg:inline">&larr; &rarr;</span>
        </div>
      </div>
    </DemoFrame>
  );
}
