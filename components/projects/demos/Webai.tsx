"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { DemoFrame } from "./DemoFrame";
import type { DemoProps } from "../ProjectDemo";
import { ScrambleText } from "@/components/ds";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion";
import { EASE_OUT_QUINT } from "@/lib/motion";

/* ---------- copy ---------- */
const T = {
  en: {
    source: "Source",
    compile: "Compile",
    elementor: "Elementor",
    run: "Run",
    reset: "Reset",
    widgets: "native widgets",
    fidelity: "fidelity",
    hint: "press R to run",
    idle: "// waiting for DOM",
    edit: "EDIT",
    transport: "transport",
  },
  pt: {
    source: "Origem",
    compile: "Compilar",
    elementor: "Elementor",
    run: "Rodar",
    reset: "Reiniciar",
    widgets: "widgets nativos",
    fidelity: "fidelidade",
    hint: "tecla R roda",
    idle: "// esperando o DOM",
    edit: "EDITAR",
    transport: "transporte",
  },
} as const;

/* ---------- data ---------- */
type BlockId = "hero" | "grid" | "card1" | "card2" | "card3" | "cta";

const BLOCKS: { id: BlockId; tip: string; widgets: number; lines: string[] }[] =
  [
    {
      id: "hero",
      tip: "h1 · 48px · 700",
      widgets: 4,
      lines: [
        '{"elType":"container","settings":{"padding":"96 24"}}',
        '{"elType":"widget","widgetType":"heading","settings":{"size":48,"weight":700}}',
        '{"elType":"widget","widgetType":"text-editor","settings":{"size":18}}',
        '{"elType":"widget","widgetType":"button","settings":{"radius":999}}',
      ],
    },
    {
      id: "grid",
      tip: "grid · 3 cols",
      widgets: 0,
      lines: ['{"elType":"container","settings":{"grid_columns":3,"gap":24}}'],
    },
    {
      id: "card1",
      tip: "card · padding 24",
      widgets: 2,
      lines: [
        '{"elType":"widget","widgetType":"icon-box","settings":{"padding":24}}',
      ],
    },
    {
      id: "card2",
      tip: "card · padding 24",
      widgets: 2,
      lines: [
        '{"elType":"widget","widgetType":"icon-box","settings":{"padding":24}}',
      ],
    },
    {
      id: "card3",
      tip: "card · padding 24",
      widgets: 2,
      lines: [
        '{"elType":"widget","widgetType":"icon-box","settings":{"padding":24}}',
      ],
    },
    {
      id: "cta",
      tip: "button · radius 999",
      widgets: 2,
      lines: [
        '{"elType":"widget","widgetType":"heading","settings":{"size":32}}',
        '{"elType":"widget","widgetType":"button","settings":{"radius":999}}',
      ],
    },
  ];
const TOTAL_WIDGETS = BLOCKS.reduce((n, b) => n + b.widgets, 0); // 12

const TRANSPORTS = ["REST", "WP-CLI", "SFTP", "Plugin"] as const;
type Transport = (typeof TRANSPORTS)[number];
const TRANSPORT_LINE: Record<Transport, string> = {
  REST: "POST /wp-json/wp/v2/pages/412  _elementor_data  200 OK",
  "WP-CLI": "wp post meta update 412 _elementor_data page.json  ok",
  SFTP: "put page.json  wp-content/uploads/elementor/412.json  ok",
  Plugin: "save_builder(412, page.json) via bridge plugin  ok",
};

const DIFF: { k: string; a: string; b: string; ok: boolean }[] = [
  { k: "padding", a: "24", b: "24", ok: true },
  { k: "font-size", a: "48", b: "48", ok: true },
  { k: "radius", a: "999", b: "999", ok: true },
  { k: "letter-spacing", a: "-0.5", b: "0", ok: false },
];
const FIDELITY = 94;

const STEP_MS = 420;
const START_MS = 250;
const SCAN_MS = START_MS + STEP_MS * BLOCKS.length;

/* ---------- component ---------- */
export default function WebaiDemo({ locale, label }: DemoProps) {
  const t = T[locale] ?? T.en;
  const reduced = useReducedMotionSafe();

  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [scanned, setScanned] = useState<BlockId[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [count, setCount] = useState(0);
  const [transport, setTransport] = useState<Transport>("REST");
  const [hover, setHover] = useState<BlockId | null>(null);
  const [runKey, setRunKey] = useState(0);
  // fixed 960x540 stage scaled to the frame width (ResizeObserver; jsdom has none, so scale stays 1)
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = frameRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) =>
      setScale(entry.contentRect.width / 960),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const phaseRef = useRef(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  const timers = useRef<number[]>([]);
  const queue = useRef<string>("");
  const typer = useRef<number | null>(null);

  const clearAll = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    if (typer.current !== null) window.clearInterval(typer.current);
    typer.current = null;
    queue.current = "";
  }, []);
  useEffect(() => clearAll, [clearAll]);

  const finishInstantly = useCallback(() => {
    setScanned(BLOCKS.map((b) => b.id));
    setLog(BLOCKS.flatMap((b) => b.lines));
    setCount(TOTAL_WIDGETS);
    setPhase("done");
  }, []);

  const reset = useCallback(() => {
    clearAll();
    setScanned([]);
    setLog([]);
    setCount(0);
    setPhase("idle");
  }, [clearAll]);

  const run = useCallback(() => {
    clearAll();
    setScanned([]);
    setLog([]);
    setCount(0);
    setRunKey((k) => k + 1);
    if (reduced) {
      finishInstantly();
      return;
    }
    setPhase("running");
    // typewriter: pulls chars from the queue into the last log line
    typer.current = window.setInterval(() => {
      if (!queue.current) return;
      const chunk = queue.current.slice(0, 6);
      queue.current = queue.current.slice(6);
      setLog((prev) => {
        const next = prev.length ? [...prev] : [""];
        const parts = chunk.split("\n");
        next[next.length - 1] += parts[0];
        for (let i = 1; i < parts.length; i++) next.push(parts[i]);
        return next;
      });
    }, 16);
    BLOCKS.forEach((b, i) => {
      const id = window.setTimeout(
        () => {
          setScanned((s) => [...s, b.id]);
          queue.current +=
            (queue.current || i > 0 ? "\n" : "") + b.lines.join("\n");
          setCount((c) => c + b.widgets);
        },
        START_MS + i * STEP_MS,
      );
      timers.current.push(id);
    });
    timers.current.push(
      window.setTimeout(() => setPhase("done"), SCAN_MS + 500),
    );
  }, [clearAll, finishInstantly, reduced]);

  // keyboard R
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "r" && e.key !== "R") return;
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      if (phaseRef.current === "running") return; // same as the disabled Run button
      run();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run]);

  const isScanned = (id: BlockId) => scanned.includes(id);
  const current = phase === "running" ? scanned[scanned.length - 1] : null;
  const done = phase === "done";
  const lastLog = log.length ? log : null;
  const dur = reduced ? 0 : undefined;

  const blockCls = (id: BlockId) => {
    const on = isScanned(id);
    const hot = hover === id || current === id;
    return `relative border transition-colors duration-200 ${
      hot
        ? "bg-fg text-bg border-fg"
        : on
          ? "border-current/70 border-solid"
          : "border-current/30 border-dashed"
    }`;
  };

  const tip = (id: BlockId) =>
    hover === id ? (
      <span className="pointer-events-none absolute -top-[18px] left-0 z-10 whitespace-nowrap border border-fg bg-bg px-1.5 py-0.5 font-mono text-[9px] text-fg">
        {BLOCKS.find((b) => b.id === id)?.tip}
      </span>
    ) : null;

  return (
    <DemoFrame name="web.ai" label={label}>
      <div ref={frameRef} className="absolute inset-0">
        <div
          className="absolute left-0 top-0 h-[540px] w-[960px] origin-top-left select-none px-6 py-5 font-mono text-[11px] text-fg"
          style={{ transform: `scale(${scale})` }}
        >
          {/* header */}
          <div className="grid grid-cols-3 gap-6 text-eyebrow">
            <div className="flex items-center justify-between">
              <span>01 {t.source}</span>
              <span className="text-fg/40">DOM</span>
            </div>
            <div className="flex items-center justify-between">
              <span>02 {t.compile}</span>
              <span className="text-fg/40">JSON</span>
            </div>
            <div className="flex items-center justify-between">
              <span>03 {t.elementor}</span>
              <span className="text-fg/40">{t.fidelity}</span>
            </div>
          </div>

          <div className="mt-4 grid h-[458px] grid-cols-3 gap-6">
            {/* ---- SOURCE ---- */}
            <div className="relative border border-dashed border-fg/20 p-4">
              <AnimatePresence>
                {phase === "running" && (
                  <motion.div
                    key={runKey}
                    aria-hidden
                    className="pointer-events-none absolute left-0 right-0 z-20 h-px bg-fg shadow-[0_0_12px_1px_var(--fg)]"
                    initial={{ top: "0%" }}
                    animate={{ top: "100%" }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    transition={{ duration: SCAN_MS / 1000, ease: "linear" }}
                  />
                )}
              </AnimatePresence>
              <div className="flex h-full flex-col gap-3">
                {/* hero */}
                <div
                  className={`${blockCls("hero")} flex flex-col items-center gap-2 px-3 py-4`}
                  onPointerEnter={() => setHover("hero")}
                  onPointerLeave={() => setHover(null)}
                >
                  {tip("hero")}
                  <div className="h-[3px] w-[22%] bg-current opacity-60" />
                  <div className="h-[9px] w-[70%] bg-current" />
                  <div className="h-[9px] w-[50%] bg-current" />
                  <div className="mt-1 h-[3px] w-[60%] bg-current opacity-40" />
                  <div className="h-[3px] w-[45%] bg-current opacity-40" />
                  <div className="mt-2 h-[16px] w-[38%] rounded-full border border-current" />
                </div>
                {/* grid */}
                <div
                  className={`${blockCls("grid")} grid grid-cols-3 gap-2 p-2`}
                  onPointerEnter={() => setHover("grid")}
                  onPointerLeave={(e) => {
                    if (
                      !(e.currentTarget as HTMLElement).contains(
                        e.relatedTarget as Node,
                      )
                    )
                      setHover(null);
                  }}
                >
                  {tip("grid")}
                  {(["card1", "card2", "card3"] as BlockId[]).map((id) => (
                    <div
                      key={id}
                      className={`${blockCls(id)} flex flex-col gap-1.5 p-2`}
                      onPointerEnter={(e) => {
                        e.stopPropagation();
                        setHover(id);
                      }}
                      onPointerLeave={(e) => {
                        e.stopPropagation();
                        setHover("grid");
                      }}
                    >
                      {tip(id)}
                      <div className="h-[14px] w-[14px] border border-current" />
                      <div className="mt-1 h-[5px] w-[80%] bg-current" />
                      <div className="h-[3px] w-full bg-current opacity-40" />
                      <div className="h-[3px] w-[70%] bg-current opacity-40" />
                    </div>
                  ))}
                </div>
                {/* cta */}
                <div
                  className={`${blockCls("cta")} flex flex-1 flex-col items-center justify-center gap-2 p-3`}
                  onPointerEnter={() => setHover("cta")}
                  onPointerLeave={() => setHover(null)}
                >
                  {tip("cta")}
                  <div className="h-[6px] w-[55%] bg-current" />
                  <div className="h-[16px] w-[40%] rounded-full bg-current" />
                </div>
              </div>
            </div>

            {/* ---- COMPILE ---- */}
            <div className="flex flex-col border border-dashed border-fg/20">
              <div className="flex items-center justify-between border-b border-dashed border-fg/20 px-3 py-2">
                <button
                  type="button"
                  data-scramble
                  onClick={done ? reset : run}
                  disabled={phase === "running"}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                    done
                      ? "border border-fg/30 text-fg hover:border-fg"
                      : "bg-fg text-bg"
                  } disabled:opacity-60`}
                >
                  <ScrambleText text={done ? t.reset : t.run} />
                </button>
                <span className="text-eyebrow text-fg/40">{t.hint}</span>
              </div>
              <pre className="min-h-0 flex-1 overflow-hidden whitespace-pre-wrap break-all px-3 py-2 text-[10px] leading-[1.45] text-fg/85">
                {lastLog ? (
                  lastLog.join("\n")
                ) : (
                  <span className="text-fg/35">{t.idle}</span>
                )}
                {phase === "running" && (
                  <span className="ml-px inline-block h-[10px] w-[5px] animate-pulse bg-fg align-middle" />
                )}
                {done && (
                  <motion.span
                    className="block text-fg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: dur ?? 0.3 }}
                  >
                    {"\n"}
                    {`> ${TRANSPORT_LINE[transport]}`}
                  </motion.span>
                )}
              </pre>
              <div className="border-t border-dashed border-fg/20 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-eyebrow text-fg/60">{t.widgets}</span>
                  <span className="text-[14px] tabular-nums">
                    {count}
                    <span className="text-fg/40">/{TOTAL_WIDGETS}</span>
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-eyebrow text-fg/40">{t.transport}</span>
                  <div
                    className="flex flex-1 overflow-hidden rounded-full border border-fg/30"
                    role="group"
                  >
                    {TRANSPORTS.map((tr) => (
                      <button
                        key={tr}
                        type="button"
                        data-scramble
                        aria-pressed={transport === tr}
                        onClick={() => setTransport(tr)}
                        className={`flex-1 px-1 py-[3px] text-[9px] uppercase tracking-wide transition-colors ${
                          transport === tr
                            ? "bg-fg text-bg"
                            : "text-fg/70 hover:text-fg"
                        }`}
                      >
                        <ScrambleText text={tr} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ---- ELEMENTOR ---- */}
            <div className="flex flex-col border border-dashed border-fg/20 p-4">
              <div className="flex flex-1 flex-col gap-3">
                <Out
                  show={isScanned("hero")}
                  reduced={reduced}
                  edit={t.edit}
                  className="flex flex-col items-center gap-2 px-3 py-4"
                >
                  <div className="h-[3px] w-[22%] bg-fg/60" />
                  <div className="h-[9px] w-[70%] bg-fg" />
                  <div className="h-[9px] w-[50%] bg-fg" />
                  <div className="mt-1 h-[3px] w-[60%] bg-fg/40" />
                  <div className="h-[3px] w-[45%] bg-fg/40" />
                  <div className="mt-2 h-[16px] w-[38%] rounded-full bg-fg" />
                </Out>
                <Out
                  show={isScanned("grid")}
                  reduced={reduced}
                  edit={t.edit}
                  chip={false}
                  className="grid grid-cols-3 gap-2 p-2"
                >
                  {(["card1", "card2", "card3"] as BlockId[]).map((id) => (
                    <Out
                      key={id}
                      show={isScanned(id)}
                      reduced={reduced}
                      edit={t.edit}
                      small
                      className="flex flex-col gap-1.5 p-2"
                    >
                      <div className="h-[14px] w-[14px] bg-fg" />
                      <div className="mt-1 h-[5px] w-[80%] bg-fg" />
                      <div className="h-[3px] w-full bg-fg/40" />
                      <div className="h-[3px] w-[70%] bg-fg/40" />
                    </Out>
                  ))}
                </Out>
                <Out
                  show={isScanned("cta")}
                  reduced={reduced}
                  edit={t.edit}
                  className="flex flex-1 flex-col items-center justify-center gap-2 p-3"
                >
                  <div className="h-[6px] w-[55%] bg-fg" />
                  <div className="h-[16px] w-[40%] rounded-full bg-fg" />
                </Out>
              </div>

              {/* fidelity meter */}
              <div className="mt-3 border-t border-dashed border-fg/20 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-eyebrow text-fg/60">{t.fidelity}</span>
                  <Counter value={done ? FIDELITY : 0} reduced={reduced} />
                </div>
                <div className="mt-2 h-[4px] w-full border border-fg/30">
                  <motion.div
                    className="h-full bg-fg"
                    initial={false}
                    animate={{ width: done ? `${FIDELITY}%` : "0%" }}
                    transition={{
                      duration: dur ?? 1,
                      ease: [...EASE_OUT_QUINT],
                    }}
                  />
                </div>
                <ul className="mt-2 flex flex-col gap-[3px] text-[9px]">
                  {DIFF.map((d, i) => (
                    <motion.li
                      key={d.k}
                      className="flex justify-between gap-2 whitespace-nowrap"
                      initial={false}
                      animate={{ opacity: done ? 1 : 0, y: done ? 0 : 4 }}
                      transition={{
                        duration: dur ?? 0.3,
                        delay: reduced ? 0 : 0.4 + i * 0.12,
                      }}
                    >
                      <span className="text-fg/60">{d.k}</span>
                      <span className={d.ok ? "" : "text-fg/50"}>
                        {d.a} {"->"} {d.b} {d.ok ? "✓" : "✗"}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DemoFrame>
  );
}

/* ---------- pieces ---------- */
function Out({
  show,
  reduced,
  edit,
  small = false,
  chip = true,
  className = "",
  children,
}: {
  show: boolean;
  reduced: boolean;
  edit: string;
  small?: boolean;
  chip?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className={`relative border border-fg/70 ${className}`}
      initial={false}
      animate={{ opacity: show ? 1 : 0.12, scale: show ? 1 : 0.97 }}
      transition={{ duration: reduced ? 0 : 0.36, ease: [...EASE_OUT_QUINT] }}
    >
      {children}
      {chip && (
        <span
          className={`absolute right-0 top-0 bg-fg px-1 text-bg ${small ? "text-[6px] leading-[9px]" : "text-[7px] leading-[11px]"} tracking-wider transition-opacity duration-300 ${
            show ? "opacity-100" : "opacity-0"
          }`}
        >
          {edit}
        </span>
      )}
    </motion.div>
  );
}

function Counter({ value, reduced }: { value: number; reduced: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      if (reduced || value === 0) {
        setN(value);
        return;
      }
      const p = Math.min(1, (now - start) / 1000);
      const e = 1 - Math.pow(1 - p, 5);
      setN(Math.round(value * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduced]);
  return <span className="text-[14px] tabular-nums">{n}%</span>;
}
