/** Pós-processo Bayer 4×4: cena → 1 bit (#000/#fff). uPixel = tamanho do "pixel" do dither.
 *  +1/32 no limiar: preto puro (l=0) fica preto (sem step(0,0)=1 salpicando o fundo). */
export const vert = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }
`;

export const frag = /* glsl */ `
precision highp float; uniform sampler2D tScene; uniform vec2 uRes; uniform float uPixel; varying vec2 vUv;
const mat4 B = mat4(0.,8.,2.,10., 12.,4.,14.,6., 3.,11.,1.,9., 15.,7.,13.,5.)/16.;
void main(){ vec2 px = floor(gl_FragCoord.xy/uPixel); vec2 uv = (px*uPixel+uPixel*0.5)/uRes; float l = dot(texture2D(tScene, uv).rgb, vec3(.299,.587,.114));
  int x = int(mod(px.x,4.)); int y = int(mod(px.y,4.)); float t = B[x][y] + 1./32.; gl_FragColor = vec4(vec3(step(t, l)),1.); }
`;
