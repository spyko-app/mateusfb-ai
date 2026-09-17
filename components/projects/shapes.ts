import type * as THREE from "three";
import type { DitherBuild } from "@/components/hero/dither-rig";

export const SHAPES = ["grid", "chain", "pages", "stack", "island", "display", "flow"] as const;
export type Shape = (typeof SHAPES)[number];

const TILT_X = 0.55;
const SPIN = 0.25; // rad/s

type T = typeof THREE;

function materials(T: T) {
  const white = new T.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.35, roughness: 0.7 });
  const gray = new T.MeshStandardMaterial({ color: 0x767676, emissive: 0x0e0e0e, roughness: 0.6 });
  const edge = new T.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.22, roughness: 0.4 });
  return { white, gray, edge, dispose: () => [white, gray, edge].forEach((m) => m.dispose()) };
}

/** barra fina entre dois pontos (as linhas de 1px somem no dither, então links têm área) */
function bar(T: T, a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material, geos: THREE.BufferGeometry[]) {
  const len = a.distanceTo(b);
  const g = new T.CylinderGeometry(r, r, len, 6, 1);
  geos.push(g);
  const m = new T.Mesh(g, mat);
  m.position.copy(a).lerp(b, 0.5);
  m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return m;
}

type Built = { group: THREE.Group; update?: (t: number) => void; dispose: () => void };

const builders: Record<Shape, (T: T) => Built> = {
  /** grade 4×4 de caixinhas: alturas ondulam como um mapa de tiles */
  grid(T) {
    const g = new T.Group();
    const mats = materials(T);
    const geo = new T.BoxGeometry(0.42, 0.14, 0.42);
    const cells: { m: THREE.Mesh; i: number; j: number }[] = [];
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++) {
        const m = new T.Mesh(geo, (i + j) % 3 === 0 ? mats.white : mats.gray);
        m.position.set((i - 1.5) * 0.56, 0, (j - 1.5) * 0.56);
        g.add(m);
        cells.push({ m, i, j });
      }
    return {
      group: g,
      update: (t) => {
        for (const c of cells) c.m.position.y = Math.sin(t * 1.4 + c.i * 0.9 + c.j * 0.7) * 0.12;
      },
      dispose: () => {
        geo.dispose();
        mats.dispose();
      },
    };
  },
  /** corrente: 4 toros intercalados, alternando 90° */
  chain(T) {
    const g = new T.Group();
    const mats = materials(T);
    const geo = new T.TorusGeometry(0.34, 0.09, 10, 28);
    for (let i = 0; i < 4; i++) {
      const m = new T.Mesh(geo, i % 2 ? mats.gray : mats.white);
      m.position.x = (i - 1.5) * 0.56;
      m.rotation.y = i % 2 ? Math.PI / 2 : 0;
      g.add(m);
    }
    g.rotation.z = 0.35;
    return { group: g, dispose: () => (geo.dispose(), mats.dispose()) };
  },
  /** livro aberto: duas capas em V + páginas finas em leque */
  pages(T) {
    const g = new T.Group();
    const mats = materials(T);
    const cover = new T.BoxGeometry(1.1, 0.06, 1.5);
    const page = new T.BoxGeometry(1.0, 0.02, 1.4);
    const geos = [cover, page];
    const open = 0.5;
    for (const s of [-1, 1]) {
      const c = new T.Mesh(cover, mats.gray);
      c.position.x = s * 0.56;
      c.rotation.z = -s * open;
      g.add(c);
    }
    const leaves: THREE.Mesh[] = [];
    for (let i = 0; i < 5; i++) {
      const p = new T.Mesh(page, mats.white);
      g.add(p);
      leaves.push(p);
    }
    g.position.y = -0.2;
    return {
      group: g,
      update: (t) => {
        leaves.forEach((p, i) => {
          const k = (i - 2) / 2;
          const flutter = Math.sin(t * 1.2 + i) * 0.08;
          p.rotation.z = -k * open * 0.9 + flutter;
          p.position.x = k * 0.5;
          p.position.y = 0.06 + Math.abs(k) * 0.05;
        });
      },
      dispose: () => (geos.forEach((x) => x.dispose()), mats.dispose()),
    };
  },
  /** pilha de lajes: a marca, mais alta (4 níveis), a do topo respira */
  stack(T) {
    const g = new T.Group();
    const mats = materials(T);
    const geo = new T.BoxGeometry(1.7, 0.08, 1.7);
    const slabs: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const m = new T.Mesh(geo, i === 3 ? mats.white : mats.gray);
      m.position.y = (i - 1.5) * 0.5;
      g.add(m);
      slabs.push(m);
    }
    return {
      group: g,
      update: (t) => {
        slabs[3].position.y = 0.75 + Math.sin(t * 1.5) * 0.08;
      },
      dispose: () => (geo.dispose(), mats.dispose()),
    };
  },
  /** ilha: cápsula deitada com um "now playing" (disco) flutuando ao lado */
  island(T) {
    const g = new T.Group();
    const mats = materials(T);
    const cap = new T.CapsuleGeometry(0.28, 1.5, 6, 14);
    const disc = new T.CylinderGeometry(0.22, 0.22, 0.06, 20);
    const body = new T.Mesh(cap, mats.gray);
    body.rotation.z = Math.PI / 2;
    g.add(body);
    const d = new T.Mesh(disc, mats.white);
    d.position.set(-0.6, 0, 0.3);
    g.add(d);
    const dots: THREE.Mesh[] = [];
    const dot = new T.BoxGeometry(0.08, 0.08, 0.08);
    for (let i = 0; i < 4; i++) {
      const m = new T.Mesh(dot, mats.white);
      m.position.set(0.2 + i * 0.22, 0, 0.3);
      g.add(m);
      dots.push(m);
    }
    return {
      group: g,
      update: (t) => {
        d.rotation.y = t * 1.2;
        dots.forEach((m, i) => (m.scale.y = 1 + Math.abs(Math.sin(t * 3 + i)) * 2.2));
      },
      dispose: () => ([cap, disc, dot].forEach((x) => x.dispose()), mats.dispose()),
    };
  },
  /** monitor: retângulo fino com 3 barras de slider que deslizam */
  display(T) {
    const g = new T.Group();
    const mats = materials(T);
    const frame = new T.BoxGeometry(2.0, 1.3, 0.08);
    const track = new T.BoxGeometry(1.3, 0.05, 0.05);
    const knob = new T.BoxGeometry(0.12, 0.16, 0.12);
    const stand = new T.BoxGeometry(0.5, 0.08, 0.5);
    const screen = new T.Mesh(frame, mats.gray);
    g.add(screen);
    const base = new T.Mesh(stand, mats.gray);
    base.position.y = -0.85;
    g.add(base);
    const knobs: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const tr = new T.Mesh(track, mats.white);
      tr.position.set(0, 0.3 - i * 0.3, 0.06);
      g.add(tr);
      const k = new T.Mesh(knob, mats.white);
      k.position.set(0, 0.3 - i * 0.3, 0.08);
      g.add(k);
      knobs.push(k);
    }
    return {
      group: g,
      update: (t) => {
        knobs.forEach((k, i) => (k.position.x = Math.sin(t * 0.7 + i * 2.1) * 0.6));
      },
      dispose: () => ([frame, track, knob, stand].forEach((x) => x.dispose()), mats.dispose()),
    };
  },
  /** fluxo: nós ligados em duas camadas (pipeline), um pulso corre pelos links */
  flow(T) {
    const g = new T.Group();
    const mats = materials(T);
    const node = new T.BoxGeometry(0.28, 0.28, 0.28);
    const geos: THREE.BufferGeometry[] = [node];
    const pts = [
      new T.Vector3(-1.1, 0, 0),
      new T.Vector3(-0.3, 0.55, 0),
      new T.Vector3(-0.3, -0.55, 0),
      new T.Vector3(0.5, 0, 0),
      new T.Vector3(1.2, 0.4, 0),
    ];
    const links: [number, number][] = [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 3],
      [3, 4],
    ];
    pts.forEach((p, i) => {
      const m = new T.Mesh(node, i === 3 ? mats.white : mats.gray);
      m.position.copy(p);
      g.add(m);
    });
    for (const [a, b] of links) g.add(bar(T, pts[a], pts[b], 0.03, mats.edge, geos));
    const pulse = new T.Mesh(node, mats.white);
    pulse.scale.setScalar(0.45);
    g.add(pulse);
    return {
      group: g,
      update: (t) => {
        const path = [0, 1, 3, 4];
        const u = (t * 0.5) % (path.length - 1);
        const i = Math.floor(u);
        pulse.position.copy(pts[path[i]]).lerp(pts[path[i + 1]], u - i);
      },
      dispose: () => (geos.forEach((x) => x.dispose()), mats.dispose()),
    };
  },
};

/** `build` pra um `DitherScene`: monta a forma, inclina como o hero e gira devagar. */
export function shapeBuild(shape: Shape): DitherBuild {
  return (_scene, T, rig) => {
    const built = builders[shape](T);
    const pivot = new T.Group();
    pivot.rotation.x = TILT_X;
    pivot.add(built.group);
    rig.world.add(pivot);
    const phase = Math.random() * Math.PI * 2;
    return {
      fit: pivot,
      update: (t) => {
        built.group.rotation.y = phase + t * SPIN;
        built.update?.(t);
      },
      dispose: built.dispose,
    };
  };
}
