/* gera o PDF da lista de presença de um treinamento do jeito que o app imprime. Uso: node imprime.js <id> <saida.pdf> [dist] */
const { chromium, abre, ir } = require('../moderno-v0615/pagina/lib');
const path = require('path'), RAIZ = path.resolve(__dirname, '..', '..', '..'), SEM = require('./semente.js').toString();
(async () => { const br = await chromium.launch(); const p = await abre(br, { raiz: RAIZ, arq: process.argv[4] || 'dist/index.html', w: 1280, h: 800, semente: false });
  await p.evaluate('(' + SEM + ')()'); await p.waitForTimeout(500); await ir(p, 'qualidade/treinos', 900);
  await p.evaluate(id => { window.print = () => {}; trLista(id); }, process.argv[2]); await p.waitForTimeout(400);
  await p.evaluate(() => { document.body.classList.add('au-imprimindo'); });
  await p.pdf({ path: process.argv[3], format: 'A4', margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' }, printBackground: true, preferCSSPageSize: true });
  await br.close(); })();
