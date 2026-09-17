"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { DemoFrame } from "./DemoFrame";
import { ScrambleText } from "@/components/ds";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion";
import type { DemoProps } from "../ProjectDemo";

/**
 * Demo "cove": mockup monocromático de uma tela de Mac com o notch no topo.
 * A ilha vive sobre o notch: pílula compacta (equalizer + marquee), expande no hover
 * (now playing com controles) e vira HUD (volume, brilho, bateria, foco, shelf,
 * clipboard, timer) ao clicar nos chips. Volta pra compacta em ~3 s, `Esc` fecha.
 * Tudo desenhado numa tela base de 640×360 e escalado pro tamanho do container.
 */

const W = 640;
const H = 360;
const SPRING = { type: "spring", stiffness: 300, damping: 26 } as const;
const TRACK_LEN = 214; // segundos da faixa fictícia

type Mode = "compact" | "playing" | "volume" | "brightness" | "battery" | "focus" | "shelf" | "clipboard" | "timer";
type Hud = Exclude<Mode, "compact" | "playing">;

const HUDS: Hud[] = ["volume", "brightness", "battery", "focus", "shelf", "clipboard", "timer"];

const T = {
  en: {
    volume: "Volume",
    brightness: "Brightness",
    battery: "Battery",
    focus: "Focus",
    shelf: "Shelf",
    clipboard: "Clipboard",
    timer: "Timer",
    nowPlaying: "Now playing",
    charging: "Charging",
    focusOn: "Focus on",
    hint: "Hover the notch. Click a chip. Esc closes.",
    play: "Play",
    pause: "Pause",
    prev: "Previous",
    next: "Next",
    timerName: "Pasta",
    clips: ["git rebase -i main", "hello@mateusfb.ai", "SF Pro Rounded 12"],
    files: ["deck.pdf", "cover.png", "notes.md"],
  },
  pt: {
    volume: "Volume",
    brightness: "Brilho",
    battery: "Bateria",
    focus: "Foco",
    shelf: "Prateleira",
    clipboard: "Clipboard",
    timer: "Timer",
    nowPlaying: "Tocando agora",
    charging: "Carregando",
    focusOn: "Foco ativado",
    hint: "Passe o mouse no notch. Clique num chip. Esc fecha.",
    play: "Tocar",
    pause: "Pausar",
    prev: "Anterior",
    next: "Próxima",
    timerName: "Macarrão",
    clips: ["git rebase -i main", "hello@mateusfb.ai", "SF Pro Rounded 12"],
    files: ["deck.pdf", "capa.png", "notas.md"],
  },
} as const;
type Dict = (typeof T)[keyof typeof T];

const SIZE: Record<Mode, { w: number; h: number; r: number }> = {
  compact: { w: 156, h: 24, r: 12 },
  playing: { w: 330, h: 116, r: 26 },
  volume: { w: 270, h: 56, r: 20 },
  brightness: { w: 270, h: 56, r: 20 },
  battery: { w: 220, h: 48, r: 18 },
  focus: { w: 220, h: 48, r: 18 },
  shelf: { w: 320, h: 112, r: 24 },
  clipboard: { w: 320, h: 112, r: 24 },
  timer: { w: 220, h: 64, r: 22 },
};

const TRACK = { title: "Dark Matter in Motion", artist: "Spyko" };

const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export default function CoveDemo({ locale, label }: DemoProps) {
  const t = T[locale];
  const reduced = useReducedMotionSafe();

  const [mode, setMode] = useState<Mode>("compact");
  const [hovered, setHovered] = useState(false);
  const [userPlaying, setUserPlaying] = useState<boolean | null>(null);
  const playing = userPlaying ?? !reduced; // sem autoplay com reduced-motion
  const [progress, setProgress] = useState(37);
  const [volume, setVolume] = useState(0.62);
  const [brightness, setBrightness] = useState(0.8);
  const [elapsed, setElapsed] = useState(0);
  const timerStart = useRef(0);

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

  // progresso da faixa
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setProgress((p) => (p + 1) % TRACK_LEN), 1000);
    return () => window.clearInterval(id);
  }, [playing]);

  // timer
  useEffect(() => {
    if (mode !== "timer") return;
    timerStart.current = Date.now();
    const id = window.setInterval(() => setElapsed(Date.now() - timerStart.current), 250);
    return () => window.clearInterval(id);
  }, [mode]);

  // auto-retorno pra compacta quando não está em hover
  useEffect(() => {
    if (mode === "compact" || hovered) return;
    const id = window.setTimeout(() => setMode("compact"), mode === "playing" ? 700 : 3000);
    return () => window.clearTimeout(id);
  }, [mode, hovered]);

  // Esc fecha
  useEffect(() => {
    if (mode === "compact") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMode("compact");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode]);

  const openHud = (h: Hud) => {
    if (h === "timer") setElapsed(0);
    setMode(h);
  };

  const size = SIZE[mode];
  const spring = reduced ? { duration: 0 } : SPRING;
  const fade = reduced ? { duration: 0 } : { duration: 0.18 };

  return (
    <DemoFrame name="cove" label={label}>
      <div ref={wrapRef} className="relative h-full w-full overflow-hidden" data-cove-mode={mode}>
        <div
          className="absolute left-0 top-0 select-none"
          style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "top left" }}
        >
          {/* tela do Mac */}
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-[14px] border border-fg/35"
            style={{ top: 30, width: 560, height: 236 }}
          >
            {/* barra de menus */}
            <div className="absolute inset-x-0 top-0 flex h-[20px] items-center justify-between border-b border-dashed border-fg/20 px-3">
              <div className="flex items-center gap-2">
                <span className="h-[7px] w-[7px] rounded-full bg-fg/80" />
                <span className="h-[5px] w-[22px] rounded-full bg-fg/80" />
                <span className="h-[5px] w-[14px] rounded-full bg-fg/30" />
                <span className="h-[5px] w-[18px] rounded-full bg-fg/30" />
                <span className="h-[5px] w-[12px] rounded-full bg-fg/30" />
              </div>
              <div className="flex items-center gap-2">
                <span className="h-[5px] w-[5px] rounded-full border border-fg/50" />
                <span className="h-[5px] w-[10px] rounded-[1px] border border-fg/50" />
                <span className="font-mono text-[7px] leading-none tracking-[.5px] text-fg/60">9:41</span>
              </div>
            </div>
            {/* notch */}
            <div className="absolute left-1/2 top-0 h-[20px] w-[128px] -translate-x-1/2 rounded-b-[10px] bg-fg/10" />
            {/* wallpaper de linhas */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 top-[20px] rounded-b-[13px] opacity-[.12]"
              style={{
                backgroundImage: "repeating-linear-gradient(135deg, var(--fg) 0 1px, transparent 1px 12px)",
              }}
            />
            {/* dock */}
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-[5px] rounded-[8px] border border-fg/25 px-2 py-[4px]">
              {Array.from({ length: 7 }).map((_, i) => (
                <span key={i} className={`h-[10px] w-[10px] rounded-[3px] ${i === 2 ? "bg-fg/70" : "border border-fg/40"}`} />
              ))}
            </div>

            {/* ilha */}
            <motion.div
              data-cove-island
              role="button"
              tabIndex={0}
              aria-label="Cove island"
              className="absolute left-1/2 top-0 z-10 origin-top overflow-hidden border border-fg/60 bg-bg text-fg"
              style={{ x: "-50%" }}
              initial={false}
              animate={{ width: size.w, height: size.h, borderRadius: size.r }}
              transition={spring}
              onPointerEnter={() => {
                setHovered(true);
                setMode((m) => (m === "compact" ? "playing" : m));
              }}
              onPointerLeave={() => setHovered(false)}
              onClick={() => setMode((m) => (m === "compact" ? "playing" : m === "playing" ? "compact" : m))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setMode((m) => (m === "compact" ? "playing" : "compact"));
                }
              }}
            >
              <AnimatePresence initial={false}>
                <motion.div
                  key={mode}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={fade}
                >
                  {mode === "compact" && <Compact playing={playing} reduced={reduced} />}
                  {mode === "playing" && (
                    <NowPlaying
                      t={t}
                      playing={playing}
                      reduced={reduced}
                      progress={progress}
                      onToggle={() => setUserPlaying(!playing)}
                      onSkip={(d) => setProgress((p) => (d > 0 ? 0 : Math.max(0, p - 15)))}
                    />
                  )}
                  {(mode === "volume" || mode === "brightness") && (
                    <Slider
                      label={mode === "volume" ? t.volume : t.brightness}
                      glyph={mode === "volume" ? "speaker" : "sun"}
                      value={mode === "volume" ? volume : brightness}
                      onChange={mode === "volume" ? setVolume : setBrightness}
                    />
                  )}
                  {mode === "battery" && <Battery t={t} />}
                  {mode === "focus" && <Focus t={t} />}
                  {mode === "shelf" && <Shelf files={t.files} reduced={reduced} />}
                  {mode === "clipboard" && <Clipboard clips={t.clips} reduced={reduced} />}
                  {mode === "timer" && <Timer name={t.timerName} seconds={elapsed / 1000} />}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* chips */}
          <div className="absolute inset-x-0 flex justify-center gap-[6px]" style={{ top: 290 }}>
            {HUDS.map((h) => (
              <button
                key={h}
                type="button"
                data-scramble
                data-cove-chip={h}
                onClick={() => openHud(h)}
                className={`rounded-full border px-[10px] py-[4px] font-mono text-[9px] uppercase tracking-[1px] transition-colors duration-200 ${
                  mode === h ? "border-fg bg-fg text-bg" : "border-dashed border-fg/40 text-fg/80 hover:border-fg"
                }`}
              >
                <ScrambleText text={t[h]} />
              </button>
            ))}
          </div>
          <p className="absolute inset-x-0 text-center font-mono text-[8px] uppercase tracking-[1px] text-fg/40" style={{ top: 326 }}>
            {t.hint}
          </p>
        </div>
      </div>
    </DemoFrame>
  );
}

/* ---------- conteúdos da ilha ---------- */

function Equalizer({ playing, reduced, size = 8 }: { playing: boolean; reduced: boolean; size?: number }) {
  const animate = playing && !reduced;
  return (
    <span className="flex items-end gap-[2px]" style={{ height: size }} aria-hidden="true">
      {[0.6, 1, 0.75].map((peak, i) => (
        <motion.span
          key={i}
          className="w-[2px] rounded-[1px] bg-fg"
          animate={animate ? { height: [size * 0.3, size * peak, size * 0.45, size * peak * 0.9, size * 0.3] } : { height: size * 0.3 }}
          transition={animate ? { duration: 0.9 + i * 0.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
        />
      ))}
    </span>
  );
}

function Compact({ playing, reduced }: { playing: boolean; reduced: boolean }) {
  const text = `${TRACK.title}  ·  ${TRACK.artist}  ·  `;
  return (
    <div className="flex h-full items-center gap-[8px] px-[10px]">
      <Equalizer playing={playing} reduced={reduced} />
      <div className="relative h-full flex-1 overflow-hidden font-mono text-[8px] uppercase tracking-[.8px] text-fg/80">
        <motion.div
          className="absolute top-1/2 flex -translate-y-1/2 whitespace-nowrap"
          animate={reduced || !playing ? { x: 0 } : { x: ["0%", "-50%"] }}
          transition={reduced || !playing ? { duration: 0 } : { duration: 9, repeat: Infinity, ease: "linear" }}
        >
          <span>{text}</span>
          <span>{text}</span>
        </motion.div>
      </div>
      <span className="h-[6px] w-[6px] rounded-full border border-fg/60" aria-hidden="true" />
    </div>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-fg/40 text-fg transition-colors duration-200 hover:border-fg hover:bg-fg hover:text-bg"
    >
      {children}
    </button>
  );
}

function NowPlaying({
  t,
  playing,
  reduced,
  progress,
  onToggle,
  onSkip,
}: {
  t: Dict;
  playing: boolean;
  reduced: boolean;
  progress: number;
  onToggle: () => void;
  onSkip: (d: 1 | -1) => void;
}) {
  return (
    <div className="flex h-full items-center gap-[12px] px-[14px]">
      {/* capa dithered */}
      <div
        aria-hidden="true"
        className="h-[72px] w-[72px] shrink-0 rounded-[10px] border border-fg/50"
        style={{
          backgroundImage: "radial-gradient(var(--fg) 0.6px, transparent 0.9px)",
          backgroundSize: "3px 3px",
          backgroundPosition: "center",
          opacity: 0.85,
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[7px] uppercase tracking-[1px] text-fg/50">{t.nowPlaying}</span>
          <Equalizer playing={playing} reduced={reduced} size={9} />
        </div>
        <div className="min-w-0">
          <div className="truncate text-[12px] font-medium leading-[1.2]">{TRACK.title}</div>
          <div className="truncate text-[9px] leading-[1.2] text-fg/60">{TRACK.artist}</div>
        </div>
        <div className="flex items-center gap-[6px] font-mono text-[7px] text-fg/60">
          <span>{mmss(progress)}</span>
          <div className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-fg/20">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-fg"
              animate={{ width: `${(progress / TRACK_LEN) * 100}%` }}
              transition={{ duration: reduced ? 0 : 0.6, ease: "linear" }}
            />
          </div>
          <span>{mmss(TRACK_LEN)}</span>
        </div>
        <div className="flex items-center gap-[6px]">
          <IconButton label={t.prev} onClick={() => onSkip(-1)}>
            <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
              <rect x="1" y="1" width="1.6" height="8" />
              <path d="M9 1 3 5l6 4z" />
            </svg>
          </IconButton>
          <IconButton label={playing ? t.pause : t.play} onClick={onToggle}>
            {playing ? (
              <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
                <rect x="1.5" y="1" width="2.6" height="8" />
                <rect x="5.9" y="1" width="2.6" height="8" />
              </svg>
            ) : (
              <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
                <path d="M2 1l7 4-7 4z" />
              </svg>
            )}
          </IconButton>
          <IconButton label={t.next} onClick={() => onSkip(1)}>
            <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
              <path d="M1 1l6 4-6 4z" />
              <rect x="7.4" y="1" width="1.6" height="8" />
            </svg>
          </IconButton>
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  glyph,
  value,
  onChange,
}: {
  label: string;
  glyph: "speaker" | "sun";
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
    <div className="flex h-full items-center gap-[10px] px-[14px]" onClick={(e) => e.stopPropagation()}>
      <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center" aria-hidden="true">
        {glyph === "speaker" ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
            <path d="M2 5.5h2.5L8 2.5v9L4.5 8.5H2z" fill="currentColor" />
            <path d="M10 4.5a3.5 3.5 0 0 1 0 5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
            <circle cx="7" cy="7" r="2.6" fill="currentColor" />
            <path d="M7 1v1.6M7 11.4V13M1 7h1.6M11.4 7H13M2.8 2.8l1.1 1.1M10.1 10.1l1.1 1.1M2.8 11.2l1.1-1.1M10.1 3.9l1.1-1.1" />
          </svg>
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
        <div className="flex items-center justify-between font-mono text-[7px] uppercase tracking-[1px] text-fg/60">
          <span>{label}</span>
          <span data-cove-value>{pct}%</span>
        </div>
        <div
          ref={trackRef}
          role="slider"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          tabIndex={0}
          data-cove-slider
          className="relative h-[10px] cursor-ew-resize touch-none overflow-hidden rounded-full border border-fg/50"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") onChange(Math.max(0, value - 0.05));
            if (e.key === "ArrowRight") onChange(Math.min(1, value + 0.05));
          }}
        >
          <motion.div
            className="absolute inset-y-0 left-0 bg-fg"
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
          />
        </div>
      </div>
    </div>
  );
}

function Battery({ t }: { t: Dict }) {
  return (
    <div className="flex h-full items-center gap-[10px] px-[14px]">
      <span className="relative flex h-[12px] w-[24px] items-center rounded-[3px] border border-fg/70 px-[1.5px]" aria-hidden="true">
        <span className="h-[7px] w-[87%] rounded-[1px] bg-fg" />
        <span className="absolute -right-[3px] top-1/2 h-[5px] w-[2px] -translate-y-1/2 rounded-r-[1px] bg-fg/70" />
        <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" width="8" height="10" viewBox="0 0 8 10" fill="var(--bg)" aria-hidden="true">
          <path d="M5 0 1 6h2.5L3 10l4-6H4.5z" />
        </svg>
      </span>
      <div className="flex flex-1 items-baseline justify-between">
        <span className="font-mono text-[7px] uppercase tracking-[1px] text-fg/60">{t.charging}</span>
        <span className="text-[14px] font-medium leading-none">87%</span>
      </div>
    </div>
  );
}

function Focus({ t }: { t: Dict }) {
  return (
    <div className="flex h-full items-center gap-[10px] px-[14px]">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M10.5 1.5a6.5 6.5 0 1 0 4 11.5A7.5 7.5 0 0 1 10.5 1.5z" />
      </svg>
      <div className="flex flex-1 items-center justify-between">
        <span className="text-[11px] font-medium">{t.focusOn}</span>
        <span className="h-[6px] w-[6px] rounded-full bg-fg" aria-hidden="true" />
      </div>
    </div>
  );
}

function Shelf({ files, reduced }: { files: readonly string[]; reduced: boolean }) {
  return (
    <div className="flex h-full items-center justify-center gap-[10px] px-[14px]">
      {files.map((f, i) => (
        <motion.div
          key={f}
          data-cove-file
          className="flex h-[78px] w-[80px] flex-col items-center justify-end gap-[6px] rounded-[10px] border border-dashed border-fg/50 p-[8px]"
          initial={reduced ? false : { opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={reduced ? { duration: 0 } : { ...SPRING, delay: 0.06 * i }}
        >
          <svg width="24" height="30" viewBox="0 0 24 30" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
            <path d="M2 1h13l7 7v21H2z" strokeLinejoin="round" />
            <path d="M15 1v7h7" strokeLinejoin="round" />
            <path d="M6 14h12M6 18h12M6 22h8" strokeLinecap="round" />
          </svg>
          <span className="max-w-full truncate font-mono text-[7px] tracking-[.5px] text-fg/70">{f}</span>
        </motion.div>
      ))}
    </div>
  );
}

function Clipboard({ clips, reduced }: { clips: readonly string[]; reduced: boolean }) {
  return (
    <div className="flex h-full flex-col justify-center gap-[5px] px-[14px]">
      {clips.map((c, i) => (
        <motion.div
          key={c}
          data-cove-clip
          className="flex items-center gap-[8px] rounded-[7px] border border-fg/30 px-[8px] py-[5px]"
          initial={reduced ? false : { opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={reduced ? { duration: 0 } : { ...SPRING, delay: 0.05 * i }}
        >
          <span className="font-mono text-[7px] text-fg/40">{String(i + 1).padStart(2, "0")}</span>
          <span className="truncate font-mono text-[9px]">{c}</span>
          {i === 0 && <span className="ml-auto h-[5px] w-[5px] shrink-0 rounded-full bg-fg" aria-hidden="true" />}
        </motion.div>
      ))}
    </div>
  );
}

function Timer({ name, seconds }: { name: string; seconds: number }) {
  const s = Math.max(0, seconds);
  const ring = 2 * Math.PI * 12;
  const frac = (s % 60) / 60;
  return (
    <div className="flex h-full items-center gap-[12px] px-[14px]">
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
        <circle cx="15" cy="15" r="12" fill="none" stroke="var(--fg)" strokeOpacity=".25" strokeWidth="2" />
        <circle
          cx="15"
          cy="15"
          r="12"
          fill="none"
          stroke="var(--fg)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={ring}
          strokeDashoffset={ring * (1 - frac)}
          transform="rotate(-90 15 15)"
        />
      </svg>
      <div className="flex flex-1 items-baseline justify-between">
        <span className="font-mono text-[7px] uppercase tracking-[1px] text-fg/60">{name}</span>
        <span data-cove-timer className="font-mono text-[18px] leading-none tabular-nums">
          {mmss(s)}
        </span>
      </div>
    </div>
  );
}
