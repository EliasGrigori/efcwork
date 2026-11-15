const { chromium, abre, ir } = require('../moderno-v0615/pagina/lib');
const path = require('path'), RAIZ = path.resolve(__dirname, '..', '..', '..'), SEM = require('./semente.js').toString();
(async () => { const br = await chromium.launch();
  for (const [nome, w, h] of [['pc', 1280, 800], ['cel', 390, 800]]) {
    const p = await abre(br, { raiz: RAIZ, w: w, h: h, dsf: 1, semente: false }); await p.evaluate('(' + SEM + ')()'); await p.waitForTimeout(600);
    const sh = async n => { await p.waitForTimeout(900); await p.screenshot({ path: '/tmp/tr/' + nome + '-' + n + '.png' }); };
    await ir(p, 'qualidade/treinos', 1200);
    await p.evaluate(() => trAbre('t1')); await sh('2-gaveta-realizado');
    await p.evaluate(() => { document.querySelector('#gv .gv-corpo').scrollTop = 9999; }); await sh('2b-gaveta-fim');
    await p.keyboard.press('Escape'); await p.waitForTimeout(500);
    await p.evaluate(() => trAbre('t9')); await sh('3-gaveta-falta');
    await p.keyboard.press('Escape'); await p.waitForTimeout(500);
    await p.evaluate(() => trAbre('t2')); await sh('4-gaveta-quiz');
    await p.evaluate(() => { document.querySelector('#gv [data-act="tr-pres"]').click(); }); await sh('5-presenca');
    await p.keyboard.press('Escape'); await p.waitForTimeout(400); await p.keyboard.press('Escape'); await p.waitForTimeout(500);
    await p.evaluate(() => trNovo()); await sh('6-novo');
    await p.evaluate(() => { document.querySelector('#gv .gv-corpo').scrollTop = 9999; }); await sh('6b-novo-fim');
    console.log(nome, p._er);
    await p.context().close(); }
  await br.close(); })();
