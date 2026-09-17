/**
 * Estado da pilha da seção "Where I sit" em função do progresso de scroll.
 * Função pura: sem DOM, sem motion — testada em tests/stack-state.test.ts.
 *
 * Linha do tempo (p; 0..1 = seção sticky, 1..1.15 = saída da seção — a coluna sticky já está indo embora):
 *   0.00        plano: "You" + "Shipped" colados (vão 0)
 *   0.02–0.14   inclina (skewY −9.6° + escala .935) e abre um vão de OPEN_GAP px entre eles; extrusões aparecem
 *   0.25–0.47   agents (antes) e kits/glyph (depois, +.05) deslizam da esquerda pro vão; o vão cresce até a altura natural
 *   0.55–0.70   abre a faixa das integrações entre kits e "Shipped"
 *   0.68–1.00   as 9 células entram em cascata (esquerda → direita, ~.03 de defasagem)
 *   1.00–1.15   volta ao plano (extrusões somem) — acontece enquanto a seção sai da tela
 * Calibrado nos PNGs docs/ref/am-p*.png (antimetal.com a 1280×577).
 */
export const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
export const clamp01 = (n: number) => clamp(n, 0, 1);
export const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
export const seg = (p: number, a: number, b: number) => easeOutQuint(clamp01((p - a) / (b - a)));

export interface LayerState {
  x: number; // %
  y: number; // px
  z: number; // px (não usado na projeção 2D; mantido pela forma)
  opacity: number;
  extrude: number; // 0..1 — opacidade das linhas de extrusão
}
export interface StackState {
  rotateX: number; // mantido pela forma (sempre 0: a projeção da referência é um skew 2D)
  rotateZ: number;
  skewY: number; // graus
  tilt: number; // 0..1
  scale: number;
  you: LayerState;
  agents: LayerState;
  kits: LayerState;
  glyph: LayerState;
  integrations: LayerState; // opacity = quanto a faixa está aberta
  ship: LayerState;
  cells: number[]; // opacidade das 9 células (8 logos + "+ more")
  gap: number; // px do vão vazio entre "You" e "Shipped" antes das camadas do meio entrarem
  enter: number; // 0..1 — quanto o miolo já ocupa a altura natural
}

export const P_MAX = 1.15;
export const TILT = { skewY: -9.6, scale: 0.935 } as const;
export const OPEN_GAP = 125; // px de vão aberto na inclinação (ref. am-p0.12)
export const EXTRUDE_LEN = 60; // px das linhas de extrusão (antes do skew)
export const CELLS = 9;

const nz = (n: number) => (n === 0 ? 0 : n); // normaliza -0
const L = (o: Partial<LayerState> = {}): LayerState => {
  const s = { x: 0, y: 0, z: 0, opacity: 1, extrude: 0, ...o };
  return { x: nz(s.x), y: nz(s.y), z: nz(s.z), opacity: nz(s.opacity), extrude: nz(s.extrude) };
};

export function stackState(pRaw: number): StackState {
  const p = clamp(pRaw, 0, P_MAX);
  const tiltIn = seg(p, 0.02, 0.14);
  const tiltOut = seg(p, 1.0, P_MAX);
  const tilt = tiltIn * (1 - tiltOut);
  const enterA = seg(p, 0.25, 0.42);
  const enterK = seg(p, 0.3, 0.47);
  const intOpen = seg(p, 0.55, 0.7);
  const cells = Array.from({ length: CELLS }, (_, i) => nz(seg(p, 0.68 + i * 0.03, 0.76 + i * 0.03)));
  const mid = (e: number): LayerState => L({ x: -40 * (1 - e), opacity: e, extrude: tilt * e });
  return {
    rotateX: 0,
    rotateZ: 0,
    skewY: nz(TILT.skewY * tilt),
    tilt,
    scale: 1 - (1 - TILT.scale) * tilt,
    you: L({ extrude: tilt }),
    agents: mid(enterA),
    kits: mid(enterK),
    glyph: mid(enterK),
    integrations: L({ opacity: intOpen, extrude: tilt * intOpen }),
    ship: L({ extrude: tilt }),
    cells,
    gap: OPEN_GAP * tiltIn,
    enter: enterA,
  };
}
