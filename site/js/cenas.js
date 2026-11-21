/* =====================================================================
   CENAS 3D DO SITE (todas no mesmo renderer)
   ===================================================================== */
import { THREE, motor, adicionaVista, acorda, fotografa } from './gl/motor.js';
import { criaPalco, criaBalde, poeBalde, atualizaPose, enquadra, texturaDe, texturaCanvas, coresDaTextura, imprime, Giro, giroscopio, FORMAS } from './gl/balde3d.js';
import { criaFluido } from './gl/fluido.js';
import { rotuloMatriz, rotuloCliente, baldePlano, fontesProntas, misturar } from './rotulo.js';

const $ = (s, el = document) => el.querySelector(s);

/* ---------- TOPO: tinta + balde que emerge ---------- */
export async function cenaTopo(prod) {
  const el = $('#hero-palco');
  const fluido = criaFluido($('#inicio'));
  if (!fluido) document.documentElement.classList.add('sem-fluido');
  const p = criaPalco({ reflexo: true });
  const tex = await texturaDe(prod.rotulo + '-2048.webp');
  const cores = coresDaTextura(tex.image);
  const balde = criaBalde({ tipo: '18L', textura: tex, corBase: cores.base });
  poeBalde(p, balde);
  const giro = new Giro(el, { auto: 0.3 });
  giroscopio.listeners.add(giro);
  const estado = { subida: motor.reduz ? 0 : -4.2 };
  adicionaVista({
    el, ordem: 2,
    anima: () => !motor.reduz || giro.ativo(),
    desenha(dt, t, ret) {
      enquadra(p, ret, { alturaAlvo: 4.0, centroY: 1.0 });
      p.raiz.position.y = estado.subida;
      atualizaPose(p, { y: 0.34 + (motor.reduz ? 0 : Math.sin(t * 1.1) * 0.06), giro: giro.passo(dt) - 0.35, inclinaX: giro.incX, inclinaZ: giro.incZ });
      motor.renderer.render(p.cena, p.camera);
    },
  });
  return {
    giro, fluido,
    entra() {
      if (motor.reduz || !window.gsap) { estado.subida = 0; acorda(); return; }
      gsap.to(estado, { subida: 0, duration: 2.1, ease: 'expo.out', delay: 0.15, onUpdate: acorda });
      if (fluido) [0.35, 0.55, 0.8].forEach((d, i) => setTimeout(() => fluido.respingo(0.42 + i * 0.08, 0.08, 1.2), d * 1000));
    },
  };
}

/* ---------- EMBORRACHADA: gira 360° com a rolagem ---------- */
export async function cenaEmborrachada(prod) {
  const el = $('#emb-palco');
  const p = criaPalco({ reflexo: true });
  const tex = await texturaDe(prod.rotulo + '-2048.webp');
  const balde = criaBalde({ tipo: '18L', textura: tex, corBase: coresDaTextura(tex.image).base });
  poeBalde(p, balde);
  const giro = new Giro(el, { auto: 0 });
  giroscopio.listeners.add(giro);
  adicionaVista({
    el, ordem: 2,
    anima: () => !motor.reduz,
    desenha(dt, t, ret) {
      enquadra(p, ret, { alturaAlvo: 3.6, centroY: 1.15 });
      atualizaPose(p, { y: 0.3 + (motor.reduz ? 0 : Math.sin(t * 1.2 + 1) * 0.05), giro: giro.passo(dt), inclinaX: giro.incX, inclinaZ: giro.incZ });
      motor.renderer.render(p.cena, p.camera);
    },
  });
  return giro; // giro.extra = ângulo controlado pela rolagem
}

/* ---------- PRATELEIRA 3D ---------- */
export async function cenaPrateleira(produtos, { aoMudar, aoAbrir }) {
  const el = $('#prat-gl');
  const cena = new THREE.Scene(); cena.environment = motor.env;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
  cena.fog = new THREE.Fog(0x0a0807, 9, 22);
  cena.add(new THREE.HemisphereLight(0x3a2a22, 0x0a0606, 0.7));
  const key = new THREE.DirectionalLight(0xfff3e6, 2.2); key.position.set(-3, 6, 7); cena.add(key);
  const rL = new THREE.DirectionalLight(0xF7A600, 2.6); rL.position.set(-6, 3, -4); cena.add(rL);
  const rR = new THREE.DirectionalLight(0xE0203A, 2.4); rR.position.set(6, 3, -4); cena.add(rR);
  // fundo que muda de cor conforme o produto ativo
  const fundoMat = new THREE.ShaderMaterial({
    depthWrite: false, fog: false,
    uniforms: { uCor: { value: new THREE.Color(0x2a1408) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 uCor; varying vec2 vUv;\nvoid main(){ float d=distance(vUv,vec2(0.5,0.42)); vec3 c=mix(uCor,vec3(0.039,0.039,0.039),smoothstep(0.05,0.62,d)); gl_FragColor=vec4(c,1.0);\n#include <colorspace_fragment>\n}',
  });
  const fundo = new THREE.Mesh(new THREE.PlaneGeometry(90, 50), fundoMat); fundo.position.z = -14; cena.add(fundo);
  const ESP = 3.1, N = produtos.length;
  // prateleira: tábua escura com borda luminosa
  const largura = (N - 1) * ESP + 8;
  const tabua = new THREE.Mesh(new THREE.BoxGeometry(largura, 0.16, 2.6), new THREE.MeshPhysicalMaterial({ color: 0x0e0b0a, roughness: 0.38, metalness: 0.1, clearcoat: 0.35, clearcoatRoughness: 0.3, envMapIntensity: 0.12 }));
  tabua.position.set((N - 1) * ESP / 2, -0.08, 0); cena.add(tabua);
  const bordaGeo = new THREE.BoxGeometry(largura, 0.025, 0.025);
  const bc = []; const pos = bordaGeo.attributes.position; const cA = new THREE.Color(0xF7A600), cM = new THREE.Color(0xEE6A0A), cB = new THREE.Color(0xC8102E);
  for (let i = 0; i < pos.count; i++) { const t = (pos.getX(i) / largura) + 0.5; const c = t < 0.5 ? cA.clone().lerp(cM, t * 2) : cM.clone().lerp(cB, (t - 0.5) * 2); bc.push(c.r * 2, c.g * 2, c.b * 2); }
  bordaGeo.setAttribute('color', new THREE.Float32BufferAttribute(bc, 3));
  const borda = new THREE.Mesh(bordaGeo, new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false, fog: false, transparent: true, opacity: 0.75 }));
  borda.position.set((N - 1) * ESP / 2, 0, 1.3); cena.add(borda);

  await fontesProntas;
  const itens = await Promise.all(produtos.map(async (prod, i) => {
    let tex, cores;
    if (prod.rotulo) {
      tex = await texturaDe(prod.rotulo + '-1024.webp'); cores = coresDaTextura(tex.image);
    } else {
      const cv = rotuloMatriz(prod, { W: 1024 }); tex = texturaCanvas(cv); cores = { base: misturar(prod.gerado.cor, '#000000', 0.4), dominante: prod.gerado.cor };
    }
    const b = criaBalde({ tipo: '18L', textura: tex, corBase: cores.base, comScan: false });
    b.position.set(i * ESP, b.userData.metadeAltura, 0);
    b.userData.indice = i;
    b.traverse((o) => { o.userData.indice = i; });
    cena.add(b);
    return { b, cor: new THREE.Color(cores.dominante), prod };
  }));

  const estado = { alvo: 0, atual: 0, ativo: -1, giroAtivo: 0 };
  const corTmp = new THREE.Color();
  const ray = new THREE.Raycaster(); const ptr = new THREE.Vector2();
  let ultimoRet = { x: 0, y: 0, w: 1, h: 1 };
  let px0 = 0, py0 = 0, t0 = 0;
  el.addEventListener('pointerdown', (e) => { px0 = e.clientX; py0 = e.clientY; t0 = performance.now(); });
  el.addEventListener('pointerup', (e) => {
    if (Math.hypot(e.clientX - px0, e.clientY - py0) > 10 || performance.now() - t0 > 600) return;
    const r = ultimoRet;
    ptr.set(((e.clientX - r.x) / r.w) * 2 - 1, -((e.clientY - r.y) / r.h) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    const hit = ray.intersectObjects(itens.map((x) => x.b), true)[0];
    if (!hit) return;
    const i = hit.object.userData.indice;
    if (i === Math.round(estado.atual)) aoAbrir(itens[i].prod); else api.irPara(i);
  });

  const api = {
    N, estado, itens,
    defineProgresso(p) { estado.alvo = p * (N - 1); acorda(); },
    irPara: (i) => {},
    fotografa(prod) { // imagem do balde para o detalhe do produto
      const it = itens.find((x) => x.prod.id === prod.id); if (!it) return null;
      const p = criaPalco({ reflexo: false, podio: false });
      const b = it.b.clone(true); p.raiz.add(b); b.position.set(0, b.userData.metadeAltura, 0); b.rotation.set(0, -0.25, 0);
      p.camera.fov = 24; enquadra(p, { w: 520, h: 600 }, { alturaAlvo: 2.9, centroY: 1.15, elevacao: 0.1 });
      return fotografa(p.cena, p.camera, 520, 600);
    },
  };
  adicionaVista({
    el, ordem: 2, limpa: true,
    anima: () => true,
    desenha(dt, t, ret) {
      ultimoRet = ret;
      estado.atual += (estado.alvo - estado.atual) * Math.min(1, dt * 6);
      const ativo = Math.round(estado.atual);
      if (ativo !== estado.ativo) { estado.ativo = ativo; aoMudar(itens[ativo].prod, ativo); }
      camera.aspect = ret.w / ret.h;
      const estreito = camera.aspect < 0.9;
      camera.fov = estreito ? 38 : 30;
      const dist = estreito ? 15.5 : 12.4;
      const deslocX = camera.aspect > 1.2 ? 2.3 : 0; // abre espaço para o texto à esquerda
      const cx = estado.atual * ESP - deslocX;
      camera.position.set(cx, estreito ? 2.6 : 2.4, dist);
      camera.lookAt(cx, estreito ? 1.45 : 1.55, 0);
      fundo.position.x = cx;
      camera.updateProjectionMatrix();
      itens.forEach((it, i) => {
        const d = i - estado.atual; const ad = Math.abs(d);
        const k = Math.max(0, 1 - ad);
        const b = it.b;
        const e = 0.82 + 0.3 * k;
        b.scale.setScalar(e);
        b.position.set(i * ESP, b.userData.metadeAltura * e + 0.15 * k, 1.25 * k);
        if (i === ativo && !motor.reduz) estado.giroAtivo += dt;
        // o ativo gira de um lado para o outro, sempre voltando o rótulo para a frente
        b.rotation.y = i === ativo ? Math.sin(estado.giroAtivo * 0.7) * 0.75 * k - 0.3 * (1 - k) : -0.42 * Math.sign(d) * Math.min(1, ad);
        b.visible = ad < 5;
      });
      if (!itens[ativo]) return;
      corTmp.copy(itens[ativo].cor).lerp(new THREE.Color(0x000000), 0.55);
      fundoMat.uniforms.uCor.value.lerp(corTmp, Math.min(1, dt * 3));
      motor.renderer.render(cena, camera);
    },
  });
  return api;
}

/* ---------- SUA MARCA: rótulo ao vivo ---------- */
export async function cenaMarca() {
  const el = $('#marca-palco');
  const p = criaPalco({ reflexo: true });
  await fontesProntas;
  const giro = new Giro(el, { auto: 0.22 });
  giroscopio.listeners.add(giro);
  let tipo = '18L', escalaAnim = { v: 1 };
  let balde = null;
  function monta(dados) {
    tipo = dados.tamanho;
    const tex = texturaCanvas(rotuloCliente({ ...dados, W: 2048 }));
    balde = criaBalde({ tipo, textura: tex, corBase: misturar(dados.cor, '#000000', 0.45) });
    poeBalde(p, balde);
  }
  adicionaVista({
    el, ordem: 2,
    anima: () => !motor.reduz || giro.ativo(),
    desenha(dt, t, ret) {
      enquadra(p, ret, { alturaAlvo: 3.7, centroY: 1.2 });
      const esc = FORMAS[tipo].escala * escalaAnim.v;
      atualizaPose(p, { y: 0.3 + (motor.reduz ? 0 : Math.sin(t * 1.05) * 0.05), giro: giro.passo(dt) - 0.2, inclinaX: giro.incX, inclinaZ: giro.incZ, escala: esc });
      motor.renderer.render(p.cena, p.camera);
    },
  });
  return {
    giro,
    atualiza(dados, { imprimir = true } = {}) {
      if (!balde || dados.tamanho !== tipo) {
        monta(dados);
        if (window.gsap && !motor.reduz) gsap.fromTo(escalaAnim, { v: 0.75 }, { v: 1, duration: 0.9, ease: 'back.out(1.6)', onUpdate: acorda });
        acorda(); return;
      }
      const tex = texturaCanvas(rotuloCliente({ ...dados, W: 2048 }));
      p.balde.userData.matBase.color.set(misturar(dados.cor, '#000000', 0.45));
      imprime(p.balde.userData.matRotulo, tex, { instantaneo: !imprimir });
    },
  };
}

/* ---------- Sem WebGL: versões 2D ---------- */
export function marcaPlana(dados) {
  const cv = $('#marca-plano');
  const img = baldePlano(rotuloCliente({ ...dados, W: 1024 }), { L: 520, tamanho: dados.tamanho });
  cv.width = img.width; cv.height = img.height;
  cv.getContext('2d').drawImage(img, 0, 0);
}
export function imagemGerada(prod) {
  return baldePlano(rotuloMatriz(prod, { W: 1024 }), { L: 520 }).toDataURL('image/png');
}
