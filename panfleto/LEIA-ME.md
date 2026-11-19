# Panfleto Tintas Matriz (A4 + 3 mm de sangria)

- `panfleto-grafica-cmyk.pdf` — arquivo para a gráfica (2 páginas, 216 x 303 mm com sangria; corte A4 marcado; cores em CMYK).
- `panfleto-tela-rgb.pdf` — mesma arte em RGB, para ver no celular/computador.
- `panfleto-frente-300dpi.png` e `panfleto-verso-300dpi.png` — imagens com sangria, 300 dpi.
- `panfleto.html` + `assets/` — arquivo editável. Para gerar de novo: `node build.js` (precisa de Playwright) e converter o PDF para CMYK com Ghostscript.

Pendente: trocar telefone, WhatsApp, Instagram e endereço de exemplo, e o link do QR (hoje https://exemplo.com/video-matriz, arquivo `assets/qr.svg`).
