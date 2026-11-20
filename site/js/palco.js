/* =====================================================================
   PALCO DO BALDE — integra a embalagem à cena:
   feixe de luz, halo, pedestal com borda luminosa, sombra de contato
   que acompanha a flutuação, reflexo no piso e luz de recorte
   (laranja à esquerda, vermelha à direita) aplicada sobre o render.
   O render em si não é alterado: a luz é uma camada separada.
   ===================================================================== */
let uid = 0;

export const numeroDo = (src) => (src || '').split('/').pop().slice(0, 2);

export function palcoHTML({ src = '', icone = '', n = numeroDo(src), mini = false, poeira = false, orbita = !mini, brilho = false, transforma = false, atraso = 0, alt = '' } = {}) {
  const id = 'pc' + (++uid);
  const d = `animation-delay:${atraso}s`;
  const luzE = `img/baldes/luz/${n}-e.webp`, luzD = `img/baldes/luz/${n}-d.webp`;
  const mascara = (u) => `-webkit-mask-image:url(${u});mask-image:url(${u})`;
  let corpo;
  if (src) {
    const imgs = transforma
      ? `<img src="img/baldes/sua-marca-neutro.webp" alt="Balde com rótulo neutro: sua marca aqui" class="balde balde-neutro" decoding="async">
         <img src="${src}" alt="${alt}" class="balde balde-matriz" decoding="async"><i class="scan"></i>`
      : `<img src="${src}" alt="${alt}" class="balde" decoding="async"${mini ? ' loading="lazy"' : ''}>`;
    corpo = `<div class="corpo${transforma ? ' transforma' : ''}">${imgs}
      <i class="luz luz-e" style="background-image:url(${luzE})"></i>
      <i class="luz luz-d" style="background-image:url(${luzD})"></i>
      <i class="sombreia" style="${mascara(src)}"></i>
      ${brilho ? `<i class="brilho" style="${mascara(src)}"></i>` : ''}</div>`;
  } else {
    corpo = `<div class="corpo orbe"><span>${icone}</span></div>`;
  }
  const orb = orbita ? `
      <ellipse cx="200" cy="30" rx="208" ry="26" fill="none" stroke="url(#${id}a)" stroke-opacity=".3" stroke-width=".8"/>
      <circle r="2.6" fill="#fff" class="orb-ponto"><animateMotion dur="11s" repeatCount="indefinite" path="M-8,30 a208,26 0 1,0 416,0 a208,26 0 1,0 -416,0"/></circle>` : '';
  const svg = `<svg class="ped" viewBox="-20 -16 440 132" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="${id}a" x1="0" x2="1"><stop offset="0" stop-color="#F7A600"/><stop offset=".5" stop-color="#EE6A0A" stop-opacity=".35"/><stop offset="1" stop-color="#C8102E"/></linearGradient>
      <linearGradient id="${id}b" x1="0" x2="1"><stop offset="0" stop-color="#7a3a12"/><stop offset=".1" stop-color="#2a1a12"/><stop offset=".5" stop-color="#120e0d"/><stop offset=".9" stop-color="#2a1216"/><stop offset="1" stop-color="#7a1a24"/></linearGradient>
      <radialGradient id="${id}c" cx=".5" cy=".3" r=".75"><stop offset="0" stop-color="#5a3a26"/><stop offset=".35" stop-color="#2c1f19"/><stop offset=".75" stop-color="#171212"/><stop offset="1" stop-color="#100c0c"/></radialGradient>
      <radialGradient id="${id}v" cx=".5" cy=".4" r=".56"><stop offset=".5" stop-color="#100c0c" stop-opacity="0"/><stop offset="1" stop-color="#100c0c" stop-opacity=".85"/></radialGradient>
      <radialGradient id="${id}s"><stop offset="0" stop-color="#000" stop-opacity=".7"/><stop offset=".55" stop-color="#000" stop-opacity=".3"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id}q"><stop offset="0" stop-color="#ffb46a" stop-opacity=".28"/><stop offset="1" stop-color="#ff8a3a" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id}l"><stop offset="0" stop-color="#EE6A0A" stop-opacity=".55"/><stop offset="1" stop-color="#C8102E" stop-opacity="0"/></radialGradient>
      <clipPath id="${id}k"><ellipse cx="200" cy="24" rx="190" ry="22"/></clipPath>
      <filter id="${id}g" x="-20%" y="-80%" width="140%" height="260%"><feGaussianBlur stdDeviation="3.2"/></filter>
    </defs>
    <ellipse cx="200" cy="80" rx="235" ry="32" fill="url(#${id}l)"/>
    <path d="M10 24V58A190 22 0 0 0 390 58V24Z" fill="url(#${id}b)"/>
    <path d="M10 40A190 22 0 0 0 390 40" fill="none" stroke="url(#${id}a)" stroke-opacity=".18" stroke-width=".8"/>
    <ellipse cx="200" cy="58" rx="190" ry="22" fill="none" stroke="url(#${id}a)" stroke-opacity=".35"/>
    <ellipse cx="200" cy="24" rx="190" ry="22" fill="url(#${id}c)"/>
    <g clip-path="url(#${id}k)">
      <ellipse cx="200" cy="24" rx="150" ry="17.4" fill="none" stroke="url(#${id}a)" stroke-opacity=".22" stroke-width=".7"/>
      <ellipse cx="200" cy="24" rx="104" ry="12" fill="none" stroke="url(#${id}a)" stroke-opacity=".14" stroke-width=".6"/>
      <ellipse cx="200" cy="21" rx="120" ry="9" fill="url(#${id}q)"/>
      <ellipse cx="200" cy="24" rx="190" ry="22" fill="url(#${id}v)"/>
      <ellipse class="sombra-c" style="${d}" cx="200" cy="25" rx="${src ? 112 : 84}" ry="11" fill="url(#${id}s)"/>
    </g>
    <ellipse cx="200" cy="24" rx="190" ry="22" fill="none" stroke="url(#${id}a)" stroke-width="4" filter="url(#${id}g)" opacity=".8"/>
    <ellipse cx="200" cy="24" rx="190" ry="22" fill="none" stroke="url(#${id}a)" stroke-width="1.4"/>
    ${orb}
  </svg>`;
  const pts = poeira ? `<div class="poeira" aria-hidden="true">${'<i></i>'.repeat(9)}</div>` : '';
  return `<div class="feixe" aria-hidden="true"><i></i></div><div class="halo" aria-hidden="true"></div>${svg}
    <div class="flutua" style="${d}"><div class="tilt">${corpo}</div></div>${pts}`;
}

/* Monta os palcos fixos da página (marcados com data-palco) */
export function montaPalcos(raiz = document) {
  raiz.querySelectorAll('[data-palco]').forEach((el) => {
    const n = el.dataset.palco;
    const src = el.dataset.src;
    el.innerHTML = palcoHTML({
      src, n, alt: el.dataset.alt || '',
      poeira: 'poeira' in el.dataset, brilho: 'brilho' in el.dataset,
      transforma: 'transforma' in el.dataset, orbita: !('semOrbita' in el.dataset),
    });
  });
}
