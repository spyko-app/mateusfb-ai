"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLOW_URL, createPointsMaterial, createSprite, loadImage, sampleImage } from "./particles";

/**
 * Hero como campo de partículas (pipeline do xmcp.dev): uma imagem estática já ditherizada
 * (`/hero/scene.png`, preto com pontos brancos) é lida pixel a pixel e cada ponto branco vira um
 * `THREE.Points` com sprite radial suave, blending aditivo e tamanho minúsculo. A animação é só
 * cintilação por partícula (ruído no tempo), respiração lenta de brilho e um **campo de força local
 * do mouse**: só as partículas perto do cursor são empurradas (com um leve redemoinho) e voltam com
 * inércia, deixando um rastro que se apaga — nada de parallax global (medido no xmcp: deslocamento
 * global = 0,0; a diferença entre frames fica ao redor do cursor e de onde ele acabou de passar).
 *
 * Pra trocar a cena: substitua `public/hero/scene.png` por outro PNG preto/branco (qualquer tamanho).
 */

const SCENE_URL = "/hero/scene.png";
const MAX_W = 720;
const MAX_H = 500;
const ASPECT = MAX_W / MAX_H;
const MAX_POINTS = 60_000;
/** escala (px CSS por px da cena) em que a cena foi calibrada — 720/850, como no xmcp */
const REF_SCALE = 720 / 850;
/** ponto base em px CSS (×dpr no shader; o sprite radial só acende no miolo → ~1,5 px visíveis = delicado) */
const POINT_BASE = 2.2;
/** campo de força do cursor (px CSS): raio, deslocamento máximo, ângulo do redemoinho */
const FORCE_RADIUS = 110;
const FORCE_STRENGTH = 26;
const SWIRL_RAD = (35 * Math.PI) / 180;
/** inércia: aproxima rápido do alvo, solta devagar (0,08/frame ≈ rastro de ~0,5 s) */
const LERP_IN = 0.18;
const LERP_OUT = 0.08;
/** respiração: pulso lento de brilho/tamanho do campo inteiro (sem mover posição) */
const BREATH_PERIOD_S = 6;
const BREATH_AMT = 0.08;

const vert = /* glsl */ `
  attribute float aSeed;
  attribute float aDepth;
  attribute vec2 aOffset;
  uniform float uTime;
  uniform float uSize;
  uniform float uStatic;
  uniform float uBreath;
  uniform vec2 uMouse;
  uniform float uRadius;
  varying float vAlpha;
  void main() {
    float speed = 1.2 + aSeed * 2.6;
    float tw = 0.55 + 0.45 * sin(uTime * speed + aSeed * 6.2831853);
    tw = mix(tw, 0.85, uStatic);
    vec3 p = position + vec3(aOffset, 0.0);
    // o cursor "acende" a região: dentro do raio, +30% de brilho e tamanho
    float lit = 1.0 - smoothstep(0.0, uRadius, distance(p.xy, uMouse));
    float boost = 1.0 + 0.3 * lit;
    vAlpha = tw * (0.55 + 0.45 * aDepth) * uBreath * boost;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.8 + 0.5 * tw + 0.25 * aDepth) * uBreath * boost;
  }
`;

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
      const field = sampleImage(img, MAX_POINTS);
      const count = field.seeds.length;

      const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "low-power" });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setClearColor(0x000000, 1);
      host.appendChild(renderer.domElement);
      const canvas = renderer.domElement;

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100);
      camera.position.z = 10;

      const offsets = new Float32Array(count * 2);
      const offsetAttr = new THREE.BufferAttribute(offsets, 2);
      offsetAttr.setUsage(THREE.DynamicDrawUsage);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(field.positions, 3));
      geo.setAttribute("aSeed", new THREE.BufferAttribute(field.seeds, 1));
      geo.setAttribute("aDepth", new THREE.BufferAttribute(field.depths, 1));
      geo.setAttribute("aOffset", offsetAttr);

      const { sprite, hasSprite } = createSprite(glowImg);
      const mat = createPointsMaterial({
        vertexShader: vert,
        sprite,
        hasSprite,
        size: POINT_BASE * dpr,
        uniforms: {
          uStatic: { value: reducedRef.current ? 1 : 0 },
          uBreath: { value: 1 },
          uMouse: { value: new THREE.Vector2(1e6, 1e6) },
          uRadius: { value: 1 },
        },
      });
      const points = new THREE.Points(geo, mat);
      scene.add(points);

      /** px CSS por unidade da cena (enquadra com letterbox preto, mantendo o aspecto) */
      let scale = 1;
      let drawCount = count;
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
        mat.uniforms.uRadius.value = FORCE_RADIUS / scale;
        // densidade constante em px CSS: em telas menores desenha só um prefixo (embaralhado) dos pontos
        const frac = Math.min(1, Math.sqrt(scale / REF_SCALE));
        drawCount = Math.max(1, Math.round(count * frac));
        geo.setDrawRange(0, drawCount);
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      // cursor em unidades da cena (origem no centro, y pra cima); `active=false` fora do canvas → tudo volta
      const mouse = { x: 0, y: 0, active: false };
      const setPointer = (clientX: number, clientY: number) => {
        const r = canvas.getBoundingClientRect();
        const inside = clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
        mouse.active = inside;
        if (!inside) return;
        mouse.x = (clientX - r.left - r.width / 2) / scale;
        mouse.y = -(clientY - r.top - r.height / 2) / scale;
      };
      const onMove = (e: MouseEvent) => {
        setPointer(e.clientX, e.clientY);
        schedule();
      };
      const onTouch = (e: TouchEvent) => {
        const t = e.touches[0];
        if (t) setPointer(t.clientX, t.clientY);
        else mouse.active = false;
        schedule();
      };
      const onLeave = () => {
        mouse.active = false;
        schedule();
      };
      window.addEventListener("mousemove", onMove, { passive: true });
      window.addEventListener("touchmove", onTouch, { passive: true });
      window.addEventListener("touchend", onLeave, { passive: true });
      document.addEventListener("mouseleave", onLeave);

      /** energia residual do campo (soma dos deslocamentos) → sabemos quando parar de atualizar o buffer */
      let energy = 0;
      const cosS = Math.cos(SWIRL_RAD);
      const sinS = Math.sin(SWIRL_RAD);
      const updateForces = (active: boolean) => {
        const R = FORCE_RADIUS / scale;
        const S = FORCE_STRENGTH / scale;
        const pos = field.positions;
        let sum = 0;
        for (let i = 0; i < drawCount; i++) {
          let tx = 0;
          let ty = 0;
          if (active) {
            const dx = pos[i * 3] - mouse.x;
            const dy = pos[i * 3 + 1] - mouse.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < R) {
              const u = d / R;
              const f = 1 - u * u * (3 - 2 * u); // smoothstep(R, 0, d)
              const inv = d > 1e-4 ? 1 / d : 0;
              const nx = dx * inv;
              const ny = dy * inv;
              // empurra pra fora + redemoinho (direção girada 35°)
              tx = (nx * cosS - ny * sinS) * S * f;
              ty = (nx * sinS + ny * cosS) * S * f;
            }
          }
          const ox = offsets[i * 2];
          const oy = offsets[i * 2 + 1];
          const k = tx * tx + ty * ty > ox * ox + oy * oy ? LERP_IN : LERP_OUT;
          const nx = ox + (tx - ox) * k;
          const ny = oy + (ty - oy) * k;
          offsets[i * 2] = nx;
          offsets[i * 2 + 1] = ny;
          sum += Math.abs(nx) + Math.abs(ny);
        }
        energy = sum * scale;
        offsetAttr.needsUpdate = true;
      };

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
        mat.uniforms.uBreath.value = isStatic ? 1 : 1 + Math.sin((t / BREATH_PERIOD_S) * Math.PI * 2) * BREATH_AMT;

        const active = mouse.active && !isStatic;
        if (active) mat.uniforms.uMouse.value.set(mouse.x, mouse.y);
        else mat.uniforms.uMouse.value.set(1e6, 1e6);
        if (active || energy > 0.5) updateForces(active);

        renderer.render(scene, camera);
        const settled = isStatic && energy <= 0.5;
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
      schedule();

      cleanup = () => {
        if (raf) cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("touchmove", onTouch);
        window.removeEventListener("touchend", onLeave);
        document.removeEventListener("mouseleave", onLeave);
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
