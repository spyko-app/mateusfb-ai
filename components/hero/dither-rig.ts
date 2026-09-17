import * as THREE from "three";
import { bgFrag, frag, vert } from "./dither.glsl";

/** Cursor: `x/y` normalizados na janela (0..1), `cx/cy` em px do canvas (origem embaixo-esquerda, como gl_FragCoord; -9999 = fora). */
export type DitherMouse = { x: number; y: number; cx: number; cy: number };

export type DitherRig = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** grupo que recebe a cena do chamador (e o parallax, se houver) */
  world: THREE.Group;
  lights: { key: THREE.PointLight; fill: THREE.PointLight; rim: THREE.PointLight };
  /** unidades de mundo por px do canvas na profundidade do sujeito (definido no resize) */
  unitsPerPx: number;
  /** move o "spotlight" do dither (px do canvas) */
  setSpot: (x: number, y: number) => void;
  /** deslocamento do fundo volumétrico (px) */
  setBgOffset: (x: number, y: number) => void;
  size: { w: number; h: number };
};

export type DitherBuild = (
  scene: THREE.Scene,
  T: typeof THREE,
  rig: DitherRig,
) => {
  /** chamado a cada frame; `t` em segundos desde o mount */
  update?: (t: number, mouse: DitherMouse) => void;
  dispose?: () => void;
  /** objeto usado pra enquadrar a câmera (default: `rig.world`) */
  fit?: THREE.Object3D;
};

export type DitherRigOptions = {
  build: DitherBuild;
  /** tamanho em px CSS: função (pra seguir o host) ou fixo */
  size: (host: HTMLElement) => { w: number; h: number };
  /** pixel ratio do renderer (1 = partícula 1px CSS, 2 = partícula meia-px) */
  dpr?: number;
  /** exposição do tone mapping antes do limiar (hero = 1.9) */
  exposure?: number;
  /** pinta o glow radial + "X" de luz atrás do sujeito */
  background?: boolean;
  /** raio (px do canvas) do spotlight que segue o cursor; 0 desliga */
  spotRadius?: number;
  /** margem do enquadramento (0..1; 0.7 = sujeito ocupa 70% da menor dimensão) */
  fitMargin?: number;
  /** folga extra (unidades) na altura do enquadramento */
  fitPadY?: number;
  fov?: number;
  /** escuta o mouse na janela inteira (hero) ou só sobre o canvas */
  mouseScope?: "window" | "host";
};

const KEY_BASE = new THREE.Vector3(-2.4, 3.2, 2.6);

/**
 * Monta renderer + cena + luzes (as do hero) + pós-processo de dither estocástico num host,
 * com loop pausado fora da tela / aba oculta e `dispose()` completo. Quem chama só descreve a cena em `build`.
 */
export function createDitherRig(host: HTMLElement, opts: DitherRigOptions): () => void {
  const {
    dpr = 1,
    exposure = 1.9,
    background = true,
    spotRadius = 160,
    fitMargin = 0.7,
    fitPadY = 0,
    fov = 35,
    mouseScope = "window",
  } = opts;

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "low-power" });
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 1);
  renderer.autoClear = false;
  renderer.domElement.style.imageRendering = "pixelated";
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.06);
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);

  // key (frente, alto-esquerda, forte, queda larga) + fill suave da direita + rim por trás (arestas acendem)
  const key = new THREE.PointLight(0xffffff, 9, 0, 1);
  key.position.copy(KEY_BASE);
  const fill = new THREE.PointLight(0xffffff, 3.5, 0, 1);
  fill.position.set(3.2, 0.6, 2.4);
  const rim = new THREE.PointLight(0xffffff, 9, 0, 1);
  rim.position.set(1.2, 1.4, -3.4);
  scene.add(key, fill, rim, new THREE.AmbientLight(0xffffff, 0.1));

  const world = new THREE.Group();
  scene.add(world);

  const target = new THREE.WebGLRenderTarget(1, 1, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
  const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quadGeo = new THREE.PlaneGeometry(2, 2);

  const bgScene = new THREE.Scene();
  const bgMat = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: bgFrag,
    uniforms: { uRes: { value: new THREE.Vector2(1, 1) }, uOffset: { value: new THREE.Vector2(0, 0) }, uTime: { value: 0 } },
    depthTest: false,
    depthWrite: false,
  });
  bgScene.add(new THREE.Mesh(quadGeo, bgMat));

  const quadScene = new THREE.Scene();
  const ditherMat = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: {
      tScene: { value: target.texture },
      uRes: { value: new THREE.Vector2(1, 1) },
      uPixel: { value: 1 },
      uFrame: { value: 0 },
      uExposure: { value: exposure },
      uMouse: { value: new THREE.Vector2(-9999, -9999) },
      uSpotRadius: { value: Math.max(spotRadius, 0.001) },
    },
    depthTest: false,
    depthWrite: false,
  });
  quadScene.add(new THREE.Mesh(quadGeo, ditherMat));

  const rig: DitherRig = {
    renderer,
    scene,
    camera,
    world,
    lights: { key, fill, rim },
    unitsPerPx: 0.01,
    setSpot: (x, y) => ditherMat.uniforms.uMouse.value.set(x * dpr, y * dpr),
    setBgOffset: (x, y) => bgMat.uniforms.uOffset.value.set(x * dpr, y * dpr),
    size: { w: 1, h: 1 },
  };

  const built = opts.build(scene, THREE, rig);
  const fitObj = built.fit ?? world;

  const bbox = new THREE.Box3().setFromObject(fitObj);
  const bboxSize = new THREE.Vector3();
  bbox.getSize(bboxSize);
  const bboxCenter = new THREE.Vector3();
  bbox.getCenter(bboxCenter);
  const fitHeight = bboxSize.y + fitPadY;
  const fitWidth = bboxSize.x;

  const resize = () => {
    const { w, h } = opts.size(host);
    if (w < 1 || h < 1) return;
    rig.size = { w, h };
    renderer.setSize(w, h, true);
    target.setSize(Math.round(w * dpr), Math.round(h * dpr));
    ditherMat.uniforms.uRes.value.set(w * dpr, h * dpr);
    bgMat.uniforms.uRes.value.set(w * dpr, h * dpr);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    const vFov = (camera.fov * Math.PI) / 180;
    const distForHeight = fitHeight / fitMargin / (2 * Math.tan(vFov / 2));
    const distForWidth = fitWidth / fitMargin / (2 * Math.tan(vFov / 2) * camera.aspect);
    const dist = Math.max(distForHeight, distForWidth);
    camera.position.set(bboxCenter.x, bboxCenter.y, bboxCenter.z + dist);
    camera.lookAt(bboxCenter);
    rig.unitsPerPx = (2 * dist * Math.tan(vFov / 2)) / h;
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  const mouse: DitherMouse = { x: 0.5, y: 0.5, cx: -9999, cy: -9999 };
  const onMove = (e: MouseEvent) => {
    mouse.x = e.clientX / window.innerWidth;
    mouse.y = e.clientY / window.innerHeight;
    const r = renderer.domElement.getBoundingClientRect();
    mouse.cx = e.clientX - r.left;
    mouse.cy = r.bottom - e.clientY;
  };
  const onLeave = () => {
    mouse.cx = -9999;
    mouse.cy = -9999;
  };
  const mouseTarget: EventTarget = mouseScope === "window" ? window : host;
  mouseTarget.addEventListener("pointermove", onMove as EventListener, { passive: true });
  if (mouseScope === "host") host.addEventListener("pointerleave", onLeave);

  let visible = true;
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) schedule();
  });
  io.observe(host);
  const onVis = () => schedule();
  document.addEventListener("visibilitychange", onVis);

  let raf = 0;
  let frameN = 0;
  const t0 = performance.now();

  const frame = () => {
    raf = 0;
    if (document.hidden || !visible) return;
    const now = performance.now();
    frameN++;
    built.update?.((now - t0) / 1000, mouse);
    bgMat.uniforms.uTime.value = (now - t0) / 1000;
    ditherMat.uniforms.uFrame.value = frameN % 4096;

    renderer.setRenderTarget(target);
    renderer.clear();
    if (background) renderer.render(bgScene, quadCam);
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
    mouseTarget.removeEventListener("pointermove", onMove as EventListener);
    if (mouseScope === "host") host.removeEventListener("pointerleave", onLeave);
    document.removeEventListener("visibilitychange", onVis);
    built.dispose?.();
    quadGeo.dispose();
    ditherMat.dispose();
    bgMat.dispose();
    target.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
}
