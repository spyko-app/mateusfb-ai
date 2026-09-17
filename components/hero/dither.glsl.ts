/** Pós-processo de dither ESTOCÁSTICO temporal: cena → 1 bit (#000/#fff), 1 pixel por partícula.
 *  white = step(hash(pixel, frame), clamp(lum * uExposure)). O hash muda a cada frame (uFrame) → cintilação contínua.
 *  A leitura vem do CONTRASTE de luminância (como no xmcp.dev): núcleo quase sólido nas faces iluminadas,
 *  meio-tom nas faces em sombra, salpico só nas bordas. Fundo ≤ 4% pra o sujeito ser o que se vê. */
export const vert = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }
`;

export const frag = /* glsl */ `
precision highp float;
uniform sampler2D tScene; uniform vec2 uRes; uniform float uPixel; uniform float uFrame;
uniform float uExposure; uniform vec2 uMouse; uniform float uSpotRadius;
varying vec2 vUv;
// hash 2D com semente temporal (ruído branco por pixel, re-semeado por frame)
float hash(vec2 p, float t){
  p += t * vec2(0.1, 0.3);
  vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
void main(){
  vec2 px = floor(gl_FragCoord.xy / uPixel);
  vec2 uv = (px * uPixel + uPixel * 0.5) / uRes;
  float l = dot(texture2D(tScene, uv).rgb, vec3(.299, .587, .114));
  // "spotlight": ×1.25 num raio de uSpotRadius px em volta do cursor (queda suave)
  float dm = distance(px * uPixel, uMouse);
  l *= 1.0 + 0.25 * (1.0 - smoothstep(uSpotRadius * 0.35, uSpotRadius, dm));
  l = pow(clamp(l * uExposure, 0., 1.), 1.0);
  // vinheta larga e suave: só os ~8% externos dissolvem no preto da página
  vec2 vc = (uv - 0.5) * vec2(2.0, 2.0);
  l *= 1.0 - smoothstep(0.84, 1.0, max(abs(vc.x), abs(vc.y)));
  // ~55% dos pixels usam ruído fixo (grão estável), o resto re-sorteia a cada frame (cintilação)
  float stable = step(hash(px, 7.), 0.55);
  float n = mix(hash(px, uFrame + 1.), hash(px, 0.), stable);
  // preto puro fica preto (sem step(0,0) salpicando o fundo)
  float w = l <= 0.003 ? 0. : step(n, l);
  gl_FragColor = vec4(vec3(w), 1.);
}
`;

/** Fundo volumétrico sutil: glow radial + duas faixas de luz em "X" atrás do sujeito (≤ ~4% de cobertura após o dither). */
export const bgFrag = /* glsl */ `
precision highp float;
uniform vec2 uRes; uniform vec2 uOffset; uniform float uTime;
varying vec2 vUv;
float streak(vec2 p, vec2 dir, float width){
  float d = abs(dot(p, vec2(-dir.y, dir.x)));
  float along = dot(p, dir);
  return exp(-d * d / (width * width)) * exp(-along * along * 0.55);
}
void main(){
  vec2 p = (vUv * uRes - uRes * 0.5 - uOffset) / uRes.y;
  float r = length(p);
  float glow = 0.010 * exp(-r * r * 3.0);
  float halo = 0.002 * exp(-r * 1.8);
  float breath = 0.92 + 0.08 * sin(uTime * 0.6);
  float x = streak(p, normalize(vec2(1., 0.78)), 0.08) + streak(p, normalize(vec2(1., -0.78)), 0.08);
  float v = glow + halo + 0.012 * x * breath;
  vec2 vc = (vUv - 0.5) * vec2(2.0, 1.7);
  v *= 1.0 - smoothstep(0.45, 0.8, length(vc));
  gl_FragColor = vec4(vec3(v), 1.);
}
`;
