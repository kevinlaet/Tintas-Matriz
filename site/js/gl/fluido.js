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
  splat: `varying vec2 vUv; uniform sampler2D uTarget; uniform float aspect; uniform vec4 cor; uniform vec2 ponto; uniform float raio;
    void main(){ vec2 p=vUv-ponto; p.x*=aspect; float k=exp(-dot(p,p)/raio); gl_FragColor=texture2D(uTarget,vUv)+k*cor; }`,
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
    float dens(vec2 uv){ return texture2D(uDye,uv).a; }
    void main(){
      vec4 c=texture2D(uDye,vUv); float d=c.a;
      vec3 base=clamp(c.rgb/max(d,1e-4),0.0,1.0);
      float a=1.0-exp(-d*2.6);
      float dx=dens(vR)-dens(vL), dy=dens(vT)-dens(vB);
      vec3 n=normalize(vec3(-dx*0.8,-dy*0.8,length(texel)*24.0));
      vec3 L=normalize(vec3(-0.45,0.65,0.62)); vec3 V=vec3(0.0,0.0,1.0); vec3 H=normalize(L+V);
      float dif=clamp(dot(n,L)*0.5+0.62,0.4,1.12);
      float esp=pow(max(dot(n,H),0.0),70.0)*1.1 + pow(max(dot(n,H),0.0),10.0)*0.1;
      vec3 cor=base*dif*(0.8+0.2*a)+vec3(1.0,0.96,0.9)*esp*a;
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
  const conf = { simRes: 128, dyeRes: innerWidth * motor.dpr > 2000 ? 768 : 512, dissVel: 2.4, dissDye: 0.1, curl: 0.6, iter: 14, raio: 0.45 };

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
    passe(mats.splat, vel.b, { texel: tex(sim.w, sim.h), uTarget: vel.a.texture, aspect: asp, ponto: new THREE.Vector2(x, y), cor: new THREE.Vector4(dx, dy, 0, 0), raio: raio / 100 }); vel.troca();
    // cor = [r, g, b, quantidade]: a cor entra já multiplicada pela quantidade de tinta
    passe(mats.splat, dye.b, { texel: tex(tinta.w, tinta.h), uTarget: dye.a.texture, aspect: asp, ponto: new THREE.Vector2(x, y), cor: new THREE.Vector4(cor[0] * cor[3], cor[1] * cor[3], cor[2] * cor[3], cor[3]), raio: raio / 100 }); dye.troca();
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
  // cores da cartela Matriz: Amarelo Sol, Tangerina, Vermelho Cardinal, Turquesa, Verde Limão, Safira, Pavão + laranja e vermelho da marca
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const PALETA = ['#F7A600', '#41C4DC', '#ED1C24', '#AAD037', '#1F66B6', '#F6891E', '#23AE9B', '#FFF200', '#C8102E'].map(hex);
  const corDe = (i, qtd) => [...PALETA[((i % PALETA.length) + PALETA.length) % PALETA.length], qtd];
  function intro() {
    const out = [];
    for (let i = 0; i < 9; i++) {
      const x = 0.05 + i * 0.1125 + (Math.random() - 0.5) * 0.03;
      out.push({ x, y: -0.02, dx: (Math.random() - 0.5) * 50, dy: 120 + Math.random() * 90, cor: corDe(i, 1.0), raio: 2.4, atraso: 0.12 * i });
    }
    return out;
  }
  el.addEventListener('pointermove', (e) => {
    const b = el.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width, y = 1 - (e.clientY - b.top) / b.height;
    if (ultimo) {
      const dx = (x - ultimo.x) * 1600, dy = (y - ultimo.y) * 1600;
      const corAtual = Math.floor(motor.tempo / 0.7); // a cor do rastro muda devagar, passando pela cartela
      if (Math.abs(dx) + Math.abs(dy) > 0.6) pendentes.push({ x, y, dx, dy, cor: corDe(corAtual, 0.16), raio: e.pointerType === 'touch' ? 0.9 : 0.65 });
    }
    ultimo = { x, y }; vivo = motor.tempo;
  }, { passive: true });
  el.addEventListener('pointerleave', () => { ultimo = null; });
  el.addEventListener('pointerdown', (e) => {
    const b = el.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width, y = 1 - (e.clientY - b.top) / b.height;
    alternaCor++; pendentes.push({ x, y, dx: (Math.random() - 0.5) * 120, dy: 140, cor: corDe(alternaCor, 0.7), raio: 1.0 }); vivo = motor.tempo;
  });

  let tAcum = 0, proxAmbiente = 2.2, preAquecido = false, ambiente = 0;
  const api = {
    respingo(x, y, forca = 1) { pendentes.push({ x, y, dx: (Math.random() - 0.5) * 80 * forca, dy: 160 * forca, cor: corDe(alternaCor++, 0.6), raio: 1.2 * forca }); vivo = motor.tempo; acorda(); },
    vista: null,
  };
  api.vista = adicionaVista({
    el, ordem: 1, limpa: false,
    anima: () => !motor.reduz,
    desenha(dt, t, ret) {
      tamanhos(ret);
      r.setScissorTest(false);
      if (motor.reduz && !preAquecido) { // movimento reduzido: forma a poça de uma vez, sem animação
        preAquecido = true;
        pendentes.splice(0).forEach((p) => splat(p.x, p.y, p.dx, p.dy, p.cor, p.raio));
        for (let i = 0; i < 90; i++) passo(1 / 60);
      }
      const simula = !motor.reduz;
      if (simula) {
        // tinta nova sobe devagar do fundo, revezando as cores da cartela
        if (t > proxAmbiente) { proxAmbiente = t + 1.1; ambiente++; pendentes.push({ x: 0.06 + Math.random() * 0.88, y: -0.03, dx: (Math.random() - 0.5) * 40, dy: 70 + Math.random() * 50, cor: corDe(ambiente * 4, 0.42), raio: 1.8 }); }
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
