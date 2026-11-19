// Gera frente.png, verso.png (300 dpi, com sangria) e panfleto-tela-rgb.pdf a partir de panfleto.html
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 817, height: 1145 }, deviceScaleFactor: 300 / 96 });
  await p.goto('file://' + path.resolve(__dirname, 'panfleto.html')); await p.waitForLoadState('networkidle'); await p.evaluate(() => document.fonts.ready);
  for (const id of ['frente', 'verso']) await (await p.$('#' + id)).screenshot({ path: path.resolve(__dirname, `panfleto-${id}-300dpi.png`) });
  const ov = await p.evaluate(() => { const c = document.querySelector('.col'); const r = c.getBoundingClientRect(); return { colBottomMm: (r.bottom + scrollY) / 96 * 25.4 - 303 }; });
  console.log(ov);
  await p.pdf({ path: path.resolve(__dirname, 'panfleto-tela-rgb.pdf'), width: '216mm', height: '303mm', printBackground: true });
  await b.close();
})();
