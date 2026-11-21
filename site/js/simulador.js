/* =====================================================================
   SIMULADOR DE COR NA PAREDE
   Cenas em SVG (fachada e sala) com a parede como área pintável.
   Ao escolher uma cor, um rolo passa em faixas e a cor nova cobre a
   parede por completo (pintura lisa e uniforme).
   ===================================================================== */
const NS = 'http://www.w3.org/2000/svg';
const AMB = { fachada: 'Fachada', sala: 'Sala', portao: 'Portão' };

function cenaFachada() {
  return `
  <defs>
    <linearGradient id="sCeu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141826"/><stop offset=".7" stop-color="#2c2430"/><stop offset="1" stop-color="#3c2b28"/></linearGradient>
    <linearGradient id="sVidro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22303f"/><stop offset=".5" stop-color="#121a24"/><stop offset="1" stop-color="#2a3644"/></linearGradient>
    <linearGradient id="sReflexo" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="sSombraLaje" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".42"/><stop offset=".22" stop-color="#000" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>
    <linearGradient id="sLuz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe2b0" stop-opacity=".55"/><stop offset=".55" stop-color="#ffc27a" stop-opacity=".16"/><stop offset="1" stop-color="#ffb060" stop-opacity="0"/></linearGradient>
    <filter id="sBorra" x="-20%" y="-5%" width="140%" height="110%"><feGaussianBlur stdDeviation="14"/></filter>
    <linearGradient id="sCalcada" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3532"/><stop offset="1" stop-color="#26221f"/></linearGradient>
    <linearGradient id="sMadeira" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a3a24"/><stop offset=".5" stop-color="#7a5234"/><stop offset="1" stop-color="#4e3220"/></linearGradient>
    <filter id="sCimento"><feTurbulence type="fractalNoise" baseFrequency=".012 .02" numOctaves="3" seed="7"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .5 -.12"/><feComposite in2="SourceGraphic" operator="in"/></filter>
  </defs>
  <rect width="1600" height="1100" fill="url(#sCeu)"/>
  <circle cx="1380" cy="150" r="46" fill="#f4e3c2" opacity=".85"/>
  <rect y="1000" width="1600" height="100" fill="url(#sCalcada)"/>
  <g stroke="#1c1917" stroke-width="3">${Array.from({ length: 9 }, (_, i) => `<line x1="${i * 200}" y1="1000" x2="${i * 200 - 40}" y2="1100"/>`).join('')}</g>
  <rect y="985" width="1600" height="18" fill="#47403b"/>
  <g class="alvo" data-alvo="parede">
    <rect x="260" y="330" width="1080" height="660" data-pinta="1"/>
    <rect x="0" y="800" width="250" height="190" data-pinta="1"/>
    <rect x="1350" y="800" width="250" height="190" data-pinta="1"/>
  </g>
  <g class="efeito-cimento" opacity="0"><rect x="260" y="330" width="1080" height="660" filter="url(#sCimento)"/><rect x="0" y="800" width="250" height="190" filter="url(#sCimento)"/><rect x="1350" y="800" width="250" height="190" filter="url(#sCimento)"/></g>
  <rect x="260" y="330" width="1080" height="660" fill="url(#sSombraLaje)" style="mix-blend-mode:multiply"/>
  <g stroke="#000" stroke-opacity=".1" stroke-width="2"><line x1="260" y1="560" x2="1340" y2="560"/><line x1="260" y1="790" x2="1340" y2="790"/></g>
  <rect x="0" y="800" width="250" height="16" fill="#000" opacity=".25"/><rect x="1350" y="800" width="250" height="16" fill="#000" opacity=".25"/>
  <rect x="300" y="420" width="250" height="570" fill="url(#sMadeira)"/>
  <g stroke="#3b2516" stroke-width="3" opacity=".7">${Array.from({ length: 11 }, (_, i) => `<line x1="${322 + i * 21}" y1="420" x2="${322 + i * 21}" y2="990"/>`).join('')}</g>
  <rect x="630" y="420" width="470" height="350" fill="#151313"/>
  <rect x="644" y="434" width="442" height="322" fill="url(#sVidro)"/>
  <polygon points="700,434 800,434 690,756 644,756 644,600" fill="url(#sReflexo)"/>
  <line x1="865" y1="434" x2="865" y2="756" stroke="#151313" stroke-width="10"/>
  <g class="alvo" data-alvo="portao"><rect x="1150" y="600" width="150" height="390" data-pinta="1"/></g>
  <rect x="1150" y="600" width="150" height="390" fill="none" stroke="#151313" stroke-width="8"/>
  <rect x="1270" y="780" width="8" height="60" rx="4" fill="#d8d2c8"/>
  <rect x="230" y="296" width="1140" height="40" fill="#1e1b1b"/><rect x="230" y="334" width="1140" height="6" fill="#000" opacity=".35"/>
  <g style="mix-blend-mode:screen"><path d="M590 480 L620 480 L700 990 L510 990 Z" fill="url(#sLuz)" filter="url(#sBorra)"/><path d="M1112 570 L1138 570 L1200 990 L1050 990 Z" fill="url(#sLuz)" filter="url(#sBorra)" opacity=".8"/></g>
  <rect x="592" y="464" width="26" height="18" rx="4" fill="#26221f"/><rect x="1112" y="554" width="26" height="18" rx="4" fill="#26221f"/>
  <g fill="#1f2a1c"><ellipse cx="200" cy="980" rx="110" ry="40"/><ellipse cx="1450" cy="980" rx="120" ry="44"/></g>
  <g fill="#2f4a2a"><path d="M150 980c-10-90 30-150 60-170-10 60 0 110 10 170Z"/><path d="M220 980c10-80 50-120 90-130-30 50-40 90-40 130Z"/><path d="M1420 980c-20-100 20-160 50-180-6 70 4 120 14 180Z"/><path d="M1480 980c12-70 60-110 100-118-32 44-44 80-44 118Z"/></g>`;
}
function cenaSala() {
  return `
  <defs>
    <linearGradient id="sPiso" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b4a32"/><stop offset="1" stop-color="#3a2618"/></linearGradient>
    <linearGradient id="sJanela" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff3dc" stop-opacity=".32"/><stop offset=".6" stop-color="#fff3dc" stop-opacity=".06"/><stop offset="1" stop-color="#fff3dc" stop-opacity="0"/></linearGradient>
    <radialGradient id="sVinheta" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></radialGradient>
    <radialGradient id="sAbajur" cx=".5" cy=".2" r=".8"><stop offset="0" stop-color="#ffd9a0" stop-opacity=".45"/><stop offset="1" stop-color="#ffd9a0" stop-opacity="0"/></radialGradient>
    <filter id="sCimento2"><feTurbulence type="fractalNoise" baseFrequency=".01 .018" numOctaves="3" seed="3"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .5 -.12"/><feComposite in2="SourceGraphic" operator="in"/></filter>
  </defs>
  <g class="alvo" data-alvo="parede"><rect x="0" y="0" width="1600" height="780" data-pinta="1"/></g>
  <g class="efeito-cimento" opacity="0"><rect x="0" y="0" width="1600" height="780" filter="url(#sCimento2)"/></g>
  <rect x="0" y="0" width="1600" height="780" fill="url(#sJanela)" style="mix-blend-mode:screen"/>
  <rect y="760" width="1600" height="24" fill="#f2efe8"/>
  <rect y="784" width="1600" height="316" fill="url(#sPiso)"/>
  <g stroke="#2a1b10" stroke-width="2" opacity=".5">${Array.from({ length: 9 }, (_, i) => `<line x1="${i * 200}" y1="784" x2="${i * 200 - 120}" y2="1100"/>`).join('')}</g>
  <g><rect x="560" y="210" width="480" height="300" fill="#f4f1ea"/><rect x="580" y="230" width="440" height="260" fill="#1b1716"/>
    <circle cx="720" cy="360" r="80" fill="#EE6A0A"/><rect x="780" y="300" width="170" height="130" fill="#C8102E" opacity=".9"/><circle cx="880" cy="330" r="38" fill="#F7A600"/></g>
  <ellipse cx="800" cy="1010" rx="520" ry="40" fill="#000" opacity=".35"/>
  <g><rect x="380" y="620" width="840" height="170" rx="40" fill="#2c2827"/><rect x="360" y="560" width="140" height="250" rx="40" fill="#34302e"/><rect x="1100" y="560" width="140" height="250" rx="40" fill="#34302e"/>
    <rect x="470" y="520" width="320" height="150" rx="36" fill="#3a3533"/><rect x="810" y="520" width="320" height="150" rx="36" fill="#3a3533"/>
    <rect x="420" y="790" width="24" height="70" fill="#1a1716"/><rect x="1156" y="790" width="24" height="70" fill="#1a1716"/>
    <rect x="860" y="560" width="120" height="100" rx="24" fill="#EE6A0A"/></g>
  <g><rect x="1350" y="300" width="10" height="720" fill="#1e1b1a"/><path d="M1290 300h130l-30-120h-70Z" fill="#e9e2d6"/><ellipse cx="1355" cy="460" rx="240" ry="380" fill="url(#sAbajur)"/></g>
  <g><path d="M150 1010h120l-14-150h-92Z" fill="#c9bfb2"/><g fill="#2f4a2a"><path d="M210 860c-40-90-10-190 20-230 10 80 0 150-20 230Z"/><path d="M200 860c-80-40-120-130-110-190 50 60 90 110 110 190Z"/><path d="M220 860c60-60 120-90 170-90-50 40-110 70-170 90Z"/></g></g>
  <rect width="1600" height="1100" fill="url(#sVinheta)"/>`;
}

export function criaSimulador({ produtos, nota, aoPintar }) {
  const cena = document.getElementById('sim-cena');
  const lista = produtos.filter((p) => p.cores && p.ambientes && p.ambientes.length);
  const estado = { prod: null, amb: null, cor: null, cores: { parede: '#D4A55D', portao: '#3D7036' }, animando: null };
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 1600 1100'); svg.setAttribute('role', 'img');
  cena.appendChild(svg);
  const rolo = `<g class="rolo" opacity="0"><rect x="-70" y="-26" width="140" height="52" rx="22" class="rolo-cor"/><rect x="-70" y="-26" width="140" height="18" rx="9" fill="#fff" opacity=".22"/><path d="M70 0h24v120h-14" fill="none" stroke="#d9d4cc" stroke-width="9" stroke-linecap="round"/><rect x="70" y="110" width="22" height="110" rx="10" fill="#1c1a19"/></g>`;

  function desenhaCena(nome) {
    svg.innerHTML = (nome === 'sala' ? cenaSala() : cenaFachada()) + `<g class="camada-nova"></g>` + rolo;
    svg.setAttribute('aria-label', nome === 'sala' ? 'Sala com a parede pintada na cor escolhida' : 'Fachada com a parede pintada na cor escolhida');
    svg.querySelectorAll('.alvo').forEach((g) => { const c = estado.cores[g.dataset.alvo] || '#D4A55D'; g.querySelectorAll('[data-pinta]').forEach((r) => r.setAttribute('fill', c)); });
    aplicaEfeito();
  }
  function aplicaEfeito() {
    const ef = svg.querySelector('.efeito-cimento');
    if (ef) ef.setAttribute('opacity', estado.prod && estado.prod.efeito ? '.55' : '0');
  }
  const cenaDe = (amb) => (amb === 'sala' ? 'sala' : 'fachada');
  const alvoDe = (amb) => (amb === 'portao' ? 'portao' : 'parede');

  function pinta(cor) {
    const alvo = alvoDe(estado.amb);
    const grupo = svg.querySelector(`.alvo[data-alvo="${alvo}"]`);
    if (!grupo) return;
    estado.cores[alvo] = cor;
    const formas = [...grupo.querySelectorAll('[data-pinta]')];
    const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches || !window.gsap;
    if (estado.animando) { estado.animando.progress(1); estado.animando = null; }
    if (reduz) { formas.forEach((f) => f.setAttribute('fill', cor)); aplicaEfeito(); return; }
    // caixa total das formas
    const caixas = formas.map((f) => ({ x: +f.getAttribute('x'), y: +f.getAttribute('y'), w: +f.getAttribute('width'), h: +f.getAttribute('height') }));
    const x0 = Math.min(...caixas.map((c) => c.x)), x1 = Math.max(...caixas.map((c) => c.x + c.w));
    const y0 = Math.min(...caixas.map((c) => c.y)), y1 = Math.max(...caixas.map((c) => c.y + c.h));
    const faixas = alvo === 'portao' ? 2 : 6, lf = (x1 - x0) / faixas;
    const id = 'clip' + Math.random().toString(36).slice(2, 8);
    const camada = svg.querySelector('.camada-nova');
    camada.innerHTML = `<defs><clipPath id="${id}">${Array.from({ length: faixas }, (_, i) => `<rect x="${x0 + i * lf - 2}" y="${y0}" width="${lf + 4}" height="0" class="fx"/>`).join('')}</clipPath></defs>
      <g clip-path="url(#${id})">${caixas.map((c) => `<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" fill="${cor}"/>`).join('')}</g>`;
    const rolo = svg.querySelector('.rolo'); svg.querySelector('.rolo-cor').setAttribute('fill', cor);
    const fx = camada.querySelectorAll('.fx');
    const tl = gsap.timeline({ onComplete: () => { formas.forEach((f) => f.setAttribute('fill', cor)); camada.innerHTML = ''; gsap.set(rolo, { opacity: 0 }); estado.animando = null; } });
    tl.set(rolo, { opacity: 1, x: x0 + lf / 2, y: y0 - 20 });
    const dur = alvo === 'portao' ? 0.45 : 0.3;
    fx.forEach((r, i) => {
      const cx = x0 + i * lf + lf / 2;
      const desce = i % 2 === 0;
      if (desce) {
        tl.to(rolo, { x: cx, duration: 0.12, ease: 'power1.inOut' });
        tl.fromTo(r, { attr: { y: y0, height: 0 } }, { attr: { y: y0, height: y1 - y0 }, duration: dur, ease: 'none' }, '<0.08');
        tl.fromTo(rolo, { y: y0 }, { y: y1, duration: dur, ease: 'none' }, '<');
      } else {
        tl.to(rolo, { x: cx, duration: 0.12, ease: 'power1.inOut' });
        tl.fromTo(r, { attr: { y: y1, height: 0 } }, { attr: { y: y0, height: y1 - y0 }, duration: dur, ease: 'none' }, '<0.08');
        tl.fromTo(rolo, { y: y1 }, { y: y0, duration: dur, ease: 'none' }, '<');
      }
    });
    tl.to(rolo, { opacity: 0, y: '-=60', duration: 0.3 });
    estado.animando = tl;
    aplicaEfeito();
  }

  // painel
  const elProd = document.getElementById('sim-produtos'), elAmb = document.getElementById('sim-ambientes'), elCart = document.getElementById('sim-cartela');
  elProd.innerHTML = lista.map((p) => `<button type="button" role="tab" aria-selected="false" data-id="${p.id}">${p.curto || p.nome}</button>`).join('');
  document.querySelectorAll('#cores .nota-cores').forEach((n) => { n.textContent = nota; });
  function escolheProduto(id, { pintar = true } = {}) {
    const p = lista.find((x) => x.id === id) || lista[0];
    estado.prod = p;
    elProd.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', b.dataset.id === p.id));
    const amb = p.ambientes.includes(estado.amb) ? estado.amb : p.ambientes[0];
    elAmb.innerHTML = p.ambientes.length > 1 ? p.ambientes.map((a) => `<button type="button" role="radio" aria-checked="${a === amb}" data-amb="${a}">${AMB[a]}</button>`).join('') : '';
    trocaAmbiente(amb);
    elCart.innerHTML = p.cores.map(([n, c], i) => `<button type="button" class="cart" role="radio" aria-checked="false" data-i="${i}" style="--c:${c}"><i></i>${n}</button>`).join('');
    const atual = p.cores.findIndex(([, c]) => c.toLowerCase() === (estado.cores[alvoDe(amb)] || '').toLowerCase());
    escolheCor(atual >= 0 ? atual : Math.min(1, p.cores.length - 1), { pintar });
  }
  function trocaAmbiente(amb) {
    const mudaCena = !estado.amb || cenaDe(amb) !== cenaDe(estado.amb);
    estado.amb = amb;
    elAmb.querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', b.dataset.amb === amb));
    if (mudaCena) desenhaCena(cenaDe(amb)); else aplicaEfeito();
  }
  function escolheCor(i, { pintar = true } = {}) {
    const [nome, cor] = estado.prod.cores[i];
    elCart.querySelectorAll('.cart').forEach((b) => b.setAttribute('aria-checked', +b.dataset.i === i));
    document.getElementById('sim-cor-nome').textContent = nome;
    document.getElementById('sim-prod-nome').textContent = `${estado.prod.nome} · ${AMB[estado.amb]}`;
    if (pintar) { pinta(cor); aoPintar && aoPintar(cor); } else { estado.cores[alvoDe(estado.amb)] = cor; desenhaCena(cenaDe(estado.amb)); }
  }
  elProd.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) escolheProduto(b.dataset.id); });
  elAmb.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; trocaAmbiente(b.dataset.amb); const i = +(elCart.querySelector('[aria-checked="true"]')?.dataset.i || 0); escolheCor(i); });
  elCart.addEventListener('click', (e) => { const b = e.target.closest('.cart'); if (b) escolheCor(+b.dataset.i); });
  escolheProduto((lista.find((p) => p.id === 'protecao-emborrachada') || lista[0]).id, { pintar: false });
  return { escolheProduto, escolheCor, estado, lista };
}
