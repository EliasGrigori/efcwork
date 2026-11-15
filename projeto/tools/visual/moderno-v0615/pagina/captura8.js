/* Página v0.6.16 · Qualidade › Não conformidades e Bugs e sugestões (portadas do EFClaudian).
   HOJE = v0.6.15.3 publicada (dist/index-antes.html: a aba mostra "Esta área está sendo refeita"), PROPOSTA = dist de agora.
   Uso: NODE_PATH=$(npm root -g) node captura8.js */
const { chromium, abre, ir } = require('./lib');
const sharp = require('sharp'), fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..', '..', '..', '..'), OUT = path.join(__dirname, 'out', 'img8'); fs.mkdirSync(OUT, { recursive: true });
const SEM = require(path.join(RAIZ, 'tools/visual/qualidade-v0616/semente.js')).toString();
const IMG = {}, esp = (p, ms) => p.waitForTimeout(ms);
async function grava(p, nome, clip, larg) { const buf = await p.screenshot(clip ? { clip } : {}); let s = sharp(buf); const m = await s.metadata(); if (larg && m.width > larg) s = s.resize({ width: larg }); const o = await s.webp({ quality: 88 }).toBuffer({ resolveWithObject: true }); fs.writeFileSync(path.join(OUT, nome + '.webp'), o.data); IMG[nome] = { w: o.info.width, h: o.info.height, kb: Math.round(o.data.length / 1024) }; }
const copia = (de, para) => { fs.copyFileSync(path.join(OUT, de + '.webp'), path.join(OUT, para + '.webp')); IMG[para] = IMG[de]; };
const caixa = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: Math.min(r.height, 860 - r.y) }; }, sel);
/* a folha impressa: põe o conteúdo de impressão na tela, em A4, e fotografa */
async function folha(p, nome, deitado) {
  await p.evaluate(() => { window.print = () => {}; });
  return async () => { await esp(p, 300); await p.evaluate(d => { document.body.classList.add('au-imprimindo'); }, deitado); await p.emulateMedia({ media: 'print' }); await p.setViewportSize({ width: deitado ? 1123 : 794, height: deitado ? 794 : 1123 }); await esp(p, 400);
    const h = await p.evaluate(() => Math.min(document.querySelector('#au-imp').getBoundingClientRect().height + 40, 1100));
    await grava(p, nome, { x: 0, y: 0, width: deitado ? 1123 : 794, height: Math.round(h) }, deitado ? 1100 : 794);
    await p.emulateMedia({ media: 'screen' }); await p.evaluate(() => document.body.classList.remove('au-imprimindo')); await p.setViewportSize({ width: 1280, height: 860 }); await esp(p, 300); };
}
(async () => {
  const br = await chromium.launch();
  for (const [suf, arq] of [['hoje', 'dist/index-antes.html'], ['prop', 'dist/index.html']]) {
    for (const [dev, w] of [['pc', 1280], ['cel', 390]]) {
      const p = await abre(br, { raiz: RAIZ, arq, w, h: 860, dsf: dev === 'cel' ? 2 : 1 }); await p.evaluate('(' + SEM + ')()'); await esp(p, 1200);
      const PC = { x: 240, y: 0, width: 1040, height: 640 }, CEL = { x: 0, y: 0, width: 390, height: 760 };
      await ir(p, 'qualidade/nc', 1500); await grava(p, 'i54-' + dev + '-' + suf, dev === 'pc' ? PC : CEL, dev === 'pc' ? 1040 : 780);
      await ir(p, 'qualidade/bugs', 1500); await grava(p, 'i57-' + dev + '-' + suf, dev === 'pc' ? PC : CEL, dev === 'pc' ? 1040 : 780);
      if (dev === 'pc' && suf === 'hoje') {
        /* hoje: a NC só abre por Inspeções (apontamento e auditoria); as outras telas não existem aqui */
        await ir(p, 'inspecoes/apontamentos', 1200); await p.evaluate(() => apAbre('apN1')); await esp(p, 1300); await grava(p, 'i55-gav-hoje', await caixa(p, '#gv'), 900); await p.keyboard.press('Escape'); await esp(p, 400);
        ['i56-jan-hoje', 'i56-folha-hoje'].forEach(x => copia('i54-pc-hoje', x));
        ['i58-jan-hoje', 'i59-gav-hoje', 'i59-res-hoje', 'i60-folha-hoje'].forEach(x => copia('i57-pc-hoje', x));
      }
      if (dev === 'pc' && suf === 'prop') {
        await ir(p, 'qualidade/nc', 1200); await p.click('tr[data-id="ap|apN1"]'); await esp(p, 1300); await grava(p, 'i55-gav-prop', await caixa(p, '#gv'), 900); await p.keyboard.press('Escape'); await esp(p, 500);
        await p.click('[data-act="nq-folha"]'); await esp(p, 700); await p.evaluate(() => { S.fm.pes = 'Josineldo'; gvDesenha(true); }); await esp(p, 600); await grava(p, 'i56-jan-prop', await caixa(p, '#gv'), 900);
        const f1 = await folha(p, 'i56-folha-prop', false); await p.click('[data-act="nq-folha-ok"]'); await f1();
        await ir(p, 'coletas/amostras', 900); await ir(p, 'qualidade/bugs', 1200); await p.click('[data-act="bs-novo"][data-id="bug"]'); await esp(p, 900); await grava(p, 'i58-jan-prop', await caixa(p, '#gv'), 900); await p.keyboard.press('Escape'); await esp(p, 500);
        if (await p.$('#gv')) { await p.keyboard.press('Escape'); await esp(p, 400); }
        await p.click('tr[data-id="b2"]'); await esp(p, 1500); await grava(p, 'i59-gav-prop', await caixa(p, '#gv'), 900);
        await p.click('#gv [data-act="bs-sit"][data-s="resolvido"]'); await esp(p, 800); await p.evaluate(() => { S.fm.txt = 'A lista agora fica no lugar ao abrir a amostra.'; gvDesenha(true); }); await esp(p, 500); await grava(p, 'i59-res-prop', await caixa(p, '#gv'), 900);
        await p.keyboard.press('Escape'); await esp(p, 500); if (await p.$('#gv')) { await p.keyboard.press('Escape'); await esp(p, 400); }
        const f2 = await folha(p, 'i60-folha-prop', true); await p.click('[data-act="bs-pdf"]'); await esp(p, 800); await f2();
      }
      console.log(suf, dev, 'erros', p._er); await p.context().close();
    }
  }
  await br.close(); fs.writeFileSync(path.join(__dirname, 'out', 'img8.json'), JSON.stringify(IMG, null, 1)); console.log(Object.keys(IMG).length, 'imagens');
})().catch(e => { console.error(e); process.exit(1); });
