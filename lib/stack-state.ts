/**
 * Estado da pilha 3D da seção "Where I sit" em função do progresso de scroll (0..1).
 * Função pura: sem DOM, sem motion — testada em tests/stack-state.test.ts.
 *
 * Fases (p):
 *   0.00–0.15  plano: só "You" e "Shipped", com um vão vazio entre eles
 *   0.15–0.45  inclina pra isométrico (rotateX 55°, rotateZ −38°); camadas do meio entram pela esquerda
 *              com extrusão tracejada e profundidade escalonada ("You" no topo da pilha = maior z;
 *              cada camada abaixo desce DEPTH_STEP; as linhas tracejadas pendem até a camada de baixo)
 *   0.50–0.85  volta a 2D; integrações aparecem entre kits e Shipped
 *   0.85–1.00  pequeno assentamento
 */
export const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
export const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
export const seg = (p: number, a: number, b: number) =>
  easeOutQuint(clamp01((p - a) / (b - a)));

export interface LayerState {
  x: number; // %
  y: number; // px
  z: number; // px
  opacity: number;
  extrude: number; // 0..1
}
export interface StackState {
  rotateX: number;
  rotateZ: number;
  tilt: number; // 0..1 (quanto da inclinação isométrica está aplicada)
  scale: number; // encolhe levemente quando inclinado pra caber na viewport
  you: LayerState;
  agents: LayerState;
  kits: LayerState;
  glyph: LayerState;
  integrations: LayerState;
  ship: LayerState;
  gap: number; // px entre you e ship quando plano
}

export const TILT = { rotateX: 55, rotateZ: -38 } as const;
export const DEPTH_STEP = 80; // px por camada quando inclinado
export const TILT_SCALE = 0.82; // escala no pico da inclinação
export const FLAT_GAP = 160; // px de vão inicial

const nz = (n: number) => (n === 0 ? 0 : n); // normaliza -0
const L = (o: Partial<LayerState> = {}): LayerState => {
  const s = { x: 0, y: 0, z: 0, opacity: 1, extrude: 0, ...o };
  return {
    x: nz(s.x),
    y: nz(s.y),
    z: nz(s.z),
    opacity: nz(s.opacity),
    extrude: nz(s.extrude),
  };
};

export function stackState(pRaw: number): StackState {
  const p = clamp01(pRaw);
  const tilt = seg(p, 0.15, 0.45) * (1 - seg(p, 0.5, 0.85)); // 0 → 1 → 0
  const enter = seg(p, 0.15, 0.45); // camadas do meio deslizam pra dentro
  const flat2 = seg(p, 0.55, 0.85); // integrações aparecem
  const exit = seg(p, 0.85, 1) * 24; // assentamento final
  // níveis (de cima pra baixo): you=3, agents=2, kits/glyph=1, ship=0
  const level = (n: number) => DEPTH_STEP * n * tilt;
  const mid = (n: number): LayerState =>
    L({ x: -40 * (1 - enter), opacity: enter, z: level(n), extrude: tilt });
  return {
    rotateX: nz(TILT.rotateX * tilt),
    rotateZ: nz(TILT.rotateZ * tilt),
    tilt,
    scale: 1 - (1 - TILT_SCALE) * tilt,
    you: L({ z: level(3), extrude: tilt, y: -exit }),
    agents: mid(2),
    kits: mid(1),
    glyph: mid(1),
    integrations: L({ opacity: flat2 }),
    ship: L({ z: 0, extrude: 0, y: exit }),
    gap: FLAT_GAP * (1 - enter),
  };
}
