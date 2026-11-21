/* =====================================================================
   DIFERENCIAIS DEMONSTRADOS
   - planta baixa: 1 quadradinho = 1 m² pintado (rendimento do balde 18 L)
   - régua da premium à econômica (faixa que o catálogo dá a cada produto)
   - antes/depois de cobertura (ilustrativo)
   - baixo odor (produtos que o catálogo descreve assim)
   ===================================================================== */
const NS = 'http://www.w3.org/2000/svg';

/* Planta: apartamento com cômodos; a área interna é uma grade de 1 m² */
const COMODOS = [
  { nome: 'Sala', x: 0, y: 0, w: 9, h: 7 },
  { nome: 'Cozinha', x: 9, y: 0, w: 5, h: 7 },
  { nome: 'Quarto', x: 0, y: 7, w: 6, h: 6 },
  { nome: 'Banheiro', x: 6, y: 7, w: 3, h: 4 },
  { nome: 'Quarto', x: 9, y: 7, w: 5, h: 6 },
  { nome: 'Área', x: 14, y: 0, w: 4, h: 13 },
];
export function criaPlanta({ produtos, aoMudar }) {
  const svg = document.getElementById('planta');
  const lista = produtos.filter((p) => p.rend18);
  const L = 20, ox = 20, oy = 0; // 1 m² = 20 px
  const celulas = [];
  COMODOS.forEach((c, ci) => { for (let j = 0; j < c.h; j++) for (let i = 0; i < c.w; i++) celulas.push({ x: c.x + i, y: c.y + j, ci }); });
  // ordem de pintura: cômodo por cômodo, em zigue-zague
  celulas.sort((a, b) => a.ci - b.ci || a.y - b.y || (a.y % 2 ? b.x - a.x : a.x - b.x));
  const total = celulas.length; // 236 m² de grade
  svg.setAttribute('viewBox', `0 0 ${18 * L + 40} ${13 * L + 2}`);
  svg.innerHTML = `<defs><linearGradient id="gPlanta" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F7A600"/><stop offset=".5" stop-color="#EE6A0A"/><stop offset="1" stop-color="#C8102E"/></linearGradient></defs>
    <g class="cel">${celulas.map((c, i) => `<rect x="${ox + c.x * L + 1}" y="${oy + c.y * L + 1}" width="${L - 2}" height="${L - 2}" rx="2" fill="rgba(255,255,255,.04)" data-i="${i}"/>`).join('')}</g>
    <g fill="none" stroke="rgba(246,242,238,.55)" stroke-width="2.4">${COMODOS.map((c) => `<rect x="${ox + c.x * L}" y="${oy + c.y * L}" width="${c.w * L}" height="${c.h * L}"/>`).join('')}</g>
    <g font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="rgba(246,242,238,.75)">${COMODOS.map((c) => `<text x="${ox + c.x * L + 6}" y="${oy + c.y * L + 15}">${c.nome}</text>`).join('')}</g>`;
  const rects = [...svg.querySelectorAll('.cel rect')].sort((a, b) => a.dataset.i - b.dataset.i);
  const range = document.getElementById('planta-range'), saida = document.getElementById('planta-saida');
  const elProd = document.getElementById('planta-produtos');
  let prod = lista.find((p) => p.id === 'hiper-rendimento') || lista[0];
  elProd.innerHTML = lista.map((p) => `<button type="button" role="radio" aria-checked="${p.id === prod.id}" data-id="${p.id}">${p.nome} · ${p.rend18} m²</button>`).join('');
  function desenha(v) {
    const n = Math.min(total, Math.round(v));
    rects.forEach((r, i) => r.setAttribute('fill', i < n ? 'url(#gPlanta)' : 'rgba(255,255,255,.04)'));
    saida.textContent = `${n} m²`;
  }
  function define(p, animar = true) {
    prod = p; range.max = p.rend18;
    elProd.querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', b.dataset.id === p.id));
    if (animar && window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const o = { v: +range.value };
      gsap.to(o, { v: p.rend18, duration: 1.4, ease: 'power2.inOut', onUpdate: () => { range.value = o.v; desenha(o.v); } });
    } else { range.value = p.rend18; desenha(p.rend18); }
    aoMudar && aoMudar(p);
  }
  range.addEventListener('input', () => desenha(+range.value));
  elProd.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) define(lista.find((p) => p.id === b.dataset.id)); });
  desenha(0);
  return { anima: () => define(prod, true), define };
}

export function criaRegua({ produtos, aoAbrir }) {
  const faixas = [['premium', 'Premium'], ['standard', 'Standard'], ['economica', 'Econômica']];
  const el = document.getElementById('regua');
  el.innerHTML = `<div class="regua-trilho"></div><div class="regua-faixas">${faixas.map(([, n]) => `<span>${n}</span>`).join('')}</div>
    <div class="regua-itens">${faixas.map(([f]) => `<div class="regua-col">${produtos.filter((p) => p.faixa === f).map((p) => `<button type="button" data-id="${p.id}">${p.foto ? `<img src="${p.foto}-800.webp" alt="" loading="lazy">` : ''}<span>${p.curto || p.nome}</span></button>`).join('')}</div>`).join('')}</div>`;
  el.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) aoAbrir(produtos.find((p) => p.id === b.dataset.id), b); });
}

export function criaAntesDepois() {
  const el = document.getElementById('antes-depois'); const alca = el.querySelector('.ad-alca');
  let v = 50;
  const aplica = () => { el.style.setProperty('--corte', v + '%'); alca.setAttribute('aria-valuenow', Math.round(v)); };
  const deX = (x) => { const r = el.getBoundingClientRect(); v = Math.max(0, Math.min(100, ((x - r.left) / r.width) * 100)); aplica(); };
  let ativo = false;
  el.addEventListener('pointerdown', (e) => { ativo = true; el.setPointerCapture?.(e.pointerId); deX(e.clientX); });
  el.addEventListener('pointermove', (e) => { if (ativo) deX(e.clientX); });
  ['pointerup', 'pointercancel'].forEach((ev) => el.addEventListener(ev, () => { ativo = false; }));
  alca.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') { v = Math.max(0, v - 5); aplica(); e.preventDefault(); e.stopPropagation(); } if (e.key === 'ArrowRight') { v = Math.min(100, v + 5); aplica(); e.preventDefault(); e.stopPropagation(); } });
  aplica();
  return { anima() { if (!window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) return; const o = { v: 92 }; gsap.to(o, { v: 50, duration: 1.6, ease: 'power3.inOut', onUpdate: () => { v = o.v; aplica(); } }); } };
}

export function criaOdor({ produtos }) {
  document.getElementById('odor-lista').innerHTML = produtos.filter((p) => p.odor).map((p) => `<li><b>${p.curto || p.nome}</b> · ${p.odor.toLowerCase()}</li>`).join('');
}
