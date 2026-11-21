/* =====================================================================
   TINTAS MATRIZ — orquestra o site
   ===================================================================== */
import { CONFIG, CONTADORES, LINHAS, PRODUTOS, SUA_MARCA, NOTA_CORES } from './dados.js';
import { iniciaMotor, motor, acorda } from './gl/motor.js';
import { criaParticulas } from './gl/particulas.js';
import { giroscopio } from './gl/balde3d.js';
import { cenaTopo, cenaEmborrachada, cenaPrateleira, cenaMarca, marcaPlana, imagemGerada } from './cenas.js';
import { palcoHTML, montaPalcos } from './palco.js';
import { criaSimulador } from './simulador.js';
import { criaPlanta, criaRegua, criaAntesDepois, criaOdor } from './demos.js';
import { ligaSom, plop, clique, som } from './som.js';
import { fontesProntas } from './rotulo.js';

const raiz = document.documentElement;
raiz.classList.add('js');
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mouseFino = matchMedia('(hover: hover) and (pointer: fine)').matches;
const toque = matchMedia('(hover: none)').matches || navigator.maxTouchPoints > 0;
const temGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
if (temGsap) gsap.registerPlugin(ScrollTrigger);
const REUNIAO = !!CONFIG.modoReuniao;
const falta = (txt = '[A DEFINIR]') => (REUNIAO ? '' : `<mark>${txt}</mark>`);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const produto = (id) => PRODUTOS.find((p) => p.id === id);

/* ---------------- motor 3D (ou modo 2D) ---------------- */
const gl = iniciaMotor($('#gl'));
if (!gl) { raiz.classList.add('sem-webgl'); montaPalcos(); }
$('#ano').textContent = new Date().getFullYear();

/* ---------------- dados na página ---------------- */
function montaContadores() {
  const vis = CONTADORES.map((c) => ({ ...c, v: String(c.valor || '').replace(/\D/g, '') })).filter((c) => c.v || !REUNIAO);
  const el = $('#contadores');
  el.style.setProperty('--n', Math.max(1, vis.length));
  el.innerHTML = vis.map((c) => `<div class="contador" data-revela>${c.v
    ? `<b data-valor="${c.v}" data-pre="${esc(c.prefixo)}" data-suf="${esc(c.sufixo)}">${esc(c.prefixo)}${reduz ? Number(c.v).toLocaleString('pt-BR') : 0}${esc(c.sufixo)}</b>`
    : '<b class="falta">[NÚMERO]</b>'}<span>${esc(c.rotulo)}</span></div>`).join('');
}
function formataFone(n) { const d = n.replace(/^55/, ''); return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d.length === 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` : n; }
function montaContato() {
  const num = String(CONFIG.whatsapp || '').replace(/\D/g, '');
  const linkWhats = num ? `https://wa.me/${num}?text=${encodeURIComponent(CONFIG.whatsappTexto || '')}` : '';
  const btn = $('#btn-whats');
  if (linkWhats) btn.href = linkWhats; else if (REUNIAO) btn.hidden = true; else { btn.removeAttribute('target'); btn.href = '#contato'; }
  const fone = String(CONFIG.telefone || ''); const insta = String(CONFIG.instagram || '').replace(/^@/, '');
  const itens = [
    ['WhatsApp', num ? `<a href="${linkWhats}" target="_blank" rel="noopener">${esc(formataFone(num))}</a>` : ''],
    ['Instagram', insta ? `<a href="https://instagram.com/${encodeURIComponent(insta)}" target="_blank" rel="noopener">@${esc(insta)}</a>` : ''],
    ['Telefone', fone ? `<a href="tel:+55${fone.replace(/\D/g, '')}">${esc(fone)}</a>` : ''],
    ['Endereço', CONFIG.endereco ? `<p>${esc(CONFIG.endereco)}</p>` : ''],
  ].filter(([, v]) => v || !REUNIAO);
  $('#contatos').innerHTML = itens.map(([t, v]) => `<li><small>${t}</small>${v || `<p>${falta()}</p>`}</li>`).join('');
  const pagina = location.protocol.startsWith('http') ? location.origin + location.pathname : '';
  const alvo = CONFIG.qrLink || linkWhats || pagina;
  if (alvo && typeof window.qrcode === 'function') {
    const q = qrcode(0, 'M'); q.addData(alvo); q.make();
    $('#qr').innerHTML = q.createSvgTag({ cellSize: 6, margin: 0, scalable: true });
    if (CONFIG.qrLink) { $('#qr-titulo').textContent = 'Aponte a câmera'; $('#qr-texto').textContent = 'e abra o link no celular.'; }
    else if (!linkWhats) { $('#qr-titulo').textContent = 'Abra este site no celular'; }
  } else if (REUNIAO) $('#qr-card').hidden = true;
  else $('#qr').innerHTML = '<p style="color:#111;font-weight:700;padding:40px 0">QR code: [A DEFINIR]</p>';
}
function montaCondicoes() {
  const it = [['Pedido mínimo', SUA_MARCA.pedidoMinimo], ['Prazo de produção', SUA_MARCA.prazoProducao]].filter(([, v]) => v || !REUNIAO);
  $('#marca-condicoes').innerHTML = it.map(([t, v]) => `<li>${t}: ${v ? esc(v) : falta()}</li>`).join('');
}
const EMB = produto('protecao-emborrachada');
$('#emb-cores').innerHTML = EMB.cores.map(([n, c]) => `<li><i style="--c:${c}"></i>${n}</li>`).join('');
$$('.nota-cores').forEach((n) => { n.textContent = NOTA_CORES; });
montaContadores(); montaContato(); montaCondicoes();

/* ---------------- tipografia que pinta ---------------- */
function preparaTitulo(el) {
  el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
  const quebra = (no, grad) => {
    const frag = document.createDocumentFragment();
    no.textContent.split(/(\s+)/).forEach((p) => {
      if (!p) return;
      if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
      const pal = document.createElement('span'); pal.className = 'pal'; pal.setAttribute('aria-hidden', 'true');
      if (grad) { const w = document.createElement('span'); w.className = 'le tinta'; w.textContent = p; pal.appendChild(w); }
      else [...p].forEach((ch) => { const l = document.createElement('span'); l.className = 'le'; l.textContent = ch; pal.appendChild(l); });
      frag.appendChild(pal);
    });
    return frag;
  };
  const percorre = (pai) => {
    [...pai.childNodes].forEach((n) => {
      if (n.nodeType === 3) pai.replaceChild(quebra(n, false), n);
      else if (n.nodeType === 1 && n.classList.contains('grad')) { n.classList.remove('grad'); n.replaceChildren(quebra(n, true)); }
      else if (n.nodeType === 1) percorre(n);
    });
  };
  percorre(el);
}
$$('[data-pinta]').forEach(preparaTitulo);
function revelaTitulo(el, { atraso = 0 } = {}) {
  if (!temGsap || reduz) { el.classList.add('pronto'); $$('.tinta', el).forEach((t) => t.style.setProperty('--enche', '100%')); return; }
  el.classList.add('pronto');
  gsap.fromTo($$('.le', el), { yPercent: 105 }, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.022, delay: atraso });
}

/* ---------------- abertura ---------------- */
let topo = null, emb = null, prat = null, marca3d = null;
const barra = $('.loader-bar i');
const passo = (k) => { barra.style.transform = `scaleX(${Math.min(1, k)})`; };
const tarefas = [];
if (gl) {
  criaParticulas();
  tarefas.push(cenaTopo(EMB).then((t) => { topo = t; passo(0.6); }));
  tarefas.push(cenaEmborrachada(EMB).then((g) => { emb = g; passo(0.75); }));
}
tarefas.push(fontesProntas.then(() => passo(0.4)));
Promise.race([Promise.all(tarefas), new Promise((ok) => setTimeout(ok, 6000))]).catch((e) => console.warn(e)).then(() => {
  passo(1);
  setTimeout(() => {
    $('#loader').classList.add('fim'); document.body.classList.remove('carregando');
    abertura();
    iniciaSecoes().catch((e) => console.error('Erro ao montar seções:', e));
  }, 280);
});

function abertura() {
  revelaTitulo($('.hero-titulo'), { atraso: 0.15 });
  const tinta = $('.hero-titulo .tinta');
  if (temGsap && !reduz) {
    gsap.from('.hero-sobre, .hero-rodape', { y: 16, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, delay: 0.3 });
    gsap.from('.nav', { autoAlpha: 0, duration: 1.4, delay: 0.6 });
    if (tinta) gsap.fromTo(tinta, { '--enche': '0%' }, { '--enche': '100%', duration: 1.6, ease: 'power2.inOut', delay: 0.9 });
  } else if (tinta) tinta.style.setProperty('--enche', '100%');
  if (topo) topo.entra();
}

/* ---------------- seções (depois da abertura) ---------------- */
async function iniciaSecoes() {
  // ordem importa: primeiro as seções que "travam" na tela, depois as animações que dependem da posição delas
  cortina();
  secaoEmborrachada();
  await secaoPrateleira();
  await secaoMarca();
  rolagemBasica();
  if (temGsap) secoes.forEach((s) => ScrollTrigger.create({ trigger: s, start: 'top 55%', end: 'bottom 55%', onToggle: (st) => st.isActive && ativa(s.id) }));
  const sim = criaSimulador({ produtos: PRODUTOS, nota: NOTA_CORES, aoPintar: () => plop() });
  const planta = criaPlanta({ produtos: PRODUTOS });
  criaRegua({ produtos: PRODUTOS, aoAbrir: (p, b) => abreModal(p, b) });
  const ad = criaAntesDepois();
  criaOdor({ produtos: PRODUTOS });
  if (temGsap) {
    ScrollTrigger.create({ trigger: '.demo-planta', start: 'top 75%', once: true, onEnter: () => planta.anima() });
    ScrollTrigger.create({ trigger: '.demo-cobertura', start: 'top 80%', once: true, onEnter: () => ad.anima() });
    ScrollTrigger.refresh();
  } else planta.anima();
  window.__site = { sim, prat, marca3d, motor };
  vitrine();
  raiz.classList.add('pronto');
}

function mostraTudo() {
  $$('[data-revela],[data-revela-grupo]>*').forEach((e) => { e.style.opacity = 1; e.style.transform = 'none'; e.style.filter = 'none'; });
  $$('[data-pinta]').forEach((t) => revelaTitulo(t));
}
function rolagemBasica() {
  if (!temGsap) return mostraTudo();
  gsap.to('.progresso i', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
  if (reduz) return mostraTudo();
  ScrollTrigger.batch('[data-revela]', { start: 'top 90%', once: true, onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out', stagger: 0.08 }) });
  $$('[data-revela-grupo]').forEach((g) => ScrollTrigger.create({ trigger: g, start: 'top 90%', once: true, onEnter: () => gsap.to(g.children, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out', stagger: 0.08 }) }));
  $$('[data-pinta]').forEach((t) => {
    if (t.closest('#inicio')) return;
    ScrollTrigger.create({ trigger: t, start: 'top 88%', once: true, onEnter: () => revelaTitulo(t) });
    const ws = $$('.tinta', t);
    ws.forEach((w, i) => gsap.fromTo(w, { '--enche': '0%' }, { '--enche': '100%', ease: 'none', scrollTrigger: { trigger: t, start: `top ${84 - (i * 16) / ws.length}%`, end: `top ${50 - (i * 16) / ws.length}%`, scrub: 0.4 } }));
  });
  $$('.contador b[data-valor]').forEach((b) => {
    const fim = +b.dataset.valor, pre = b.dataset.pre || '', suf = b.dataset.suf || ''; const o = { v: 0 };
    ScrollTrigger.create({ trigger: b, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: fim, duration: 2.2, ease: 'power3.out', onUpdate: () => { b.textContent = pre + Math.round(o.v).toLocaleString('pt-BR') + suf; } }) });
  });
  $$('.pincelada path').forEach((p) => gsap.to(p, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: p.closest('.pincelada'), start: 'top 98%', end: 'top 60%', scrub: 0.5 } }));
}

/* ---------------- cortina de tinta: topo → fábrica ---------------- */
function cortina() {
  if (!temGsap || reduz) return;
  const svg = $('.cortina'), tinta = $('.cortina-tinta'), brilho = $('.cortina-brilho');
  let H = 0, W = 0, dmax = 0;
  function desenha() {
    W = innerWidth; H = innerHeight; dmax = H * 0.3;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', W); svg.setAttribute('height', H);
    let d = `M0 -2 H${W} V${H}`; let x = W; let semente = 7;
    const rnd = () => { semente = (semente * 9301 + 49297) % 233280; return semente / 233280; };
    while (x > 0) {
      const lw = 30 + rnd() * 70; const gap = 20 + rnd() * 90; const len = H * (0.03 + rnd() * 0.25);
      const xa = Math.max(0, x - gap); d += ` L${xa.toFixed(1)} ${H}`; x = xa; if (x <= 0) break;
      const xb = Math.max(0, x - lw); const meio = (x + xb) / 2;
      d += ` C${x.toFixed(1)} ${(H + len * 0.6).toFixed(1)} ${(meio + lw * 0.5).toFixed(1)} ${(H + len).toFixed(1)} ${meio.toFixed(1)} ${(H + len).toFixed(1)} C${(meio - lw * 0.5).toFixed(1)} ${(H + len).toFixed(1)} ${xb.toFixed(1)} ${(H + len * 0.6).toFixed(1)} ${xb.toFixed(1)} ${H}`;
      x = xb;
    }
    d += ` L0 ${H} Z`;
    tinta.setAttribute('d', d); brilho.setAttribute('d', d);
  }
  desenha(); addEventListener('resize', desenha);
  ScrollTrigger.create({
    trigger: '#fabrica', start: 'top 92%', end: 'top 6%', scrub: 0.6,
    onUpdate: (s) => {
      const p = s.progress; const total = H + dmax;
      const ty = p < 0.5 ? -total + (p / 0.5) * total : ((p - 0.5) / 0.5) * (H + 10);
      svg.style.visibility = p > 0.002 && p < 0.998 ? 'visible' : 'hidden';
      svg.style.transform = `translate3d(0,${ty.toFixed(1)}px,0)`;
    },
  });
}

/* ---------------- 3. Emborrachada ---------------- */
function secaoEmborrachada() {
  const passos = $$('.ep');
  const svg = $('.parede-tec');
  const clip = $('.filme-clip', svg), borda = $('.filme-borda', svg), brilhoF = $('.filme-brilho', svg);
  const gotas = $('.gotas', svg), camadas = $('.camadas', svg), unica = $('.camada-unica', svg), tempo = $('.tempo', svg);
  const NS = 'http://www.w3.org/2000/svg';
  const legenda = document.createElementNS(NS, 'text'); legenda.setAttribute('x', 300); legenda.setAttribute('y', 446); legenda.setAttribute('text-anchor', 'middle'); legenda.setAttribute('class', 'tec-txt'); legenda.setAttribute('opacity', 0); legenda.textContent = 'Fundo + acabamento num só produto'; camadas.appendChild(legenda);
  const gs = Array.from({ length: 12 }, () => { const g = document.createElementNS(NS, 'ellipse'); g.setAttribute('cx', 0); g.setAttribute('cy', -40); g.setAttribute('rx', 4); g.setAttribute('ry', 6); g.setAttribute('fill', 'rgba(190,225,255,.85)'); g.setAttribute('opacity', 0); gotas.appendChild(g); return g; });
  let chuva = null;
  function ligaChuva(on) {
    if (!temGsap || reduz) { gs.forEach((g, i) => { g.setAttribute('cx', 100 + i * 36); g.setAttribute('cy', 120 + (i % 4) * 60); g.setAttribute('opacity', on ? 0.8 : 0); }); return; }
    if (on && !chuva) {
      chuva = gsap.timeline();
      gs.forEach((g, i) => {
        const x = 90 + Math.random() * 420; const yHit = 60 + Math.random() * 200;
        const t = gsap.timeline({ repeat: -1, delay: (i * 0.23) % 2.4 });
        t.fromTo(g, { attr: { cx: x - 30, cy: -30, rx: 2, ry: 9 }, opacity: 0 }, { attr: { cx: x, cy: yHit }, opacity: 0.9, duration: 0.45, ease: 'power1.in' })
          .to(g, { attr: { rx: 5, ry: 5 }, duration: 0.12 })
          .to(g, { attr: { cy: 395, rx: 3.5, ry: 6 }, opacity: 0.2, duration: 1.4, ease: 'power1.in' });
        chuva.add(t, 0);
      });
    } else if (!on && chuva) { chuva.kill(); chuva = null; gs.forEach((g) => g.setAttribute('opacity', 0)); }
  }
  const contas = $$('#emborrachada [data-conta]');
  const painelDados = $('.emb-dados');
  const contaAte = (k) => contas.forEach((s) => { s.textContent = Math.round(+s.dataset.conta * k); });
  function aplica(p) {
    const f = Math.min(1, p / 0.22);
    clip.setAttribute('height', 360 * f);
    borda.setAttribute('y1', 40 + 360 * f); borda.setAttribute('y2', 40 + 360 * f); borda.setAttribute('opacity', f > 0 && f < 1 ? 0.9 : 0);
    brilhoF.setAttribute('x', -200 + 900 * Math.min(1, p / 0.3));
    ligaChuva(p >= 0.25);
    const c = Math.min(1, Math.max(0, (p - 0.52) / 0.14));
    camadas.setAttribute('opacity', p >= 0.48 ? 1 : 0);
    unica.setAttribute('opacity', c); legenda.setAttribute('opacity', c);
    $$('.camadas text:not(:last-child)', svg).forEach((t) => t.setAttribute('opacity', 1 - c));
    tempo.setAttribute('opacity', p >= 0.75 ? 1 : 0);
    const k = p < 0.25 ? 0 : p < 0.5 ? 1 : p < 0.75 ? 2 : 3;
    passos.forEach((el, j) => el.classList.toggle('on', j <= k));
    contaAte(Math.min(1, Math.max(0, (p - 0.78) / 0.18)));
    painelDados.classList.toggle('mostra', p >= 0.76);
    if (emb) { emb.extra = p * Math.PI * 2; acorda(); }
  }
  if (!temGsap) { aplica(1); return; }
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px) and (min-height: 560px)', () => {
    aplica(0);
    ScrollTrigger.create({ trigger: '.emb-pin', start: 'top top', end: '+=260%', pin: true, scrub: 0.6, anticipatePin: 1, onUpdate: (s) => aplica(s.progress), onRefresh: (s) => aplica(s.progress) });
    if (!reduz) gsap.from('.emb-topo > *', { y: 40, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '#emborrachada', start: 'top 70%' } });
  });
  mm.add('(max-width: 900px), (max-height: 559px)', () => {
    aplica(0);
    const o = { p: 0 };
    ScrollTrigger.create({ trigger: '.parede-tec', start: 'top 75%', once: true, onEnter: () => gsap.to(o, { p: 1, duration: reduz ? 0.01 : 7, ease: 'none', onUpdate: () => aplica(o.p) }) });
  });
}

/* ---------------- 4. Prateleira ---------------- */
async function secaoPrateleira() {
  const N = PRODUTOS.length;
  const linhasEl = $('.prat-linhas');
  linhasEl.innerHTML = LINHAS.map((l) => `<button type="button" role="tab" aria-selected="false" data-linha="${l.id}">${l.curto || l.nome}</button>`).join('');
  let atual = 0; let stPrat = null;
  const info = { linha: $('.prat-linha'), nome: $('.prat-nome'), curta: $('.prat-curta'), rend: $('.prat-rend'), cont: $('.prat-contador') };
  function mostra(p, i) {
    atual = i;
    info.linha.textContent = p.linha; info.nome.textContent = p.nome; info.curta.textContent = p.curta;
    info.rend.textContent = p.rend && p.rend.length ? p.rend[0] : (p.emb || []).join(' · ');
    info.cont.textContent = `${String(i + 1).padStart(2, '0')} / ${N}`;
    linhasEl.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', b.dataset.linha === p.linhaId));
    if (temGsap && !reduz) gsap.fromTo([info.linha, info.nome, info.curta, info.rend], { clipPath: 'inset(0 0 100% 0)', yPercent: 40, opacity: 0 }, { clipPath: 'inset(0 0 0% 0)', yPercent: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.05, overwrite: true });
    clique();
  }
  const irPara = (i) => {
    i = Math.max(0, Math.min(N - 1, i));
    if (stPrat) scrollTo({ top: stPrat.start + (i / (N - 1)) * (stPrat.end - stPrat.start) + 2, behavior: reduz ? 'auto' : 'smooth' });
    else if (prat) prat.defineProgresso(i / (N - 1));
    else { mostra(PRODUTOS[i], i); $('#prat-fallback').children[i]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); }
  };
  if (gl) {
    prat = await cenaPrateleira(PRODUTOS, { aoMudar: mostra, aoAbrir: (p) => abreModal(p) });
    prat.irPara = irPara;
    if (temGsap) {
      stPrat = ScrollTrigger.create({
        trigger: '.prat-pin', start: 'top top', end: `+=${(N - 1) * 32}%`, pin: true, anticipatePin: 1,
        onUpdate: (s) => prat.defineProgresso(s.progress),
        snap: reduz ? false : { snapTo: 1 / (N - 1), duration: { min: 0.2, max: 0.6 }, delay: 0.12, ease: 'power1.inOut' },
      });
    }
  } else {
    const fb = $('#prat-fallback'); fb.hidden = false;
    fb.innerHTML = PRODUTOS.map((p, i) => `<button type="button" data-i="${i}">${p.foto ? `<img src="${p.foto}-800.webp" alt="${esc(p.nome)}" loading="lazy">` : `<img src="${imagemGerada(p)}" alt="${esc(p.nome)}">`}${esc(p.curto || p.nome)}</button>`).join('');
    fb.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { const i = +b.dataset.i; if (i === atual) abreModal(PRODUTOS[i], b); else mostra(PRODUTOS[i], i); } });
    mostra(PRODUTOS[0], 0);
  }
  linhasEl.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) irPara(PRODUTOS.findIndex((p) => p.linhaId === b.dataset.linha)); });
  $('#prat-ant').addEventListener('click', () => irPara(atual - 1));
  $('#prat-prox').addEventListener('click', () => irPara(atual + 1));
  $('#prat-detalhe').addEventListener('click', () => abreModal(PRODUTOS[atual], $('#prat-detalhe')));
  secaoPrateleira.paradas = () => (stPrat ? PRODUTOS.map((_, i) => Math.round(stPrat.start + (i / (N - 1)) * (stPrat.end - stPrat.start))) : []);
}

/* ---------------- 5. Sua marca ---------------- */
async function secaoMarca() {
  const CORES = ['#C8102E', '#EE6A0A', '#F7A600', '#1E5FA8', '#0F7B6C', '#2E7D32', '#5B2A86', '#1B1B1B', '#F2EFE6'];
  const mc = CONFIG.marcaCliente || {};
  const estado = { nome: mc.nome || '', cor: mc.cor || CORES[0], logo: null, produto: 'Tinta Acrílica Premium', tamanho: '18L' };
  const elCores = $('#marca-cores');
  elCores.innerHTML = CORES.map((c) => `<button type="button" role="radio" aria-checked="${c.toLowerCase() === estado.cor.toLowerCase()}" aria-label="Cor ${c}" data-cor="${c}" style="--c:${c}"></button>`).join('') + `<label title="Outra cor"><input type="color" id="marca-cor-livre" value="${estado.cor}" aria-label="Escolher outra cor"></label>`;
  const sel = $('#marca-produto');
  const opcoes = ['Tinta Acrílica Premium', 'Tinta Acrílica Standard', 'Tinta Acrílica Econômica', 'Proteção Emborrachada', 'Esmalte Base Água', 'Massa Corrida', 'Selador Acrílico'];
  sel.innerHTML = opcoes.map((o) => `<option>${o}</option>`).join('');
  $('#marca-nome').value = estado.nome;
  $('#criador').addEventListener('submit', (e) => e.preventDefault());
  if (gl) marca3d = await cenaMarca();
  let espera = null;
  function atualiza(imprimir = true) {
    $('#marca-legenda').textContent = estado.nome ? `Assim vai ficar a ${estado.nome}` : 'Assim vai ficar a sua';
    if (marca3d) marca3d.atualiza({ ...estado }, { imprimir }); else marcaPlana({ ...estado });
  }
  if (mc.logo) { const img = new Image(); img.onload = () => { estado.logo = img; atualiza(false); }; img.src = mc.logo; }
  $('#marca-nome').addEventListener('input', (e) => { estado.nome = e.target.value.trim(); clearTimeout(espera); espera = setTimeout(() => atualiza(true), 380); });
  elCores.addEventListener('click', (e) => { const b = e.target.closest('button[data-cor]'); if (!b) return; estado.cor = b.dataset.cor; elCores.querySelectorAll('button').forEach((x) => x.setAttribute('aria-checked', x === b)); plop(); atualiza(true); });
  $('#marca-cor-livre').addEventListener('input', (e) => { estado.cor = e.target.value; elCores.querySelectorAll('button').forEach((x) => x.setAttribute('aria-checked', false)); clearTimeout(espera); espera = setTimeout(() => { plop(0.7); atualiza(true); }, 160); });
  sel.addEventListener('change', () => { estado.produto = sel.value; atualiza(true); });
  $('#marca-logo').addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    if (!/^image\/(png|svg\+xml|jpeg|webp)$/.test(f.type) || f.size > 8e6) { $('.logo-up b').textContent = 'Use PNG, SVG, JPG ou WEBP (até 8 MB)'; return; }
    const leitor = new FileReader();
    leitor.onload = () => { const img = new Image(); img.onload = () => { estado.logo = img; $('.logo-up b').textContent = f.name; atualiza(true); }; img.src = leitor.result; };
    leitor.readAsDataURL(f);
  });
  $('#marca-tamanhos').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; estado.tamanho = b.dataset.tam; $$('#marca-tamanhos button').forEach((x) => x.setAttribute('aria-checked', x === b)); clique(); atualiza(true); });
  atualiza(false);
  secaoMarca.demo = (nome) => { estado.nome = nome; $('#marca-nome').value = nome; atualiza(true); };
  secaoMarca.cor = (c) => { estado.cor = c; elCores.querySelectorAll('button').forEach((x) => x.setAttribute('aria-checked', x.dataset.cor === c)); plop(); atualiza(true); };
  secaoMarca.CORES = CORES;
}

/* ---------------- detalhe do produto ---------------- */
const modal = $('#modal'); let voltaFoco = null;
function abreModal(p, origem) {
  if (!p) return;
  voltaFoco = origem || document.activeElement;
  $('#modal-linha').textContent = p.linha; $('#modal-nome').textContent = p.nome;
  $('#modal-selo').textContent = p.selo || ''; $('#modal-selo').hidden = !p.selo;
  $('#modal-desc').textContent = p.desc;
  let html;
  if (p.foto) html = palcoHTML({ src: p.foto, alt: esc(p.nome), brilho: true });
  else {
    let url = '';
    try { const c = prat && prat.fotografa(p); url = c ? c.toDataURL('image/png') : imagemGerada(p); } catch (e) { url = imagemGerada(p); }
    html = palcoHTML({ url, alt: esc(p.nome) });
  }
  $('#modal-palco').innerHTML = html;
  $('#modal-nota').hidden = !!p.foto;
  const lista = (t, itens, obs) => `<h4>${t}</h4><ul>${itens.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>${obs ? `<p class="obs">${esc(obs)}</p>` : ''}`;
  $('#modal-rend').innerHTML = p.rend && p.rend.length ? lista('Rendimento', p.rend, p.obs) : (REUNIAO ? '' : '<h4>Rendimento</h4><ul><li><mark>[A DEFINIR]</mark></li></ul>');
  $('#modal-emb').innerHTML = p.emb && p.emb.length ? lista('Embalagens', p.emb) : '';
  $('#modal-cores').innerHTML = p.cores ? `<h4>Cores</h4><ul>${p.cores.map(([n, c]) => `<li><i style="--c:${c === 'transparent' ? 'rgba(255,255,255,.08)' : c}"></i>${esc(n)}</li>`).join('')}</ul><p class="obs">${NOTA_CORES}</p>` : '';
  modal.hidden = false; document.body.style.overflow = 'hidden';
  motor.pausado = true; // o fundo 3D fica parado enquanto o detalhe está aberto
  if (temGsap && !reduz) {
    gsap.fromTo('.modal-fundo', { opacity: 0 }, { opacity: 1, duration: 0.4 });
    gsap.fromTo('.modal-caixa', { y: 50, scale: 0.95, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.8, ease: 'expo.out' });
    gsap.fromTo('.modal-info > *', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.04, delay: 0.1 });
  }
  $('.modal-fechar').focus({ preventScroll: true });
}
function fechaModal() {
  if (modal.hidden) return;
  const fim = () => { modal.hidden = true; document.body.style.overflow = ''; motor.pausado = false; acorda(); voltaFoco?.focus?.({ preventScroll: true }); };
  if (temGsap && !reduz) gsap.to('.modal-caixa, .modal-fundo', { opacity: 0, duration: 0.25, onComplete: fim }); else fim();
}
modal.addEventListener('click', (e) => { if (e.target.closest('[data-fechar]')) fechaModal(); });

/* ---------------- navegação, tela cheia, som, giroscópio ---------------- */
const nav = $('.nav'), secoes = $$('[data-secao]'), pontos = $('.pontos');
secoes.forEach((s) => { const a = document.createElement('a'); a.href = '#' + s.id; a.setAttribute('aria-label', s.dataset.secao); a.innerHTML = `<span>${s.dataset.secao}</span>`; pontos.appendChild(a); });
const ativa = (id) => $$('.nav-links a, .pontos a').forEach((a) => a.classList.toggle('ativo', a.getAttribute('href') === '#' + id));
addEventListener('scroll', () => nav.classList.toggle('solida', scrollY > 40), { passive: true });
function alternaTelaCheia() {
  const d = document;
  if (!d.fullscreenElement && !d.webkitFullscreenElement) (raiz.requestFullscreen || raiz.webkitRequestFullscreen)?.call(raiz);
  else (d.exitFullscreen || d.webkitExitFullscreen)?.call(d);
}
$('#tela-cheia').addEventListener('click', alternaTelaCheia);
const btnSom = $('#btn-som');
function defineSom(on) { if (ligaSom(on)) { btnSom.setAttribute('aria-pressed', on); btnSom.setAttribute('aria-label', on ? 'Desligar som' : 'Ligar som'); } }
btnSom.addEventListener('click', () => defineSom(!som.ligado));
if (CONFIG.somLigado) addEventListener('pointerdown', () => defineSom(true), { once: true });
if (gl && toque) {
  if (giroscopio.precisaPermissao) { const b = $('#btn-giro'); b.hidden = false; b.addEventListener('click', async () => { if (await giroscopio.liga()) b.hidden = true; }); }
  else giroscopio.liga();
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]'); if (!a) return;
  const alvo = document.getElementById(a.getAttribute('href').slice(1)); if (!alvo) return;
  e.preventDefault(); scrollTo({ top: alvo.getBoundingClientRect().top + scrollY, behavior: reduz ? 'auto' : 'smooth' });
});

/* ---------------- teclado (apresentação) ----------------
   Seta/espaço: próxima parada (inclui passos da Emborrachada e cada produto)
   PageDown/PageUp: próxima/anterior seção. F: tela cheia. Esc: fecha detalhe. */
function paradas(fina) {
  const lista = secoes.map((s) => Math.round(s.getBoundingClientRect().top + scrollY));
  if (fina && temGsap) {
    ScrollTrigger.getAll().forEach((st) => { if (st.pin && st.trigger.closest('#emborrachada')) [0.27, 0.52, 0.77, 1].forEach((f) => lista.push(Math.round(st.start + (st.end - st.start) * f))); });
    (secaoPrateleira.paradas ? secaoPrateleira.paradas() : []).forEach((v) => lista.push(v));
  }
  return [...new Set(lista)].sort((a, b) => a - b);
}
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') return fechaModal();
  if (!modal.hidden) return;
  const alvo = e.target;
  if (alvo.closest && alvo.closest('input, textarea, select, [role="slider"]')) return;
  if (e.key === 'f' || e.key === 'F') { alternaTelaCheia(); return; }
  const emBotao = alvo.closest && alvo.closest('button, a');
  const fina = ['ArrowDown', 'ArrowUp', ' '].includes(e.key);
  const prox = ['ArrowDown', 'PageDown'].includes(e.key) || (e.key === ' ' && !e.shiftKey && !emBotao);
  const ant = ['ArrowUp', 'PageUp'].includes(e.key) || (e.key === ' ' && e.shiftKey && !emBotao);
  if (!prox && !ant) return;
  e.preventDefault();
  const y = scrollY, ps = paradas(fina);
  const destino = prox ? ps.find((p) => p > y + 8) : [...ps].reverse().find((p) => p < y - 8);
  if (destino !== undefined) scrollTo({ top: destino, behavior: reduz ? 'auto' : 'smooth' });
});

/* ---------------- cursor e botões magnéticos ---------------- */
if (mouseFino && !reduz) {
  raiz.classList.add('cursor-on');
  const cur = $('.cursor'), anel = $('.cursor-anel'), ponto = $('.cursor-ponto');
  let x = innerWidth / 2, y = innerHeight / 2, ax = x, ay = y, rodando = false;
  const anda = () => {
    ax += (x - ax) * 0.2; ay += (y - ay) * 0.2;
    ponto.style.transform = `translate3d(${x}px,${y}px,0)`; anel.style.transform = `translate3d(${ax}px,${ay}px,0)`;
    if (Math.abs(x - ax) + Math.abs(y - ay) > 0.3) requestAnimationFrame(anda); else rodando = false;
  };
  addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; if (!rodando) { rodando = true; requestAnimationFrame(anda); } }, { passive: true });
  const alvoCur = 'a, button, select, input, [role="tab"], [role="radio"]';
  document.addEventListener('pointerover', (e) => { cur.classList.toggle('ativo', !!e.target.closest(alvoCur)); cur.classList.toggle('arrasta', !!e.target.closest('.palco3d, .prat-gl, .antes-depois')); });
  if (temGsap) $$('.magnetico').forEach((b) => {
    const qx = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3' }), qy = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3' });
    b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); qx((e.clientX - (r.left + r.width / 2)) * 0.28); qy((e.clientY - (r.top + r.height / 2)) * 0.35); });
    b.addEventListener('pointerleave', () => { qx(0); qy(0); });
  });
}

/* ---------------- modo vitrine (TV) ---------------- */
function vitrine() {
  const conf = CONFIG.vitrine || {}; if (!conf.ativo || reduz || !temGsap) return;
  const espera = (conf.segundos || 30) * 1000;
  let timer = null, tl = null, ativo = false, rolandoSozinho = false;
  const proxy = { y: 0 };
  const rolaAte = (y, dur) => gsap.to(proxy, { y, duration: dur, ease: 'power2.inOut', immediateRender: false, onUpdate: () => { rolandoSozinho = true; scrollTo(0, proxy.y); rolandoSozinho = false; } });
  const topoDe = (sel) => Math.round($(sel).getBoundingClientRect().top + scrollY);
  function comeca() {
    if (!modal.hidden || document.activeElement?.closest?.('input, select')) return reinicia();
    ativo = true; raiz.classList.add('vitrine'); proxy.y = scrollY;
    const stEmb = ScrollTrigger.getAll().find((s) => s.pin && s.trigger.closest('#emborrachada'));
    const nome = (CONFIG.marcaCliente && CONFIG.marcaCliente.nome) || 'Sua Marca';
    tl = gsap.timeline({ onComplete: () => { if (ativo) { ativo = false; comeca(); } } });
    tl.add(rolaAte(0, 2.5)).to({}, { duration: 6 });
    if (stEmb) tl.add(rolaAte(stEmb.start, 2.5)).add(rolaAte(stEmb.end, 11));
    else tl.add(rolaAte(topoDe('#emborrachada'), 2.5)).to({}, { duration: 6 });
    const ps = secaoPrateleira.paradas ? secaoPrateleira.paradas() : [];
    if (ps.length) { tl.add(rolaAte(ps[0], 2.5)).to({}, { duration: 2 }); [3, 7, 9, 12, 14].forEach((i) => ps[i] !== undefined && tl.add(rolaAte(ps[i], 1.4)).to({}, { duration: 2.4 })); }
    else tl.add(rolaAte(topoDe('#produtos'), 2.5)).to({}, { duration: 5 });
    tl.add(rolaAte(topoDe('#sua-marca') - 40, 2.5));
    tl.add(() => secaoMarca.demo && secaoMarca.demo(nome)).to({}, { duration: 2.4 });
    (secaoMarca.CORES || []).slice(3, 6).forEach((c) => tl.add(() => secaoMarca.cor(c)).to({}, { duration: 2.2 }));
    tl.add(() => secaoMarca.cor((CONFIG.marcaCliente && CONFIG.marcaCliente.cor) || '#C8102E')).to({}, { duration: 2.5 });
  }
  function para() { if (!ativo) return; ativo = false; if (tl) tl.kill(); tl = null; gsap.killTweensOf(proxy); raiz.classList.remove('vitrine'); }
  function reinicia() { clearTimeout(timer); timer = setTimeout(comeca, espera); }
  ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'].forEach((ev) => addEventListener(ev, () => { para(); reinicia(); }, { passive: true }));
  addEventListener('scroll', () => { if (!rolandoSozinho && !ativo) reinicia(); }, { passive: true });
  reinicia();
  window.__vitrine = { comeca, para };
}
