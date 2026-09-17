"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { bgFrag, frag, vert } from "./dither.glsl";

const MAX_W = 720;
const MAX_H = 500;
const ASPECT = MAX_W / MAX_H;
/** 1 px por partícula, resolução nativa (DPR 1) — como o xmcp.dev */
const PIXEL = 1;
/** exposição do tone mapping: face iluminada do topo satura (≥85% de densidade), sombra fica em meio-tom */
const EXPOSURE = 1.9;
const SLAB = { size: 2.2, thick: 0.1, gap: 0.9 } as const;
/** arestas com área (barras finas) — linhas de 1px não pegam luz e somem no dither */
const EDGE = 0.03;
const TILT_X = 0.6;
/** rotação bem lenta (≤ 0.0015 rad/frame) */
const SPIN_Y = 0.0012;
/** parallax: deslocamento da cena até ±14px e inclinação até ±0.10 rad, com lerp 0.08 */
const PARALLAX_PX = 14;
const PARALLAX_TILT = 0.1;
const LERP = 0.08;
/** a luz principal segue o cursor (±1.5 unidades) → as faces iluminadas mudam com o mouse */
const KEY_FOLLOW = 1.5;
const KEY_BASE = new THREE.Vector3(-2.4, 3.2, 2.6);
/** "spotlight" no shader: ×1.25 num raio de 160px do cursor */
const SPOT_RADIUS = 160;
const BREATH_AMP = 0.08;
const BREATH_PERIOD = 4000;
const FOV = 35;
const FIT_MARGIN = 0.7;

/** Pilha isométrica do mark em 3D, iluminada suave: topo emissivo, os de baixo em cinza que pega luz e névoa. */
function buildStack(): { group: THREE.Group; top: THREE.Mesh; dispose: () => void } {
  const group = new THREE.Group();
  const box = new THREE.BoxGeometry(SLAB.size, SLAB.thick, SLAB.size);
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.35, roughness: 0.7 });
  const gray = new THREE.MeshStandardMaterial({ color: 0x5c5c5c, emissive: 0x080808, roughness: 0.6 });
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.22, roughness: 0.4 });
  // 12 arestas como barras finas (BoxGeometry) — têm área, pegam luz e viram linhas pontilhadas nítidas
  const half = SLAB.size / 2;
  const halfT = SLAB.thick / 2;
  const barX = new THREE.BoxGeometry(SLAB.size + EDGE, EDGE, EDGE);
  const barZ = new THREE.BoxGeometry(EDGE, EDGE, SLAB.size + EDGE);
  const barY = new THREE.BoxGeometry(EDGE, SLAB.thick + EDGE, EDGE);
  const addEdges = (parent: THREE.Object3D) => {
    for (const sy of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const m = new THREE.Mesh(barX, edgeMat);
        m.position.set(0, sy * halfT, sz * half);
        parent.add(m);
      }
      for (const sx of [-1, 1]) {
        const m = new THREE.Mesh(barZ, edgeMat);
        m.position.set(sx * half, sy * halfT, 0);
        parent.add(m);
      }
    }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const m = new THREE.Mesh(barY, edgeMat);
      m.position.set(sx * half, 0, sz * half);
      parent.add(m);
    }
  };

  const top = new THREE.Mesh(box, white);
  top.position.y = SLAB.gap;
  group.add(top);

  for (const y of [0, -SLAB.gap]) {
    const fill = new THREE.Mesh(box, gray);
    fill.position.y = y;
    addEdges(fill);
    group.add(fill);
  }

  group.position.y = -0.35;
  group.rotation.x = TILT_X;
  group.rotation.y = Math.PI / 4;
  const dispose = () => {
    box.dispose();
    barX.dispose();
    barZ.dispose();
    barY.dispose();
    white.dispose();
    gray.dispose();
    edgeMat.dispose();
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
    scene.fog = new THREE.FogExp2(0x000000, 0.06);
    const camera = new THREE.PerspectiveCamera(FOV, ASPECT, 0.1, 100);

    // key (frente, alto-esquerda, forte, queda larga) + fill suave da direita + rim por trás (arestas acendem)
    const keyLight = new THREE.PointLight(0xffffff, 9, 0, 1);
    keyLight.position.copy(KEY_BASE);
    const fillLight = new THREE.PointLight(0xffffff, 3.5, 0, 1);
    fillLight.position.set(3.2, 0.6, 2.4);
    const rimLight = new THREE.PointLight(0xffffff, 9, 0, 1);
    rimLight.position.set(1.2, 1.4, -3.4);
    scene.add(keyLight, fillLight, rimLight, new THREE.AmbientLight(0xffffff, 0.1));

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
        uExposure: { value: EXPOSURE },
        uMouse: { value: new THREE.Vector2(-9999, -9999) },
        uSpotRadius: { value: SPOT_RADIUS },
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

    const mouse = { x: 0.5, y: 0.5, cx: -9999, cy: -9999 };
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
      // posição do cursor em px do canvas (origem embaixo-esquerda, como gl_FragCoord)
      const r = renderer.domElement.getBoundingClientRect();
      mouse.cx = e.clientX - r.left;
      mouse.cy = r.bottom - e.clientY;
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
    const spot = new THREE.Vector2(-9999, -9999);
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

      // luz principal acompanha o cursor (sentido do mouse) → faces iluminadas mudam
      const kx = (mouse.x - 0.5) * 2 * KEY_FOLLOW;
      const ky = -(mouse.y - 0.5) * 2 * KEY_FOLLOW;
      keyLight.position.x += (KEY_BASE.x + kx - keyLight.position.x) * LERP;
      keyLight.position.y += (KEY_BASE.y + ky - keyLight.position.y) * LERP;
      if (mouse.cx > -9000) spot.lerp(new THREE.Vector2(mouse.cx, mouse.cy), LERP);
      ditherMat.uniforms.uMouse.value.copy(spot);

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
