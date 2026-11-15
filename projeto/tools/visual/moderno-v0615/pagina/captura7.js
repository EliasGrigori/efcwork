/* Página dos ITENS 6 e 7 da varredura v0.6.8 (14/11): HOJE = v0.6.15.2 publicada (dist/index-antes.html), PROPOSTA = dist de agora.
   Uso: NODE_PATH=$(npm root -g) node captura7.js */
const { chromium, abre, ir } = require('./lib');
const sharp = require('sharp'), fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..', '..', '..', '..'), OUT = path.join(__dirname, 'out', 'img7'); fs.mkdirSync(OUT, { recursive: true });
const SEM = require(path.join(RAIZ, 'tools/visual/limite-v0615/semente.js')).toString();
const IMG = {}, NUM = {}, esp = (p, ms) => p.waitForTimeout(ms);
async function grava(p, nome, clip, larg) { const buf = await p.screenshot(clip ? { clip } : {}); let s = sharp(buf); const m = await s.metadata(); if (larg && m.width > larg) s = s.resize({ width: larg }); const o = await s.webp({ quality: 88 }).toBuffer({ resolveWithObject: true }); fs.writeFileSync(path.join(OUT, nome + '.webp'), o.data); IMG[nome] = { w: o.info.width, h: o.info.height, kb: Math.round(o.data.length / 1024) }; }
const caixa = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }, sel);
(async () => {
  const br = await chromium.launch();
  for (const [suf, arq] of [['hoje', 'dist/index-antes.html'], ['prop', 'dist/index.html']]) {
    for (const [dev, w] of [['pc', 1280], ['cel', 390]]) {
      const p = await abre(br, { raiz: RAIZ, arq, w, h: 860, dsf: dev === 'cel' ? 2 : 1 }); await p.evaluate('(' + SEM + ')()'); await esp(p, 1200);
      const PC = { x: 240, y: 56, width: 1040, height: 250 }, CEL = { x: 0, y: 56, width: 390, height: 420 };
      await ir(p, 'coletas/amostras', 1600); NUM['amostras-' + dev + '-' + suf] = await p.evaluate(() => S.coletas.length);
      await grava(p, 'i50-' + dev + '-' + suf, dev === 'pc' ? PC : CEL, dev === 'pc' ? 1040 : 780);
      await ir(p, 'coletas/agua', 1600); NUM['agua-' + dev + '-' + suf] = await p.evaluate(() => S.aguacol.length);
      let c51 = PC; if (dev === 'cel') { await p.evaluate(() => { const b = document.querySelector('.tb-bar'); window.scrollBy(0, b.getBoundingClientRect().top - 300); }); await esp(p, 500); const b = await caixa(p, '.tb-bar'); c51 = { x: 0, y: Math.max(0, b.y - 140), width: 390, height: 360 }; }
      await grava(p, 'i51-' + dev + '-' + suf, c51, dev === 'pc' ? 1040 : 780);
      if (dev === 'pc') {
        await p.evaluate(() => acAbre('v8')); await esp(p, 1300);
        await grava(p, 'i52-gav-' + suf, await caixa(p, '#gv'), 900);
        await p.keyboard.press('Escape'); await esp(p, 500);
        await p.evaluate(() => acAbre('v3')); await esp(p, 1300);
        const g = await caixa(p, '#gv'); await grava(p, 'i53-gav-' + suf, { x: g.x, y: g.y, width: g.width, height: 330 }, 900);
        await p.keyboard.press('Escape'); await esp(p, 400);
      }
      console.log(suf, dev, 'erros', p._er); await p.context().close();
    }
  }
  await br.close(); fs.writeFileSync(path.join(__dirname, 'out', 'img7.json'), JSON.stringify(IMG, null, 1)); console.log(Object.keys(IMG).length, 'imagens', NUM);
})().catch(e => { console.error(e); process.exit(1); });
