"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { frag, vert } from "./dither.glsl";

const MAX_W = 720;
const MAX_H = 420;
const PIXEL = 2;
const SLAB = { size: 2.2, thick: 0.08, gap: 0.9 } as const;
const TILT_X = 0.6;
const SPIN_Y = 0.003;
const PARALLAX = 0.21;
const LERP = 0.06;
const BREATH_AMP = 0.08;
const BREATH_PERIOD = 4000;
const FOV = 35;
/** margem de ~8% ao redor da pilha: a caixa ocupa esta fração da altura/largura visível */
const FIT_MARGIN = 0.92;

/** Pilha isométrica do mark em 3D: topo sólido, dois de baixo em contorno (fill escuro pro dither ler as arestas). */
function buildStack(): { group: THREE.Group; top: THREE.Mesh; dispose: () => void } {
  const group = new THREE.Group();
  const box = new THREE.BoxGeometry(SLAB.size, SLAB.thick, SLAB.size);
  const edges = new THREE.EdgesGeometry(box);
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x2a2a2a });
  const dark = new THREE.MeshStandardMaterial({ color: 0x222222 });
  const line = new THREE.LineBasicMaterial({ color: 0xffffff });

  const top = new THREE.Mesh(box, white);
  top.position.y = SLAB.gap;
  group.add(top);

  for (const y of [0, -SLAB.gap]) {
    const fill = new THREE.Mesh(box, dark);
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
    dark.dispose();
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
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);

    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(-3, 4, 3);
    scene.add(key, new THREE.AmbientLight(0xffffff, 0.15));

    const stack = buildStack();
    scene.add(stack.group);

    // bounding box da pilha já rotacionada/posicionada — usado pra enquadrar a câmera com margem
    const bbox = new THREE.Box3().setFromObject(stack.group);
    const bboxSize = new THREE.Vector3();
    bbox.getSize(bboxSize);
    const bboxCenter = new THREE.Vector3();
    bbox.getCenter(bboxCenter);
    // a "respiração" do topo e o parallax variam a caixa um pouco; dá uma folga extra
    const fitHeight = bboxSize.y + BREATH_AMP * 2;
    const fitWidth = bboxSize.x;

    const target = new THREE.WebGLRenderTarget(1, 1, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    const quadScene = new THREE.Scene();
    const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const ditherMat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: { tScene: { value: target.texture }, uRes: { value: new THREE.Vector2(1, 1) }, uPixel: { value: PIXEL } },
      depthTest: false,
      depthWrite: false,
    });
    const quadGeo = new THREE.PlaneGeometry(2, 2);
    quadScene.add(new THREE.Mesh(quadGeo, ditherMat));

    const resize = () => {
      const w = Math.min(MAX_W, Math.max(1, host.clientWidth));
      const h = Math.min(MAX_H, Math.max(1, host.clientHeight));
      renderer.setSize(w, h, true);
      target.setSize(w, h);
      ditherMat.uniforms.uRes.value.set(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      // distância mínima pra pilha inteira caber na vertical e na horizontal, com margem
      const vFov = (camera.fov * Math.PI) / 180;
      const distForHeight = fitHeight / FIT_MARGIN / (2 * Math.tan(vFov / 2));
      const distForWidth = fitWidth / FIT_MARGIN / (2 * Math.tan(vFov / 2) * camera.aspect);
      const dist = Math.max(distForHeight, distForWidth);
      camera.position.set(bboxCenter.x, bboxCenter.y, bboxCenter.z + dist);
      camera.lookAt(bboxCenter);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const mouse = { x: 0.5, y: 0.5 };
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

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
    let rotX = 0;
    let rotY = 0;
    const t0 = performance.now();

    const frame = () => {
      raf = 0;
      if (document.hidden || !visible) return;
      spin += SPIN_Y;
      rotX += ((mouse.y - 0.5) * PARALLAX - rotX) * LERP;
      rotY += ((mouse.x - 0.5) * PARALLAX - rotY) * LERP;
      stack.group.rotation.x = TILT_X + rotX;
      stack.group.rotation.y = spin + rotY;
      stack.top.position.y = SLAB.gap + Math.sin(((performance.now() - t0) / BREATH_PERIOD) * Math.PI * 2) * BREATH_AMP;

      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
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
      document.removeEventListener("visibilitychange", onVis);
      stack.dispose();
      quadGeo.dispose();
      ditherMat.dispose();
      target.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} className="h-full w-full [&>canvas]:block [&>canvas]:mx-auto" aria-hidden />;
}
