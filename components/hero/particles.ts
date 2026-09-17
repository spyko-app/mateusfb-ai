import * as THREE from "three";

/**
 * Pedaços compartilhados entre o hero de partículas e o preloader: sprite radial (glow.png com fallback
 * procedural), material `THREE.Points` aditivo e leitura de uma cena ditherizada (PNG preto/branco).
 */

export const GLOW_URL = "/hero/glow.png";

/** Fragment shader comum: sprite radial suave × alpha por partícula, branco aditivo. */
export const pointsFrag = /* glsl */ `
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

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`falha ao carregar ${url}`));
    img.src = url;
  });
}

/** Textura do sprite (glow.png) ou textura vazia → `hasSprite` diz ao shader se usa a procedural. */
export function createSprite(glowImg: HTMLImageElement | null): { sprite: THREE.Texture; hasSprite: boolean } {
  const sprite = glowImg ? new THREE.Texture(glowImg) : new THREE.Texture();
  if (glowImg) {
    sprite.minFilter = THREE.LinearFilter;
    sprite.magFilter = THREE.LinearFilter;
    sprite.needsUpdate = true;
  }
  return { sprite, hasSprite: !!glowImg };
}

export type PointsMaterialOptions = {
  vertexShader: string;
  sprite: THREE.Texture;
  hasSprite: boolean;
  /** tamanho base do ponto já em px de dispositivo (px CSS × dpr) */
  size: number;
  uniforms?: Record<string, THREE.IUniform>;
};

/** Material de pontos brancos aditivos com o fragment comum; o vertex vem de quem chama. */
export function createPointsMaterial({ vertexShader, sprite, hasSprite, size, uniforms = {} }: PointsMaterialOptions) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader: pointsFrag,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: size },
      uSprite: { value: sprite },
      uHasSprite: { value: hasSprite ? 1 : 0 },
      ...uniforms,
    },
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

/** Gerador determinístico (LCG) — mesma cena, mesmas partículas. */
export function lcg(seed = 1234567) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export type Field = { positions: Float32Array; seeds: Float32Array; depths: Float32Array; w: number; h: number };

/** Lê os pixels brancos da cena: posição em unidades da cena (origem no centro, y pra cima), semente e profundidade (densidade local). */
export function sampleImage(img: HTMLImageElement, maxPoints: number): Field {
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

  const keep = Math.min(1, maxPoints / Math.max(total, 1));
  const rnd = lcg();
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
