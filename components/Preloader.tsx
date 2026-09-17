"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import * as THREE from "three";
import { MARK_GEOMETRY } from "@/components/brand/Mark";
import { Wordmark } from "@/components/brand/Wordmark";
import { GLOW_URL, createPointsMaterial, createSprite, lcg, loadImage } from "@/components/hero/particles";

/**
 * Preloader de entrada: overlay preto em tela cheia, 1ª visita da sessão (flag `mfb-preloaded` no
 * sessionStorage; com `prefers-reduced-motion` nem monta). A marca (pilha isométrica de 3 planos,
 * `MARK_GEOMETRY`) surge como partículas, andar por andar: cada plano converge de posições aleatórias
 * pro lugar (easeOutQuint), o wordmark entra embaixo e o overlay some enquanto tudo deriva 12px pra cima.
 * Só monta no cliente depois da hidratação → o SSR entrega a página normal (LCP não espera nada).
 */

export const PRELOADER_FLAG = "mfb-preloaded";
/** linha do tempo (ms) */
export const PRELOADER_TIMELINE = {
  planeStart: [0, 350, 700],
  planeDur: 500,
  wordmark: 1000,
  fadeStart: 1500,
  total: 1900,
} as const;
const MARK_PX = 220;
const SCATTER = 260;
const POINT_BASE = 2.9;
const DRIFT_PX = 12;

const vert = /* glsl */ `
  attribute vec3 aStart;
  attribute float aSeed;
  attribute float aT0;
  attribute float aDim;
  uniform float uTime;
  uniform float uSize;
  uniform float uDur;
  uniform float uDrift;
  varying float vAlpha;
  void main() {
    float p = clamp((uTime - aT0) / uDur, 0.0, 1.0);
    float q = 1.0 - p;
    float e = 1.0 - q * q * q * q * q; // easeOutQuint
    vec3 pos = mix(aStart, position, e) + vec3(0.0, uDrift, 0.0);
    float tw = 0.6 + 0.4 * sin(uTime * (2.0 + aSeed * 3.0) + aSeed * 6.2831853);
    vAlpha = e * mix(0.5, 1.0, tw) * aDim;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.8 + 0.5 * tw) * mix(0.8, 1.0, aDim);
  }
`;

type MarkField = { positions: Float32Array; starts: Float32Array; seeds: Float32Array; t0s: Float32Array; dims: Float32Array };

/** Amostra os 3 losangos da marca (contorno dos 3 + preenchimento esparso do topo) em px CSS, origem no centro, y pra cima. */
export function sampleMark(px = MARK_PX): MarkField {
  const { planes, cx, w, h } = MARK_GEOMETRY;
  const S = px / (2 * w); // px por unidade do viewBox: a marca tem 2w de largura
  const cyMid = planes[1].cy;
  const rnd = lcg(4242);
  const pos: number[] = [];
  const starts: number[] = [];
  const seeds: number[] = [];
  const t0s: number[] = [];
  const dims: number[] = [];
  const push = (x: number, y: number, plane: number, dim: number) => {
    pos.push((x - cx) * S, -(y - cyMid) * S, 0);
    const a = rnd() * Math.PI * 2;
    const r = SCATTER * (0.35 + 0.65 * Math.sqrt(rnd()));
    starts.push((x - cx) * S + Math.cos(a) * r, -(y - cyMid) * S + Math.sin(a) * r, 0);
    seeds.push(rnd());
    t0s.push(PRELOADER_TIMELINE.planeStart[plane] / 1000);
    dims.push(dim);
  };
  // andares: índice 0 = base (planes[2], cy maior), 1 = meio, 2 = topo (planes[0])
  const order = [2, 1, 0] as const;
  const strokeJitter = 0.28; // ±unidades do viewBox (~±3px em 220px)
  order.forEach((planeIdx, floor) => {
    const { cy } = planes[planeIdx];
    const corners = [
      [cx, cy - h],
      [cx + w, cy],
      [cx, cy + h],
      [cx - w, cy],
    ];
    for (let e = 0; e < 4; e++) {
      const [x0, y0] = corners[e];
      const [x1, y1] = corners[(e + 1) % 4];
      const len = Math.hypot(x1 - x0, y1 - y0) * S;
      const n = Math.round(len * 2.4);
      for (let i = 0; i < n; i++) {
        const t = (i + rnd()) / n;
        const jx = (rnd() - 0.5) * 2 * strokeJitter;
        const jy = (rnd() - 0.5) * 2 * strokeJitter;
        push(x0 + (x1 - x0) * t + jx, y0 + (y1 - y0) * t + jy, floor, 1);
      }
    }
    if (floor === 2) {
      // topo sólido → preenchimento esparso (rejeição dentro do losango |dx|/w + |dy|/h ≤ 1)
      const n = Math.round(2 * w * h * S * S * 0.11);
      let got = 0;
      while (got < n) {
        const dx = (rnd() * 2 - 1) * w;
        const dy = (rnd() * 2 - 1) * h;
        if (Math.abs(dx) / w + Math.abs(dy) / h > 0.97) continue;
        push(cx + dx, cy + dy, floor, 0.55);
        got++;
      }
    }
  });
  return {
    positions: new Float32Array(pos),
    starts: new Float32Array(starts),
    seeds: new Float32Array(seeds),
    t0s: new Float32Array(t0s),
    dims: new Float32Array(dims),
  };
}

function easeOutQuint(p: number) {
  const q = 1 - Math.min(1, Math.max(0, p));
  return 1 - q * q * q * q * q;
}

const subscribeNoop = () => () => {};
/** 1ª visita da sessão e sem reduced motion → mostra. */
function shouldShowPreloader(): boolean {
  try {
    if (sessionStorage.getItem(PRELOADER_FLAG)) return false;
  } catch {
    /* sem storage: mostra */
  }
  if (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return true;
}

export type PreloaderProps = { onDone?: () => void };

export function Preloader({ onDone }: PreloaderProps) {
  // só decide no cliente, depois da hidratação (snapshot do servidor = false → SSR entrega a página normal)
  const eligible = useSyncExternalStore(subscribeNoop, shouldShowPreloader, () => false);
  const [done, setDone] = useState(false);
  const show = eligible && !done;
  const [wordmark, setWordmark] = useState(false);
  const [fading, setFading] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  // linha do tempo + trava de scroll
  useEffect(() => {
    if (!show) return;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    const T = PRELOADER_TIMELINE;
    const timers = [
      window.setTimeout(() => setWordmark(true), T.wordmark),
      window.setTimeout(() => setFading(true), T.fadeStart),
      window.setTimeout(() => {
        try {
          sessionStorage.setItem(PRELOADER_FLAG, "1");
        } catch {
          /* sem storage: mostra de novo na próxima, sem quebrar */
        }
        setDone(true);
        onDoneRef.current?.();
      }, T.total),
    ];
    return () => {
      timers.forEach(clearTimeout);
      body.style.overflow = prevOverflow;
    };
  }, [show]);

  // partículas (WebGL); sem WebGL (jsdom, GPU bloqueada) o overlay fica só com o wordmark e some no mesmo tempo
  useEffect(() => {
    const host = hostRef.current;
    if (!show || !host || typeof WebGLRenderingContext === "undefined") return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    (async () => {
      const glowImg = await loadImage(GLOW_URL).catch(() => null);
      if (disposed) return;
      const field = sampleMark();
      const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "low-power" });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setClearColor(0x000000, 0);
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100);
      camera.position.z = 10;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(field.positions, 3));
      geo.setAttribute("aStart", new THREE.BufferAttribute(field.starts, 3));
      geo.setAttribute("aSeed", new THREE.BufferAttribute(field.seeds, 1));
      geo.setAttribute("aT0", new THREE.BufferAttribute(field.t0s, 1));
      geo.setAttribute("aDim", new THREE.BufferAttribute(field.dims, 1));
      const { sprite, hasSprite } = createSprite(glowImg);
      const mat = createPointsMaterial({
        vertexShader: vert,
        sprite,
        hasSprite,
        size: POINT_BASE * dpr,
        uniforms: { uDur: { value: PRELOADER_TIMELINE.planeDur / 1000 }, uDrift: { value: 0 } },
      });
      scene.add(new THREE.Points(geo, mat));

      const resize = () => {
        const w = Math.max(1, host.clientWidth);
        const h = Math.max(1, host.clientHeight);
        renderer.setSize(w, h, true);
        camera.left = -w / 2;
        camera.right = w / 2;
        camera.top = h / 2;
        camera.bottom = -h / 2;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      let raf = 0;
      const t0 = performance.now();
      const T = PRELOADER_TIMELINE;
      const frame = () => {
        raf = 0;
        if (disposed) return;
        const ms = performance.now() - t0;
        mat.uniforms.uTime.value = ms / 1000;
        mat.uniforms.uDrift.value = DRIFT_PX * easeOutQuint((ms - T.fadeStart) / (T.total - T.fadeStart));
        renderer.render(scene, camera);
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
      cleanup = () => {
        if (raf) cancelAnimationFrame(raf);
        ro.disconnect();
        geo.dispose();
        mat.dispose();
        sprite.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })().catch((err) => {
      if (process.env.NODE_ENV !== "production") console.warn("preloader:", err);
    });
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [show]);

  if (!show) return null;
  return (
    <div
      role="status"
      aria-label="mateusfb.ai"
      aria-busy="true"
      data-preloader
      className="fixed inset-0 z-[60] bg-black transition-opacity duration-[400ms] ease-out"
      style={{ opacity: fading ? 0 : 1 }}
    >
      <div ref={hostRef} aria-hidden className="absolute inset-0 [&>canvas]:block" />
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 text-eyebrow text-white transition-opacity duration-500"
        style={{ top: `calc(50% + ${MARK_PX * 0.7}px)`, opacity: wordmark ? 1 : 0 }}
      >
        <Wordmark />
      </div>
    </div>
  );
}

export default Preloader;
