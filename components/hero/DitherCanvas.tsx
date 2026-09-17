"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { bgFrag, frag, vert } from "./dither.glsl";

const MAX_W = 720;
const MAX_H = 500;
const ASPECT = MAX_W / MAX_H;
/** 1 px por partícula, resolução nativa (DPR 1) — como o xmcp.dev */
const PIXEL = 1;
const GAMMA = 1.4;
const SLAB = { size: 2.2, thick: 0.1, gap: 0.9 } as const;
const TILT_X = 0.6;
/** rotação bem lenta (≤ 0.0015 rad/frame) */
const SPIN_Y = 0.0012;
/** parallax: deslocamento da cena até ±12px e inclinação até ±0.06 rad, com lerp 0.05 */
const PARALLAX_PX = 12;
const PARALLAX_TILT = 0.06;
const LERP = 0.05;
const BREATH_AMP = 0.08;
const BREATH_PERIOD = 4000;
const FOV = 35;
const FIT_MARGIN = 0.7;

/** Pilha isométrica do mark em 3D, iluminada suave: topo emissivo, os de baixo em cinza que pega luz e névoa. */
function buildStack(): { group: THREE.Group; top: THREE.Mesh; dispose: () => void } {
  const group = new THREE.Group();
  const box = new THREE.BoxGeometry(SLAB.size, SLAB.thick, SLAB.size);
  const edges = new THREE.EdgesGeometry(box);
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.14, roughness: 0.6 });
  const gray = new THREE.MeshStandardMaterial({ color: 0xa8a8a8, emissive: 0x0c0c0c, roughness: 0.6 });
  const line = new THREE.LineBasicMaterial({ color: 0x777777, transparent: true, opacity: 0.6 });

  const top = new THREE.Mesh(box, white);
  top.position.y = SLAB.gap;
  group.add(top);

  for (const y of [0, -SLAB.gap]) {
    const fill = new THREE.Mesh(box, gray);
    fill.position.y = y;
    const frame = new THREE.LineSegments(edges, line);
    frame.position.y = y;
    group.add(fill, frame);
  }

  group.position.y = -0.35;
  group.rotation.x = TILT_X;
  group.rotation.y = Math.PI / 4;
  const dispose = () => {
    box.dispose();
    edges.dispose();
    white.dispose();
    gray.dispose();
    line.dispose();
  };
  return { group, top, dispose };
}

export default function DitherCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 1);
    renderer.autoClear = false;
    renderer.domElement.style.imageRendering = "pixelated";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.12);
    const camera = new THREE.PerspectiveCamera(FOV, ASPECT, 0.1, 100);

    // duas luzes pontuais com queda larga (decay 1) — iluminação volumétrica, sem silhueta dura
    const keyLight = new THREE.PointLight(0xffffff, 8, 0, 1);
    keyLight.position.set(-2.2, 2.8, 1.8);
    const rimLight = new THREE.PointLight(0xffffff, 7, 0, 1);
    rimLight.position.set(3.0, -1.0, 2.5);
    scene.add(keyLight, rimLight, new THREE.AmbientLight(0xffffff, 0.12));

    // "mundo" que recebe o parallax (deslocamento + inclinação); a pilha vive dentro
    const world = new THREE.Group();
    const stack = buildStack();
    world.add(stack.group);
    scene.add(world);

    const bbox = new THREE.Box3().setFromObject(stack.group);
    const bboxSize = new THREE.Vector3();
    bbox.getSize(bboxSize);
    const bboxCenter = new THREE.Vector3();
    bbox.getCenter(bboxCenter);
    const fitHeight = bboxSize.y + BREATH_AMP * 2;
    const fitWidth = bboxSize.x;

    const target = new THREE.WebGLRenderTarget(1, 1, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quadGeo = new THREE.PlaneGeometry(2, 2);

    // passo 1: fundo volumétrico (glow radial + "X" de luz) pintado no render target antes da cena 3D
    const bgScene = new THREE.Scene();
    const bgMat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: bgFrag,
      uniforms: { uRes: { value: new THREE.Vector2(1, 1) }, uOffset: { value: new THREE.Vector2(0, 0) }, uTime: { value: 0 } },
      depthTest: false,
      depthWrite: false,
    });
    bgScene.add(new THREE.Mesh(quadGeo, bgMat));

    // passo 3: dither estocástico temporal (1 px, re-semeado a cada frame)
    const quadScene = new THREE.Scene();
    const ditherMat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        tScene: { value: target.texture },
        uRes: { value: new THREE.Vector2(1, 1) },
        uPixel: { value: PIXEL },
        uFrame: { value: 0 },
        uGamma: { value: GAMMA },
      },
      depthTest: false,
      depthWrite: false,
    });
    quadScene.add(new THREE.Mesh(quadGeo, ditherMat));

    let unitsPerPx = 0.01;
    const resize = () => {
      const w = Math.min(MAX_W, Math.max(1, host.clientWidth));
      const h = Math.round(w / ASPECT);
      renderer.setSize(w, h, true);
      target.setSize(w, h);
      ditherMat.uniforms.uRes.value.set(w, h);
      bgMat.uniforms.uRes.value.set(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      const vFov = (camera.fov * Math.PI) / 180;
      const distForHeight = fitHeight / FIT_MARGIN / (2 * Math.tan(vFov / 2));
      const distForWidth = fitWidth / FIT_MARGIN / (2 * Math.tan(vFov / 2) * camera.aspect);
      const dist = Math.max(distForHeight, distForWidth);
      camera.position.set(bboxCenter.x, bboxCenter.y, bboxCenter.z + dist);
      camera.lookAt(bboxCenter);
      unitsPerPx = (2 * dist * Math.tan(vFov / 2)) / h;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const mouse = { x: 0.5, y: 0.5 };
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
    });
    io.observe(host);
    const onVis = () => schedule();
    document.addEventListener("visibilitychange", onVis);

    let raf = 0;
    let spin = Math.PI / 4;
    let frameN = 0;
    // parallax (em px, eixo y da tela pra baixo) — a cena deriva no sentido OPOSTO ao cursor
    const par = { x: 0, y: 0 };
    const t0 = performance.now();

    const frame = () => {
      raf = 0;
      if (document.hidden || !visible) return;
      const now = performance.now();
      frameN++;
      spin += SPIN_Y;
      const tx = -(mouse.x - 0.5) * 2 * PARALLAX_PX;
      const ty = -(mouse.y - 0.5) * 2 * PARALLAX_PX;
      par.x += (tx - par.x) * LERP;
      par.y += (ty - par.y) * LERP;

      world.position.set(par.x * unitsPerPx, -par.y * unitsPerPx, 0);
      world.rotation.x = (par.y / PARALLAX_PX) * PARALLAX_TILT;
      world.rotation.y = -(par.x / PARALLAX_PX) * PARALLAX_TILT;
      stack.group.rotation.y = spin;
      stack.top.position.y = SLAB.gap + Math.sin(((now - t0) / BREATH_PERIOD) * Math.PI * 2) * BREATH_AMP;

      bgMat.uniforms.uOffset.value.set(par.x, -par.y);
      bgMat.uniforms.uTime.value = (now - t0) / 1000;
      ditherMat.uniforms.uFrame.value = frameN % 4096;

      renderer.setRenderTarget(target);
      renderer.clear();
      renderer.render(bgScene, quadCam);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(quadScene, quadCam);
      schedule();
    };
    function schedule() {
      if (!raf && !document.hidden && visible) raf = requestAnimationFrame(frame);
    }
    schedule();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      stack.dispose();
      quadGeo.dispose();
      ditherMat.dispose();
      bgMat.dispose();
      target.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="h-full w-full [&>canvas]:block [&>canvas]:mx-auto [&>canvas]:max-w-full [&>canvas]:[image-rendering:pixelated]"
      aria-hidden
    />
  );
}
