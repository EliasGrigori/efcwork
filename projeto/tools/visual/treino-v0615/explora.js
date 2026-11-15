const { chromium, abre, ir } = require('../moderno-v0615/pagina/lib');
const path = require('path'), RAIZ = path.resolve(__dirname, '..', '..', '..');
const SEM = require('./semente.js').toString();
(async () => { const br = await chromium.launch();
  for (const [nome, w, h] of [['pc', 1280, 800], ['cel', 390, 800]]) {
    const p = await abre(br, { raiz: RAIZ, w: w, h: h, dsf: 1, semente: false });
    await p.evaluate('(' + SEM + ')()'); await p.waitForTimeout(600);
    await ir(p, 'qualidade/treinos', 1200); await p.screenshot({ path: '/tmp/tr/' + nome + '-1-lista.png' });
    console.log(nome, 'abas:', await p.evaluate(() => [...document.querySelectorAll('.cs-abas a')].map(a => a.textContent.trim())), 'erros', p._er);
    await p.context().close(); }
  await br.close(); })();
