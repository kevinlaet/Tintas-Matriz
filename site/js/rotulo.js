/* =====================================================================
   GERADOR DE RÓTULOS (canvas 2D)
   - rotuloMatriz(): rótulo no padrão Matriz para produtos sem foto
   - rotuloCliente(): rótulo com a marca do cliente (seção "Sua marca")
   A textura dá a volta inteira no balde: a frente fica no centro (x = W/2)
   e ocupa ~40% da largura. Proporção altura/largura igual à do balde 3D.
   ===================================================================== */

export const PROPORCAO = { '18L': 0.336, '3.6L': 0.34, '0.9L': 0.255 };

const fontes = () => (document.fonts ? Promise.all([
  document.fonts.load('700 80px Sora'), document.fonts.load('600 40px Sora'), document.fonts.load('600 40px Inter'),
]).catch(() => {}) : Promise.resolve());
export const fontesProntas = fontes();

function lum(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const f = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
export function misturar(hex, alvo, t) {
  const a = parseInt(hex.replace('#', ''), 16), b = parseInt(alvo.replace('#', ''), 16);
  const ch = (v, s) => (v >> s) & 255;
  const m = (s) => Math.round(ch(a, s) + (ch(b, s) - ch(a, s)) * t);
  return '#' + ((1 << 24) + (m(16) << 16) + (m(8) << 8) + m(0)).toString(16).slice(1);
}
export const textoSobre = (hex) => (lum(hex) > 0.42 ? '#1B1715' : '#FFFFFF');

function cria(W, prop) {
  const c = document.createElement('canvas');
  c.width = W; c.height = Math.round(W * prop);
  return c;
}
function encaixa(ctx, texto, maxW, tamanho, peso = 700, familia = 'Sora') {
  let t = tamanho;
  ctx.font = `${peso} ${t}px ${familia}, system-ui, sans-serif`;
  while (ctx.measureText(texto).width > maxW && t > 10) { t -= 2; ctx.font = `${peso} ${t}px ${familia}, system-ui, sans-serif`; }
  return t;
}
function linhasDe(ctx, texto, maxW) {
  const palavras = texto.split(/\s+/); const out = []; let l = '';
  palavras.forEach((p) => { const t = l ? l + ' ' + p : p; if (ctx.measureText(t).width > maxW && l) { out.push(l); l = p; } else l = t; });
  if (l) out.push(l);
  return out;
}
/* "Matriz" com a faixa tricolor, como nos rótulos reais */
function marcaMatriz(ctx, cx, y, h, cor = '#FFFFFF') {
  ctx.save();
  ctx.fillStyle = cor; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.font = `700 ${h}px Sora, system-ui, sans-serif`;
  ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = h * 0.08; ctx.shadowOffsetY = h * 0.03;
  ctx.fillText('Matriz', cx, y);
  const w = ctx.measureText('Matriz').width;
  ctx.shadowColor = 'transparent';
  const x0 = cx - w * 0.52, x1 = cx + w * 0.5, yb = y + h * 0.16;
  const faixa = (dy, esp, c) => { ctx.beginPath(); ctx.moveTo(x0, yb + dy); ctx.quadraticCurveTo(cx, yb + dy - h * 0.05, x1, yb + dy + h * 0.06); ctx.lineTo(x1, yb + dy + h * 0.06 + esp); ctx.quadraticCurveTo(cx, yb + dy - h * 0.05 + esp * 0.6, x0, yb + dy + esp * 0.35); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); };
  faixa(0, h * 0.07, '#F2C200'); faixa(h * 0.075, h * 0.06, '#FFFFFF'); faixa(h * 0.14, h * 0.08, '#C8102E');
  ctx.restore();
}
function brilhoLateral(ctx, W, H) {
  // leve variação de tom ao redor (o 3D cuida da luz; isto só evita um chapado artificial)
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, 'rgba(0,0,0,.10)'); g.addColorStop(0.3, 'rgba(0,0,0,0)'); g.addColorStop(0.5, 'rgba(255,255,255,.03)'); g.addColorStop(0.7, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.10)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

/* Rótulo padrão Matriz para produtos sem foto */
export function rotuloMatriz(prod, { W = 2048, tamanho = '18L' } = {}) {
  const g = prod.gerado || { cor: '#202020', destaque: '#F7A600', tipo: '' };
  const c = cria(W, PROPORCAO[tamanho]); const ctx = c.getContext('2d'); const H = c.height; const cx = W / 2;
  const txt = g.texto || textoSobre(g.cor);
  // fundo
  const fundo = ctx.createLinearGradient(0, 0, 0, H);
  fundo.addColorStop(0, misturar(g.cor, '#000000', 0.25)); fundo.addColorStop(0.45, g.cor); fundo.addColorStop(1, misturar(g.cor, '#000000', 0.35));
  ctx.fillStyle = fundo; ctx.fillRect(0, 0, W, H);
  // faixas finas superiores
  ctx.fillStyle = '#F2C200'; ctx.fillRect(0, H * 0.075, W, H * 0.006);
  // faixa central com a cor de destaque
  const fy = H * 0.5, fh = H * 0.2;
  const faixa = ctx.createLinearGradient(0, fy, 0, fy + fh);
  faixa.addColorStop(0, misturar(g.cor, '#000000', 0.45)); faixa.addColorStop(1, misturar(g.cor, '#000000', 0.6));
  ctx.fillStyle = faixa; ctx.fillRect(0, fy, W, fh);
  ctx.fillStyle = g.destaque; ctx.fillRect(0, fy - H * 0.008, W, H * 0.008); ctx.fillRect(0, fy + fh, W, H * 0.006);
  // marca Matriz
  marcaMatriz(ctx, cx, H * 0.33, H * 0.2, txt === '#FFFFFF' ? '#FFFFFF' : '#1B1715');
  // tipo + nome
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = g.destaque; ctx.font = `600 ${Math.round(H * 0.042)}px Sora, system-ui, sans-serif`;
  ctx.fillText((g.tipo || '').toUpperCase(), cx, H * 0.44);
  ctx.fillStyle = '#FFFFFF';
  const nome = (prod.curto || prod.nome).toUpperCase();
  const t = encaixa(ctx, nome, W * 0.3, Math.round(H * 0.085), 700);
  const ls = linhasDe(ctx, nome, W * 0.3);
  const usa = ls.length > 1 ? Math.min(t, Math.round(H * 0.066)) : t;
  ctx.font = `700 ${usa}px Sora, system-ui, sans-serif`;
  const ls2 = linhasDe(ctx, nome, W * 0.3).slice(0, 2);
  ls2.forEach((l, i) => ctx.fillText(l, cx, fy + fh / 2 + (i - (ls2.length - 1) / 2) * usa * 1.05));
  // linha e selo
  ctx.fillStyle = txt === '#FFFFFF' ? 'rgba(255,255,255,.78)' : 'rgba(27,23,21,.75)';
  ctx.font = `600 ${Math.round(H * 0.034)}px Inter, system-ui, sans-serif`;
  ctx.fillText((prod.linha || '').toUpperCase(), cx, H * 0.79);
  if (prod.selo) {
    ctx.font = `700 ${Math.round(H * 0.03)}px Inter, system-ui, sans-serif`;
    const sw = ctx.measureText(prod.selo.toUpperCase()).width + H * 0.06;
    ctx.fillStyle = g.destaque; roundRect(ctx, cx - sw / 2, H * 0.84, sw, H * 0.06, H * 0.012); ctx.fill();
    ctx.fillStyle = textoSobre(g.destaque); ctx.fillText(prod.selo.toUpperCase(), cx, H * 0.87);
  }
  brilhoLateral(ctx, W, H);
  return c;
}

/* Rótulo com a marca do cliente */
export function rotuloCliente({ nome = '', cor = '#C8102E', logo = null, produto = 'Tinta Acrílica', tamanho = '18L', W = 2048 } = {}) {
  const c = cria(W, PROPORCAO[tamanho]); const ctx = c.getContext('2d'); const H = c.height; const cx = W / 2;
  const txt = textoSobre(cor);
  const esc = misturar(cor, '#000000', 0.38), clr = misturar(cor, '#FFFFFF', 0.22);
  const fundo = ctx.createLinearGradient(0, 0, 0, H);
  fundo.addColorStop(0, clr); fundo.addColorStop(0.55, cor); fundo.addColorStop(1, esc);
  ctx.fillStyle = fundo; ctx.fillRect(0, 0, W, H);
  // faixa diagonal suave (assinatura visual)
  ctx.save(); ctx.globalAlpha = 0.14; ctx.fillStyle = txt;
  for (let i = -2; i < 9; i++) { ctx.beginPath(); const x = i * W * 0.12; ctx.moveTo(x, H); ctx.lineTo(x + W * 0.05, H); ctx.lineTo(x + W * 0.05 + H * 0.5, 0); ctx.lineTo(x + H * 0.5, 0); ctx.fill(); }
  ctx.restore();
  // faixa escura inferior
  ctx.fillStyle = esc; ctx.fillRect(0, H * 0.74, W, H * 0.26);
  ctx.fillStyle = txt === '#FFFFFF' ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.9)'; ctx.fillRect(0, H * 0.74, W, H * 0.006);
  ctx.fillStyle = txt === '#FFFFFF' ? 'rgba(255,255,255,.55)' : 'rgba(27,23,21,.45)'; ctx.fillRect(0, H * 0.07, W, H * 0.005);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let yNome = H * 0.4;
  if (logo && logo.width) {
    const lh = H * 0.24, lw = Math.min(W * 0.2, lh * (logo.width / logo.height));
    const lhh = lw * (logo.height / logo.width);
    ctx.drawImage(logo, cx - lw / 2, H * 0.12 + (lh - lhh) / 2, lw, lhh);
    yNome = H * 0.5;
  }
  const marca = (nome || 'SUA MARCA').toUpperCase();
  ctx.fillStyle = txt;
  const tam = encaixa(ctx, marca, W * 0.32, Math.round(H * (logo ? 0.13 : 0.19)), 700);
  ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = tam * 0.08; ctx.shadowOffsetY = tam * 0.03;
  ctx.fillText(marca, cx, yNome);
  ctx.shadowColor = 'transparent';
  ctx.font = `600 ${Math.round(H * 0.045)}px Sora, system-ui, sans-serif`;
  ctx.fillStyle = txt === '#FFFFFF' ? 'rgba(255,255,255,.85)' : 'rgba(27,23,21,.8)';
  ctx.fillText(produto.toUpperCase(), cx, yNome + tam * 0.72);
  // rodapé
  const rotTam = { '18L': '18 L', '3.6L': '3,6 L', '0.9L': '900 ml' }[tamanho];
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `700 ${Math.round(H * 0.07)}px Sora, system-ui, sans-serif`;
  ctx.textAlign = 'right'; ctx.fillText(rotTam, cx + W * 0.16, H * 0.87);
  ctx.textAlign = 'left'; ctx.font = `600 ${Math.round(H * 0.03)}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fillText('INTERIOR', cx - W * 0.16, H * 0.85);
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillText('Conteúdo', cx - W * 0.16, H * 0.9);
  brilhoLateral(ctx, W, H);
  return c;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

/* Balde "achatado" em 2D (sem WebGL): desenha a frente do rótulo num cilindro em perspectiva. */
export function baldePlano(rotuloCanvas, { L = 520, tamanho = '18L' } = {}) {
  const c = document.createElement('canvas');
  const prop = tamanho === '0.9L' ? 0.82 : 1.12;
  c.width = L; c.height = Math.round(L * prop);
  const ctx = c.getContext('2d');
  const W = L * 0.86, x0 = (L - W) / 2, R = W / 2, cx = L / 2;
  const topoY = L * 0.14, corpoH = c.height - topoY - L * 0.08, ry = R * 0.12;
  const src = rotuloCanvas, sw = src.width, sh = src.height;
  // corpo: fatias verticais mapeadas no cilindro (±72°)
  const fatias = 160, phiMax = (72 * Math.PI) / 180;
  for (let i = 0; i < fatias; i++) {
    const a0 = -Math.PI / 2 + (i / fatias) * Math.PI, a1 = -Math.PI / 2 + ((i + 1) / fatias) * Math.PI;
    const xs0 = cx + R * 0.97 * Math.sin(a0), xs1 = cx + R * 0.97 * Math.sin(a1);
    const am = (a0 + a1) / 2;
    const u = 0.5 + am / (2 * Math.PI);
    const curva = ry * (1 - Math.cos(am));
    ctx.drawImage(src, u * sw, 0, Math.max(1, sw / (2 * fatias)), sh, xs0, topoY + ry - curva, Math.max(1, xs1 - xs0 + 0.6), corpoH);
    const sombra = 0.55 * (1 - Math.cos(am)) ** 1.6;
    ctx.fillStyle = `rgba(0,0,0,${sombra})`; ctx.fillRect(xs0, topoY + ry - curva, Math.max(1, xs1 - xs0 + 0.6), corpoH);
  }
  // fundo arredondado: recorte elíptico inferior
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath(); ctx.moveTo(cx - R, 0); ctx.lineTo(cx + R, 0); ctx.lineTo(cx + R, topoY + ry + corpoH - ry);
  ctx.ellipse(cx, topoY + corpoH, R * 0.97, ry * 1.4, 0, 0, Math.PI); ctx.lineTo(cx - R, 0); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  // tampa
  const tg = ctx.createLinearGradient(x0, 0, x0 + W, 0);
  tg.addColorStop(0, '#cfcfcc'); tg.addColorStop(0.35, '#fbfbf9'); tg.addColorStop(0.7, '#ecece9'); tg.addColorStop(1, '#bdbdba');
  ctx.fillStyle = tg;
  ctx.beginPath(); ctx.ellipse(cx, topoY + ry * 0.4, R * 1.05, ry * 1.25, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(cx - R * 1.05, topoY - L * 0.06, R * 2.1, L * 0.06 + ry * 0.4);
  ctx.fillStyle = '#f7f7f5'; ctx.beginPath(); ctx.ellipse(cx, topoY - L * 0.06, R * 1.05, ry * 1.25, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.08)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx, topoY - L * 0.06, R * 0.86, ry, 0, 0, Math.PI * 2); ctx.stroke();
  return c;
}
