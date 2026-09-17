"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createDitherRig } from "./dither-rig";

const MAX_W = 720;
const MAX_H = 500;
const ASPECT = MAX_W / MAX_H;
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
    return createDitherRig(host, {
      dpr: 1,
      exposure: EXPOSURE,
      background: true,
      spotRadius: SPOT_RADIUS,
      fitMargin: FIT_MARGIN,
      fitPadY: BREATH_AMP * 2,
      fov: FOV,
      mouseScope: "window",
      size: (h) => {
        const w = Math.min(MAX_W, Math.max(1, h.clientWidth));
        return { w, h: Math.round(w / ASPECT) };
      },
      build: (_scene, T, rig) => {
        const stack = buildStack();
        rig.world.add(stack.group);
        const keyLight = rig.lights.key;
        let spin = Math.PI / 4;
        // parallax (em px, eixo y da tela pra baixo): a cena deriva no sentido OPOSTO ao cursor
        const par = { x: 0, y: 0 };
        const spot = new T.Vector2(-9999, -9999);
        const tmp = new T.Vector2();
        return {
          fit: stack.group,
          update: (t, mouse) => {
            spin += SPIN_Y;
            const tx = -(mouse.x - 0.5) * 2 * PARALLAX_PX;
            const ty = -(mouse.y - 0.5) * 2 * PARALLAX_PX;
            par.x += (tx - par.x) * LERP;
            par.y += (ty - par.y) * LERP;

            rig.world.position.set(par.x * rig.unitsPerPx, -par.y * rig.unitsPerPx, 0);
            rig.world.rotation.x = (par.y / PARALLAX_PX) * PARALLAX_TILT;
            rig.world.rotation.y = -(par.x / PARALLAX_PX) * PARALLAX_TILT;
            stack.group.rotation.y = spin;
            stack.top.position.y = SLAB.gap + Math.sin(((t * 1000) / BREATH_PERIOD) * Math.PI * 2) * BREATH_AMP;

            // luz principal acompanha o cursor (sentido do mouse) → faces iluminadas mudam
            const kx = (mouse.x - 0.5) * 2 * KEY_FOLLOW;
            const ky = -(mouse.y - 0.5) * 2 * KEY_FOLLOW;
            keyLight.position.x += (KEY_BASE.x + kx - keyLight.position.x) * LERP;
            keyLight.position.y += (KEY_BASE.y + ky - keyLight.position.y) * LERP;
            if (mouse.cx > -9000) spot.lerp(tmp.set(mouse.cx, mouse.cy), LERP);
            rig.setSpot(spot.x, spot.y);
            rig.setBgOffset(par.x, -par.y);
          },
          dispose: stack.dispose,
        };
      },
    });
  }, []);

  return (
    <div
      ref={hostRef}
      className="h-full w-full [&>canvas]:block [&>canvas]:mx-auto [&>canvas]:max-w-full [&>canvas]:[image-rendering:pixelated]"
      aria-hidden
    />
  );
}
