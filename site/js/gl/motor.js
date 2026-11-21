/* =====================================================================
   MOTOR WebGL ÚNICO
   Um só renderer (um canvas fixo atrás da página) desenha todas as
   "vistas": partículas, tinta líquida do topo e os baldes 3D de cada seção.
   - cada vista ocupa o retângulo do seu elemento na página (scissor)
   - vistas fora da tela não são desenhadas (IntersectionObserver)
   - retângulos são medidos só quando a página rola/muda de tamanho
   - o laço para sozinho quando nada se mexe e volta ao primeiro sinal
   ===================================================================== */
import * as THREE from '../../vendor/three.module.min.js';
import { RoomEnvironment } from '../../vendor/RoomEnvironment.js';

export { THREE };

export const motor = {
  ok: false, renderer: null, canvas: null, vistas: [], env: null,
  dpr: 1, largura: 0, altura: 0, rodando: false, sujo: true,
  ultimaAcao: performance.now(), relogio: new THREE.Clock(false), tempo: 0,
  reduz: matchMedia('(prefers-reduced-motion: reduce)').matches,
  pausado: false,
};

export function suportaWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

export function iniciaMotor(canvas) {
  if (!suportaWebGL()) return false;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, stencil: true, powerPreference: 'high-performance' });
  } catch (e) { console.warn('WebGL indisponível:', e); return false; }
  const tv = matchMedia('(hover: hover) and (pointer: fine)').matches && screen.width >= 1900;
  motor.dpr = Math.min(window.devicePixelRatio || 1, tv ? 1.25 : 1.5);
  renderer.setPixelRatio(motor.dpr);
  renderer.autoClear = false;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.localClippingEnabled = true;
  renderer.setClearColor(0x000000, 0);
  motor.renderer = renderer; motor.canvas = canvas;
  const pm = new THREE.PMREMGenerator(renderer);
  motor.env = pm.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  pm.dispose();
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); motor.ok = false; document.documentElement.classList.add('sem-webgl'); });
  ajusta();
  addEventListener('resize', () => { ajusta(); marcaSujo(); acorda(); });
  addEventListener('scroll', () => { marcaSujo(); acorda(); }, { passive: true });
  ['pointermove', 'pointerdown', 'keydown', 'touchstart', 'wheel'].forEach((ev) => addEventListener(ev, () => acorda(), { passive: true }));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) acorda(); });
  motor.ok = true;
  return true;
}

function ajusta() {
  const w = document.documentElement.clientWidth, h = window.innerHeight;
  motor.largura = w; motor.altura = h;
  motor.renderer.setSize(w, h, false);
  motor.canvas.style.width = w + 'px'; motor.canvas.style.height = h + 'px';
  motor.vistas.forEach((v) => v.aoRedimensionar && v.aoRedimensionar());
}

export function marcaSujo() { motor.sujo = true; }

/* Registra uma vista.
   el: elemento cujo retângulo a vista ocupa (null = tela inteira)
   desenha(dt, t, ret): desenha a vista
   anima(): true enquanto a vista precisa de quadros mesmo sem interação */
export function adicionaVista(vista) {
  const v = Object.assign({ ordem: 0, visivel: !vista.el, ret: { x: 0, y: 0, w: 0, h: 0 }, anima: () => false }, vista);
  motor.vistas.push(v); motor.vistas.sort((a, b) => a.ordem - b.ordem);
  if (v.el) {
    const io = new IntersectionObserver((ents) => ents.forEach((e) => { v.visivel = e.isIntersecting; if (v.visivel) { marcaSujo(); acorda(); } }), { rootMargin: '80px 0px' });
    io.observe(v.el); v.io = io;
  }
  marcaSujo(); acorda();
  return v;
}

function mede() {
  motor.vistas.forEach((v) => {
    if (!v.el) { v.ret = { x: 0, y: 0, w: motor.largura, h: motor.altura }; return; }
    if (!v.visivel) return;
    const r = v.el.getBoundingClientRect();
    v.ret = { x: r.left, y: r.top, w: r.width, h: r.height };
  });
  motor.sujo = false;
}

export function acorda() {
  motor.ultimaAcao = performance.now();
  if (!motor.ok || motor.rodando || motor.pausado || document.hidden) return;
  motor.rodando = true;
  motor.relogio.start();
  requestAnimationFrame(quadro);
}

function quadro() {
  if (!motor.ok || document.hidden || motor.pausado) { motor.rodando = false; return; }
  const dt = Math.min(motor.relogio.getDelta(), 1 / 8);
  motor.tempo += dt;
  if (motor.sujo) mede();
  const r = motor.renderer, H = motor.altura;
  r.setScissorTest(false); r.setViewport(0, 0, motor.largura, H); r.clear(true, true, true);
  r.setScissorTest(true);
  let precisa = false;
  for (const v of motor.vistas) {
    if (!v.visivel || v.desligada) continue;
    const { x, y, w, h } = v.ret;
    if (w < 2 || h < 2 || y > H || y + h < 0 || x > motor.largura || x + w < 0) continue;
    const yGL = H - (y + h);
    r.setViewport(x, yGL, w, h); r.setScissor(x, yGL, w, h);
    if (v.limpa) r.clear(true, true, true); else r.clearDepth(), r.clearStencil();
    v.desenha(dt, motor.tempo, v.ret);
    if (v.anima()) precisa = true;
  }
  const ocioso = performance.now() - motor.ultimaAcao > 7000;
  if (precisa || !ocioso) requestAnimationFrame(quadro);
  else { motor.rodando = false; motor.relogio.stop(); }
}

/* Foto de um objeto 3D (para o detalhe do produto e o modo sem WebGL ao vivo) */
export function fotografa(cena, camera, wf = 520, hf = 600) {
  const r = motor.renderer; const w = wf * 2, h = hf * 2; // desenha em 2x e reduz (antisserrilhado)
  const rt = new THREE.WebGLRenderTarget(w, h, { colorSpace: THREE.SRGBColorSpace });
  const antes = { alvo: r.getRenderTarget(), scissor: r.getScissorTest() };
  camera.aspect = w / h; camera.updateProjectionMatrix();
  r.setRenderTarget(rt); r.setScissorTest(false); r.setViewport(0, 0, w, h);
  r.setClearColor(0x000000, 0); r.clear(true, true, true);
  r.render(cena, camera);
  const px = new Uint8Array(w * h * 4);
  r.readRenderTargetPixels(rt, 0, 0, w, h, px);
  r.setRenderTarget(antes.alvo); r.setScissorTest(antes.scissor);
  rt.dispose();
  const c2 = document.createElement('canvas'); c2.width = w; c2.height = h;
  const ctx2 = c2.getContext('2d'); const img = ctx2.createImageData(w, h);
  for (let y = 0; y < h; y++) img.data.set(px.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4);
  ctx2.putImageData(img, 0, 0);
  const c = document.createElement('canvas'); c.width = wf; c.height = hf;
  const ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(c2, 0, 0, wf, hf);
  acorda();
  return c;
}
