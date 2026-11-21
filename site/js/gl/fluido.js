/* =====================================================================
   TINTA LÍQUIDA (simulação de fluido na GPU) — topo do site
   Fluido estável (advecção, vorticidade, pressão) em render targets de
   meia precisão. Duas "tintas": laranja (canal R) e vermelha (canal G),
   exibidas com brilho especular para parecer tinta viscosa e brilhante.
   ===================================================================== */
import { THREE, motor, adicionaVista, acorda } from './motor.js';

const VS = `varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB; uniform vec2 texel;
void main(){ vUv=uv; vL=vUv-vec2(texel.x,0.0); vR=vUv+vec2(texel.x,0.0); vT=vUv+vec2(0.0,texel.y); vB=vUv-vec2(0.0,texel.y); gl_Position=vec4(position.xy,0.0,1.0); }`;
const FS = {
  splat: `varying vec2 vUv; uniform sampler2D uTarget; uniform float aspect; uniform vec3 cor; uniform vec2 ponto; uniform float raio;
    void main(){ vec2 p=vUv-ponto; p.x*=aspect; vec3 s=exp(-dot(p,p)/raio)*cor; vec3 b=texture2D(uTarget,vUv).xyz; gl_FragColor=vec4(b+s,1.0); }`,
  advec: `varying vec2 vUv; uniform sampler2D uVel; uniform sampler2D uSrc; uniform vec2 texel; uniform float dt; uniform float diss;
    void main(){ vec2 c=vUv-dt*texture2D(uVel,vUv).xy*texel; vec4 r=texture2D(uSrc,c); gl_FragColor=r/(1.0+diss*dt); }`,
  diverg: `varying vec2 vUv,vL,vR,vT,vB; uniform sampler2D uVel;
    void main(){ float L=texture2D(uVel,vL).x, R=texture2D(uVel,vR).x, T=texture2D(uVel,vT).y, B=texture2D(uVel,vB).y; vec2 C=texture2D(uVel,vUv).xy;
      if(vL.x<0.0)L=-C.x; if(vR.x>1.0)R=-C.x; if(vT.y>1.0)T=-C.y; if(vB.y<0.0)B=-C.y; gl_FragColor=vec4(0.5*(R-L+T-B),0.0,0.0,1.0); }`,
  curl: `varying vec2 vUv,vL,vR,vT,vB; uniform sampler2D uVel;
    void main(){ float L=texture2D(uVel,vL).y, R=texture2D(uVel,vR).y, T=texture2D(uVel,vT).x, B=texture2D(uVel,vB).x; gl_FragColor=vec4(0.5*(R-L-T+B),0.0,0.0,1.0); }`,
  vort: `varying vec2 vUv,vL,vR,vT,vB; uniform sampler2D uVel; uniform sampler2D uCurl; uniform float curl; uniform float dt;
    void main(){ float L=texture2D(uCurl,vL).x, R=texture2D(uCurl,vR).x, T=texture2D(uCurl,vT).x, B=texture2D(uCurl,vB).x, C=texture2D(uCurl,vUv).x;
      vec2 f=0.5*vec2(abs(T)-abs(B),abs(R)-abs(L)); f/=length(f)+0.0001; f*=curl*C; f.y*=-1.0;
      vec2 v=texture2D(uVel,vUv).xy+f*dt; v=clamp(v,-1000.0,1000.0); gl_FragColor=vec4(v,0.0,1.0); }`,
  pressao: `varying vec2 vUv,vL,vR,vT,vB; uniform sampler2D uP; uniform sampler2D uDiv;
    void main(){ float L=texture2D(uP,vL).x, R=texture2D(uP,vR).x, T=texture2D(uP,vT).x, B=texture2D(uP,vB).x; float d=texture2D(uDiv,vUv).x; gl_FragColor=vec4((L+R+B+T-d)*0.25,0.0,0.0,1.0); }`,
  grad: `varying vec2 vUv,vL,vR,vT,vB; uniform sampler2D uP; uniform sampler2D uVel;
    void main(){ float L=texture2D(uP,vL).x, R=texture2D(uP,vR).x, T=texture2D(uP,vT).x, B=texture2D(uP,vB).x; vec2 v=texture2D(uVel,vUv).xy-vec2(R-L,T-B); gl_FragColor=vec4(v,0.0,1.0); }`,
  limpa: `varying vec2 vUv; uniform sampler2D uT; uniform float valor; void main(){ gl_FragColor=valor*texture2D(uT,vUv); }`,
  tela: `varying vec2 vUv,vL,vR,vT,vB; uniform sampler2D uDye; uniform vec2 texel;
    vec3 paleta(float t){ vec3 a=vec3(0.969,0.651,0.0), m=vec3(0.933,0.416,0.039), b=vec3(0.784,0.063,0.18); return t<0.5?mix(a,m,t*2.0):mix(m,b,(t-0.5)*2.0); }
    float dens(vec2 uv){ vec3 c=texture2D(uDye,uv).rgb; return c.r+c.g; }
    void main(){
      vec3 c=texture2D(uDye,vUv).rgb; float d=c.r+c.g; float t=clamp(c.g/(d+1e-4),0.0,1.0);
      float a=1.0-exp(-d*2.2);
      float dx=dens(vR)-dens(vL), dy=dens(vT)-dens(vB);
      vec3 n=normalize(vec3(-dx*0.9,-dy*0.9,length(texel)*26.0));
      vec3 L=normalize(vec3(-0.45,0.65,0.62)); vec3 V=vec3(0.0,0.0,1.0); vec3 H=normalize(L+V);
      float dif=clamp(dot(n,L)*0.55+0.6,0.35,1.15);
      float esp=pow(max(dot(n,H),0.0),60.0)*1.25 + pow(max(dot(n,H),0.0),8.0)*0.12;
      vec3 cor=paleta(t)*dif*(0.75+0.25*a)+vec3(1.0,0.93,0.85)*esp*a;
      gl_FragColor=vec4(cor,a);
    }`,
};

function rt(w, h, tipo) {
  return new THREE.WebGLRenderTarget(w, h, { type: tipo, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping });
}
function duplo(w, h, tipo) { const o = { a: rt(w, h, tipo), b: rt(w, h, tipo), w, h, troca() { const x = this.a; this.a = this.b; this.b = x; } }; return o; }

export function suportaFluido() {
  const r = motor.renderer;
  return !!(r && r.capabilities.isWebGL2 && (r.extensions.has('EXT_color_buffer_float') || r.extensions.has('EXT_color_buffer_half_float')));
}

export function criaFluido(el) {
  if (!suportaFluido()) return null;
  const r = motor.renderer;
  const cena = new THREE.Scene(); const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)); quad.frustumCulled = false; cena.add(quad);
  const mats = {};
  for (const [k, fs] of Object.entries(FS)) {
    mats[k] = new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: fs, uniforms: { texel: { value: new THREE.Vector2() } }, depthTest: false, depthWrite: false });
  }
  mats.tela.transparent = true; mats.tela.blending = THREE.NormalBlending;
  const tipo = THREE.HalfFloatType;
  let vel, dye, pres, div, curlRT, sim = { w: 0, h: 0 }, tinta = { w: 0, h: 0 };
  const conf = { simRes: 128, dyeRes: innerWidth * motor.dpr > 2000 ? 768 : 512, dissVel: 1.6, dissDye: 0.05, curl: 2.5, iter: 18, raio: 0.45 };

  function tamanhos(ret) {
    const asp = ret.w / Math.max(1, ret.h);
    const res = (base) => (asp >= 1 ? { w: Math.round(base * asp), h: base } : { w: base, h: Math.round(base / asp) });
    const s = res(conf.simRes), d = res(conf.dyeRes);
    if (s.w === sim.w && s.h === sim.h && d.w === tinta.w && d.h === tinta.h) return;
    [vel, dye, pres].forEach((x) => x && (x.a.dispose(), x.b.dispose()));
    [div, curlRT].forEach((x) => x && x.dispose());
    sim = s; tinta = d;
    vel = duplo(s.w, s.h, tipo); pres = duplo(s.w, s.h, tipo); dye = duplo(d.w, d.h, tipo);
    div = rt(s.w, s.h, tipo); curlRT = rt(s.w, s.h, tipo);
    [vel.a, vel.b, pres.a, pres.b, dye.a, dye.b, div, curlRT].forEach((t) => { r.setRenderTarget(t); r.clear(); });
    r.setRenderTarget(null);
    pendentes.push(...intro());
  }
  function passe(mat, alvo, unis) {
    quad.material = mat;
    for (const [k, v] of Object.entries(unis)) { if (!mat.uniforms[k]) mat.uniforms[k] = { value: v }; else mat.uniforms[k].value = v; }
    r.setRenderTarget(alvo); r.render(cena, cam);
  }
  const tex = (w, h) => new THREE.Vector2(1 / w, 1 / h);
  function splat(x, y, dx, dy, cor, raio = conf.raio) {
    const asp = sim.w / sim.h;
    passe(mats.splat, vel.b, { texel: tex(sim.w, sim.h), uTarget: vel.a.texture, aspect: asp, ponto: new THREE.Vector2(x, y), cor: new THREE.Vector3(dx, dy, 0), raio: raio / 100 }); vel.troca();
    passe(mats.splat, dye.b, { texel: tex(tinta.w, tinta.h), uTarget: dye.a.texture, aspect: asp, ponto: new THREE.Vector2(x, y), cor: new THREE.Vector3(cor[0], cor[1], 0), raio: raio / 100 }); dye.troca();
  }
  function passo(dt) {
    const ts = tex(sim.w, sim.h);
    passe(mats.curl, curlRT, { texel: ts, uVel: vel.a.texture });
    passe(mats.vort, vel.b, { texel: ts, uVel: vel.a.texture, uCurl: curlRT.texture, curl: conf.curl, dt }); vel.troca();
    passe(mats.diverg, div, { texel: ts, uVel: vel.a.texture });
    passe(mats.limpa, pres.b, { texel: ts, uT: pres.a.texture, valor: 0.8 }); pres.troca();
    for (let i = 0; i < conf.iter; i++) { passe(mats.pressao, pres.b, { texel: ts, uP: pres.a.texture, uDiv: div.texture }); pres.troca(); }
    passe(mats.grad, vel.b, { texel: ts, uP: pres.a.texture, uVel: vel.a.texture }); vel.troca();
    passe(mats.advec, vel.b, { texel: ts, uVel: vel.a.texture, uSrc: vel.a.texture, dt, diss: conf.dissVel }); vel.troca();
    passe(mats.advec, dye.b, { texel: ts, uVel: vel.a.texture, uSrc: dye.a.texture, dt, diss: conf.dissDye }); dye.troca();
  }

  // entrada: mouse e toque
  const pendentes = []; let ultimo = null, alternaCor = 0, vivo = 0;
  const cores = [[0.9, 0.05], [0.25, 0.75], [0.55, 0.45]];
  function intro() {
    const out = [];
    for (let i = 0; i < 7; i++) {
      const x = 0.06 + i * 0.148 + (Math.random() - 0.5) * 0.04;
      out.push({ x, y: 0.0, dx: (Math.random() - 0.5) * 160, dy: 260 + Math.random() * 220, cor: cores[i % 3].map((c) => c * 0.55), raio: 1.6, atraso: 0.04 * i });
    }
    out.push({ x: 0.5, y: 0.12, dx: 0, dy: 520, cor: [0.45, 0.25], raio: 1.2, atraso: 0.5 });
    return out;
  }
  el.addEventListener('pointermove', (e) => {
    const b = el.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width, y = 1 - (e.clientY - b.top) / b.height;
    if (ultimo) {
      const dx = (x - ultimo.x) * 4200, dy = (y - ultimo.y) * 4200;
      if (Math.abs(dx) + Math.abs(dy) > 1) pendentes.push({ x, y, dx: dx * 0.6, dy: dy * 0.6, cor: cores[alternaCor % 3].map((c) => c * 0.22), raio: e.pointerType === 'touch' ? 0.6 : 0.42 });
    }
    ultimo = { x, y }; vivo = motor.tempo;
  }, { passive: true });
  el.addEventListener('pointerleave', () => { ultimo = null; alternaCor++; });
  el.addEventListener('pointerdown', (e) => {
    const b = el.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width, y = 1 - (e.clientY - b.top) / b.height;
    alternaCor++; pendentes.push({ x, y, dx: (Math.random() - 0.5) * 600, dy: 500, cor: cores[alternaCor % 3].map((c) => c * 0.8), raio: 0.6 }); vivo = motor.tempo;
  });

  let tAcum = 0, proxAmbiente = 2.5, preAquecido = false;
  const api = {
    respingo(x, y, forca = 1) { pendentes.push({ x, y, dx: (Math.random() - 0.5) * 500 * forca, dy: 650 * forca, cor: cores[(alternaCor++) % 3].map((c) => c * 0.7), raio: 0.7 * forca }); vivo = motor.tempo; acorda(); },
    vista: null,
  };
  api.vista = adicionaVista({
    el, ordem: 1, limpa: false,
    anima: () => !motor.reduz && (motor.tempo - vivo < 6 || pendentes.length > 0),
    desenha(dt, t, ret) {
      tamanhos(ret);
      r.setScissorTest(false);
      if (motor.reduz && !preAquecido) { // movimento reduzido: forma a poça de uma vez, sem animação
        preAquecido = true;
        pendentes.splice(0).forEach((p) => splat(p.x, p.y, p.dx, p.dy, p.cor, p.raio));
        for (let i = 0; i < 90; i++) passo(1 / 60);
      }
      const simula = !motor.reduz && (pendentes.length > 0 || motor.tempo - vivo < 6 || t < 10);
      if (simula) {
        if (!motor.reduz && t > proxAmbiente && t < 40) { proxAmbiente = t + 2.8; pendentes.push({ x: 0.1 + Math.random() * 0.8, y: 0.0, dx: (Math.random() - 0.5) * 120, dy: 220, cor: cores[Math.floor(Math.random() * 3)].map((c) => c * 0.18), raio: 1.0 }); }
        for (let i = pendentes.length - 1; i >= 0; i--) {
          const p = pendentes[i];
          if (p.atraso > 0) { p.atraso -= dt; continue; }
          splat(p.x, p.y, p.dx, p.dy, p.cor, p.raio); pendentes.splice(i, 1);
        }
        tAcum = Math.min(dt, 1 / 30); passo(motor.reduz ? 1 / 60 : tAcum);
        if (pendentes.length) vivo = motor.tempo;
      }
      // tela
      r.setRenderTarget(null);
      const H = motor.altura, yGL = H - (ret.y + ret.h);
      r.setViewport(ret.x, yGL, ret.w, ret.h); r.setScissor(ret.x, yGL, ret.w, ret.h); r.setScissorTest(true);
      quad.material = mats.tela;
      mats.tela.uniforms.texel.value.set(1 / tinta.w, 1 / tinta.h);
      if (!mats.tela.uniforms.uDye) mats.tela.uniforms.uDye = { value: null };
      mats.tela.uniforms.uDye.value = dye.a.texture;
      r.render(cena, cam);
    },
  });
  // com movimento reduzido: só forma a poça de tinta e para
  if (motor.reduz) vivo = motor.tempo;
  return api;
}
