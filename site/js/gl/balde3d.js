/* =====================================================================
   BALDE 3D (Three.js)
   Corpo levemente cônico com o rótulo como textura cilíndrica, tampa com
   relevo (torneada), alça de arame, pódio com borda luminosa, sombra de
   contato e reflexo no tampo do pódio (stencil).
   ===================================================================== */
import { THREE, motor, acorda } from './motor.js';

/* Medidas por embalagem (unidades 3D). altura/raio seguem a proporção do rótulo. */
export const FORMAS = {
  '18L': { rTopo: 1.0, rBase: 0.92, altura: 2.03, alca: true, escala: 1 },
  '3.6L': { rTopo: 1.0, rBase: 0.9, altura: 2.05, alca: true, escala: 0.6 },
  '0.9L': { rTopo: 1.0, rBase: 0.94, altura: 1.55, alca: false, escala: 0.42 },
};

const cacheGeo = {};
function geometrias(tipo) {
  if (cacheGeo[tipo]) return cacheGeo[tipo];
  const f = FORMAS[tipo]; const h2 = f.altura / 2;
  const corpo = new THREE.CylinderGeometry(f.rTopo, f.rBase, f.altura, 160, 1, true, Math.PI, Math.PI * 2);
  const base = new THREE.LatheGeometry([
    new THREE.Vector2(f.rBase, -h2), new THREE.Vector2(f.rBase - 0.006, -h2 - 0.02), new THREE.Vector2(f.rBase - 0.03, -h2 - 0.04), new THREE.Vector2(0.001, -h2 - 0.045),
  ].reverse(), 96);
  const t = h2 - 0.06; // a tampa encaixa um pouco abaixo do topo do corpo
  const perfil = [
    [0.001, t + 0.205], [0.32, t + 0.205], [0.55, t + 0.2], [0.83, t + 0.2], [0.86, t + 0.215], [0.9, t + 0.24], [0.93, t + 0.25], [0.99, t + 0.252],
    [1.035, t + 0.245], [1.062, t + 0.225], [1.074, t + 0.195], [1.07, t + 0.17], [1.078, t + 0.15], [1.08, t + 0.12], [1.072, t + 0.1],
    [1.079, t + 0.08], [1.08, t + 0.045], [1.07, t + 0.02], [1.04, t + 0.005], [f.rTopo * 0.998, t + 0.004],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const tampa = new THREE.LatheGeometry(perfil.reverse(), 128);
  let alca = null, orelha = null;
  if (f.alca) {
    const yA = h2 - 0.16, a = THREE.MathUtils.degToRad(104);
    const dy = Math.cos(a), dz = -Math.sin(a);
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const th = (i / 40) * Math.PI;
      pts.push(new THREE.Vector3(1.045 * Math.cos(th), yA + 1.09 * Math.sin(th) * dy, 1.09 * Math.sin(th) * dz));
    }
    alca = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.017, 8, false);
    orelha = new THREE.CylinderGeometry(0.055, 0.055, 0.07, 20); orelha.rotateZ(Math.PI / 2);
  }
  return (cacheGeo[tipo] = { corpo, base, tampa, alca, orelha, f });
}

const matTampa = () => new THREE.MeshPhysicalMaterial({ color: 0xf4f4f1, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.45, envMapIntensity: 0.9 });
const matAlca = () => new THREE.MeshStandardMaterial({ color: 0xdcdcdc, metalness: 0.25, roughness: 0.32, envMapIntensity: 1 });

/* Material do rótulo com efeito de "impressão": uma linha de luz passa de cima
   para baixo trocando o rótulo antigo pelo novo. */
export function materialRotulo(tex) {
  const m = new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.34, clearcoat: 0.55, clearcoatRoughness: 0.22, envMapIntensity: 0.85 });
  const u = { uMapB: { value: tex }, uScan: { value: 1.2 }, uScanOn: { value: 0 } };
  m.userData.u = u;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D uMapB; uniform float uScan; uniform float uScanOn;')
      .replace('#include <map_fragment>', `#ifdef USE_MAP
  vec4 texA = texture2D( map, vMapUv );
  vec4 texB = texture2D( uMapB, vMapUv );
  float lim = uScan * 1.1 - 0.05;
  float kk = smoothstep( lim - 0.012, lim, 1.0 - vMapUv.y );
  diffuseColor *= mix( texB, texA, kk );
#endif`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
#ifdef USE_MAP
  float dl = (1.0 - vMapUv.y) - (uScan * 1.1 - 0.05);
  totalEmissiveRadiance += vec3(1.0, 0.62, 0.22) * uScanOn * exp(-dl * dl * 9000.0) * 3.0;
#endif`);
  };
  m.customProgramCacheKey = () => 'rotulo-scan';
  return m;
}

/* Troca o rótulo com o efeito de impressão (ou direto, se instantaneo) */
export function imprime(mat, novaTex, { dur = 1.1, instantaneo = false } = {}) {
  const u = mat.userData.u;
  if (instantaneo || !window.gsap || motor.reduz) {
    const velha = mat.map; mat.map = novaTex; u.uMapB.value = novaTex; u.uScan.value = 1.2; u.uScanOn.value = 0; mat.needsUpdate = true;
    if (velha && velha !== novaTex && velha.userData.descartavel) velha.dispose();
    acorda(); return;
  }
  gsap.killTweensOf(u.uScan);
  u.uMapB.value = novaTex; u.uScan.value = 0; u.uScanOn.value = 1;
  gsap.to(u.uScan, { value: 1.2, duration: dur, ease: 'power1.inOut', onUpdate: acorda, onComplete: () => {
    const velha = mat.map; mat.map = novaTex; u.uScanOn.value = 0; mat.needsUpdate = true;
    if (velha && velha !== novaTex && velha.userData.descartavel) velha.dispose();
    acorda();
  } });
}

const carregador = new THREE.TextureLoader();
const cacheTex = {};
export function texturaDe(url) {
  if (cacheTex[url]) return cacheTex[url];
  const p = new Promise((ok, erro) => carregador.load(url, (t) => { prepara(t); ok(t); }, undefined, erro));
  cacheTex[url] = p; return p;
}
export function texturaCanvas(canvas) {
  const t = new THREE.CanvasTexture(canvas); prepara(t); t.userData.descartavel = true; return t;
}
function prepara(t) {
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = motor.renderer ? Math.min(8, motor.renderer.capabilities.getMaxAnisotropy()) : 1;
  t.wrapS = THREE.RepeatWrapping;
  t.needsUpdate = true;
}
/* cor média da base do rótulo (para o fundo do balde) e cor dominante (para o fundo da prateleira) */
export function coresDaTextura(img) {
  const c = document.createElement('canvas'); c.width = 64; c.height = 24;
  const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0, 64, 24);
  const d = ctx.getImageData(0, 0, 64, 24).data;
  const media = (y0, y1) => { let r = 0, g = 0, b = 0, n = 0; for (let y = y0; y < y1; y++) for (let x = 0; x < 64; x++) { const i = (y * 64 + x) * 4; r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; } return [r / n, g / n, b / n]; };
  const hex = ([r, g, b]) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  // dominante: média das colunas laterais (fundo do rótulo), ignorando a frente com texto
  let r = 0, g = 0, b = 0, n = 0;
  for (let y = 4; y < 20; y++) for (const x of [2, 4, 6, 57, 59, 61]) { const i = (y * 64 + x) * 4; r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
  return { base: hex(media(21, 24)), dominante: hex([r / n, g / n, b / n]) };
}

/* Monta um balde (Group) com rótulo */
export function criaBalde({ tipo = '18L', textura = null, corBase = '#1a1a1a', comScan = true } = {}) {
  const g = geometrias(tipo);
  const grupo = new THREE.Group(); grupo.userData.tipo = tipo;
  const mRot = comScan ? materialRotulo(textura) : new THREE.MeshPhysicalMaterial({ map: textura, roughness: 0.34, clearcoat: 0.55, clearcoatRoughness: 0.22, envMapIntensity: 0.85 });
  const corpo = new THREE.Mesh(g.corpo, mRot); corpo.name = 'corpo';
  const base = new THREE.Mesh(g.base, new THREE.MeshPhysicalMaterial({ color: corBase, roughness: 0.4, clearcoat: 0.4 }));
  const tampa = new THREE.Mesh(g.tampa, matTampa());
  grupo.add(corpo, base, tampa);
  if (g.alca) {
    const mA = matAlca();
    const alca = new THREE.Mesh(g.alca, mA); alca.name = 'alca';
    const y = g.f.altura / 2 - 0.16;
    const o1 = new THREE.Mesh(g.orelha, mA); o1.position.set(1.0, y, 0);
    const o2 = new THREE.Mesh(g.orelha, mA); o2.position.set(-1.0, y, 0);
    grupo.add(alca, o1, o2);
  }
  grupo.userData.matRotulo = mRot; grupo.userData.matBase = base.material;
  grupo.userData.metadeAltura = g.f.altura / 2 + 0.045;
  return grupo;
}

/* Textura radial (sombra, brilho) gerada em canvas */
function radial(stops, tam = 256) {
  const c = document.createElement('canvas'); c.width = c.height = tam;
  const ctx = c.getContext('2d'); const gr = ctx.createRadialGradient(tam / 2, tam / 2, 0, tam / 2, tam / 2, tam / 2);
  stops.forEach(([o, cor]) => gr.addColorStop(o, cor));
  ctx.fillStyle = gr; ctx.fillRect(0, 0, tam, tam);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* Palco 3D completo: cena, câmera, luzes, pódio, balde, sombra e reflexo */
export function criaPalco({ reflexo = true, podio = true, raioPodio = 1.55 } = {}) {
  const cena = new THREE.Scene();
  cena.environment = motor.env;
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
  const luz = new THREE.DirectionalLight(0xfff3e6, 2.1); luz.position.set(-3, 5, 6); cena.add(luz);
  const preench = new THREE.DirectionalLight(0xffffff, 0.45); preench.position.set(4, 1.5, 5); cena.add(preench);
  const recorteL = new THREE.DirectionalLight(0xF7A600, 3.2); recorteL.position.set(-6, 2.5, -4); cena.add(recorteL);
  const recorteR = new THREE.DirectionalLight(0xE0203A, 3.0); recorteR.position.set(6, 2, -4); cena.add(recorteR);
  cena.add(new THREE.HemisphereLight(0x3a2a22, 0x0a0606, 0.6));

  const raiz = new THREE.Group(); cena.add(raiz);
  const topo = 0; // tampo do pódio em y = 0
  const partes = { cena, camera, raiz, topo, balde: null, espelho: null };

  if (podio) {
    const ped = new THREE.Group(); raiz.add(ped);
    const alt = 0.3;
    const lado = new THREE.Mesh(new THREE.CylinderGeometry(raioPodio, raioPodio * 1.03, alt, 120, 1, true),
      new THREE.MeshPhysicalMaterial({ color: 0x120d0c, roughness: 0.3, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0.15, envMapIntensity: 0.7 }));
    lado.position.y = topo - alt / 2; ped.add(lado);
    const fundo = new THREE.Mesh(new THREE.CircleGeometry(raioPodio * 1.03, 96), new THREE.MeshBasicMaterial({ color: 0x050404 }));
    fundo.rotation.x = Math.PI / 2; fundo.position.y = topo - alt; ped.add(fundo);
    // anel luminoso em degradê (laranja à esquerda, vermelho à direita)
    const anelGeo = new THREE.TorusGeometry(raioPodio, 0.014, 10, 220); anelGeo.rotateX(Math.PI / 2);
    const cores = []; const pos = anelGeo.attributes.position; const cA = new THREE.Color(0xF7A600), cM = new THREE.Color(0xEE6A0A), cB = new THREE.Color(0xC8102E);
    for (let i = 0; i < pos.count; i++) { const t = (pos.getX(i) / raioPodio + 1) / 2; const c = t < 0.5 ? cA.clone().lerp(cM, t * 2) : cM.clone().lerp(cB, (t - 0.5) * 2); cores.push(c.r * 2.2, c.g * 2.2, c.b * 2.2); }
    anelGeo.setAttribute('color', new THREE.Float32BufferAttribute(cores, 3));
    const anel = new THREE.Mesh(anelGeo, new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }));
    anel.position.y = topo + 0.002; ped.add(anel);
    const anel2 = anel.clone(); anel2.material = anel.material.clone(); anel2.material.transparent = true; anel2.material.opacity = 0.35; anel2.position.y = topo - alt; anel2.scale.setScalar(1.03); ped.add(anel2);
    // brilho no chão e halo atrás
    const brilho = new THREE.Mesh(new THREE.PlaneGeometry(raioPodio * 2.25, raioPodio * 2.25), new THREE.MeshBasicMaterial({ map: radial([[0, 'rgba(238,106,10,.55)'], [0.35, 'rgba(200,16,46,.22)'], [1, 'rgba(0,0,0,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    brilho.rotation.x = -Math.PI / 2; brilho.position.y = topo - alt - 0.01; ped.add(brilho);
    // stencil do tampo (onde o reflexo pode aparecer)
    const mascara = new THREE.Mesh(new THREE.CircleGeometry(raioPodio, 96), new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, stencilWrite: true, stencilRef: 1, stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.ReplaceStencilOp }));
    mascara.rotation.x = -Math.PI / 2; mascara.position.y = topo; mascara.renderOrder = 1; ped.add(mascara);
    // tampo de vidro escuro, por cima do reflexo
    const tampo = new THREE.Mesh(new THREE.CircleGeometry(raioPodio, 96), new THREE.MeshPhysicalMaterial({ color: 0x0d0a09, roughness: 0.18, metalness: 0.2, clearcoat: 1, transparent: true, opacity: reflexo ? 0.8 : 1, envMapIntensity: 0.8 }));
    tampo.rotation.x = -Math.PI / 2; tampo.position.y = topo + 0.001; tampo.renderOrder = 3; ped.add(tampo);
    // anéis finos no tampo
    for (const [r, o] of [[raioPodio * 0.8, 0.16], [raioPodio * 0.56, 0.1]]) {
      const rg = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.006, 160), new THREE.MeshBasicMaterial({ color: 0xF79A2A, transparent: true, opacity: o, toneMapped: false, depthWrite: false }));
      rg.rotation.x = -Math.PI / 2; rg.position.y = topo + 0.003; rg.renderOrder = 4; ped.add(rg);
    }
    // sombra de contato
    const sombra = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({ map: radial([[0, 'rgba(0,0,0,.85)'], [0.45, 'rgba(0,0,0,.4)'], [1, 'rgba(0,0,0,0)']]), transparent: true, depthWrite: false }));
    sombra.rotation.x = -Math.PI / 2; sombra.position.y = topo + 0.004; sombra.renderOrder = 5; ped.add(sombra);
    partes.sombra = sombra; partes.podio = ped;
  }
  partes.reflexo = reflexo && podio;
  return partes;
}

/* Coloca (ou troca) o balde no palco */
export function poeBalde(p, balde) {
  if (p.balde) { p.raiz.remove(p.balde); }
  if (p.espelho) { p.raiz.remove(p.espelho); p.espelho = null; }
  p.balde = balde; p.raiz.add(balde);
  if (p.reflexo) {
    const esp = balde.clone(true);
    esp.traverse((o) => {
      if (!o.isMesh) return;
      const m = o.material;
      const n = new THREE.MeshStandardMaterial({ map: m.map || null, color: m.color ? m.color.clone() : 0xffffff, roughness: 0.4, envMapIntensity: 0.6,
        stencilWrite: true, stencilRef: 1, stencilFunc: THREE.EqualStencilFunc, stencilFail: THREE.KeepStencilOp, stencilZFail: THREE.KeepStencilOp, stencilZPass: THREE.KeepStencilOp });
      if (o.name === 'corpo') n.userData.segueMapa = m;
      o.material = n; o.renderOrder = 2;
    });
    p.espelho = esp; p.raiz.add(esp);
  }
}

/* Atualiza a pose (flutuação, giro) e copia para o reflexo */
export function atualizaPose(p, { y = 0.32, giro = 0, inclinaX = 0, inclinaZ = 0, escala = 1 } = {}) {
  const b = p.balde; if (!b) return;
  const meia = b.userData.metadeAltura * escala;
  b.scale.setScalar(escala);
  b.position.set(0, p.topo + y + meia, 0);
  b.rotation.set(inclinaX, giro, inclinaZ);
  if (p.espelho) {
    const e = p.espelho;
    e.scale.set(escala, -escala, escala);
    e.position.set(0, p.topo - (y + meia), 0);
    e.rotation.set(-inclinaX, giro, -inclinaZ);
    e.traverse((o) => { if (o.isMesh && o.material.userData.segueMapa && o.material.map !== o.material.userData.segueMapa.map) { o.material.map = o.material.userData.segueMapa.map; o.material.needsUpdate = true; } });
  }
  if (p.sombra) {
    const k = THREE.MathUtils.clamp(1 - (y - 0.12) / 0.8, 0.25, 1);
    p.sombra.material.opacity = 0.35 + 0.6 * k; p.sombra.scale.setScalar(escala * (0.75 + 0.35 * k));
  }
}

/* Enquadra a câmera para o retângulo da vista */
export function enquadra(p, ret, { alturaAlvo = 3.4, centroY = 1.2, distExtra = 0, elevacao = 0.12 } = {}) {
  const asp = Math.max(0.3, ret.w / Math.max(1, ret.h));
  p.camera.aspect = asp;
  const fov = THREE.MathUtils.degToRad(p.camera.fov);
  let dist = (alturaAlvo / 2) / Math.tan(fov / 2);
  const larguraNec = 3.6; const distW = (larguraNec / 2) / (Math.tan(fov / 2) * asp);
  dist = Math.max(dist, distW) + distExtra;
  p.camera.position.set(0, centroY + dist * elevacao, dist);
  p.camera.lookAt(0, centroY, 0);
  p.camera.updateProjectionMatrix();
}

/* Controle de giro: arrastar (mouse e dedo), inércia, giro automático e giroscópio */
export class Giro {
  constructor(el, { auto = 0.25 } = {}) {
    this.el = el; this.ang = 0; this.vel = 0; this.auto = auto; this.arrasta = false; this.extra = 0;
    this.incX = 0; this.incZ = 0; this.alvoX = 0; this.alvoZ = 0; this.ultimoToque = -10;
    let x0 = 0, t0 = 0;
    el.addEventListener('pointerdown', (e) => { if (e.button > 0) return; this.arrasta = true; x0 = e.clientX; t0 = performance.now(); this.vel = 0; el.setPointerCapture?.(e.pointerId); acorda(); });
    el.addEventListener('pointermove', (e) => {
      if (!this.arrasta) return;
      const dx = e.clientX - x0; x0 = e.clientX;
      const agora = performance.now(); const dt = Math.max(8, agora - t0); t0 = agora;
      const d = (dx / Math.max(200, el.clientWidth)) * Math.PI * 2.2;
      this.ang += d; this.vel = (d / dt) * 1000; this.ultimoToque = motor.tempo; acorda();
    });
    const solta = () => { this.arrasta = false; };
    el.addEventListener('pointerup', solta); el.addEventListener('pointercancel', solta); el.addEventListener('lostpointercapture', solta);
  }
  passo(dt) {
    if (!this.arrasta) {
      this.ang += this.vel * dt; this.vel *= Math.pow(0.04, dt);
      if (Math.abs(this.vel) < 0.05 && !motor.reduz && motor.tempo - this.ultimoToque > 2.5) this.ang += this.auto * dt;
    }
    this.incX += (this.alvoX - this.incX) * Math.min(1, dt * 4);
    this.incZ += (this.alvoZ - this.incZ) * Math.min(1, dt * 4);
    return this.ang + this.extra;
  }
  ativo() { return this.arrasta || Math.abs(this.vel) > 0.05 || Math.abs(this.alvoX - this.incX) > 0.002 || (this.auto && !motor.reduz); }
}

/* Giroscópio do iPad/celular inclina o balde (precisa de permissão no iOS) */
export const giroscopio = {
  ligado: false, listeners: new Set(),
  precisaPermissao: typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function',
  async liga() {
    if (this.ligado) return true;
    try {
      if (this.precisaPermissao) { const r = await DeviceOrientationEvent.requestPermission(); if (r !== 'granted') return false; }
      addEventListener('deviceorientation', (e) => {
        if (e.gamma == null) return;
        const ix = THREE.MathUtils.clamp((e.beta - 45) / 90, -0.5, 0.5) * 0.35;
        const iz = THREE.MathUtils.clamp(e.gamma / 45, -1, 1) * 0.3;
        this.listeners.forEach((g) => { g.alvoX = ix; g.alvoZ = -iz; });
        acorda();
      });
      this.ligado = true; return true;
    } catch (err) { return false; }
  },
};
