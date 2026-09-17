"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Hero como campo de partículas (pipeline do xmcp.dev): uma imagem estática já ditherizada
 * (`/hero/scene.png`, preto com pontos brancos) é lida pixel a pixel e cada ponto branco vira um
 * `THREE.Points` com sprite radial suave, blending aditivo e tamanho minúsculo. A animação é só
 * cintilação por partícula (ruído no tempo), respiração/rotação lenta do campo inteiro e parallax
 * do mouse com profundidade por brilho local. Nada de vídeo, nada de cena 3D em tempo real.
 *
 * Pra trocar a cena: substitua `public/hero/scene.png` por outro PNG preto/branco (qualquer tamanho).
 */

const SCENE_URL = "/hero/scene.png";
const GLOW_URL = "/hero/glow.png";
const MAX_W = 720;
const MAX_H = 500;
const ASPECT = MAX_W / MAX_H;
const MAX_POINTS = 60_000;
/** escala (px CSS por px da cena) em que a cena foi calibrada — 720/850, como no xmcp */
const REF_SCALE = 720 / 850;
/** ponto base em px CSS (×dpr no shader; o sprite radial só acende no miolo → ~1,5 px visíveis = delicado) */
const POINT_BASE = 2.2;
/** parallax alvo (px CSS) = (mouse − 0,5)·(−18, −12); lerp 0,06 */
const PARALLAX = { x: -18, y: -12 } as const;
const LERP = 0.06;
const BREATH_PX = 3;
const BREATH_PERIOD_S = 6;
const ROT_DEG = 0.6;
const ROT_PERIOD_S = 14;

const vert = /* glsl */ `
  attribute float aSeed;
  attribute float aDepth;
  uniform float uTime;
  uniform float uSize;
  uniform vec2 uOffset;
  uniform float uStatic;
  varying float vAlpha;
  void main() {
    float speed = 1.2 + aSeed * 2.6;
    float tw = 0.55 + 0.45 * sin(uTime * speed + aSeed * 6.2831853);
    tw = mix(tw, 0.85, uStatic);
    vAlpha = tw * (0.55 + 0.45 * aDepth);
    // parallax por profundidade: pontos de núcleo (mais brilho) deslocam mais → sensação 3D
    vec3 p = position + vec3(uOffset * (0.35 + 0.95 * aDepth), 0.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.8 + 0.5 * tw + 0.25 * aDepth);
  }
`;

const frag = /* glsl */ `
  precision mediump float;
  uniform sampler2D uSprite;
  uniform float uHasSprite;
  varying float vAlpha;
  void main() {
    vec2 uv = gl_PointCoord;
    float d = length(uv - 0.5) * 2.0;
    float proc = exp(-d * d * 5.0);
    float sp = texture2D(uSprite, uv).a;
    float a = min(1.0, mix(proc, sp, uHasSprite) * vAlpha * 1.6);
    if (a < 0.004) discard;
    gl_FragColor = vec4(vec3(a), a);
  }
`;

type Field = { positions: Float32Array; seeds: Float32Array; depths: Float32Array; w: number; h: number };

/** Lê os pixels brancos da cena: posição em unidades da cena (origem no centro, y pra cima), semente e profundidade (densidade local). */
function sampleImage(img: HTMLImageElement): Field {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2d context");
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, w, h);
  const mask = new Uint8Array(w * h);
  let total = 0;
  for (let i = 0; i < w * h; i++) {
    if (data[i * 4] > 128) {
      mask[i] = 1;
      total++;
    }
  }
  // densidade local (célula 8×8) → profundidade: núcleo denso = mais perto, halo esparso = mais longe
  const cell = 8;
  const gw = Math.ceil(w / cell);
  const gh = Math.ceil(h / cell);
  const grid = new Float32Array(gw * gh);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (mask[y * w + x]) grid[((y / cell) | 0) * gw + ((x / cell) | 0)]++;
  let gmax = 1;
  for (let i = 0; i < grid.length; i++) gmax = Math.max(gmax, grid[i]);

  const keep = Math.min(1, MAX_POINTS / Math.max(total, 1));
  let seed = 1234567;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const positions: number[] = [];
  const seeds: number[] = [];
  const depths: number[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!mask[y * w + x] || rnd() > keep) continue;
      const dens = Math.sqrt(grid[((y / cell) | 0) * gw + ((x / cell) | 0)] / gmax);
      const s = rnd();
      positions.push(x - w / 2 + (rnd() - 0.5) * 0.6, h / 2 - y + (rnd() - 0.5) * 0.6, (dens - 0.5) * 20);
      seeds.push(s);
      depths.push(Math.min(1, dens * 0.8 + s * 0.2));
    }
  }
  // embaralha (Fisher-Yates) → `setDrawRange` com um prefixo = subamostra uniforme em telas menores
  const n = seeds.length;
  for (let i = n - 1; i > 0; i--) {
    const j = (rnd() * (i + 1)) | 0;
    for (let k = 0; k < 3; k++) {
      const t = positions[i * 3 + k];
      positions[i * 3 + k] = positions[j * 3 + k];
      positions[j * 3 + k] = t;
    }
    [seeds[i], seeds[j]] = [seeds[j], seeds[i]];
    [depths[i], depths[j]] = [depths[j], depths[i]];
  }
  return { positions: new Float32Array(positions), seeds: new Float32Array(seeds), depths: new Float32Array(depths), w, h };
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`falha ao carregar ${url}`));
    img.src = url;
  });
}

export type ParticleHeroProps = { reduced?: boolean };

export default function ParticleHero({ reduced = false }: ParticleHeroProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const reducedRef = useRef(reduced);
  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const [img, glowImg] = await Promise.all([loadImage(SCENE_URL), loadImage(GLOW_URL).catch(() => null)]);
      if (disposed) return;
      const field = sampleImage(img);

      const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "low-power" });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setClearColor(0x000000, 1);
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100);
      camera.position.z = 10;

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(field.positions, 3));
      geo.setAttribute("aSeed", new THREE.BufferAttribute(field.seeds, 1));
      geo.setAttribute("aDepth", new THREE.BufferAttribute(field.depths, 1));

      const sprite = glowImg ? new THREE.Texture(glowImg) : new THREE.Texture();
      if (glowImg) {
        sprite.minFilter = THREE.LinearFilter;
        sprite.magFilter = THREE.LinearFilter;
        sprite.needsUpdate = true;
      }
      const mat = new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: POINT_BASE * dpr },
          uOffset: { value: new THREE.Vector2(0, 0) },
          uStatic: { value: reducedRef.current ? 1 : 0 },
          uSprite: { value: sprite },
          uHasSprite: { value: glowImg ? 1 : 0 },
        },
        transparent: true,
        depthTest: false,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const points = new THREE.Points(geo, mat);
      const world = new THREE.Group();
      world.add(points);
      scene.add(world);

      /** px CSS por unidade da cena (enquadra com letterbox preto, mantendo o aspecto) */
      let scale = 1;
      const resize = () => {
        const w = Math.min(MAX_W, Math.max(1, host.clientWidth));
        const h = Math.round(w / ASPECT);
        renderer.setSize(w, h, true);
        scale = Math.min(w / field.w, h / field.h);
        const hw = w / scale / 2;
        const hh = h / scale / 2;
        camera.left = -hw;
        camera.right = hw;
        camera.top = hh;
        camera.bottom = -hh;
        camera.updateProjectionMatrix();
        // ponto = tamanho fixo em px CSS (não escala com a cena); em telas menores encolhe um pouco
        mat.uniforms.uSize.value = POINT_BASE * dpr * Math.max(0.85, Math.min(1, w / MAX_W));
        // densidade constante em px CSS: em telas menores desenha só um prefixo (embaralhado) dos pontos
        const frac = Math.min(1, Math.sqrt(scale / REF_SCALE));
        geo.setDrawRange(0, Math.max(1, Math.round(field.seeds.length * frac)));
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      const mouse = { x: 0.5, y: 0.5 };
      const par = { x: 0, y: 0 };
      const onMove = (e: MouseEvent) => {
        mouse.x = e.clientX / window.innerWidth;
        mouse.y = e.clientY / window.innerHeight;
      };
      window.addEventListener("mousemove", onMove, { passive: true });

      let visible = true;
      let raf = 0;
      const t0 = performance.now();
      const frame = () => {
        raf = 0;
        if (disposed) return;
        const t = (performance.now() - t0) / 1000;
        const isStatic = reducedRef.current;
        mat.uniforms.uStatic.value = isStatic ? 1 : 0;
        mat.uniforms.uTime.value = t;

        // parallax (px CSS, oposto ao cursor) → unidades da cena; y da tela pra baixo, da cena pra cima
        const tx = (mouse.x - 0.5) * PARALLAX.x;
        const ty = (mouse.y - 0.5) * PARALLAX.y;
        par.x += (tx - par.x) * LERP;
        par.y += (ty - par.y) * LERP;
        mat.uniforms.uOffset.value.set(par.x / scale, -par.y / scale);

        if (isStatic) {
          world.position.set(0, 0, 0);
          world.rotation.z = 0;
        } else {
          const b = (t / BREATH_PERIOD_S) * Math.PI * 2;
          world.position.set((Math.sin(b) * BREATH_PX) / scale, (Math.cos(b * 0.8) * BREATH_PX * 0.7) / scale, 0);
          world.rotation.z = Math.sin((t / ROT_PERIOD_S) * Math.PI * 2) * ((ROT_DEG * Math.PI) / 180);
        }
        renderer.render(scene, camera);
        const settled = isStatic && Math.abs(par.x - tx) < 0.05 && Math.abs(par.y - ty) < 0.05;
        if (visible && !document.hidden && !settled) raf = requestAnimationFrame(frame);
      };
      const schedule = () => {
        if (!raf && !disposed) raf = requestAnimationFrame(frame);
      };
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) schedule();
      });
      io.observe(host);
      const onVis = () => schedule();
      document.addEventListener("visibilitychange", onVis);
      const onMoveWake = () => schedule();
      window.addEventListener("mousemove", onMoveWake, { passive: true });
      schedule();

      cleanup = () => {
        if (raf) cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mousemove", onMoveWake);
        geo.dispose();
        mat.dispose();
        sprite.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })().catch((err) => {
      if (process.env.NODE_ENV !== "production") console.warn("hero particles:", err);
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return <div ref={hostRef} className="h-full w-full [&>canvas]:block [&>canvas]:mx-auto [&>canvas]:max-w-full" aria-hidden />;
}
