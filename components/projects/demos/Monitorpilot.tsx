"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { DashedCard, ScrambleText } from "@/components/ds";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion";
import { DemoFrame } from "./DemoFrame";
import type { DemoProps } from "../ProjectDemo";

/**
 * Demo de "monitorpilot": popover da barra de menus (esquerda) controlando telas ao vivo (direita),
 * com a linha de CLI equivalente digitada embaixo. Tudo local, sem rede; P&B; springs do `motion`.
 * O conteúdo é desenhado a 960×540 e escalado pra caber na moldura (mobile = scale down).
 */

const W = 960;
const H = 540;

const T = {
  en: {
    displays: "Displays",
    brightness: "Brightness",
    scale: "Scale",
    xdr: "XDR boost",
    mirror: "Mirror",
    rotate: "Rotate 90°",
    virtual: "Virtual display +",
    mirrorTag: "mirror",
    pip: "PIP",
    drag: "drag me",
    screens: "Live screens",
  },
  pt: {
    displays: "Telas",
    brightness: "Brilho",
    scale: "Escala",
    xdr: "XDR boost",
    mirror: "Espelhar",
    rotate: "Girar 90°",
    virtual: "Tela virtual +",
    mirrorTag: "espelho",
    pip: "PIP",
    drag: "arraste",
    screens: "Telas ao vivo",
  },
} as const;

type Display = {
  id: number;
  name: string;
  w: number;
  h: number;
  scaleIdx: number;
  brightness: number;
  xdr: boolean;
  mirror: boolean;
  rotate: boolean;
  virtual?: boolean;
};

const SCALES = [1, 1.33, 2] as const;
const SCALE_LABELS = ["100%", "133%", "200%"] as const;

const INITIAL: Display[] = [
  { id: 1, name: "LG UltraFine", w: 2560, h: 1440, scaleIdx: 1, brightness: 62, xdr: false, mirror: false, rotate: false },
  { id: 2, name: "Dell Vertical", w: 1080, h: 1920, scaleIdx: 2, brightness: 45, xdr: false, mirror: false, rotate: false },
];
const VIRTUAL: Display = {
  id: 3,
  name: "Virtual",
  w: 1920,
  h: 1080,
  scaleIdx: 0,
  brightness: 80,
  xdr: false,
  mirror: false,
  rotate: false,
  virtual: true,
};

const SPRING = { type: "spring", stiffness: 260, damping: 24 } as const;
const INSTANT = { duration: 0 } as const;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* ---------- Glyph do menu bar ---------- */
function Glyph({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x="0.75" y="1.75" width="10.5" height="7" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 11h4M6 8.75V11" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3 5.25h6" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1.2 1.2" />
    </svg>
  );
}

/* ---------- Slider de brilho (pointer + teclado) ---------- */
function BrightnessSlider({
  value,
  label,
  onChange,
  onCommit,
}: {
  value: number;
  label: string;
  onChange: (v: number) => void;
  onCommit: (v: number) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const fromEvent = (clientX: number) => {
    const r = track.current?.getBoundingClientRect();
    if (!r || r.width === 0) return value;
    return Math.round(clamp((clientX - r.left) / r.width, 0, 1) * 100);
  };

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    onChange(fromEvent(e.clientX));
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    onChange(fromEvent(e.clientX));
  };
  const onUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    onCommit(fromEvent(e.clientX));
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 1;
    let next = value;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = clamp(value + step, 0, 100);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = clamp(value - step, 0, 100);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = 100;
    else return;
    e.preventDefault();
    onChange(next);
    onCommit(next);
  };

  return (
    <div className="flex items-center gap-2">
      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        data-brightness-slider
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKey}
        className="relative h-[14px] flex-1 cursor-ew-resize touch-none border border-dashed border-fg/30 select-none"
      >
        <div className="absolute inset-y-[2px] left-[2px] bg-fg" style={{ width: `calc(${value}% - 4px)`, minWidth: 0 }} />
        <div
          aria-hidden="true"
          className="absolute top-1/2 h-[18px] w-[6px] -translate-x-1/2 -translate-y-1/2 border border-fg bg-bg"
          style={{ left: `${value}%` }}
        />
      </div>
      <span className="w-[34px] text-right font-mono text-[11px] tabular-nums text-fg">{value}%</span>
    </div>
  );
}

/* ---------- Toggle pill ---------- */
function Toggle({ on, text, onClick, testId }: { on: boolean; text: string; onClick: () => void; testId: string }) {
  return (
    <button
      type="button"
      data-scramble
      data-toggle={testId}
      aria-pressed={on}
      onClick={onClick}
      className={`h-[22px] whitespace-nowrap border px-[7px] font-mono text-[10px] uppercase tracking-[.5px] transition-colors duration-200 ${
        on ? "border-fg bg-fg text-bg" : "border-dashed border-fg/30 text-fg/70 hover:border-fg/70 hover:text-fg"
      }`}
    >
      <ScrambleText text={text} />
    </button>
  );
}

/* ---------- Segmented control de escala ---------- */
function Segmented({ value, onChange, label }: { value: number; onChange: (i: number) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex border border-dashed border-fg/30">
      {SCALE_LABELS.map((l, i) => (
        <button
          key={l}
          type="button"
          role="radio"
          aria-checked={value === i}
          data-scramble
          data-scale={SCALES[i]}
          onClick={() => onChange(i)}
          className={`h-[20px] px-[7px] font-mono text-[10px] tabular-nums transition-colors duration-200 ${
            value === i ? "bg-fg text-bg" : "text-fg/70 hover:text-fg"
          } ${i > 0 ? "border-l border-dashed border-fg/30" : ""}`}
        >
          <ScrambleText text={l} />
        </button>
      ))}
    </div>
  );
}

/* ---------- Thumbnail de tela ---------- */
const THUMB = 0.1; // px por pixel lógico

function Screen({
  d,
  ghost,
  reduced,
  children,
  tag,
}: {
  d: Display;
  ghost?: boolean;
  reduced: boolean;
  children?: ReactNode;
  tag?: string;
}) {
  const scale = SCALES[d.scaleIdx];
  const w = Math.round((d.w / scale) * THUMB);
  const h = Math.round((d.h / scale) * THUMB);
  const fill = 0.08 + (d.brightness / 100) * 0.92;
  const glow = d.xdr ? `0 0 ${14 + d.brightness * 0.2}px rgba(255,255,255,${0.25 + d.brightness / 200})` : "none";
  const box = d.rotate ? Math.max(w, h) : undefined;
  return (
    <div className="flex flex-col items-center gap-[6px]" style={{ width: box, height: box ? box + 18 : undefined }}>
      <motion.div
        data-screen={d.id}
        data-ghost={ghost ? "true" : undefined}
        layout
        animate={{ width: w, height: h, rotate: d.rotate ? 90 : 0, opacity: 1 }}
        initial={{ width: w, height: h, rotate: 0, opacity: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={reduced ? INSTANT : SPRING}
        className={`relative shrink-0 border ${ghost ? "border-dashed border-fg/50" : "border-fg"}`}
        style={{ boxShadow: glow }}
      >
        <div className="absolute inset-0 bg-fg" style={{ opacity: ghost ? fill * 0.5 : fill }} />
        {children}
      </motion.div>
      <span className="whitespace-nowrap font-mono text-[9px] uppercase tracking-[1px] text-fg/60">{tag ?? `${d.id} · ${d.name}`}</span>
    </div>
  );
}

/* ---------- Typewriter da CLI (remonta por `key`, sem setState síncrono em effect) ---------- */
function Typewriter({ text, reduced }: { text: string; reduced: boolean }) {
  const [n, setN] = useState(() => (reduced ? text.length : 0));
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          window.clearInterval(id);
          return v;
        }
        return v + 1;
      });
    }, 16);
    return () => window.clearInterval(id);
  }, [text, reduced]);
  return (
    <span data-cli className="text-fg">
      {reduced ? text : text.slice(0, n)}
    </span>
  );
}

/* ---------- Demo ---------- */
export default function MonitorpilotDemo({ locale, label }: DemoProps) {
  const t = T[locale] ?? T.en;
  const reduced = useReducedMotionSafe();

  const [displays, setDisplays] = useState<Display[]>(INITIAL);
  const [pip, setPipState] = useState({ x: 0.62, y: 0.12 });
  const pipRef = useRef(pip);
  const setPip = (p: { x: number; y: number }) => {
    pipRef.current = p;
    setPipState(p);
  };
  const [cmd, setCmd] = useState("monitorpilot list");
  const [scale, setScale] = useState(1);

  const wrap = useRef<HTMLDivElement>(null);

  /* escala do palco 960x540 pra caber na moldura */
  useEffect(() => {
    const el = wrap.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      const cw = entry.contentRect.width;
      setScale(cw > 0 ? cw / W : 1);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const patch = useCallback((id: number, p: Partial<Display>) => {
    setDisplays((ds) => ds.map((d) => (d.id === id ? { ...d, ...p } : d)));
  }, []);

  const hasVirtual = displays.some((d) => d.virtual);
  const first = displays[0];

  /* drag do PIP dentro da tela 1 (fração, funciona sob qualquer scale) */
  const pipDrag = useRef<{ dx: number; dy: number } | null>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const PIP_W = 0.3;
  const PIP_H = 0.3;
  const pipDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = screenRef.current?.getBoundingClientRect();
    if (!r) return;
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    pipDrag.current = { dx: (e.clientX - r.left) / r.width - pip.x, dy: (e.clientY - r.top) / r.height - pip.y };
  };
  const pipMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = screenRef.current?.getBoundingClientRect();
    if (!r || !pipDrag.current) return;
    const x = clamp((e.clientX - r.left) / r.width - pipDrag.current.dx, 0, 1 - PIP_W);
    const y = clamp((e.clientY - r.top) / r.height - pipDrag.current.dy, 0, 1 - PIP_H);
    setPip({ x, y });
  };
  const pipUp = () => {
    if (!pipDrag.current) return;
    pipDrag.current = null;
    const p = pipRef.current;
    setCmd(`monitorpilot pip --display 1 --of 2 --x ${p.x.toFixed(2)} --y ${p.y.toFixed(2)}`);
  };

  return (
    <DemoFrame name="monitorpilot" label={label}>
      <div ref={wrap} className="absolute inset-0 overflow-hidden" style={{ containerType: "inline-size" }}>
        <div
          className="absolute left-0 top-0 grid"
          style={{
            width: W,
            height: H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            gridTemplateColumns: "424px 1fr",
            gridTemplateRows: "1fr 44px",
          }}
        >
          {/* ===== Esquerda: menu bar + popover ===== */}
          <div className="relative flex flex-col border-r border-dashed border-fg/15">
            {/* menu bar */}
            <div className="flex h-[24px] items-center justify-between border-b border-dashed border-fg/15 px-3 font-mono text-[10px] text-fg/60">
              <span className="flex items-center gap-[10px]">
                <span className="h-[9px] w-[9px] rounded-full border border-fg/60" />
                <span>Finder</span>
                <span className="text-fg/30">File</span>
                <span className="text-fg/30">Edit</span>
                <span className="text-fg/30">View</span>
              </span>
              <span className="flex items-center gap-[10px]">
                <span className="text-fg/30">wifi</span>
                <span className="text-fg/30">100%</span>
                <span className="flex h-[16px] w-[18px] items-center justify-center bg-fg text-bg" data-menubar-glyph>
                  <Glyph />
                </span>
                <span>9:41</span>
              </span>
            </div>

            {/* notch do popover */}
            <span
              aria-hidden="true"
              className="absolute left-[316px] top-[19px] h-[10px] w-[10px] rotate-45 border-l border-t border-dashed border-fg/30 bg-bg"
            />

            {/* popover */}
            <DashedCard className="mx-[12px] mt-[8px] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-3 pt-[9px] pb-[6px]">
                <span className="text-eyebrow text-fg/60">
                  <span className="mr-[6px] inline-block align-[-2px]">
                    <Glyph size={10} />
                  </span>
                  MonitorPilot · {t.displays}
                </span>
                <span className="font-mono text-[10px] text-fg/40">{displays.length}</span>
              </div>

              <div className="flex flex-col">
                <AnimatePresence initial={false}>
                  {displays.map((d, idx) => (
                    <motion.div
                      key={d.id}
                      data-display-row={d.id}
                      layout
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={reduced ? INSTANT : { ...SPRING, delay: idx * 0.06 }}
                      className="border-t border-dashed border-fg/15 px-3 py-[8px]"
                    >
                      <div className="flex items-baseline justify-between">
                        <span className="text-[12px] text-fg">
                          {d.id}. {d.name}
                        </span>
                        <span className="font-mono text-[10px] tabular-nums text-fg/60">
                          {d.w}×{d.h} · {SCALE_LABELS[d.scaleIdx]}
                        </span>
                      </div>
                      <div className="mt-[6px] flex items-center gap-2">
                        <span className="w-[54px] font-mono text-[9px] uppercase tracking-[1px] text-fg/50">{t.brightness}</span>
                        <div className="flex-1">
                          <BrightnessSlider
                            value={d.brightness}
                            label={`${t.brightness} ${d.name}`}
                            onChange={(v) => patch(d.id, { brightness: v })}
                            onCommit={(v) => setCmd(`monitorpilot brightness --display ${d.id} --set ${v}`)}
                          />
                        </div>
                      </div>
                      <div className="mt-[7px] flex items-center gap-[6px]">
                        <Segmented
                          label={`${t.scale} ${d.name}`}
                          value={d.scaleIdx}
                          onChange={(i) => {
                            patch(d.id, { scaleIdx: i });
                            setCmd(`monitorpilot hidpi --display ${d.id} --scale ${SCALES[i]}`);
                          }}
                        />
                        <span className="flex-1" />
                        <Toggle
                          testId={`xdr-${d.id}`}
                          on={d.xdr}
                          text={t.xdr}
                          onClick={() => {
                            patch(d.id, { xdr: !d.xdr });
                            setCmd(`monitorpilot xdr --display ${d.id} ${d.xdr ? "--off" : "--on"}`);
                          }}
                        />
                        <Toggle
                          testId={`mirror-${d.id}`}
                          on={d.mirror}
                          text={t.mirror}
                          onClick={() => {
                            patch(d.id, { mirror: !d.mirror });
                            setCmd(d.mirror ? `monitorpilot unmirror --display ${d.id}` : `monitorpilot mirror --display ${d.id} --to 1`);
                          }}
                        />
                        <Toggle
                          testId={`rotate-${d.id}`}
                          on={d.rotate}
                          text={t.rotate}
                          onClick={() => {
                            patch(d.id, { rotate: !d.rotate });
                            setCmd(`monitorpilot rotate --display ${d.id} --deg ${d.rotate ? 0 : 90}`);
                          }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div className="border-t border-dashed border-fg/15 px-3 py-[8px]">
                  <button
                    type="button"
                    data-scramble
                    data-virtual-add
                    disabled={hasVirtual}
                    onClick={() => {
                      setDisplays((ds) => [...ds, VIRTUAL]);
                      setCmd("monitorpilot virtual --create 1920x1080 --hidpi");
                    }}
                    className={`h-[24px] w-full border font-mono text-[10px] uppercase tracking-[1px] transition-colors duration-200 ${
                      hasVirtual
                        ? "cursor-default border-dashed border-fg/15 text-fg/30"
                        : "border-dashed border-fg/40 text-fg hover:bg-fg hover:text-bg"
                    }`}
                  >
                    <ScrambleText text={t.virtual} />
                  </button>
                </div>
              </div>
            </DashedCard>
          </div>

          {/* ===== Direita: telas ao vivo ===== */}
          <div className="relative flex flex-col px-5 pt-[8px]">
            <span className="text-eyebrow text-fg/60">{t.screens}</span>
            <div className="flex flex-1 flex-wrap content-center items-center justify-center gap-x-8 gap-y-6">
              <AnimatePresence>
                {displays.map((d) =>
                  d.id === 1 ? (
                    <Screen key={d.id} d={d} reduced={reduced}>
                      <div ref={screenRef} className="absolute inset-0" data-screen-surface>
                        <motion.div
                          data-pip
                          role="button"
                          tabIndex={0}
                          aria-label={t.pip}
                          onPointerDown={pipDown}
                          onPointerMove={pipMove}
                          onPointerUp={pipUp}
                          onPointerCancel={pipUp}
                          animate={{ left: `${pip.x * 100}%`, top: `${pip.y * 100}%` }}
                          transition={reduced ? INSTANT : { type: "spring", stiffness: 500, damping: 40 }}
                          className="absolute flex cursor-grab touch-none items-center justify-center border border-fg bg-bg active:cursor-grabbing"
                          style={{ width: `${PIP_W * 100}%`, height: `${PIP_H * 100}%` }}
                        >
                          <span className="overflow-hidden whitespace-nowrap font-mono text-[8px] uppercase tracking-[1px] text-fg/70">
                            {t.pip}
                          </span>
                          <span className="absolute inset-[3px] border border-dashed border-fg/30" />
                        </motion.div>
                      </div>
                    </Screen>
                  ) : (
                    <Screen key={d.id} d={d} reduced={reduced} />
                  ),
                )}
                {displays
                  .filter((d) => d.mirror)
                  .map((d) => (
                    <Screen key={`m-${d.id}`} d={{ ...d, brightness: first.brightness }} ghost reduced={reduced} tag={`${d.id} · ${t.mirrorTag}`} />
                  ))}
              </AnimatePresence>
            </div>
          </div>

          {/* ===== Rodapé: CLI ===== */}
          <div className="col-span-2 flex items-center gap-2 border-t border-dashed border-fg/15 px-4 font-mono text-[12px]">
            <span className="text-fg/50">$</span>
            <Typewriter key={cmd} text={cmd} reduced={reduced} />
            <span
              aria-hidden="true"
              className="inline-block h-[13px] w-[7px] bg-fg"
              style={reduced ? undefined : { animation: "mp-blink 1s steps(1) infinite" }}
            />
            <style>{`@keyframes mp-blink{0%,50%{opacity:1}50.01%,100%{opacity:0}}`}</style>
          </div>
        </div>
      </div>
    </DemoFrame>
  );
}
