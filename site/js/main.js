/* =====================================================================
   TINTAS MATRIZ — interações e animações
   ===================================================================== */
import { CONFIG, CONTADORES, LINHAS } from './dados.js';
import { palcoHTML, montaPalcos } from './palco.js';
montaPalcos();

const raiz = document.documentElement;
raiz.classList.add('js');
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mouseFino = matchMedia('(hover: hover) and (pointer: fine)').matches;
const temGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
if (temGsap) gsap.registerPlugin(ScrollTrigger);

/* ---------------- dados na página ---------------- */
$('#ano').textContent = new Date().getFullYear();

/* ---------------- abertura ---------------- */
queueMicrotask(() => { montaContadores(); montaContato(); montaLinha(); });
const barra = $('.loader-bar i');
const essenciais = [$('.hero-palco .balde')];
let prontos = 0;
const marca = () => { prontos++; barra.style.transform = `scaleX(${0.15 + 0.85 * (prontos / (essenciais.length + 1))})`; };
const esperaImg = (img) => new Promise((ok) => { if (img.complete && img.naturalWidth) return ok(); img.addEventListener('load', ok, { once: true }); img.addEventListener('error', ok, { once: true }); });
Promise.race([
  Promise.all([...essenciais.map((i) => esperaImg(i).then(marca)), (document.fonts ? document.fonts.ready : Promise.resolve()).then(marca)]),
  new Promise((ok) => setTimeout(ok, 4500)),
]).then(() => {
  barra.style.transform = 'scaleX(1)';
  setTimeout(() => {
    $('#loader').classList.add('fim');
    document.body.classList.remove('carregando');
    abertura();
    preCarrega();
  }, 350);
});

function preCarrega() {
  const urls = LINHAS.flatMap((l) => l.produtos.map((p) => p.img)).filter(Boolean).concat('img/baldes/sua-marca-neutro.webp');
  const vai = () => urls.forEach((u) => { const i = new Image(); i.decoding = 'async'; i.src = u; });
  ('requestIdleCallback' in window) ? requestIdleCallback(vai, { timeout: 2000 }) : setTimeout(vai, 800);
}

/* ---------------- partículas (Three.js) ---------------- */
if (!reduz) {
  import('./particulas.js').then((m) => m.iniciar($('#particulas'))).catch((e) => console.warn('Partículas desligadas:', e));
}

/* ---------------- cursor ---------------- */
if (mouseFino && !reduz) {
  raiz.classList.add('cursor-on');
  const cur = $('.cursor'), anel = $('.cursor-anel'), ponto = $('.cursor-ponto');
  let x = innerWidth / 2, y = innerHeight / 2, ax = x, ay = y;
  addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; cur.classList.remove('oculto'); }, { passive: true });
  document.addEventListener('pointerleave', () => cur.classList.add('oculto'));
  const alvo = 'a, button, .prod, [role="tab"]';
  document.addEventListener('pointerover', (e) => { if (e.target.closest(alvo)) cur.classList.add('ativo'); });
  document.addEventListener('pointerout', (e) => { if (e.target.closest(alvo)) cur.classList.remove('ativo'); });
  (function anda() {
    ax += (x - ax) * 0.18; ay += (y - ay) * 0.18;
    ponto.style.transform = `translate3d(${x}px,${y}px,0)`;
    anel.style.transform = `translate3d(${ax}px,${ay}px,0)`;
    requestAnimationFrame(anda);
  })();
}

/* ---------------- inclinação 3D dos baldes (mouse) ---------------- */
/* Cada palco tem: inclinação pelo mouse + giro automático lento (data-gira)
   + giro extra controlado pela rolagem (t.extra). A luz de recorte acompanha:
   o lado virado para a luz laranja (esquerda) ou vermelha (direita) acende mais. */
const tilts = new Set();
const porPalco = new Map();
function registraTilt(palco) {
  const el = palco.querySelector('.tilt');
  if (!el) return;
  const t = { palco, el, max: parseFloat(palco.dataset.tilt || 10), gira: parseFloat(palco.dataset.gira || 0), rx: 0, ry: 0, alvoX: 0, alvoY: 0, extra: 0 };
  tilts.add(t); porPalco.set(palco, t);
  return t;
}
$$('[data-tilt]').forEach(registraTilt);
function luzDoPalco(t, ry) {
  const k = Math.max(-1, Math.min(1, ry / 14));
  t.palco.style.setProperty('--rl', (0.82 - 0.5 * k).toFixed(3));
  t.palco.style.setProperty('--rr', (0.66 + 0.5 * k).toFixed(3));
}
if (!reduz) {
  let px = 0.5, py = 0.5, mexeu = false;
  addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; mexeu = true; }, { passive: true });
  const t0 = performance.now();
  (function giraTilt(agora) {
    const seg = ((agora || t0) - t0) / 1000;
    tilts.forEach((t) => {
      const r = t.palco.getBoundingClientRect();
      if (r.bottom < -50 || r.top > innerHeight + 50 || !r.width) return;
      if (mexeu) {
        const dx = (px - (r.left + r.width / 2)) / Math.max(innerWidth / 2, 1);
        const dy = (py - (r.top + r.height / 2)) / Math.max(innerHeight / 2, 1);
        t.alvoY = Math.max(-1, Math.min(1, dx)) * t.max;
        t.alvoX = -Math.max(-1, Math.min(1, dy)) * t.max * 0.5;
      }
      t.rx += (t.alvoX - t.rx) * 0.07; t.ry += (t.alvoY - t.ry) * 0.07;
      const auto = t.gira ? t.gira * Math.sin(seg * Math.PI * 2 / 12) : 0;
      const ry = t.ry + auto + t.extra;
      t.el.style.transform = `rotateX(${t.rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${(auto * 0.08).toFixed(2)}deg)`;
      luzDoPalco(t, ry);
    });
    requestAnimationFrame(giraTilt);
  })();
}

/* ---------------- navegação ---------------- */
const nav = $('.nav');
const secoes = $$('[data-secao]');
const pontos = $('.pontos');
secoes.forEach((s) => {
  const a = document.createElement('a');
  a.href = '#' + s.id; a.setAttribute('aria-label', s.dataset.secao);
  a.innerHTML = `<span>${s.dataset.secao}</span>`;
  pontos.appendChild(a);
});
function ativa(id) {
  $$('.nav-links a, .pontos a').forEach((a) => a.classList.toggle('ativo', a.getAttribute('href') === '#' + id));
}
addEventListener('scroll', () => nav.classList.toggle('solida', scrollY > 40), { passive: true });

$('#tela-cheia').addEventListener('click', alternaTelaCheia);
function alternaTelaCheia() {
  const d = document;
  if (!d.fullscreenElement && !d.webkitFullscreenElement) (raiz.requestFullscreen || raiz.webkitRequestFullscreen)?.call(raiz);
  else (d.exitFullscreen || d.webkitExitFullscreen)?.call(d);
}

/* ---------------- animações de rolagem ---------------- */
function abertura() {
  if (!temGsap || reduz) { $$('[data-revela],[data-revela-grupo]>*').forEach((e) => { e.style.opacity = 1; e.style.transform = 'none'; e.style.filter = 'none'; }); iniciaRolagem(); return; }
  // título palavra por palavra
  const titulo = $('.hero-titulo');
  $$('.hl', titulo).forEach((hl) => {
    const nos = [...hl.childNodes]; hl.textContent = '';
    nos.forEach((n) => {
      if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach((p) => {
        if (!p) return;
        if (/^\s+$/.test(p)) hl.appendChild(document.createTextNode(' '));
        else { const s = document.createElement('span'); s.className = 'ch'; s.textContent = p; hl.appendChild(s); }
      });
      else { n.classList.add('ch'); hl.appendChild(n); }
    });
  });
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from('.hero-sobre', { y: 20, opacity: 0, duration: 1.2 })
    .from('.hero-titulo .ch', { yPercent: 70, opacity: 0, filter: 'blur(14px)', duration: 1.6, stagger: 0.09 }, 0.1)
    .from('.hero-palco', { y: 140, scale: 0.72, opacity: 0, duration: 2.2 }, 0.25)
    .from('.hero-palco .ped', { scale: 0.6, opacity: 0, transformOrigin: '50% 40%', duration: 2 }, 0.45)
    .from('.hero-palco .feixe', { opacity: 0, duration: 2.4, ease: 'power2.out' }, 0.9)
    .from('.hero-legenda, .rolar', { y: 20, opacity: 0, duration: 1.2, stagger: 0.12 }, 1.1)
    .from('.nav', { autoAlpha: 0, duration: 1.4, ease: 'power2.out' }, 0.8);
  iniciaRolagem();
}

function iniciaRolagem() {
  if (!temGsap) return;
  // barra de progresso
  gsap.to('.progresso i', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
  // pins primeiro (as posições das outras animações dependem deles)
  if (!reduz) { destaque(); suaMarca(); }
  // seção ativa
  secoes.forEach((s) => ScrollTrigger.create({ trigger: s, start: 'top 55%', end: 'bottom 55%', onToggle: (st) => st.isActive && ativa(s.id) }));
  if (reduz) { $('#replay').addEventListener('click', () => aplicaMarca(1)); passos.forEach((l) => l.classList.add('on')); aplicaMarca(1); $$('.dif').forEach((d) => d.classList.add('vis')); return; }

  // hero sai de cena devagar
  gsap.to('.hero-palco', { yPercent: -12, scale: 0.86, opacity: 0.25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero-titulo', { yPercent: -60, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: '60% top', scrub: true } });

  // revelações simples
  ScrollTrigger.batch('[data-revela]', { start: 'top 88%', once: true, onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.3, ease: 'expo.out', stagger: 0.1 }) });
  $$('[data-revela-grupo]').forEach((g) => ScrollTrigger.create({ trigger: g, start: 'top 88%', once: true, onEnter: () => gsap.to(g.children, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out', stagger: 0.09 }) }));

  // frase da fábrica, palavra por palavra
  const frase = $('[data-palavras]');
  frase.innerHTML = frase.textContent.trim().split(/\s+/).map((p) => `<span class="p">${p}</span>`).join(' ');
  gsap.to($$('.p', frase), { opacity: 1, stagger: 0.12, ease: 'none', scrollTrigger: { trigger: frase, start: 'top 85%', end: 'bottom 45%', scrub: 0.6 } });

  // contadores
  $$('.contador b[data-valor]').forEach((b) => {
    const fim = parseFloat(b.dataset.valor), pre = b.dataset.pre || '', suf = b.dataset.suf || '';
    const o = { v: 0 };
    ScrollTrigger.create({ trigger: b, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: fim, duration: 2.4, ease: 'power3.out', onUpdate: () => { b.textContent = pre + Math.round(o.v).toLocaleString('pt-BR') + suf; } }) });
  });

  diferenciais();
  ScrollTrigger.refresh();
}

/* ---------- 3. produto principal ---------- */
function destaque() {
  const mm = gsap.matchMedia();
  const giroDestaque = porPalco.get($('.destaque-palco')) || { extra: 0 };
  $('.destaque-palco .brilho')?.style.setProperty('animation', 'none');
  const contas = $$('#destaque [data-conta]');
  const contaAte = (p) => contas.forEach((s) => { s.textContent = Math.round(parseFloat(s.dataset.conta) * p); });
  mm.add('(min-width: 1001px) and (min-height: 560px)', () => {
    contaAte(0);
    gsap.from('.destaque-titulo > *', { y: 50, opacity: 0, filter: 'blur(8px)', duration: 1.3, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '#destaque', start: 'top 70%' } });
    gsap.from('.destaque-palco', { y: 120, scale: 0.8, opacity: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '#destaque', start: 'top 70%' } });
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.destaque-pin', start: 'top top', end: '+=220%', pin: true, scrub: 0.8, anticipatePin: 1 } });
    tl.fromTo(giroDestaque, { extra: -12 }, { extra: 12, ease: 'none', duration: 1 }, 0)
      .fromTo('.destaque-palco .corpo', { scale: 0.9 }, { scale: 1.04, ease: 'none', duration: 1 }, 0)
      .fromTo('.destaque-palco .brilho', { backgroundPosition: '130% 0' }, { backgroundPosition: '-30% 0', ease: 'none', duration: 1 }, 0)
      .from('.b1', { x: -60, opacity: 0, duration: 0.14 }, 0.12)
      .from('.b2', { x: 60, opacity: 0, duration: 0.14 }, 0.28)
      .from('.b3', { x: -60, opacity: 0, duration: 0.14 }, 0.44)
      .from('.b4', { x: 60, opacity: 0, duration: 0.14 }, 0.6)
      .from('.destaque-dados > *', { y: 40, opacity: 0, stagger: 0.06, duration: 0.16 }, 0.62)
      .to({ p: 0 }, { p: 1, duration: 0.22, ease: 'power2.out', onUpdate() { contaAte(this.targets()[0].p); } }, 0.66);
    return () => contaAte(1);
  });
  mm.add('(max-width: 1000px), (max-height: 559px)', () => {
    gsap.from('.destaque-titulo > *, .beneficio, .destaque-dados > *', { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '#destaque', start: 'top 75%' } });
    const o = { p: 0 }; contaAte(0);
    ScrollTrigger.create({ trigger: '.destaque-dados', start: 'top 90%', once: true, onEnter: () => gsap.to(o, { p: 1, duration: 2, ease: 'power3.out', onUpdate: () => contaAte(o.p) }) });
    gsap.fromTo(giroDestaque, { extra: -10 }, { extra: 10, ease: 'none', scrollTrigger: { trigger: '.destaque-centro', start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}

/* ---------- 5. sua marca ---------- */
const transforma = $('.transforma'), scan = $('.scan'), visual = $('.marca-visual'), passos = $$('.passos li');
function aplicaMarca(p) { // p: 0 = neutro, 1 = Matriz
  transforma.style.setProperty('--p', ((1 - p) * 100).toFixed(2));
  scan.style.opacity = p > 0.01 && p < 0.99 ? 1 : 0;
  visual.classList.toggle('feito', p > 0.6);
}
aplicaMarca(0);
function suaMarca() {
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px) and (min-height: 560px)', () => {
    const o = { p: 0 };
    gsap.from('.marca-texto > :not(.passos), .marca-visual', { y: 50, opacity: 0, filter: 'blur(8px)', duration: 1.3, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '#sua-marca', start: 'top 70%' } });
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.marca-pin', start: 'top top', end: '+=170%', pin: true, scrub: 0.8, anticipatePin: 1 } });
    passos.forEach((li, i) => tl.add(() => passos.forEach((l, j) => l.classList.toggle('on', j <= i)), 0.1 + i * 0.12));
    tl.add(() => passos.forEach((l) => l.classList.remove('on')), 0.02);
    tl.to(o, { p: 1, duration: 0.45, ease: 'power1.inOut', onUpdate: () => aplicaMarca(o.p) }, 0.42);
    tl.to({}, { duration: 0.12 });
  });
  mm.add('(max-width: 900px), (max-height: 559px)', () => {
    passos.forEach((l) => l.classList.add('on'));
    ScrollTrigger.create({ trigger: '.marca-palco', start: 'top 70%', once: true, onEnter: () => tocaMarca() });
  });
  $('#replay').addEventListener('click', tocaMarca);
}
function tocaMarca() {
  const o = { p: 0 }; aplicaMarca(0);
  gsap.to(o, { p: 1, duration: 2.4, ease: 'power2.inOut', delay: 0.4, onUpdate: () => aplicaMarca(o.p) });
}

/* ---------- 6. diferenciais ---------- */
function diferenciais() {
  $$('.dif .d').forEach((p) => { try { p.style.setProperty('--l', Math.ceil(p.getTotalLength() + 2)); } catch (e) { /* elemento sem comprimento */ } });
  $$('.dif').forEach((d) => { d.style.opacity = 0; d.style.transform = 'translateY(50px)'; });
  ScrollTrigger.batch('.dif', { start: 'top 88%', once: true, onEnter: (els) => {
    gsap.to(els, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12, clearProps: 'transform' });
    els.forEach((el, i) => setTimeout(() => el.classList.add('vis'), 150 + i * 140));
  } });
}

/* ---------------- 2. contadores ---------------- */
function montaContadores() {
  $('#contadores').innerHTML = CONTADORES.map((c) => {
    const v = String(c.valor || '').replace(/\D/g, '');
    return `<div class="contador" data-revela>${v
      ? `<b data-valor="${v}" data-pre="${esc(c.prefixo)}" data-suf="${esc(c.sufixo)}">${esc(c.prefixo)}${reduz ? Number(v).toLocaleString('pt-BR') : 0}${esc(c.sufixo)}</b>`
      : '<b class="falta">[NÚMERO]</b>'}<span>${esc(c.rotulo)}</span></div>`;
  }).join('');
}

/* ---------------- 4. linha completa ---------------- */
const ICONES = {
  brilho: '<svg viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/><circle cx="12" cy="12" r="2.2"/></svg>',
  gota: '<svg viewBox="0 0 24 24"><path d="M12 3C8 9 6 12 6 15a6 6 0 0 0 12 0c0-3-2-6-6-12Z"/><path d="M9.5 16a2.6 2.6 0 0 0 2.5 2"/></svg>',
  massa: '<svg viewBox="0 0 24 24"><path d="M4 18h16"/><path d="M6 18 9 9h9l-3 9"/><path d="M12 9V5h3"/></svg>',
  rolo: '<svg viewBox="0 0 24 24"><rect x="4" y="3" width="13" height="6" rx="1.5"/><path d="M17 6h3v5h-8v3"/><rect x="10.5" y="14" width="3" height="7" rx="1"/></svg>',
  textura: '<svg viewBox="0 0 24 24"><path d="M3 7c3-3 6 3 9 0s6 3 9 0"/><path d="M3 12c3-3 6 3 9 0s6 3 9 0"/><path d="M3 17c3-3 6 3 9 0s6 3 9 0"/></svg>',
};
const todos = new Map();
LINHAS.forEach((l) => l.produtos.forEach((p) => todos.set(p.id, { ...p, linha: l.nome })));

function montaLinha() {
  const abas = $('.abas');
  abas.innerHTML = '<span class="aba-marca" aria-hidden="true"></span>' + LINHAS.map((l, i) =>
    `<button class="aba" role="tab" id="aba-${l.id}" aria-controls="grade" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-linha="${l.id}">${l.nome}</button>`).join('');
  abas.addEventListener('click', (e) => { const b = e.target.closest('.aba'); if (b) escolheLinha(b.dataset.linha, true); });
  abas.addEventListener('keydown', (e) => {
    const lista = $$('.aba', abas); const i = lista.indexOf(document.activeElement);
    if (i < 0) return;
    let n = null;
    if (e.key === 'ArrowRight') n = (i + 1) % lista.length;
    if (e.key === 'ArrowLeft') n = (i - 1 + lista.length) % lista.length;
    if (n !== null) { e.preventDefault(); e.stopPropagation(); lista[n].focus(); escolheLinha(lista[n].dataset.linha, true); }
  });
  addEventListener('resize', posicionaMarcaAba);
  document.fonts?.ready.then(posicionaMarcaAba);
  escolheLinha(LINHAS[0].id, false);
  $('#grade').addEventListener('click', (e) => { const c = e.target.closest('.prod'); if (c) abreModal(c.dataset.id, c); });
}
function posicionaMarcaAba() {
  const ativa = $('.aba[aria-selected="true"]'), m = $('.aba-marca');
  if (!ativa || !m) return;
  m.style.width = ativa.offsetWidth + 'px';
  m.style.height = ativa.offsetHeight + 'px';
  m.style.transform = `translate(${ativa.offsetLeft}px, ${ativa.offsetTop}px)`;
  const abas = ativa.parentElement;
  if (abas.scrollWidth > abas.clientWidth) abas.scrollTo({ left: ativa.offsetLeft - (abas.clientWidth - ativa.offsetWidth) / 2, behavior: 'smooth' });
}
let trocando = false;
function escolheLinha(id, animar) {
  if (trocando) return;
  const linha = LINHAS.find((l) => l.id === id);
  $$('.aba').forEach((b) => { const s = b.dataset.linha === id; b.setAttribute('aria-selected', s); b.tabIndex = s ? 0 : -1; });
  posicionaMarcaAba();
  $('.linha-resumo').textContent = linha.resumo;
  const grade = $('#grade');
  const desenha = () => {
    grade.setAttribute('aria-labelledby', 'aba-' + id);
    grade.innerHTML = linha.produtos.map((p, i) => cartao(p, i)).join('');
    if (temGsap && !reduz) {
      gsap.fromTo($$('.prod', grade), { y: 70, opacity: 0, rotateX: -18, filter: 'blur(8px)' }, { y: 0, opacity: 1, rotateX: 0, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out', stagger: 0.07, clearProps: 'transform,filter' });
    }
  };
  if (animar && temGsap && !reduz && grade.children.length) {
    trocando = true;
    gsap.to($$('.prod', grade), { y: -30, opacity: 0, duration: 0.3, ease: 'power2.in', stagger: 0.025, onComplete: () => { trocando = false; desenha(); } });
  } else desenha();
}
function cartao(p, i) {
  const visual = `<div class="palco">${palcoHTML({ src: p.img, icone: ICONES[p.icone] || ICONES.gota, mini: true, atraso: (-i * 0.8).toFixed(1), alt: esc(p.nome) })}</div>`;
  const r = p.rend && p.rend.length ? p.rend[0] : (p.emb || []).join(' · ');
  return `<button class="prod${p.destaque ? ' estrela' : ''}" type="button" data-id="${p.id}" aria-label="${esc(p.nome)}: ver detalhes">
    <div class="prod-img">${visual}</div>
    <p class="prod-selo">${esc(p.selo || '')}</p>
    <h3>${esc(p.nome)}</h3>
    <div class="prod-mais"><div><p>${esc(p.curta)}</p><p class="r">${esc(r)}</p></div></div>
  </button>`;
}

/* ---------- detalhe do produto ---------- */
const modal = $('#modal');
let voltaFoco = null, tiltModal = null;
function abreModal(id, origem) {
  const p = todos.get(id); if (!p) return;
  voltaFoco = origem || document.activeElement;
  $('#modal-linha').textContent = p.linha;
  $('#modal-nome').textContent = p.nome;
  $('#modal-selo').textContent = p.selo || '';
  $('#modal-selo').hidden = !p.selo;
  $('#modal-desc').textContent = p.desc;
  const palcoM = $('#modal-palco');
  palcoM.innerHTML = palcoHTML({ src: p.img, icone: ICONES[p.icone] || ICONES.gota, alt: esc(p.nome), brilho: !!p.img });
  const lista = (t, itens, obs) => `<h4>${t}</h4><ul>${itens.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>${obs ? `<p class="obs">${esc(obs)}</p>` : ''}`;
  $('#modal-rend').innerHTML = p.rend && p.rend.length ? lista('Rendimento', p.rend, p.obs) : '<h4>Rendimento</h4><ul><li><mark>[A DEFINIR]</mark></li></ul>';
  $('#modal-emb').innerHTML = p.emb && p.emb.length ? lista('Embalagens', p.emb) : '';
  $('#modal-cores').innerHTML = p.cores ? `<h4>Cores</h4><ul>${p.cores.map(([n, c]) => `<li><i style="--c:${c === 'transparent' ? 'rgba(255,255,255,.08)' : c}"></i>${esc(n)}</li>`).join('')}</ul>` : '';
  $('#modal-cores').classList.add('modal-cores');
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  if (tiltModal) tilts.delete(tiltModal);
  tiltModal = registraTilt(palcoM);
  if (temGsap && !reduz) {
    gsap.fromTo('.modal-fundo', { opacity: 0 }, { opacity: 1, duration: 0.5 });
    gsap.fromTo('.modal-caixa', { y: 60, scale: 0.94, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.9, ease: 'expo.out' });
    gsap.fromTo('#modal-palco .corpo', { y: 80, scale: 0.8, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 1.4, ease: 'expo.out', delay: 0.1 });
    gsap.fromTo('.modal-info > *', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.05, delay: 0.15 });
  }
  $('.modal-fechar').focus({ preventScroll: true });
}
function fechaModal() {
  if (modal.hidden) return;
  const fim = () => { modal.hidden = true; document.body.style.overflow = ''; voltaFoco?.focus?.({ preventScroll: true }); };
  if (temGsap && !reduz) gsap.to('.modal-caixa, .modal-fundo', { opacity: 0, duration: 0.3, onComplete: fim });
  else fim();
}
modal.addEventListener('click', (e) => { if (e.target.closest('[data-fechar]')) fechaModal(); });

/* ---------------- 7. contato ---------------- */
function montaContato() {
  const num = String(CONFIG.whatsapp || '').replace(/\D/g, '');
  const linkWhats = num ? `https://wa.me/${num}?text=${encodeURIComponent(CONFIG.whatsappTexto || '')}` : '';
  const btn = $('#btn-whats');
  if (linkWhats) btn.href = linkWhats;
  else { btn.classList.add('sem'); btn.removeAttribute('target'); btn.href = '#contato'; btn.title = 'Número do WhatsApp: [A DEFINIR]'; }
  const falta = '<mark>[A DEFINIR]</mark>';
  const fone = String(CONFIG.telefone || '');
  const insta = String(CONFIG.instagram || '').replace(/^@/, '');
  const itens = [
    ['WhatsApp', num ? `<a href="${linkWhats}" target="_blank" rel="noopener">${esc(formataFone(num))}</a>` : falta],
    ['Telefone', fone ? `<a href="tel:+55${fone.replace(/\D/g, '')}">${esc(fone)}</a>` : falta],
    ['Instagram', insta ? `<a href="https://instagram.com/${encodeURIComponent(insta)}" target="_blank" rel="noopener">@${esc(insta)}</a>` : falta],
    ['Endereço', CONFIG.endereco ? `<p>${esc(CONFIG.endereco)}</p>` : falta],
  ];
  $('#contatos').innerHTML = itens.map(([t, v]) => `<li><small>${t}</small>${v.startsWith('<mark') ? `<p>${v}</p>` : v}</li>`).join('');
  // QR code
  const pagina = location.protocol.startsWith('http') ? location.origin + location.pathname : '';
  const alvo = CONFIG.qrLink || linkWhats || pagina;
  if (alvo && typeof window.qrcode === 'function') {
    const q = qrcode(0, 'M'); q.addData(alvo); q.make();
    $('#qr').innerHTML = q.createSvgTag({ cellSize: 6, margin: 0, scalable: true });
    if (!CONFIG.qrLink && linkWhats) { $('#qr-titulo').textContent = 'Fale pelo WhatsApp'; $('#qr-texto').textContent = 'Aponte a câmera do celular para o código.'; }
    else if (CONFIG.qrLink) { $('#qr-titulo').textContent = 'Aponte a câmera'; $('#qr-texto').textContent = 'e abra o link no celular.'; }
  } else {
    $('#qr').innerHTML = '<p style="color:#111;font-weight:700;padding:40px 0">QR code: [A DEFINIR]</p>';
  }
}
function formataFone(n) {
  const d = n.replace(/^55/, '');
  return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d.length === 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` : n;
}
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

/* ---------------- teclado (apresentação na TV) ---------------- */
function paradas() {
  const lista = secoes.map((s) => s.getBoundingClientRect().top + scrollY);
  if (temGsap) ScrollTrigger.getAll().forEach((st) => { if (st.pin) { const d = st.end - st.start; [0.34, 0.67, 1].forEach((f) => lista.push(st.start + d * f)); } });
  return [...new Set(lista.map((v) => Math.round(v)))].sort((a, b) => a - b);
}
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') return fechaModal();
  if (!modal.hidden) return;
  const alvo = e.target;
  if (alvo.closest && alvo.closest('input, textarea, [role="tab"]')) return;
  if (e.key === 'f' || e.key === 'F') { alternaTelaCheia(); return; }
  const prox = ['ArrowDown', 'PageDown'].includes(e.key) || (e.key === ' ' && alvo === document.body && !e.shiftKey);
  const ant = ['ArrowUp', 'PageUp'].includes(e.key) || (e.key === ' ' && alvo === document.body && e.shiftKey);
  if (!prox && !ant) return;
  e.preventDefault();
  const y = scrollY, ps = paradas();
  const destino = prox ? ps.find((p) => p > y + 8) : [...ps].reverse().find((p) => p < y - 8);
  if (destino !== undefined) scrollTo({ top: destino, behavior: reduz ? 'auto' : 'smooth' });
});

/* links internos com rolagem suave */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href').slice(1);
  const alvo = id && document.getElementById(id);
  if (!alvo) return;
  e.preventDefault();
  scrollTo({ top: alvo.getBoundingClientRect().top + scrollY, behavior: reduz ? 'auto' : 'smooth' });
});
