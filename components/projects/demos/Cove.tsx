"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { DemoFrame } from "./DemoFrame";
import { ScrambleText } from "@/components/ds";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion";
import type { DemoProps } from "../ProjectDemo";

/**
 * Demo "cove": a ilha do Mac com o layout REAL do app (docs/ref/cove-*.png).
 * - compacta: abraça o notch (capa à esquerda, waveform à direita)
 * - expandida: painel preto pendurado no notch, cantos superiores "escorrendo" pra barra,
 *   conteúdo do droplet (shelf / clipboard / histórico / busca / grade) e a pílula de abas no rodapé
 * - HUD: barra fina (ícone + rótulo à esquerda, barra ou valor à direita)
 * Hover expande, chips e abas trocam a página, sliders arrastam, Esc fecha, volta sozinha.
 * Tudo desenhado numa tela base de 640×360 e escalado pro tamanho do container.
 */

const W = 640;
const H = 360;
const SPRING = { type: "spring", stiffness: 320, damping: 28 } as const;

type Mode = "compact" | "expanded" | "volume" | "brightness" | "battery";
type Tab = "shelf" | "clipboard" | "history" | "search" | "grid";
type Chip = Tab | "volume" | "brightness" | "battery";

const TABS: Tab[] = ["shelf", "clipboard", "history", "search", "grid"];
const CHIPS: Chip[] = ["shelf", "clipboard", "search", "volume", "brightness", "battery"];

const T = {
  en: {
    shelf: "Shelf",
    clipboard: "Clipboard",
    history: "History",
    search: "Search",
    grid: "Droplets",
    volume: "Volume",
    brightness: "Brightness",
    battery: "Battery",
    sound: "Sound",
    dropHere: "Drop files here",
    searchClips: "Search...",
    counter: "0 items · 0 pinned",
    noHistory: "No history yet",
    searchAsk: "Search or ask",
    noCaptures: "No captures yet",
    hint: "Hover the notch. Click a chip or a tab. Esc closes.",
    droplets: ["Timers", "Calendar", "Memos", "Lyrics", "Capture", "Terminal"],
  },
  pt: {
    shelf: "Prateleira",
    clipboard: "Clipboard",
    history: "Histórico",
    search: "Busca",
    grid: "Droplets",
    volume: "Volume",
    brightness: "Brilho",
    battery: "Bateria",
    sound: "Som",
    dropHere: "Arraste arquivos pra cá",
    searchClips: "Buscar...",
    counter: "0 itens · 0 fixados",
    noHistory: "Sem histórico ainda",
    searchAsk: "Buscar ou perguntar",
    noCaptures: "Sem capturas ainda",
    hint: "Passe o mouse no notch. Clique num chip ou numa aba. Esc fecha.",
    droplets: ["Timers", "Agenda", "Memos", "Letras", "Captura", "Terminal"],
  },
} as const;
type Dict = (typeof T)[keyof typeof T];

// tela base
const SCREEN = { x: 20, y: 22, w: 600, h: 272 };
const NOTCH = { w: 132, h: 20 };

// geometria da ilha por modo (proporções tiradas dos prints do app: expandida 800×340 r48, HUD ~1045×62 r24)
const SIZE: Record<Mode, { w: number; h: number; r: number; flare: number }> = {
  compact: { w: 176, h: NOTCH.h, r: 10, flare: 6 },
  expanded: { w: 336, h: 138, r: 22, flare: 16 },
  volume: { w: 300, h: 22, r: 9, flare: 8 },
  brightness: { w: 300, h: 22, r: 9, flare: 8 },
  battery: { w: 300, h: 22, r: 9, flare: 8 },
};

export default function CoveDemo({ locale, label }: DemoProps) {
  const t = T[locale];
  const reduced = useReducedMotionSafe();

  const [mode, setMode] = useState<Mode>("compact");
  const [tab, setTab] = useState<Tab>("shelf");
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false); // aberta por chip/aba: fica mais tempo
  const [volume, setVolume] = useState(0.62);
  const [brightness, setBrightness] = useState(0.8);
  const [query, setQuery] = useState("");

  // escala da tela base 640×360 pro container
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / W || 1);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // auto-retorno pra compacta quando não está em hover
  useEffect(() => {
    if (mode === "compact" || hovered) return;
    const ms = pinned ? 6000 : mode === "expanded" ? 900 : 3000;
    const id = window.setTimeout(() => {
      setMode("compact");
      setPinned(false);
    }, ms);
    return () => window.clearTimeout(id);
  }, [mode, hovered, pinned]);


  // Esc fecha
  useEffect(() => {
    if (mode === "compact") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMode("compact");
        setPinned(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode]);

  const openChip = (c: Chip) => {
    setPinned(true);
    if (c === "volume" || c === "brightness" || c === "battery") {
      setMode(c);
      return;
    }
    setTab(c);
    setMode("expanded");
  };

  const size = SIZE[mode];
  const spring = reduced ? { duration: 0 } : SPRING;
  const fade = reduced ? { duration: 0 } : { duration: 0.16 };
  const activeChip: Chip | null = mode === "expanded" ? tab : mode === "compact" ? null : mode;

  return (
    <DemoFrame name="cove" label={label}>
      <div ref={wrapRef} className="relative h-full w-full overflow-hidden" data-cove-mode={mode} data-cove-tab={tab}>
        <div
          className="absolute left-0 top-0 select-none"
          style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "top left" }}
        >
          {/* tela do Mac: superfície clara (fg/10) pra ilha preta ler como no app */}
          <div
            className="absolute overflow-hidden rounded-[14px] border border-fg/30 bg-fg/[.08]"
            style={{ left: SCREEN.x, top: SCREEN.y, width: SCREEN.w, height: SCREEN.h }}
          >
            {/* wallpaper */}
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[.10]"
              style={{ backgroundImage: "repeating-linear-gradient(135deg, var(--fg) 0 1px, transparent 1px 14px)" }}
            />
            {/* barra de menus */}
            <div className="absolute inset-x-0 top-0 flex h-[20px] items-center justify-between px-3">
              <div className="flex items-center gap-2">
                <span className="h-[7px] w-[7px] rounded-full bg-fg/80" />
                <span className="h-[5px] w-[22px] rounded-full bg-fg/80" />
                <span className="h-[5px] w-[14px] rounded-full bg-fg/35" />
                <span className="h-[5px] w-[18px] rounded-full bg-fg/35" />
                <span className="h-[5px] w-[12px] rounded-full bg-fg/35" />
              </div>
              <div className="flex items-center gap-2">
                <span className="h-[5px] w-[5px] rounded-full border border-fg/50" />
                <span className="h-[5px] w-[10px] rounded-[1px] border border-fg/50" />
                <span className="font-mono text-[7px] leading-none tracking-[.5px] text-fg/60">9:41</span>
              </div>
            </div>
            {/* notch */}
            <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-[10px] bg-bg" style={{ width: NOTCH.w, height: NOTCH.h }} />

            {/* ilha */}
            <motion.div
              data-cove-island
              role="button"
              tabIndex={0}
              aria-label="Cove island"
              className="absolute left-1/2 top-0 z-10 text-fg outline-none"
              style={{ x: "-50%" }}
              initial={false}
              animate={{ width: size.w, height: size.h }}
              transition={spring}
              onPointerEnter={() => {
                setHovered(true);
                setMode((m) => (m === "compact" ? "expanded" : m));
              }}
              onPointerLeave={() => setHovered(false)}
              onClick={() => setMode((m) => (m === "compact" ? "expanded" : m === "expanded" ? "compact" : m))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setMode((m) => (m === "compact" ? "expanded" : "compact"));
                }
              }}
            >
              {/* cantos superiores escorrendo pra barra (como o app) */}
              <motion.span
                aria-hidden="true"
                className="absolute top-0"
                animate={{ left: -size.flare, width: size.flare, height: size.flare }}
                transition={spring}
                style={{ background: `radial-gradient(circle at 0 100%, transparent 0 ${size.flare - 0.5}px, var(--bg) ${size.flare}px)` }}
              />
              <motion.span
                aria-hidden="true"
                className="absolute top-0"
                animate={{ right: -size.flare, width: size.flare, height: size.flare }}
                transition={spring}
                style={{ background: `radial-gradient(circle at 100% 100%, transparent 0 ${size.flare - 0.5}px, var(--bg) ${size.flare}px)` }}
              />
              {/* corpo */}
              <motion.div
                className="absolute inset-0 overflow-hidden bg-bg"
                animate={{ borderBottomLeftRadius: size.r, borderBottomRightRadius: size.r }}
                transition={spring}
              >
                <AnimatePresence initial={false}>
                  <motion.div
                    key={mode === "expanded" ? `x-${tab}` : mode}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={fade}
                  >
                    {mode === "compact" && <Compact reduced={reduced} />}
                    {mode === "expanded" && (
                      <Droplet t={t} tab={tab} onTab={(x) => { setTab(x); setPinned(true); }} query={query} onQuery={setQuery} />
                    )}
                    {(mode === "volume" || mode === "brightness") && (
                      <Hud
                        label={mode === "volume" ? t.sound : t.brightness}
                        glyph={mode}
                        value={mode === "volume" ? volume : brightness}
                        onChange={mode === "volume" ? setVolume : setBrightness}
                      />
                    )}
                    {mode === "battery" && <BatteryHud />}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </div>

          {/* chips */}
          <div className="absolute inset-x-0 flex justify-center gap-[6px]" style={{ top: 314 }}>
            {CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                data-scramble
                data-cove-chip={c}
                onClick={() => openChip(c)}
                className={`rounded-full border px-[10px] py-[3px] font-mono text-[8px] uppercase tracking-[1px] transition-colors duration-200 ${
                  activeChip === c ? "border-fg bg-fg text-bg" : "border-dashed border-fg/40 text-fg/80 hover:border-fg"
                }`}
              >
                <ScrambleText text={t[c]} />
              </button>
            ))}
          </div>
          <p className="absolute inset-x-0 text-center font-mono text-[7px] uppercase tracking-[1px] text-fg/40" style={{ top: 340 }}>
            {t.hint}
          </p>
        </div>
      </div>
    </DemoFrame>
  );
}

/* ---------- ícones (traço branco, como os SF Symbols do app) ---------- */

function Icon({ name, size = 9 }: { name: Tab | "speaker" | "sun"; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (name) {
    case "shelf":
      return (
        <svg {...common}>
          <path d="M2 9l1.6-4.5h8.8L14 9v4H2z" />
          <path d="M2 9h3.5l1 1.8h3L10.5 9H14" />
        </svg>
      );
    case "clipboard":
      return (
        <svg {...common}>
          <rect x="5" y="4.5" width="7" height="9.5" rx="1.4" />
          <path d="M5 8V3.4A1.4 1.4 0 0 1 6.4 2H10l2.8 2.8V8" />
        </svg>
      );
    case "history":
      return (
        <svg {...common}>
          <path d="M3 8a5 5 0 1 0 1.5-3.6" />
          <path d="M3 3v2.2h2.2M8 5.2V8l2 1.4" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="7" cy="7" r="4.2" />
          <path d="M10.2 10.2 13.5 13.5" />
        </svg>
      );
    case "grid":
      return (
        <svg {...common}>
          <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" />
          <rect x="9" y="2.5" width="4.5" height="4.5" rx="1" />
          <rect x="2.5" y="9" width="4.5" height="4.5" rx="1" />
          <rect x="9" y="9" width="4.5" height="4.5" rx="1" />
        </svg>
      );
    case "speaker":
      return (
        <svg {...common}>
          <path d="M2.5 6h2.5L9 3v10L5 10H2.5z" fill="currentColor" />
        </svg>
      );
    case "sun":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="2.8" fill="currentColor" />
          <path d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M3.4 12.6l1.3-1.3M11.3 4.7l1.3-1.3" />
        </svg>
      );
  }
}

/* ---------- compacta ---------- */

function Compact({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex h-full items-center justify-between px-[7px]">
      <span
        aria-hidden="true"
        className="h-[12px] w-[12px] rounded-[3px] border border-fg/60"
        style={{ backgroundImage: "radial-gradient(var(--fg) 0.5px, transparent 0.8px)", backgroundSize: "2.5px 2.5px", opacity: 0.85 }}
      />
      <span className="flex items-end gap-[1.5px]" style={{ height: 9 }} aria-hidden="true">
        {[0.6, 1, 0.75, 0.9].map((peak, i) => (
          <motion.span
            key={i}
            className="w-[1.5px] rounded-[1px] bg-fg"
            animate={reduced ? { height: 9 * 0.35 } : { height: [9 * 0.3, 9 * peak, 9 * 0.45, 9 * peak * 0.9, 9 * 0.3] }}
            transition={reduced ? { duration: 0 } : { duration: 0.9 + i * 0.15, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </span>
    </div>
  );
}

/* ---------- painel expandido (droplet) ---------- */

function Droplet({
  t,
  tab,
  onTab,
  query,
  onQuery,
}: {
  t: Dict;
  tab: Tab;
  onTab: (x: Tab) => void;
  query: string;
  onQuery: (q: string) => void;
}) {
  return (
    <div className="absolute inset-0" onClick={(e) => e.stopPropagation()}>
      {tab === "shelf" && (
        <Empty y={44}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3v10M8.5 9.5 12 13l3.5-3.5" />
            <path d="M3 14l2-4.5h2.5M16.5 9.5H19l2 4.5v5H3v-5" />
            <path d="M3 14h5l1.5 2.5h5L16 14h5" />
          </svg>
          <span>{t.dropHere}</span>
        </Empty>
      )}
      {tab === "clipboard" && (
        <>
          <Field placeholder={t.searchClips} />
          <div className="absolute left-[14px] top-[38px] text-[7.5px] font-semibold leading-none text-fg/55">{t.counter}</div>
          <Empty y={64}>
            <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" aria-hidden="true">
              <rect x="4.5" y="4.5" width="7" height="9.5" rx="1.3" />
              <path d="M4.5 8V3.3A1.3 1.3 0 0 1 5.8 2H9.6l2.9 2.9V8" />
            </svg>
            <span>{t.noHistory}</span>
          </Empty>
        </>
      )}
      {tab === "history" && (
        <>
          <Field placeholder={t.searchClips} />
          <Empty y={58}>
            <span className="text-fg/80">
              <Icon name="history" size={22} />
            </span>
            <span>{t.noCaptures}</span>
          </Empty>
        </>
      )}
      {tab === "search" && <Field placeholder={t.searchAsk} value={query} onChange={onQuery} autoFocus />}
      {tab === "grid" && (
        <div className="absolute inset-x-[14px] top-[12px] grid grid-cols-3 gap-[6px]">
          {t.droplets.map((d) => (
            <div key={d} className="flex h-[28px] flex-col items-center justify-center gap-[3px] rounded-[7px] bg-fg/[.09]">
              <span className="h-[7px] w-[7px] rounded-[2px] border border-fg/70" aria-hidden="true" />
              <span className="text-[6.5px] leading-none text-fg/80">{d}</span>
            </div>
          ))}
        </div>
      )}

      {/* pílula de abas do rodapé */}
      <div className="absolute bottom-[6px] left-1/2 flex -translate-x-1/2 items-center gap-[4px] rounded-[6px] bg-fg/[.12] px-[3px] py-[1.5px]">
        {TABS.map((x) => (
          <button
            key={x}
            type="button"
            aria-label={t[x]}
            title={t[x]}
            aria-pressed={tab === x}
            data-cove-tab-btn={x}
            onClick={() => onTab(x)}
            className={`flex h-[11px] w-[13px] items-center justify-center rounded-[3.5px] transition-colors duration-150 ${
              tab === x ? "bg-fg text-bg" : "text-fg/80 hover:text-fg"
            }`}
          >
            <Icon name={x} size={8.5} />
          </button>
        ))}
      </div>
    </div>
  );
}

function Empty({ y, children }: { y: number; children: ReactNode }) {
  return (
    <div className="absolute inset-x-0 flex flex-col items-center gap-[5px] text-[9px] leading-none text-fg/85" style={{ top: y }}>
      {children}
    </div>
  );
}

function Field({
  placeholder,
  value,
  onChange,
  autoFocus,
}: {
  placeholder: string;
  value?: string;
  onChange?: (q: string) => void;
  autoFocus?: boolean;
}) {
  const editable = Boolean(onChange);
  return (
    <label className="absolute left-[13px] right-[13px] top-[11px] flex h-[22px] items-center gap-[6px] rounded-[11px] bg-fg/[.09] px-[9px] text-fg/55">
      <span className="text-fg/70">
        <Icon name="search" size={9} />
      </span>
      {editable ? (
        <input
          data-cove-search
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="min-w-0 flex-1 bg-transparent text-[8.5px] leading-none text-fg outline-none placeholder:text-fg/55"
        />
      ) : (
        <span className="text-[8.5px] leading-none">{placeholder}</span>
      )}
    </label>
  );
}

/* ---------- HUDs ---------- */

function Hud({
  label,
  glyph,
  value,
  onChange,
}: {
  label: string;
  glyph: "volume" | "brightness";
  value: number;
  onChange: (v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromEvent = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.width <= 0) return;
      onChange(Math.min(1, Math.max(0, (clientX - r.left) / r.width)));
    },
    [onChange],
  );

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    dragging.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setFromEvent(e.clientX);
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging.current) setFromEvent(e.clientX);
  };
  const onUp = () => {
    dragging.current = false;
  };

  const pct = Math.round(value * 100);
  return (
    <div className="flex h-full items-center px-[10px]" onClick={(e) => e.stopPropagation()}>
      <span className="flex w-[12px] shrink-0 items-center" aria-hidden="true">
        <Icon name={glyph === "volume" ? "speaker" : "sun"} size={9} />
      </span>
      <span className="ml-[6px] text-[8.5px] font-semibold leading-none">{label}</span>
      <span className="sr-only" data-cove-value>
        {pct}%
      </span>
      <div
        ref={trackRef}
        role="slider"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        tabIndex={0}
        data-cove-slider
        className="relative ml-auto h-[10px] w-[54px] cursor-ew-resize touch-none outline-none"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") onChange(Math.max(0, value - 0.05));
          if (e.key === "ArrowRight") onChange(Math.min(1, value + 0.05));
        }}
      >
        <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-fg/25">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-fg"
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
          />
        </div>
      </div>
    </div>
  );
}

function BatteryHud() {
  return (
    <div className="flex h-full items-center px-[10px]">
      <span className="relative flex h-[7px] w-[12px] items-center rounded-[2px] border border-fg/85 px-[1px]" aria-hidden="true">
        <span className="h-[3.5px] w-[18%] rounded-[1px] bg-fg" />
        <span className="absolute -right-[2px] top-1/2 h-[3px] w-[1px] -translate-y-1/2 rounded-r-[1px] bg-fg/85" />
      </span>
      <span data-cove-value className="ml-auto text-[8.5px] font-semibold leading-none">
        18%
      </span>
    </div>
  );
}
